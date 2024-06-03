import { useState, useEffect } from 'react';
import { serverFunctions } from '../../../../utils/serverFunctions.ts';

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

interface ResponseWithProperties {
    properties?: Property[];
    error?: string;
}

interface ResponseWithMetadata {
    dimensions?: Dimension[];
    metrics?: Metric[];
    error?: string;
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
    const [sheetName, setSheetName] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const response: { accountsResponse?: { items?: any[] }; error?: string } = await serverFunctions.listGoogleAnalyticsAccounts();
                console.log('response:', response);
                if (response.accountsResponse && response.accountsResponse.items) {
                    const validAccounts = response.accountsResponse.items;
                    setAccounts(validAccounts);
                    console.log('accounts:', validAccounts);
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
        const accountId = event.target.value;
        setSelectedAccount(accountId);
        try {
            const response: ResponseWithProperties = await serverFunctions.listGoogleAnalyticsProperties(accountId);
            const validProperties = (response.properties ?? []).filter(
                (property): property is Property => property.id !== undefined && property.name !== undefined
            );
            setProperties(validProperties);
        } catch (error) {
            setErrorMessage('Error fetching Google Analytics properties');
        }
    };

    const handlePropertyChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
        const propertyId = event.target.value;
        setSelectedProperty(propertyId);
        try {
            const response: ResponseWithMetadata = await serverFunctions.getGoogleAnalyticsPropertyMetadata();
            const validDimensions = (response.dimensions ?? [])
                .map((item) => item.apiName)
                .filter((apiName): apiName is string => apiName !== undefined);
            const validMetrics = (response.metrics ?? [])
                .map((item) => item.apiName)
                .filter((apiName): apiName is string => apiName !== undefined);
            setDimensions(validDimensions);
            setMetrics(validMetrics);
        } catch (error) {
            setErrorMessage('Error fetching Google Analytics property metadata');
        }
    };

    const handleFetchData = async () => {
        try {
            const response: FetchDataResponse = await serverFunctions.fetchGoogleAnalyticsData({
                accountId: selectedAccount,
                propertyId: selectedProperty,
                dimensions: selectedDimensions,
                metrics: selectedMetrics,
                startDate,
                endDate,
                sheetName,
            });
            if (response.error) {
                if (typeof response.error === 'string') {
                    setErrorMessage(response.error);
                } else {
                    setErrorMessage(response.error.message);
                }
            } else {
                alert('Data successfully fetched and written to the sheet');
            }
        } catch (error) {
            setErrorMessage('Error fetching data');
        }
    };

    return (
        <div className="p-4">
            <h6 className="text-lg font-semibold mb-4">
                Google Analytics Page
            </h6>
            {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Select Account</label>
                    <select
                        value={selectedAccount}
                        onChange={handleAccountChange}
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                        <option value="" disabled>
                            Select Account
                        </option>
                        {accounts.map((account) => (
                            <option key={account.id} value={account.id}>
                                {account.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Select Property</label>
                    <select
                        value={selectedProperty}
                        onChange={handlePropertyChange}
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                        <option value="" disabled>
                            Select Property
                        </option>
                        {properties.map((property) => (
                            <option key={property.id} value={property.id}>
                                {property.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Select Dimensions</label>
                    <select
                        multiple
                        value={selectedDimensions}
                        onChange={(e) => setSelectedDimensions(Array.from(e.target.selectedOptions, option => option.value))}
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                        {dimensions.map((dimension) => (
                            <option key={dimension} value={dimension}>
                                {dimension}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Select Metrics</label>
                    <select
                        multiple
                        value={selectedMetrics}
                        onChange={(e) => setSelectedMetrics(Array.from(e.target.selectedOptions, option => option.value))}
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                        {metrics.map((metric) => (
                            <option key={metric} value={metric}>
                                {metric}
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
                    <label className="block text-sm font-medium text-gray-700">Sheet Name</label>
                    <input
                        type="text"
                        value={sheetName}
                        onChange={(e) => setSheetName(e.target.value)}
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
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

export default GoogleAnalyticsPage;
