import { useNavigate } from 'react-router-dom';

const PlatformPage = () => {
    const navigate = useNavigate();

    const handleBackClick = () => {
        navigate(-1); // This will navigate back to the previous page
    };

    return (
        <div className="p-4">
            <button
                onClick={handleBackClick}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
            >
                Back
            </button>
            <h6 className="mt-4 text-lg font-semibold">
                GA4 Page
            </h6>
            {/* Add your platform-specific content here */}
        </div>
    );
};

export default PlatformPage;
