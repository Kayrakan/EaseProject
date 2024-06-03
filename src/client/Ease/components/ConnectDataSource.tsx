import React, { useState } from 'react';
import { serverFunctions } from '../../utils/serverFunctions';

interface DataSource {
    name: string;
    id: string;
}

const dataSources: DataSource[] = [
    { name: 'Google Analytics 4', id: 'ga4' },
    { name: 'Google Ads', id: 'google_ads' },
    { name: 'Criteo', id: 'criteo' },
    { name: 'Adjust', id: 'adjust' },
];

const ConnectDataSource: React.FC = () => {
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleConnect = async (dataSourceId: string) => {
        try {
            console.log(`Connecting to ${dataSourceId}`);
            if (dataSourceId === 'ga4' || dataSourceId === 'google_ads') {
                const authUrl = await serverFunctions.getOAuthURL(dataSourceId);
                window.open(authUrl, '_blank');
            } else if (dataSourceId === 'facebook_ads') {
                // Add logic for Facebook Ads OAuth
            } else if (dataSourceId === 'snapchat_ads') {
                // Add logic for Snapchat Ads OAuth
            } else if (dataSourceId === 'criteo') {
                // Add logic for Criteo OAuth
            } else if (dataSourceId === 'adjust') {
                // Add logic for Adjust OAuth
            }
        } catch (error) {
            setErrorMessage(`Error connecting to ${dataSourceId}: ` + error);
        }
    };

    return (
        <div>
            <h4 className="text-lg font-semibold mb-4">
                Connect Data Source
            </h4>
            {errorMessage && <p className="text-red-500">{errorMessage}</p>}
            <ul className="list-none p-0">
                {dataSources.map((source) => (
                    <li
                        key={source.id}
                        className="cursor-pointer p-2 hover:bg-gray-200"
                        onClick={() => handleConnect(source.id)}
                    >
                        {source.name}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ConnectDataSource;
