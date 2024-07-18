import React, { useEffect, useState } from 'react';
import { serverFunctions } from '../../../../utils/serverFunctions';
import { useNavigate } from 'react-router-dom';

const FacebookConnect: React.FC = () => {
    const [connectedAccounts, setConnectedAccounts] = useState<any[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch connected Facebook accounts
        async function fetchConnectedAccounts() {
            try {
                const accounts = await serverFunctions.getConnectedFacebookAccounts();
                console.log('accounts all')
                console.log(accounts)
                setConnectedAccounts(accounts);
            } catch (error) {
                setErrorMessage(`Error fetching connected accounts: ` + error);
            }
        }
        fetchConnectedAccounts();
    }, []);

    const handleConnectNewAccount = async () => {
        try {
            const authUrl = await serverFunctions.getFacebookOAuthURL();
            if (authUrl) {
                window.open(authUrl, '_blank');
            }
            console.log('auth start faceboko')
            console.log(authUrl)
        } catch (error) {
            setErrorMessage(`Error connecting new account: ` + error);
        }
    };

    const handleDisconnectAccount = async (accountId: string) => {
        try {
            console.log('account to disconnect' + accountId);
            await serverFunctions.resetFacebookOAuth(accountId);
            console.log('setting new connected accounts');
            setConnectedAccounts(prev => prev.filter(account => account.uniqueId !== accountId));
            console.log(connectedAccounts);
        } catch (error) {
            console.log('error occured during disconneccting account' + error);
            setErrorMessage(`Error disconnecting account: ` + error);
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-semibold mb-4">Connect Facebook Account</h1>
            {errorMessage && <p className="text-red-500">{errorMessage}</p>}
            <button
                className="bg-blue-500 text-white p-2 rounded-md mb-4"
                onClick={handleConnectNewAccount}
            >
                Connect New Account
            </button>
            <h2 className="text-lg font-semibold mb-2">Connected Accounts</h2>
            <ul className="list-none p-0 space-y-2">
                {connectedAccounts.map(account => (
                    <li
                        key={account.id}
                        className="flex items-center p-2 border rounded-md"
                    >
                        <span className="text-sm font-medium">{account.name}</span>
                        <button
                            className="ml-auto text-red-500"
                            onClick={() => handleDisconnectAccount(account.uniqueId)}
                        >
                            Disconnect
                        </button>
                    </li>
                ))}
            </ul>
            <button
                className="mt-4 bg-gray-500 text-white p-2 rounded-md"
                onClick={() => navigate('/')}
            >
                Back to Data Sources
            </button>
        </div>
    );
};

export default FacebookConnect;
