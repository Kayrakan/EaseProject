import { useState, useEffect } from 'react';
import { serverFunctions } from '../../utils/serverFunctions';
import ConnectedPlatforms from './ConnectedPlatforms';
import ConnectDataSource from './ConnectDataSource';
import { AiOutlineProject, AiOutlinePlusCircle } from 'react-icons/ai';

const EaseApp = () => {
    const [userEmail, setUserEmail] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);
    const [value, setValue] = useState(0);

    useEffect(() => {
        const fetchUserEmail = async () => {
            try {
                const email = await serverFunctions.getCurrentUser();
                setUserEmail(email);
            } catch (error) {
                console.error('Error fetching user email:', error);
                setErrorMessage('Error fetching user email: ' + error.message);
            }
        };

        fetchUserEmail();
    }, []);

    const handleConnectGA4 = () => {
        console.log('Connect GA4 clicked');
    };

    const handleChange = (newValue) => {
        setValue(newValue);
    };

    return (
        <div className="p-3 overflow-x-hidden">
            <div className="w-full">
                <div className="flex border-b border-gray-200">
                    <button
                        className={`px-4 py-2 flex items-center ${
                            value === 0 ? 'border-b-2 border-blue-500' : ''
                        }`}
                        onClick={() => handleChange(0)}
                    >
                        <AiOutlineProject className="text-xl" />
                    </button>
                    <button
                        className={`px-4 py-2 flex items-center ${
                            value === 1 ? 'border-b-2 border-blue-500' : ''
                        }`}
                        onClick={() => handleChange(1)}
                    >
                        <AiOutlinePlusCircle className="text-xl" />
                    </button>
                </div>
                <div className="mt-2">
                    {value === 0 && <ConnectedPlatforms />}
                    {value === 1 && <ConnectDataSource />}
                </div>
            </div>

            {userEmail ? (
                <p className="text-base">
                    Welcome, {userEmail}
                </p>
            ) : (
                <p className="text-base">
                    Loading...
                </p>
            )}
            {errorMessage && (
                <p className="text-red-500">
                    {errorMessage}
                </p>
            )}
        </div>
    );
};

export default EaseApp;
