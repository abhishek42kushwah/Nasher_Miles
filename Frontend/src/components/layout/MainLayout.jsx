import { useSelector } from 'react-redux';
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const MainLayout = ({ children, title }) => {
    const { theme } = useSelector((state) => state.auth);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    React.useEffect(() => {

        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            document.documentElement.style.colorScheme = 'dark';
        } else {
            document.documentElement.classList.remove('dark');
            document.documentElement.style.colorScheme = 'light';
        }
    }, [theme]);

    return (
        <div className="flex h-screen w-full bg-bg-main text-text-main overflow-hidden">
            {/* Desktop Sidebar */}
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                <Header title={title} onMenuClick={() => setIsMobileMenuOpen(true)} />

                {/* Scrollable Page Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-3 md:p-4">
                    <div className="max-w-[1600px] mx-auto">
                        {children}
                    </div>
                </div>
            </main>

            {/* Mobile Overlay Menu */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                >
                    <div
                        className="w-72 h-full bg-bg-card shadow-xl flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-4 border-b border-border-main flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="size-10 flex items-center justify-center shadow-sm overflow-hidden">
                                    <img src="/d-tab-logo.png" alt="D-Tab Logo" className="w-full h-full object-contain" />
                                </div>
                                <h1 className="text-base font-bold text-text-main leading-tight">D-Tab</h1>
                            </div>
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="p-2 rounded-lg hover:bg-bg-main text-text-muted transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto w-full">
                            <Sidebar isCollapsed={false} setIsCollapsed={() => { }} isMobile={true} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MainLayout;
