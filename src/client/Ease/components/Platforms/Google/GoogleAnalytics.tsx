import { useState, useEffect } from 'react';
import Select from 'react-select';
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
    uiName?: string;
    apiName: string;
}

interface Metric {
    uiName?: string;
    apiName: string;
}

interface FetchDataResponse {
    data?: any[];
    error?: string | { message: string };
}

interface SelectOption {
    value: string;
    label: string;
}

const GoogleAnalyticsPage = () => {
    const [accounts, setAccounts] = useState<SelectOption[]>([]);
    const [properties, setProperties] = useState<SelectOption[]>([]);
    const [dimensionOptions, setDimensionOptions] = useState<SelectOption[]>([]);
    const [metricOptions, setMetricOptions] = useState<SelectOption[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<SelectOption | null>(null);
    const [selectedProperty, setSelectedProperty] = useState<SelectOption | null>(null);
    const [selectedDimensions, setSelectedDimensions] = useState<SelectOption[]>([]);
    const [selectedMetrics, setSelectedMetrics] = useState<SelectOption[]>([]);
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [datePreset, setDatePreset] = useState<string>('Custom');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [sheetName, setSheetName] = useState<string>('');

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const response: { accounts?: Account[]; error?: string } = await serverFunctions.listGoogleAnalyticsAccounts();
                if (response.accounts) {
                    setAccounts(response.accounts.map(account => ({ value: account.id, label: account.name })));
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

    const handleAccountChange = async (selectedOption: SelectOption | null) => {
        setSelectedAccount(selectedOption);
        if (selectedOption) {
            const accountId = selectedOption.value.split('/').pop() || '';
            try {
                const response: { properties?: Property[]; error?: string } = await serverFunctions.listGoogleAnalyticsProperties(accountId);
                if (response.properties) {
                    setProperties(response.properties.map(property => ({ value: property.id, label: property.name })));
                    setSelectedProperty(null); // Reset selected property when account changes
                } else if (response.error) {
                    setErrorMessage(response.error);
                } else {
                    setErrorMessage('Unexpected response structure');
                }
            } catch (error) {
                setErrorMessage('Error fetching Google Analytics properties');
            }
        }
    };

    const handlePropertyChange = async (selectedOption: SelectOption | null) => {
        setSelectedProperty(selectedOption);
        if (selectedOption) {
            const propertyId = selectedOption.value;
            try {
                const response: { dimensions?: Dimension[]; metrics?: Metric[]; error?: string } = await serverFunctions.getGoogleAnalyticsPropertyMetadata(propertyId);

                console.log('dimensions')
                console.log(response.dimensions)
                if (response.dimensions && response.metrics) {
                    setDimensionOptions(response.dimensions.map(dim => ({
                        value: dim.apiName,
                        label: dim.uiName || dim.apiName
                    })));
                    console.log('dimensions')
                    console.log(dimensionOptions)
                    setMetricOptions(response.metrics.map(metric => ({
                        value: metric.apiName,
                        label: metric.uiName || metric.apiName
                    })));
                } else if (response.error) {
                    setErrorMessage(response.error);
                } else {
                    setErrorMessage('Unexpected response structure');
                }
            } catch (error) {
                setErrorMessage('Error fetching Google Analytics property metadata');
            }
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
                end.setDate(end.getDay() ? (end.getDate() - end.getDay() - 1) : end.getDate() - 6);
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
                propertyId: selectedProperty?.value || '',
                dimensions: selectedDimensions.map(dim => dim.value),
                metrics: selectedMetrics.map(metric => metric.value),
                startDate,
                endDate,
                sheetName,
            });
            console.log('response');
            console.log(response);
            if (response.data) {
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
                <Select
                    value={selectedAccount}
                    onChange={handleAccountChange}
                    options={accounts}
                    className="basic-multi-select"
                    classNamePrefix="select"
                />
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Select Property</label>
                <Select
                    value={selectedProperty}
                    onChange={handlePropertyChange}
                    options={properties}
                    className="basic-multi-select"
                    classNamePrefix="select"
                />
            </div>
            <div className="mb-4">
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
            {datePreset === 'Custom' && (
                <>
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
                </>
            )}
            <div className="mb-4">
                <label htmlFor="google-analytics-dimensions" className="block text-sm font-medium text-gray-700">Select Dimensions</label>
                <Select
                    id="dimensions"
                    value={selectedDimensions}
                    onChange={(selectedOptions) => setSelectedDimensions(selectedOptions as SelectOption[])}
                    options={dimensionOptions}
                    className="w-full"
                    placeholder="Select dimensions"
                    isMulti
                    isSearchable
                />
            </div>
            <div className="mb-4">
                <label htmlFor="google-analytics-metrics" className="block text-sm font-medium text-gray-700">Select Metrics</label>
                <Select
                    id="metrics"
                    value={selectedMetrics}
                    onChange={(selectedOptions) => setSelectedMetrics(selectedOptions as SelectOption[])}
                    options={metricOptions}
                    className="w-full"
                    placeholder="Select metrics"
                    isMulti
                    isSearchable
                />
            </div>
            <div className="mb-4">
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
    );
};

export default GoogleAnalyticsPage;
