import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AiOutlineArrowRight } from 'react-icons/ai';

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
        icon: '/path/to/facebook-ads-icon.png', // replace with actual path to icon
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

    return (
        <div>
            <h6 className="text-lg font-semibold mb-4">
                Data Sources
            </h6>
            {errorMessage && <p className="text-red-500">{errorMessage}</p>}
            <ul className="list-none p-0">
                {connectedPlatforms.map((platform) => (
                    <li key={platform.id} className="flex items-start p-2 border-b border-gray-200 hover:bg-gray-100">
                        <Link to={`/platform/${platform.id}`} className="flex items-center w-full">
                            <img
                                src={platform.icon}
                                alt={platform.name}
                                className="w-8 h-8 mr-4"
                            />
                            <div className="flex-1">
                                <p className="font-medium">{platform.name}</p>
                                <p className="text-gray-600 text-sm">{platform.description}</p>
                            </div>
                            <AiOutlineArrowRight className="text-xl text-gray-500" />
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ConnectedPlatforms;
