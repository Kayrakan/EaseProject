import React, { useState } from 'react';
import { serverFunctions } from '../../../../utils/serverFunctions';
import {useNavigate} from "react-router-dom";
import {AiOutlineArrowLeft} from "react-icons/ai";

const AdjustConnect: React.FC = () => {
    const [apiKey, setApiKey] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSave = async () => {
        try {
            // Save the API key to user properties
            await serverFunctions.saveAdjustApiKey(apiKey);
            alert('API Key saved successfully.');
            navigate('/'); // Navigate back to the main page or wherever needed
        } catch (error) {
            setErrorMessage(`Error saving API key: ` + error);
        }
    };
    const handleBackClick = () => {

        navigate(-1); // This will navigate back to the previous page
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
        </div>
    );
};

export default AdjustConnect;
