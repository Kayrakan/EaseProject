import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import platformComponents from './PlatformComponents';

const PlatformPage: React.FC = () => {
    const { id } = useParams<{ id?: string }>(); // id might be undefined
    const PlatformComponent = id ? platformComponents[id] : undefined;

    const navigate = useNavigate();

    const handleBackClick = () => {
        navigate(-1); // This will navigate back to the previous page
    };

    if (!PlatformComponent) {
        return (
            <div className="p-4">
                <button
                    onClick={handleBackClick}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
                >
                    Back
                </button>
                <h6 className="mt-4 text-lg font-semibold">
                    Platform not found
                </h6>
            </div>
        );
    }

    return (
        <div className="p-4">
            <button
                onClick={handleBackClick}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
            >
                Back
            </button>
            <PlatformComponent />
        </div>
    );
};

export default PlatformPage;
