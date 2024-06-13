import React, { useState } from 'react';
import { serverFunctions } from '../../../../utils/serverFunctions';

const FacebookAds: React.FC = () => {
    const [adAccount, setAdAccount] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [fields, setFields] = useState<string[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const availableFields = [
        'impressions',
        'clicks',
        'spend',
        'ctr',
        'cpm',
        // Add more fields as necessary
    ];

    const handleFetchData = async () => {
        try {
            console.log('fetch facebook ads data')
            const response = await serverFunctions.fetchFacebookAdsData({
                adAccount,
                startDate,
                endDate,
                fields,
            });

            if (response.error) {
                console.log('error fetch facebook ads data')
                setErrorMessage(response.error);
            } else {
                console.log('poll report status')
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
                console.log('-> fetch report status')

                const statusResponse = await serverFunctions.fetchFacebookReportStatus(reportRunId);
                console.log('status response: ');
                console.log(statusResponse);

                if (statusResponse.error) {
                    console.log('-> fetch report status error ')

                    setErrorMessage(statusResponse.error);
                    clearInterval(interval);
                    return;
                }

                console.log('-> fetch report status check job ')

                if (statusResponse.async_percent_completion === 100 && statusResponse.async_status === 'Job Completed') {

                    clearInterval(interval);
                    console.log('-> fetch report status job complete - > fetch results')

                    fetchReportResults(reportRunId);

                }
                console.log('-> fetch report status done ')

            } catch (error) {
                console.log('-> fetch report status error ')

                const err = error as Error;
                setErrorMessage(`Error checking report status: ${err.message}`);
                clearInterval(interval);
            }
        }, 5000); // Poll every 5 seconds
    };

    const fetchReportResults = async (reportRunId: string) => {
        try {
            console.log(' - > fetch results')

            const resultsResponse = await serverFunctions.fetchFacebookReportResults(reportRunId);
            console.log('result reponse')
            console.log(resultsResponse);
            if (resultsResponse.error) {
                console.log(' - > fetch results error 1 ')

                setErrorMessage(resultsResponse.error);
            } else {
                console.log(' - > fetch results data fetched written')

                alert('Data successfully fetched and written to the sheet');
            }
        } catch (error) {
            console.log(' - > fetch results error 2')

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
                    <label className="block text-sm font-medium text-gray-700">Ad Account</label>
                    <input
                        type="text"
                        value={adAccount}
                        onChange={(e) => setAdAccount(e.target.value)}
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
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
