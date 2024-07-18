import React, { useState, useEffect } from 'react';
import { serverFunctions } from '../../../../utils/serverFunctions';
import { useNavigate } from 'react-router-dom';
import { AiOutlineArrowLeft } from 'react-icons/ai';

interface AdjustApiKey {
    name: string;
    key: string;
}

const AdjustConnect: React.FC = () => {
    const [apiKey, setApiKey] = useState('');
    const [apiName, setApiName] = useState('');
    const [apiKeys, setApiKeys] = useState<AdjustApiKey[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchApiKeys = async () => {
            try {
                const response = await serverFunctions.getAdjustApiKeys();
                console.log('getting api keys', response);
                setApiKeys(response);
            } catch (error) {
                setErrorMessage(`Error fetching API keys: ` + error);
            }
        };
        fetchApiKeys();
    }, []);

    const handleSave = async () => {
        try {
            console.log('api key here: ' + apiKey);
            const response = await serverFunctions.saveAdjustApiKey(apiKey, apiName);
            console.log('saving api key', response);
            const platformsres = await serverFunctions.getAdjustApiKeys();
            console.log('getting adjust platform');
            console.log(platformsres);
            setApiKeys([...apiKeys, { name: apiName, key: apiKey }]);
            setApiKey('');
            setApiName('');
            alert('API Key saved successfully.');
        } catch (error) {
            setErrorMessage(`Error saving API key: ` + error);
        }
    };

    const handleDelete = async (key: string) => {
        try {
            console.log('api keys');
            console.log(key);
            console.log('key to delete');
            const response = await serverFunctions.deleteAdjustApiKey(key);
            console.log('deleted key', response);
            setApiKeys(apiKeys.filter(api => api.key !== key));
            alert('API Key deleted successfully.');
        } catch (error) {
            setErrorMessage(`Error deleting API key: ` + error);
        }
    };

    const handleBackClick = () => {
        navigate(-1);
    };

    return (
        <div className="p-4">
            <button
                onClick={handleBackClick}
                className="flex items-center p-2 text-black rounded hover:bg-gray-200"
            >
                <AiOutlineArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-semibold mb-4">Connect to Adjust</h1>
            {errorMessage && <p className="text-red-500">{errorMessage}</p>}
            <div className="mb-4">
                <label htmlFor="apiName" className="block text-sm font-medium text-gray-700">
                    Enter a name for your API Key
                </label>
                <input
                    type="text"
                    id="apiName"
                    className="mt-1 p-2 w-full border rounded-md"
                    value={apiName}
                    onChange={e => setApiName(e.target.value)}
                />
            </div>
            <div className="mb-4">
                <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">
                    Enter your API Key
                </label>
                <input
                    type="text"
                    id="apiKey"
                    className="mt-1 p-2 w-full border rounded-md"
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                />
            </div>
            <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-500 text-white rounded-md"
            >
                Save API Key
            </button>
            <h2 className="text-xl font-semibold mt-4">Saved API Keys</h2>
            <ul>
                {apiKeys.map((api, index) => (
                    <li key={index} className="flex justify-between items-center mt-2">
                        <span>{api.name}: {api.key}</span>
                        <button
                            onClick={() => handleDelete(api.key)}
                            className="ml-2 px-2 py-1 bg-red-500 text-white rounded-md"
                        >
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AdjustConnect;
