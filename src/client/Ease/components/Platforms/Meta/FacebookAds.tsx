import React, { useState, useEffect } from 'react';
import { serverFunctions } from '../../../../utils/serverFunctions';

const availableFields = [
    'impressions',
    'clicks',
    'spend',
    'ctr',
    'cpm',
    // Add more fields as necessary
];

const FacebookAds: React.FC = () => {
    const [adAccount, setAdAccount] = useState('');
    const [adAccounts, setAdAccounts] = useState<any[]>([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [fields, setFields] = useState<string[]>([]);
    const [breakdown, setBreakdown] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [connectedUsers, setConnectedUsers] = useState<any[]>([]);
    const [selectedUser, setSelectedUser] = useState<string>('');

    useEffect(() => {
        const fetchConnectedUsers = async () => {
            try {
                const users = await serverFunctions.getConnectedFacebookAccounts();
                setConnectedUsers(users);
            } catch (error) {
                const err = error as Error;
                setErrorMessage(`Error fetching connected users: ${err.message}`);
            }
        };

        fetchConnectedUsers();
    }, []);

    const handleUserChange = async (userId: string) => {
        setSelectedUser(userId);
        try {
            const response = await serverFunctions.fetchFacebookAdAccounts(userId);
            if (response.error) {
                setErrorMessage(response.error);
            } else {
                setAdAccounts(response.data);
            }
        } catch (error) {
            const err = error as Error;
            setErrorMessage(`Error fetching ad accounts: ${err.message}`);
        }
    };

    const handleFetchData = async () => {
        try {
            const response = await serverFunctions.fetchFacebookAdsData({
                adAccount,
                startDate,
                endDate,
                fields,
                breakdown,
                identifier: selectedUser,
            });

            if (response.error) {
                setErrorMessage(response.error);
            } else {
                pollReportStatus(response.reportRunId);
            }
        } catch (error) {
            const err = error as Error;
            setErrorMessage(`Error fetching data: ${err.message}`);
        }
    };

    const pollReportStatus = async (reportRunId: string) => {
        const interval = setInterval(async () => {
            try {
                const statusResponse = await serverFunctions.fetchFacebookReportStatus(reportRunId, selectedUser);
                if (statusResponse.error) {
                    setErrorMessage(statusResponse.error);
                    clearInterval(interval);
                    return;
                }
                if (statusResponse.async_percent_completion === 100 && statusResponse.async_status === 'Job Completed') {
                    clearInterval(interval);
                    fetchReportResults(reportRunId);
                }
            } catch (error) {
                const err = error as Error;
                setErrorMessage(`Error checking report status: ${err.message}`);
                clearInterval(interval);
            }
        }, 5000); // Poll every 5 seconds
    };

    const fetchReportResults = async (reportRunId: string) => {
        try {
            const resultsResponse = await serverFunctions.fetchFacebookReportResults(reportRunId, selectedUser);
            console.log('result response:');
            console.log(resultsResponse);
            if (resultsResponse.error) {
                console.log('erro occured result response ' + resultsResponse.error);
                setErrorMessage(resultsResponse.error);
            } else {
                alert('Data successfully fetched and written to the sheet');
            }
        } catch (error) {
            const err = error as Error;
            setErrorMessage(`Error fetching report results: ${err.message}`);
        }
    };

    const handleFieldChange = (field: string) => {
        setFields(prevFields =>
            prevFields.includes(field)
                ? prevFields.filter(f => f !== field)
                : [...prevFields, field]
        );
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-semibold mb-4">Facebook Ads Data</h1>
            {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Connected User</label>
                    <select
                        value={selectedUser}
                        onChange={(e) => handleUserChange(e.target.value)}
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                        <option value="">Select a User</option>
                        {connectedUsers.map((user) => (
                            <option key={user.uniqueId} value={user.uniqueId}>
                                {user.name} ({user.email})
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Ad Account</label>
                    <select
                        value={adAccount}
                        onChange={(e) => setAdAccount(e.target.value)}
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                        <option value="">Select an Ad Account</option>
                        {adAccounts.map((account) => (
                            <option key={account.id} value={account.id}>
                                {account.name} ({account.id})
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Start Date</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">End Date</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Fields</label>
                    {availableFields.map(field => (
                        <div key={field} className="flex items-center">
                            <input
                                type="checkbox"
                                checked={fields.includes(field)}
                                onChange={() => handleFieldChange(field)}
                                className="mr-2"
                            />
                            <label>{field}</label>
                        </div>
                    ))}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Breakdown</label>
                    <select
                        value={breakdown}
                        onChange={(e) => setBreakdown(e.target.value)}
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                        <option value="">Select Breakdown</option>
                        <option value="age">Age</option>
                        <option value="gender">Gender</option>
                        <option value="country">Country</option>
                        {/* Add more breakdown options as necessary */}
                    </select>
                </div>
                <button
                    onClick={handleFetchData}
                    className="mt-4 w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Fetch Data
                </button>
            </div>
        </div>
    );
};

export default FacebookAds;
