import React, { useState, useEffect } from 'react';
import Select, { MultiValue, SingleValue } from 'react-select';
import { serverFunctions } from '../../../../utils/serverFunctions';
import './styles.css';

interface SelectOption {
    value: string;
    label: string;
}

interface Event {
    id: string;
    name: string;
    short_name: string;
}

interface AdjustApiKey {
    name: string;
    key: string;
}

const Adjust: React.FC = () => {
    const [dimensions, setDimensions] = useState<SelectOption[]>([]);
    const [metrics, setMetrics] = useState<SelectOption[]>([]);
    const [selectedDimensions, setSelectedDimensions] = useState<SelectOption[]>([]);
    const [selectedMetrics, setSelectedMetrics] = useState<SelectOption[]>([]);
    const [selectedApiKey, setSelectedApiKey] = useState<AdjustApiKey | null>(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [events, setEvents] = useState<Event[]>([]);
    const [showEventSelect, setShowEventSelect] = useState(false);
    const [apiKeys, setApiKeys] = useState<AdjustApiKey[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                setLoading(true);
                const { dimensions, metrics } = await serverFunctions.getAdjustOptions();
                setDimensions(dimensions);
                setMetrics(metrics);
            } catch (error) {
                console.error('Error fetching options:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOptions();
    }, []);

    useEffect(() => {
        const fetchApiKeys = async () => {
            try {
                const response = await serverFunctions.getAdjustApiKeys();
                setApiKeys(response);
            } catch (error) {
                console.error('Error fetching API keys:', error);
            }
        };

        fetchApiKeys();
    }, []);

    useEffect(() => {
        if (selectedMetrics.some(metric => metric.value === '{event_slug}_events')) {
            fetchEvents();
        }
    }, [selectedMetrics]);

    const fetchEvents = async () => {
        if (!selectedApiKey) {
            alert('Please select an API key');
            return;
        }

        try {
            setLoading(true);
            const events = await serverFunctions.fetchEvents(selectedApiKey.key);
            setEvents(events);
            setShowEventSelect(true);
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEventSelect = (eventId: string) => {
        setSelectedMetrics(selectedMetrics.map(metric =>
            metric.value === '{event_slug}_events' ? { value: `${eventId}_events`, label: `${eventId}_events` } : metric
        ));
        setShowEventSelect(false);
    };

    const handlePullData = async () => {
        if (!selectedApiKey) {
            alert('Please select an API key');
            return;
        }

        try {
            setLoading(true);
            const data = await serverFunctions.pullAdjustData({
                apiKey: selectedApiKey.key,
                dimensions: selectedDimensions.map(d => d.value),
                metrics: selectedMetrics.map(m => m.value),
                startDate,
                endDate,
            });
            console.log('response:', data);
        } catch (error) {
            console.error('Error pulling data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-semibold mb-4">Adjust Platform</h1>
            {loading && <div className="loading-spinner">.</div>}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Select API Key</label>
                <Select
                    options={apiKeys.map(api => ({ value: api.key, label: api.name }))}
                    value={selectedApiKey ? { value: selectedApiKey.key, label: selectedApiKey.name } : null}
                    onChange={(option: SingleValue<SelectOption>) => {
                        const apiKey = apiKeys.find(api => api.key === option?.value);
                        setSelectedApiKey(apiKey || null);
                    }}
                    className="basic-single-select"
                    classNamePrefix="select"
                    isDisabled={loading}
                />
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Select Dimensions</label>
                <Select
                    isMulti
                    options={dimensions}
                    value={selectedDimensions}
                    onChange={(newValue: MultiValue<SelectOption>) => setSelectedDimensions(newValue as SelectOption[])}
                    className="basic-multi-select"
                    classNamePrefix="select"
                    isDisabled={loading}
                />
                <div className="mt-2">
                    {selectedDimensions.length > 0 && (
                        <div className="p-2 border rounded">
                            <strong>Selected Dimensions:</strong>
                            <ul>
                                {selectedDimensions.map(d => (
                                    <li key={d.value} className="inline-block bg-gray-200 rounded px-2 py-1 m-1">
                                        {d.label}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Select Metrics</label>
                <Select
                    isMulti
                    options={metrics}
                    value={selectedMetrics}
                    onChange={(newValue: MultiValue<SelectOption>) => setSelectedMetrics(newValue as SelectOption[])}
                    className="basic-multi-select"
                    classNamePrefix="select"
                    isDisabled={loading}
                />
                <div className="mt-2">
                    {selectedMetrics.length > 0 && (
                        <div className="p-2 border rounded">
                            <strong>Selected Metrics:</strong>
                            <ul>
                                {selectedMetrics.map(m => (
                                    <li key={m.value} className="inline-block bg-gray-200 rounded px-2 py-1 m-1">
                                        {m.label}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
                {showEventSelect && (
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700">Select Event</label>
                        <Select
                            options={events.map(event => ({ value: event.id, label: event.name }))}
                            onChange={(option) => handleEventSelect(option?.value || '')}
                            className="basic-single-select"
                            classNamePrefix="select"
                            isDisabled={loading}
                        />
                    </div>
                )}
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    disabled={loading}
                />
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    disabled={loading}
                />
            </div>
            <button
                onClick={handlePullData}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                disabled={loading}
            >
                {loading ? 'Loading...' : 'Pull Data'}
            </button>
        </div>
    );
};

export default Adjust;
