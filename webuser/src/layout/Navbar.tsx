import { ChevronLeftIcon, HomeIcon } from '@heroicons/react/24/solid';
import { useLocation, useNavigate } from 'react-router-dom';

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();

    const isHomePage = location.pathname === '/';

    // Function to handle navigation to home and clear session storage
    const goHome = () => {
        sessionStorage.clear(); 
        navigate('/');
    };

    return (
        <nav className="h-16 px-4 flex items-center justify-between bg-white border-b border-gray-200 shadow">
            {/* Back Button */}
            {!isHomePage && (
                <button aria-label="Go Back" onClick={() => navigate(-1)}>
                    <ChevronLeftIcon className="w-6 h-6 text-header" />
                </button>
            )}

            {/* Center Logo and Title */}
            <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center">
                <img src="/src/assets/logo.svg" alt="logo" className="w-10 h-10 mr-2" />
                <h1 className="text-lg font-semibold text-header">JodMaiLhong</h1>
            </div>

            {/* Home Button */}
            {!isHomePage && (
                <button aria-label="Go Home" onClick={goHome}>
                    <HomeIcon className="w-6 h-6 text-header" />
                </button>
            )}
        </nav>
    );
}

export default Navbar;