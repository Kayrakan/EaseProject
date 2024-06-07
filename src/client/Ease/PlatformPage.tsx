import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AiOutlineArrowLeft } from 'react-icons/ai';
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
                    className="flex items-center p-2 text-black rounded hover:bg-gray-200"
                >
                    <AiOutlineArrowLeft className="w-5 h-5" />
                </button>
                <h6 className="mt-4 text-lg font-semibold">
                    Platform not found
                </h6>
            </div>
        );
    }

    return (
        <div className="p-2">
            <button
                onClick={handleBackClick}
                className="flex items-center p-2 text-black rounded hover:bg-gray-200"
            >
                <AiOutlineArrowLeft className="w-5 h-5" />
            </button>
            <PlatformComponent />
        </div>
    );
};

export default PlatformPage;
