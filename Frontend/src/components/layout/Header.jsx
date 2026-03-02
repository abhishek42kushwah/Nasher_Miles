import { useDispatch, useSelector } from 'react-redux';
import { setTheme, updateUserTheme } from '../../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

const Header = ({ title = "Dashboard Overview", onMenuClick }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { theme } = useSelector((state) => state.auth);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        console.log('Toggling theme to:', newTheme);
        dispatch(setTheme(newTheme));
        dispatch(updateUserTheme(newTheme));
    };

    return (
        <header className="h-16 flex items-center justify-between px-6 bg-bg-card border-b border-border-main shrink-0 sticky top-0 z-20">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="md:hidden p-2 rounded-lg hover:bg-bg-main text-text-muted transition-colors"
                >
                    <span className="material-symbols-outlined">menu</span>
                </button>
                <h2 className="text-lg font-bold text-text-main tracking-tight">{title}</h2>
            </div>

            <div className="flex items-center gap-4 md:gap-7">
                {/* Desktop Search */}
                <div className="hidden lg:flex relative group w-72">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-text-muted text-[20px] group-focus-within:text-primary transition-colors">search</span>
                    </div>
                    <input
                        className="block w-full pl-10 pr-3 py-2 border border-border-main rounded-xl bg-bg-main text-sm placeholder-text-muted/50 text-text-main focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        placeholder="Search modules, tasks, files..."
                        type="text"
                    />
                </div>

                <div className="flex items-center gap-1.5">
                    <button
                        onClick={() => navigate('/notifications')}
                        className="p-2 rounded-xl hover:bg-bg-main text-text-muted relative transition-colors"
                        title="Notifications"
                    >
                        <span className="material-symbols-outlined text-[24px]">notifications</span>
                        <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-bg-card"></span>
                    </button>
                    <button
                        onClick={() => navigate('/help-demo')}
                        className="hidden md:block p-2 rounded-xl hover:bg-bg-main text-text-muted transition-colors"
                        title="Help"
                    >
                        <span className="material-symbols-outlined text-[24px]">help</span>
                    </button>
                    <button
                        onClick={toggleTheme}
                        className="hidden md:block p-2 rounded-xl hover:bg-bg-main text-text-muted transition-colors"
                        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                    >
                        <span className="material-symbols-outlined text-[24px]">
                            {theme === 'light' ? 'dark_mode' : 'light_mode'}
                        </span>
                    </button>
                    <button
                        onClick={() => navigate('/settings')}
                        className="hidden md:block p-2 rounded-xl hover:bg-bg-main text-text-muted transition-colors"
                        title="Settings"
                    >
                        <span className="material-symbols-outlined text-[24px]">settings</span>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
