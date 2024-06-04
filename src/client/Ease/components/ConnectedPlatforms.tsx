import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AiOutlineRight } from 'react-icons/ai';
import facebookIcon from './Platforms/icons/facebookIcon.svg';

interface Platform {
    id: string;
    name: string;
    description: string;
    icon: string;
}

const platformsData: Platform[] = [
    {
        id: 'ga4',
        name: 'Google Analytics 4',
        description: 'Get insights from your GA4 data.',
        icon: '/path/to/ga4-icon.png', // replace with actual path to icon
    },
    {
        id: 'google_ads',
        name: 'Google Ads',
        description: 'Manage your ad campaigns.',
        icon: '/path/to/google-ads-icon.png', // replace with actual path to icon
    },
    {
        id: 'facebook_ads',
        name: 'Facebook Ads',
        description: 'Track your Facebook Ads performance.',
        icon: facebookIcon, // replace with actual path to icon
    },
    {
        id: 'snapchat_ads',
        name: 'Snapchat Ads',
        description: 'Analyze your Snapchat Ads data.',
        icon: '/path/to/snapchat-ads-icon.png', // replace with actual path to icon
    },
    {
        id: 'criteo',
        name: 'Criteo',
        description: 'Get data from Criteo campaigns.',
        icon: '/path/to/criteo-icon.png', // replace with actual path to icon
    },
    {
        id: 'adjust',
        name: 'Adjust',
        description: 'Measure your mobile app performance.',
        icon: '/path/to/adjust-icon.png', // replace with actual path to icon
    },
];

const ConnectedPlatforms: React.FC = () => {
    const [connectedPlatforms] = useState<Platform[]>(platformsData);
    const [errorMessage] = useState<string | null>(null);
    const [showAll, setShowAll] = useState<boolean>(false);

    const handleToggleView = () => {
        setShowAll((prevShowAll) => !prevShowAll);
    };

    return (
        <div className="p-4">
            <div className="border rounded-lg p-4 mb-4">
                <h1 className="text-lg font-semibold mb-2">Let's get your data!</h1>
                <p className="text-xs text-gray-600 mb-4">
                    Use a query to define metrics and time ranges so you can easily analyze your data.
                </p>
                <button className="w-full py-2 px-4 bg-black text-white rounded-md hover:bg-gray-800">
                    + Connect Source
                </button>
            </div>
            <div className="border rounded-lg p-4 mb-4">
                <h2 className="text-base font-semibold mb-2">Or start with your connected queries:</h2>
                <ul className="space-y-2">
                    {connectedPlatforms.slice(0, showAll ? connectedPlatforms.length : 4).map((platform) => (
                        <li key={platform.id} className="flex items-center justify-between p-2 border rounded-md hover:bg-gray-100 cursor-pointer">
                            <Link to={`/platform/${platform.id}`} className="flex items-center w-full">
                                <div className="flex items-center">
                                    <img
                                        src={platform.icon}
                                        alt={platform.name}
                                        className="w-8 h-8 mr-4"
                                    />
                                    <div>
                                        <p className="text-xs font-medium">{platform.name}</p>
                                        <p className="text-xs text-gray-600">{platform.description}</p>
                                    </div>
                                </div>
                                <AiOutlineRight className="text-lg text-gray-500" />
                            </Link>
                        </li>
                    ))}
                </ul>
                <button onClick={handleToggleView} className="mt-4 w-full text-blue-500 hover:text-blue-700">
                    {showAll ? 'Show Less' : 'View All'}
                </button>
            </div>

            {errorMessage && (
                <p className="text-red-500 mt-4">
                    {errorMessage}
                </p>
            )}
        </div>
    );
};

export default ConnectedPlatforms;
