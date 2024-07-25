import React, { useState, useEffect } from 'react';
import Select, { MultiValue, SingleValue } from 'react-select';
import { serverFunctions } from '../../../../utils/serverFunctions';
import Spinner from './Spinner';  // Adjust the import path as necessary

interface SelectOption {
    value: string;
    label: string;
}

export interface FbUserSavedSettings {
    id: string;
    name: string;
    description: string;
    selectedAccount: SelectOption | null; // this will be the ad account, for example: act_955477841883144
    selectedFields: SelectOption[]; // Array of selected fields
    selectedBreakdowns: SelectOption[]; // Array of selected breakdowns
    filterSettings: { filter: string, operator: string, value: string }[]; // Filter settings
    startDate: string;
    endDate: string;
    datePreset: string;
    sheetName: string;
}

const levels = [
    { value: 'ad', label: 'Ad' },
    { value: 'adset', label: 'Ad Set' },
    { value: 'campaign', label: 'Campaign' },
    { value: 'account', label: 'Account' },
];

interface Field {
    value: string;
    label: string;
}

const breakdownOptions = [
    { value: 'ad_format_asset', label: 'ad_format_asset' },
    { value: 'age', label: 'age' },
    { value: 'app_id', label: 'app_id' },
    { value: 'body_asset', label: 'body_asset' },
    { value: 'call_to_action_asset', label: 'call_to_action_asset' },
    { value: 'coarse_conversion_value', label: 'coarse_conversion_value' },
    { value: 'country', label: 'country' },
    { value: 'description_asset', label: 'description_asset' },
    { value: 'fidelity_type', label: 'fidelity_type' },
    { value: 'gender', label: 'gender' },
    { value: 'hsid', label: 'hsid' },
    { value: 'image_asset', label: 'image_asset' },
    { value: 'impression_device', label: 'impression_device' },
    { value: 'is_conversion_id_modeled', label: 'is_conversion_id_modeled' },
    { value: 'is_rendered_as_delayed_skip_ad', label: 'is_rendered_as_delayed_skip_ad' },
    { value: 'landing_destination', label: 'landing_destination' },
    { value: 'link_url_asset', label: 'link_url_asset' },
    { value: 'mdsa_landing_destination', label: 'mdsa_landing_destination' },
    { value: 'media_asset_url', label: 'media_asset_url' },
    { value: 'media_creator', label: 'media_creator' },
    { value: 'media_destination_url', label: 'media_destination_url' },
    { value: 'media_format', label: 'media_format' },
    { value: 'media_origin_url', label: 'media_origin_url' },
    { value: 'media_text_content', label: 'media_text_content' },
    { value: 'postback_sequence_index', label: 'postback_sequence_index' },
    { value: 'product_id', label: 'product_id' },
    { value: 'redownload', label: 'redownload' },
    { value: 'region', label: 'region' },
    { value: 'skan_campaign_id', label: 'skan_campaign_id' },
    { value: 'skan_conversion_id', label: 'skan_conversion_id' },
    { value: 'skan_version', label: 'skan_version' },
    { value: 'title_asset', label: 'title_asset' },
    { value: 'user_persona_id', label: 'user_persona_id' },
    { value: 'user_persona_name', label: 'user_persona_name' },
    { value: 'video_asset', label: 'video_asset' },
    { value: 'dma', label: 'dma' },
    { value: 'frequency_value', label: 'frequency_value' },
    { value: 'hourly_stats_aggregated_by_advertiser_time_zone', label: 'hourly_stats_aggregated_by_advertiser_time_zone' },
    { value: 'hourly_stats_aggregated_by_audience_time_zone', label: 'hourly_stats_aggregated_by_audience_time_zone' },
    { value: 'mmm', label: 'mmm' },
    { value: 'place_page_id', label: 'place_page_id' },
    { value: 'publisher_platform', label: 'publisher_platform' },
    { value: 'platform_position', label: 'platform_position' },
    { value: 'device_platform', label: 'device_platform' },
    { value: 'standard_event_content_type', label: 'standard_event_content_type' },
    { value: 'conversion_destination', label: 'conversion_destination' },
    { value: 'signal_source_bucket', label: 'signal_source_bucket' },
    { value: 'marketing_messages_btn_name', label: 'marketing_messages_btn_name' }

    // Add more breakdown options as necessary
];

const filterOptions = [
    { value: 'mobile_app_installs', label: 'Mobile App Installs' },
    { value: 'mobile_app_search', label: 'Mobile App Search' },
    { value: 'mobile_app_donations', label: 'Mobile App Donations' },
    { value: 'objective', label: 'Objective' },
    { value: 'offline_contacts', label: 'Offline Contacts' },
    // Add more filter options as necessary
];

const operatorOptions = [
    { value: '>', label: '>' },
    { value: '>=', label: '>=' },
    { value: '=', label: '=' },
    { value: '<>', label: '<> (Not Equals)' },
    { value: '<', label: '<' },
    { value: '<=', label: '<=' },
    { value: 'in_range', label: 'In Range' },
    { value: 'not_in_range', label: 'Not In Range' },
];

interface SelectOption {
    value: string;
    label: string;
}

const FacebookAds: React.FC = () => {
    const [adAccount, setAdAccount] = useState('');
    const [adAccounts, setAdAccounts] = useState<any[]>([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedLevel, setSelectedLevel] = useState<SelectOption | null>(null);
    const [fields, setFields] = useState<SelectOption[]>([]);
    const [availableFields, setAvailableFields] = useState<SelectOption[]>([]);
    const [breakdown, setBreakdown] = useState<SelectOption[]>([]);
    const [filters, setFilters] = useState<{ filter: string, operator: string, value: string }[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [connectedUsers, setConnectedUsers] = useState<any[]>([]);
    const [selectedUser, setSelectedUser] = useState<string>('');
    const [showSettings, setShowSettings] = useState(false);
    const [savedTemplates, setSavedTemplates] = useState<any[]>([]);
    const [templateName, setTemplateName] = useState('');

    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [isLoadingFields, setIsLoadingFields] = useState(false);
    const [isFetchingData, setIsFetchingData] = useState(false);
    const [isSavingTemplate, setIsSavingTemplate] = useState(false);


    // progress percentage
    const [progressPercentage, setProgressPercentage] = useState(0);


    useEffect(() => {
        setIsLoadingUsers(true);
        const fetchConnectedUsers = async () => {
            try {
                const users = await serverFunctions.getConnectedFacebookAccounts();
                setConnectedUsers(users);
            } catch (error) {
                const err = error as Error;
                setErrorMessage(`Error fetching connected users: ${err.message}`);
            } finally {
                setIsLoadingUsers(false);
            }
        };

        const fetchSavedTemplates = async () => {
            try {
                const templates = await serverFunctions.getSavedTemplates();
                setSavedTemplates(templates);
            } catch (error) {
                const err = error as Error;
                setErrorMessage(`Error fetching saved templates: ${err.message}`);
            } finally {
            }
        };

        fetchConnectedUsers();
        fetchSavedTemplates();
    }, []);

    const handleUserChange = async (userId: string) => {
        setSelectedUser(userId);
        setIsLoadingFields(true);
        try {
            const response = await serverFunctions.fetchFacebookAdAccounts(userId);
            if (response.error) {
                setErrorMessage(response.error);
            } else {
                setAdAccounts(response.data);
                fetchAvailableFields(userId);  // Fetch available fields when user changes

            }
        } catch (error) {
            const err = error as Error;
            setErrorMessage(`Error fetching ad accounts: ${err.message}`);
        } finally {
            setIsLoadingFields(false);

        }
    };
    const fetchAvailableFields = async (userId: string) => {
        try {
            const response = await serverFunctions.fetchFacebookAvailableFields(userId);
            if (response.error) {
                setErrorMessage(response.error);
            } else {
                const fields = response.fields ? response.fields.map((field: Field) => ({ value: field.value, label: field.label })) : [];
                setAvailableFields(fields);
            }
        } catch (error) {
            const err = error as Error;
            setErrorMessage(`Error fetching available fields: ${err.message}`);
        } finally {
        }
    };

    const handleFetchData = async () => {
        if (!selectedLevel) {
            setErrorMessage('Please select a level.');
            return;
        }
        setIsFetchingData(true); // Set loading state

        try {
            const response = await serverFunctions.fetchFacebookAdsData({
                adAccount,
                startDate,
                endDate,
                fields: fields.map(field => field.value),
                breakdown: breakdown.map(b => b.value).join(','),
                filters,
                identifier: selectedUser,
                level: selectedLevel.value,  // Add this line
            });

            if (response.error) {
                setErrorMessage(response.error);
            } else {
                pollReportStatus(response.reportRunId);
            }
        } catch (error) {
            const err = error as Error;
            setErrorMessage(`Error fetching data: ${err.message}`);
        } finally {
        }
    };


    const pollReportStatus = async (reportRunId: string) => {
        const interval = setInterval(async () => {
            try {
                const statusResponse = await serverFunctions.fetchFacebookReportStatus(reportRunId, selectedUser);
                console.log('status responsse:')
                console.log(statusResponse);
                if (statusResponse.error) {
                    setErrorMessage(statusResponse.error);
                    clearInterval(interval);
                    return;
                }
                setProgressPercentage(statusResponse.async_percent_completion);
                console.log('percentage: ')
                console.log(statusResponse.async_percent_completion)
                if (statusResponse.async_percent_completion === 100 && statusResponse.async_status === 'Job Completed') {
                    clearInterval(interval);
                    fetchReportResults(reportRunId);
                }
            } catch (error) {
                const err = error as Error;
                setErrorMessage(`Error checking report status: ${err.message}`);
                clearInterval(interval);
            } finally {
            }
        }, 2000); // Poll every 5 seconds
    };


    const fetchReportResults = async (reportRunId: string) => {
        try {
            const resultsResponse = await serverFunctions.fetchFacebookReportResults(reportRunId, selectedUser);
            console.log('got results response');
            console.log(resultsResponse);
            if (resultsResponse.error) {
                setErrorMessage(resultsResponse.error);
            } else {
                alert('Data successfully fetched and written to the sheet');
                setProgressPercentage(0);
            }
        } catch (error) {
            console.log('could not get result response');
            const err = error as Error;
            setErrorMessage(`Error fetching report results: ${err.message}`);
        } finally {
            setIsFetchingData(false); // Reset loading state
        }
    };

    const handleAddFilter = () => {
        setFilters([...filters, { filter: '', operator: '', value: '' }]);
    };

    const handleFilterChange = (index: number, key: 'filter' | 'operator' | 'value', value: string) => {
        const newFilters = [...filters];
        newFilters[index][key] = value;
        setFilters(newFilters);
    };

    const handleRemoveFilter = (index: number) => {
        const newFilters = filters.filter((_, i) => i !== index);
        setFilters(newFilters);
    };

    const handleSaveTemplate = async () => {
        if (!templateName) {
            setErrorMessage('Please provide a name for the template.');
            return;
        }

        const newTemplate: FbUserSavedSettings = {
            id: Date.now().toString(),
            name: templateName,
            description: '',
            selectedAccount: adAccount ? { value: adAccount, label: adAccounts.find(acc => acc.id === adAccount)?.name || '' } : null,
            selectedFields: fields,
            selectedBreakdowns: breakdown,
            filterSettings: filters,
            startDate,
            endDate,
            datePreset: '',
            sheetName: '',
        };

        setIsSavingTemplate(true); // Set loading state
        try {
            await serverFunctions.saveTemplate(newTemplate);
            setSavedTemplates([...savedTemplates, newTemplate]);
            setTemplateName('');
            alert('Template saved successfully');
        } catch (error) {
            const err = error as Error;
            setErrorMessage(`Error saving template: ${err.message}`);
        } finally {
            setIsSavingTemplate(false); // Reset loading state

        }
    };

    const handleDeleteTemplate = async (templateId: string) => {
        try {
            await serverFunctions.deleteTemplate(templateId);
            setSavedTemplates(savedTemplates.filter(template => template.id !== templateId));
            alert('Template deleted successfully');
        } catch (error) {
            const err = error as Error;
            setErrorMessage(`Error deleting template: ${err.message}`);
        }
    };

    const handleApplyTemplate = (template: FbUserSavedSettings) => {
        setAdAccount(template.selectedAccount?.value || '');
        setFields(template.selectedFields || []);
        setBreakdown(template.selectedBreakdowns || []);
        setFilters(template.filterSettings || []);
        setStartDate(template.startDate || '');
        setEndDate(template.endDate || '');
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-semibold mb-4">Facebook Ads Data</h1>
            {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}
            <div className="space-y-4">
                {isLoadingUsers ? (
                    <Spinner />
                ) : (
                    <>
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
                            <label className="block text-sm font-medium text-gray-700">Level</label>
                            <Select
                                value={selectedLevel}
                                onChange={(selected: SingleValue<SelectOption>) => setSelectedLevel(selected)}
                                options={levels}
                                className="mt-1"
                                classNamePrefix="select"
                            />
                        </div>
                        {isLoadingFields ? (
                            <Spinner />
                        ) : (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Fields</label>
                                    <Select
                                        isMulti
                                        value={fields}
                                        onChange={(selected: MultiValue<SelectOption>) => setFields(selected as SelectOption[])}
                                        options={availableFields}
                                        className="mt-1"
                                        classNamePrefix="select"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Breakdown</label>
                                    <Select
                                        isMulti
                                        value={breakdown}
                                        onChange={(selected: MultiValue<SelectOption>) => setBreakdown(selected as SelectOption[])}
                                        options={breakdownOptions}
                                        className="mt-1"
                                        classNamePrefix="select"
                                    />
                                </div>
                            </>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700"></label>
                            {filters.map((filter, index) => (
                                <div key={index} className="space-y-2 mb-2">
                                    <Select
                                        value={filterOptions.find(option => option.value === filter.filter)}
                                        onChange={(selected: SingleValue<SelectOption>) => handleFilterChange(index, 'filter', selected ? selected.value : '')}
                                        options={filterOptions}
                                        className="w-full"
                                        classNamePrefix="select"
                                    />
                                    <Select
                                        value={operatorOptions.find(option => option.value === filter.operator)}
                                        onChange={(selected: SingleValue<SelectOption>) => handleFilterChange(index, 'operator', selected ? selected.value : '')}
                                        options={operatorOptions}
                                        className="w-full"
                                        classNamePrefix="select"
                                    />
                                    <input
                                        type="text"
                                        value={filter.value}
                                        onChange={(e) => handleFilterChange(index, 'value', e.target.value)}
                                        placeholder="Please enter value"
                                        className="w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    />
                                    <button onClick={() => handleRemoveFilter(index)} className="text-red-500">Remove</button>
                                </div>
                            ))}
                            <button
                                hidden={true}
                                onClick={handleAddFilter}
                                className="mt-2 py-1 px-3 bg-blue-500 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                + Add Filter
                            </button>
                        </div>
                        <button
                            onClick={handleFetchData}
                            className={`mt-4 w-full py-2 px-4 text-white rounded-md ${isFetchingData ? 'bg-gray-500' : 'bg-blue-500 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                            disabled={isFetchingData}
                        >
                            {isFetchingData ? 'Fetching Data...' : 'Fetch Data'}
                        </button>
                        {isFetchingData && <Spinner />}

                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">Job Completion</label>
                            <div className="w-full bg-gray-200 rounded-full h-4">
                                <div
                                    className="bg-blue-600 h-4 rounded-full"
                                    style={{ width: `${progressPercentage}%` }}
                                ></div>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className="mt-4 w-full py-2 px-4 bg-gray-500 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Settings
                        </button>
                        {showSettings && (
                            <div className="mt-4 p-4 border rounded-md bg-gray-50">
                                <h2 className="text-xl font-semibold mb-4">Manage Templates</h2>
                                <input
                                    type="text"
                                    value={templateName}
                                    onChange={(e) => setTemplateName(e.target.value)}
                                    placeholder="Template Name"
                                    className="w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm mb-4"
                                />
                                <button
                                    onClick={handleSaveTemplate}
                                    className={`w-full py-2 px-4 text-white rounded-md ${isSavingTemplate ? 'bg-gray-500' : 'bg-green-500 hover:bg-green-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mb-4`}
                                    disabled={isSavingTemplate}
                                >
                                    {isSavingTemplate ? 'Saving Template...' : 'Save Template'}
                                </button>
                                {isSavingTemplate && <Spinner />}  // Add this line

                                <ul>
                                    {savedTemplates.map((template) => (
                                        <li key={template.id} className="flex items-center justify-between mb-2">
                                            <span>{template.name}</span>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleApplyTemplate(template)}
                                                    className="py-1 px-3 bg-blue-500 text-white rounded-md hover:bg-blue-700"
                                                >
                                                    Apply
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteTemplate(template.id)}
                                                    className="py-1 px-3 bg-red-500 text-white rounded-md hover:bg-red-700"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );


};

export default FacebookAds;
