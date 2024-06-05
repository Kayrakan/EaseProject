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

interface View {
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
    const [views, setViews] = useState<View[]>([]);
    const [dimensions, setDimensions] = useState<string[]>([]);
    const [metrics, setMetrics] = useState<string[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<string>('');
    const [selectedProperty, setSelectedProperty] = useState<string>('');
    const [selectedViewId, setSelectedViewId] = useState<string>(''); // Add this state
    const [selectedDimensions, setSelectedDimensions] = useState<string[]>([]);
    const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [datePreset, setDatePreset] = useState<string>('Custom');
    const [sheetName, setSheetName] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const response: { accountsResponse?: { items?: any[] }; error?: string } = await serverFunctions.listGoogleAnalyticsAccounts();
                if (response.accountsResponse && response.accountsResponse.items) {
                    const validAccounts = response.accountsResponse.items;
                    setAccounts(validAccounts);
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
            const response: { properties?: Property[]; error?: string } = await serverFunctions.listGoogleAnalyticsProperties(accountId);
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
            const response: { views?: View[]; error?: string } = await serverFunctions.listGoogleAnalyticsViews(selectedAccount, propertyId);
            const validViews = (response.views ?? []).filter(
                (view): view is View => view.id !== undefined && view.name !== undefined
            );
            setViews(validViews);
        } catch (error) {
            setErrorMessage('Error fetching Google Analytics views');
        }
    };

    const handleViewChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
        const viewId = event.target.value;
        setSelectedViewId(viewId);
        try {
            const response: { dimensions?: Dimension[]; metrics?: Metric[]; error?: string } = await serverFunctions.getGoogleAnalyticsPropertyMetadata();
            const validDimensions = (response.dimensions ?? []).map(item => item.apiName).filter((apiName): apiName is string => apiName !== undefined);
            const validMetrics = (response.metrics ?? []).map(item => item.apiName).filter((apiName): apiName is string => apiName !== undefined);
            setDimensions(validDimensions);
            setMetrics(validMetrics);
        } catch (error) {
            setErrorMessage('Error fetching Google Analytics property metadata');
        }
    };

    const handleDatePresetChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedPreset = event.target.value;
        setDatePreset(selectedPreset);

        const { start, end } = createDateRanges(selectedPreset);
        setStartDate(start);
        setEndDate(end);
    };

    const createDateRanges = (preset: string) => {
        const today = new Date();
        let start = new Date(today);
        let end = new Date(today);

        switch (preset) {
            case 'Today':
                break;
            case 'Yesterday':
                start.setDate(start.getDate() - 1);
                end.setDate(end.getDate() - 1);
                break;
            case 'This Week':
                start.setDate(start.getDate() - start.getDay());
                end.setDate(end.getDate() + (6 - end.getDay()));
                break;
            case 'Last Week':
                start.setDate(start.getDate() - start.getDay() - 7);
                end.setDate(end.getDate() - end.getDay() - 1);
                break;
            case 'Last 7 Days':
                start.setDate(start.getDate() - 6);
                end.setDate(today.getDate() - 1);
                break;
            case 'This Month':
                start.setDate(1);
                end.setMonth(end.getMonth() + 1, 0);
                break;
            case 'Last Month':
                start.setMonth(start.getMonth() - 1, 1);
                end.setDate(0);
                break;
            case 'Last 30 Days':
                start.setDate(today.getDate() - 29);
                end.setDate(today.getDate() - 1);
                break;
            case 'This Year':
                start.setMonth(0, 1);
                end.setMonth(11, 31);
                break;
            case 'Last Year':
                start.setFullYear(start.getFullYear() - 1, 0, 1);
                end.setFullYear(end.getFullYear() - 1, 11, 31);
                break;
            default:
                return { start: '', end: '' };
        }
        return { start: formatDate(start), end: formatDate(end) };
    };

    const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const handleFetchData = async () => {
        try {
            const response: FetchDataResponse = await serverFunctions.fetchGoogleAnalyticsData({
                accountId: selectedAccount,
                propertyId: selectedProperty,
                viewId: selectedViewId, // Make sure to pass the correct viewId here
                dimensions: selectedDimensions,
                metrics: selectedMetrics,
                startDate,
                endDate,
                sheetName,
            });

            console.log('GA Report Response:', response);

            if (response.error) {
                setErrorMessage(typeof response.error === 'string' ? response.error : response.error.message);
            } else {
                alert('Data successfully fetched and written to the sheet');
            }
        } catch (error) {
            setErrorMessage('Error fetching data');
        }
    };


    return (
        <div className="p-4">
            <h6 className="text-lg font-semibold mb-4">Google Analytics Page</h6>
            {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}
            <div className="space-y-4">
                <div>
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
                <div>
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
                <div>
                    <label className="block text-sm font-medium text-gray-700">Select View</label>
                    <select
                        value={selectedViewId}
                        onChange={handleViewChange}
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                        <option value="" disabled>Select View</option>
                        {views.map(view => (
                            <option key={view.id} value={view.id}>{view.name}</option>
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
                        {dimensions.map(dimension => (
                            <option key={dimension} value={dimension}>{dimension}</option>
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
                        {metrics.map(metric => (
                            <option key={metric} value={metric}>{metric}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Date Preset</label>
                    <select
                        value={datePreset}
                        onChange={handleDatePresetChange}
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                        <option value="Custom">Custom</option>
                        <option value="Today">Today</option>
                        <option value="Yesterday">Yesterday</option>
                        <option value="This Week">This Week</option>
                        <option value="Last Week">Last Week</option>
                        <option value="Last 7 Days">Last 7 Days</option>
                        <option value="This Month">This Month</option>
                        <option value="Last Month">Last Month</option>
                        <option value="Last 30 Days">Last 30 Days</option>
                        <option value="This Year">This Year</option>
                        <option value="Last Year">Last Year</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Start Date</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        disabled={datePreset !== 'Custom'}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">End Date</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        disabled={datePreset !== 'Custom'}
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
