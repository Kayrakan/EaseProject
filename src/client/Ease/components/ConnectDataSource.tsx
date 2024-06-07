import { useState } from 'react';
import { serverFunctions } from '../../utils/serverFunctions';

// Importing SVG icons
import googleAnalyticsIcon from './Platforms/icons/google.svg';
import googleAdsIcon from './Platforms/icons/google.svg';
import facebookIcon from './Platforms/icons/facebook.svg';
import snapchatIcon from './Platforms/icons/snapchat.svg';
import criteoIcon from './Platforms/icons/criteo.svg';
import adjustIcon from './Platforms/icons/adjust.svg';

interface DataSource {
    name: string;
    id: string;
    icon: string;
}

const dataSources: DataSource[] = [
    { name: 'Google Analytics', id: 'google_analytics', icon: googleAnalyticsIcon },
    { name: 'Google Ads', id: 'google_ads', icon: googleAdsIcon },
    { name: 'Facebook Ads', id: 'facebook_ads', icon: facebookIcon },
    { name: 'Snapchat Ads', id: 'snapchat_ads', icon: snapchatIcon },
    { name: 'Criteo', id: 'criteo', icon: criteoIcon },
    { name: 'Adjust', id: 'adjust', icon: adjustIcon },
];

const ConnectDataSource: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleConnect = async (dataSourceId: string) => {
        try {
            console.log(`Connecting to ${dataSourceId}`);
            let authUrl: string | null = null;

            if (dataSourceId === 'google_analytics' || dataSourceId === 'google_ads') {
                authUrl = await serverFunctions.getOAuthURL(dataSourceId);
            } else if (dataSourceId === 'facebook_ads') {
                authUrl = await serverFunctions.getFacebookOAuthURL();
                console.log('OAuth URL:', authUrl);
                // window.open(authUrl, '_blank');
            } else if (dataSourceId === 'snapchat_ads') {
                // Add logic for Snapchat Ads OAuth
            } else if (dataSourceId === 'criteo') {
                // Add logic for Criteo OAuth
            } else if (dataSourceId === 'adjust') {
                // Add logic for Adjust OAuth
            }

            if (authUrl === 'ALREADY_AUTHORIZED') {
                alert('You are already authorized.');
            } else if (authUrl) {
                openPopup(authUrl);
            }
        } catch (error) {
            setErrorMessage(`Error connecting to ${dataSourceId}: ` + error);
        }
    };

    const handleReset = async (dataSourceId: string) => {
        try {
            if (dataSourceId === 'facebook_ads') {
                await serverFunctions.resetFacebookOAuth();
                alert('Facebook OAuth has been reset.');
            }
            // Add similar logic for other data sources if needed
        } catch (error) {
            setErrorMessage(`Error resetting OAuth for ${dataSourceId}: ` + error);
        }
    };

    const openPopup = (url: string) => {
        const width = 600;
        const height = 600;
        const left = (window.innerWidth - width) / 2;
        const top = (window.innerHeight - height) / 2;
        window.open(
            url,
            'OAuthPopup',
            `width=${width},height=${height},top=${top},left=${left}`
        );
    };

    const filteredDataSources = dataSources.filter(source =>
        source.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-4">
            <h1 className="text-2xl font-semibold mb-4">Data sources</h1>
            <input
                type="text"
                placeholder="Search data sources"
                className="w-full p-2 mb-4 border rounded-md"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
            <h2 className="text-lg font-semibold mb-2">Connect to a new data source</h2>
            {errorMessage && <p className="text-red-500">{errorMessage}</p>}
            <ul className="list-none p-0 space-y-2">
                {filteredDataSources.map((source) => (
                    <li
                        key={source.id}
                        className="flex items-center cursor-pointer p-2 border rounded-md hover:bg-gray-100"
                    >
                        <img
                            src={source.icon}
                            alt={source.name}
                            className="w-6 h-6 mr-4"
                        />
                        <span className="text-sm font-medium" onClick={() => handleConnect(source.id)}>{source.name}</span>
                        <button className="ml-auto text-red-500" onClick={() => handleReset(source.id)}>Reset</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ConnectDataSource;
