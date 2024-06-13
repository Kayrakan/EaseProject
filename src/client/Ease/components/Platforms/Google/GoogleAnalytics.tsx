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

interface UserSavedSettings {
    id: string;
    name: string;
    description: string;
    selectedAccount: SelectOption | null;
    selectedProperty: SelectOption | null;
    selectedDimensions: SelectOption[];
    selectedMetrics: SelectOption[];
    startDate: string;
    endDate: string;
    datePreset: string;
    sheetName: string;
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
    const [loading, setLoading] = useState<boolean>(false);


    const [settingsPanelOpen, setSettingsPanelOpen] = useState(false);
    const [savedSettings, setSavedSettings] = useState<UserSavedSettings[]>([]);

    const [settingsName, setSettingsName] = useState<string>('');


    useEffect(() => {
        const fetchAccounts = async () => {
            setLoading(true);
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
            setLoading(false);
        };

        fetchAccounts();

        fetchSavedSettings();
    }, []);

    const handleAccountChange = async (selectedOption: SelectOption | null) => {
        setSelectedAccount(selectedOption);
        if (selectedOption) {
            setLoading(true);
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
            setLoading(false);
        }
    };

    const handlePropertyChange = async (selectedOption: SelectOption | null) => {
        setSelectedProperty(selectedOption);
        if (selectedOption) {
            setLoading(true);
            const propertyId = selectedOption.value;
            try {
                const response: { dimensions?: Dimension[]; metrics?: Metric[]; error?: string } = await serverFunctions.getGoogleAnalyticsPropertyMetadata(propertyId);

                if (response.dimensions && response.metrics) {
                    setDimensionOptions(response.dimensions.map(dim => ({
                        value: dim.apiName,
                        label: dim.uiName || dim.apiName
                    })));
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
            setLoading(false);
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
        setLoading(true);
        try {
            const response: FetchDataResponse = await serverFunctions.fetchGoogleAnalyticsData({
                propertyId: selectedProperty?.value || '',
                dimensions: selectedDimensions.map(dim => dim.value),
                metrics: selectedMetrics.map(metric => metric.value),
                startDate,
                endDate,
                sheetName,
            });
            if (response.data) {
                setErrorMessage(null);
            } else if (response.error) {
                setErrorMessage(typeof response.error === 'string' ? response.error : response.error.message);
            }
        } catch (error) {
            setErrorMessage('Error fetching data');
        }
        setLoading(false);
    };

    const fetchSavedSettings = async () => {
        try {
            const ga4Settings = await serverFunctions.getConnectedPlatformSettings('Google Analytics');
            if (ga4Settings && ga4Settings.savedSettings) {
                setSavedSettings(ga4Settings.savedSettings);
            }
        } catch (error) {
            console.error('Error fetching saved settings', error);
        }
    };

    const handleSaveSettings = async () => {
        const newSetting: UserSavedSettings = {
            id: `${Date.now()}`,
            name: settingsName || `Settings ${savedSettings.length + 1}`, // Use user-defined name or default
            description: 'User saved settings',
            selectedAccount,
            selectedProperty,
            selectedDimensions,
            selectedMetrics,
            startDate,
            endDate,
            datePreset,
            sheetName,
        };
        try {
            await serverFunctions.addGa4UserSavedSettings(newSetting);
            setSavedSettings([...savedSettings, newSetting]);
            setSettingsName(''); // Clear the settings name input after saving
        } catch (error) {
            console.error('Error saving settings', error);
        }
    };

    const handleRemoveSetting = async (settingId: string) => {
        try {
            console.log('requesting');
            const settingReponse = await serverFunctions.removeGa4UserSavedSettings(settingId);
            console.log('setting reponse: ');
            console.log(settingReponse);
            setSavedSettings(savedSettings.filter(setting => setting.id !== settingId));
        } catch (error) {
            setErrorMessage('Error removing setting');
        }
    };



    useEffect(() => {
        fetchSavedSettings();
    }, []);


    return (
        <div className="p-6 bg-white rounded-lg shadow-lg max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Google Analytics Data Fetcher</h2>
            {errorMessage && <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{errorMessage}</div>}
            {loading && <div className="text-blue-500 font-medium mb-4">Loading...</div>}


            <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-1">Select Account</label>
                <Select
                    value={selectedAccount}
                    onChange={handleAccountChange}
                    options={accounts}
                    className="basic-single"
                    classNamePrefix="select"
                    styles={{
                        control: (provided) => ({
                            ...provided,
                            height: '38px', // Adjust height
                            minHeight: '38px',
                            width: '100%', // Adjust width
                        }),
                        valueContainer: (provided) => ({
                            ...provided,
                            height: '38px',
                            padding: '0 6px',
                        }),
                        input: (provided) => ({
                            ...provided,
                            margin: '0px',
                        }),
                        indicatorsContainer: (provided) => ({
                            ...provided,
                            height: '38px',
                        }),
                    }}
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-1">Select Property</label>
                <Select
                    value={selectedProperty}
                    onChange={handlePropertyChange}
                    options={properties}
                    className="basic-single"
                    classNamePrefix="select"
                    styles={{
                        control: (provided) => ({
                            ...provided,
                            height: '38px', // Adjust height
                            minHeight: '38px',
                            width: '100%', // Adjust width
                        }),
                        valueContainer: (provided) => ({
                            ...provided,
                            height: '38px',
                            padding: '0 6px',
                        }),
                        input: (provided) => ({
                            ...provided,
                            margin: '0px',
                        }),
                        indicatorsContainer: (provided) => ({
                            ...provided,
                            height: '38px',
                        }),
                    }}
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-1">Date Preset</label>
                <select
                    value={datePreset}
                    onChange={handleDatePresetChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                        <label className="block text-gray-700 font-medium mb-1">Start Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-1">End Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </>
            )}
            <div className="mb-4">
                <label htmlFor="google-analytics-dimensions" className="block text-gray-700 font-medium mb-1">Select
                    Dimensions</label>
                <Select
                    id="dimensions"
                    value={selectedDimensions}
                    onChange={(selectedOptions) => setSelectedDimensions(selectedOptions as SelectOption[])}
                    options={dimensionOptions}
                    className="w-full"
                    placeholder="Select dimensions"
                    isMulti
                    isSearchable
                    styles={{
                        control: (provided) => ({
                            ...provided,
                            height: '38px', // Adjust height
                            minHeight: '38px',
                            width: '100%', // Adjust width
                        }),
                        valueContainer: (provided) => ({
                            ...provided,
                            height: '38px',
                            padding: '0 6px',
                        }),
                        input: (provided) => ({
                            ...provided,
                            margin: '0px',
                        }),
                        indicatorsContainer: (provided) => ({
                            ...provided,
                            height: '38px',
                        }),
                    }}
                />
            </div>
            <div className="mb-4">
                <label htmlFor="google-analytics-metrics" className="block text-gray-700 font-medium mb-1">Select
                    Metrics</label>
                <Select
                    id="metrics"
                    value={selectedMetrics}
                    onChange={(selectedOptions) => setSelectedMetrics(selectedOptions as SelectOption[])}
                    options={metricOptions}
                    className="w-full"
                    placeholder="Select metrics"
                    isMulti
                    isSearchable
                    styles={{
                        control: (provided) => ({
                            ...provided,
                            height: '38px', // Adjust height
                            minHeight: '38px',
                            width: '100%', // Adjust width
                        }),
                        valueContainer: (provided) => ({
                            ...provided,
                            height: '38px',
                            padding: '0 6px',
                        }),
                        input: (provided) => ({
                            ...provided,
                            margin: '0px',
                        }),
                        indicatorsContainer: (provided) => ({
                            ...provided,
                            height: '38px',
                        }),
                    }}
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-1">Sheet Name</label>
                <input
                    type="text"
                    value={sheetName}
                    onChange={(e) => setSheetName(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>
            <button
                onClick={handleFetchData}
                className="w-full py-2 px-4 bg-indigo-500 text-white font-semibold rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                Fetch Data
            </button>

            <button
                onClick={() => setSettingsPanelOpen(true)}
                className="mt-4 w-full py-2 px-4 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
                Manage Settings
            </button>



            {/*settings*/}
            {settingsPanelOpen && (
                <div className="fixed bottom-0 left-0 right-0 h-1/2 bg-white shadow-lg p-6 overflow-auto z-50 border-t-4 border-gray-200">
                    <button
                        onClick={() => setSettingsPanelOpen(false)}
                        className="mb-4 py-2 px-4 bg-red-500 text-white font-semibold rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                        Close
                    </button>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-1">Settings Name</label>
                        <input
                            type="text"
                            value={settingsName}
                            onChange={(e) => setSettingsName(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    {/*<div className="mb-4">*/}
                    {/*    <label className="block text-gray-700 font-medium mb-1">Sheet Name</label>*/}
                    {/*    <input*/}
                    {/*        type="text"*/}
                    {/*        value={sheetName}*/}
                    {/*        onChange={(e) => setSheetName(e.target.value)}*/}
                    {/*        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"*/}
                    {/*    />*/}
                    {/*</div>*/}
                    <button
                        onClick={handleSaveSettings}
                        className="w-full py-2 px-4 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Save Settings
                    </button>
                    <div className="mt-4">
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Saved Settings</h3>
                        {savedSettings.map((setting) => (
                            <div key={setting.id} className="mb-2 p-2 border border-gray-300 rounded-md">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium text-gray-800">{setting.name}</span>
                                    <div>
                                        <button
                                            onClick={() => {
                                                setSelectedAccount(setting.selectedAccount);
                                                setSelectedProperty(setting.selectedProperty);
                                                setSelectedDimensions(setting.selectedDimensions);
                                                setSelectedMetrics(setting.selectedMetrics);
                                                setStartDate(setting.startDate);
                                                setEndDate(setting.endDate);
                                                setDatePreset(setting.datePreset);
                                                setSheetName(setting.sheetName);
                                                setSettingsPanelOpen(false);
                                            }}
                                            className="ml-4 py-1 px-2 bg-indigo-500 text-white font-semibold rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                            Apply
                                        </button>
                                        <button
                                            onClick={() => handleRemoveSetting(setting.id)}
                                            className="ml-2 py-1 px-2 bg-red-500 text-white font-semibold rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                                <p className="text-gray-600">{setting.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}




            {/*    settings end */}


        </div>
    );
};

export default GoogleAnalyticsPage;
