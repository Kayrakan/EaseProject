import { useState, useEffect } from 'react';
import { serverFunctions } from '../../../../utils/serverFunctions';

interface Account {
    id: string;
    name: string;
}

interface Property {
    id: string;
    name: string;
}

interface Dimension {
    uiName: string;
    apiName: string;
}

interface Metric {
    uiName: string;
    apiName: string;
}

interface FetchDataResponse {
    data?: any[];
    error?: string | { message: string };
}

const GoogleAnalyticsPage = () => {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);
    const [dimensions, setDimensions] = useState<string[]>([]);
    const [metrics, setMetrics] = useState<string[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<string>('');
    const [selectedProperty, setSelectedProperty] = useState<string>('');
    const [selectedDimensions, setSelectedDimensions] = useState<string[]>([]);
    const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [data, setData] = useState<any[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const response: { accounts?: Account[]; error?: string } = await serverFunctions.listGoogleAnalyticsAccounts();
                if (response.accounts) {
                    setAccounts(response.accounts);
                } else if (response.error) {
                    setErrorMessage(response.error);
                } else {
                    setErrorMessage('Unexpected response structure');
                }
            } catch (error) {
                setErrorMessage('Error fetching Google Analytics accounts');
            }
        };

        fetchAccounts();
    }, []);

    const handleAccountChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
        const fullAccountId = event.target.value;
        const accountId = fullAccountId.split('/').pop() || ''; // Extract the numeric ID or set to an empty string
        setSelectedAccount(fullAccountId);
        try {
            const response: { properties?: Property[]; error?: string } = await serverFunctions.listGoogleAnalyticsProperties(accountId);
            if (response.properties) {
                setProperties(response.properties);
                setSelectedProperty(''); // Reset selected property when account changes
            } else if (response.error) {
                setErrorMessage(response.error);
            } else {
                setErrorMessage('Unexpected response structure');
            }
        } catch (error) {
            setErrorMessage('Error fetching Google Analytics properties');
        }
    };

    const handlePropertyChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
        const propertyId = event.target.value;
        setSelectedProperty(propertyId);
        try {
            const response: { dimensions?: Dimension[]; metrics?: Metric[]; error?: string } = await serverFunctions.getGoogleAnalyticsPropertyMetadata(propertyId);
            if (response.dimensions && response.metrics) {
                setDimensions(response.dimensions.map(dim => dim.apiName));
                setMetrics(response.metrics.map(metric => metric.apiName));
            } else if (response.error) {
                setErrorMessage(response.error);
            } else {
                setErrorMessage('Unexpected response structure');
            }
        } catch (error) {
            setErrorMessage('Error fetching Google Analytics property metadata');
        }
    };

    const handleFetchData = async () => {
        try {
            const response: FetchDataResponse = await serverFunctions.fetchGoogleAnalyticsData({
                propertyId: selectedProperty,
                dimensions: selectedDimensions,
                metrics: selectedMetrics,
                startDate,
                endDate,
            });
            console.log('data: ');
            console.log(response);
            console.log(response.data);
            if (response.data) {
                setData(response.data);
                setErrorMessage(null);
            } else if (response.error) {
                setErrorMessage(typeof response.error === 'string' ? response.error : response.error.message);
            }
        } catch (error) {
            setErrorMessage('Error fetching data');
        }
    };

    return (
        <div className="p-6 bg-white shadow rounded-lg w-full max-w-md mx-auto">
            <h2 className="text-xl font-semibold mb-4">Google Analytics Page</h2>
            {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Select Account</label>
                <select
                    value={selectedAccount}
                    onChange={handleAccountChange}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                    <option value="" disabled>Select Account</option>
                    {accounts.map(account => (
                        <option key={account.id} value={account.id}>{account.name}</option>
                    ))}
                </select>
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Select Property</label>
                <select
                    value={selectedProperty}
                    onChange={handlePropertyChange}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                    <option value="" disabled>Select Property</option>
                    {properties.map(property => (
                        <option key={property.id} value={property.id}>{property.name}</option>
                    ))}
                </select>
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Select Dimensions</label>
                <select
                    multiple
                    value={selectedDimensions}
                    onChange={(e) => setSelectedDimensions(Array.from(e.target.selectedOptions, option => option.value))}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                    {dimensions.map(dimension => (
                        <option key={dimension} value={dimension}>{dimension}</option>
                    ))}
                </select>
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Select Metrics</label>
                <select
                    multiple
                    value={selectedMetrics}
                    onChange={(e) => setSelectedMetrics(Array.from(e.target.selectedOptions, option => option.value))}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                    {metrics.map(metric => (
                        <option key={metric} value={metric}>{metric}</option>
                    ))}
                </select>
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
            </div>
            <button
                onClick={handleFetchData}
                className="mt-4 w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                Fetch Data
            </button>
            {data.length > 0 && (
                <div className="mt-6">
                    <h3 className="text-lg font-medium mb-2">Report Data</h3>
                    <pre className="bg-gray-100 p-4 rounded-md">
                        {JSON.stringify(data, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
};

export default GoogleAnalyticsPage;
