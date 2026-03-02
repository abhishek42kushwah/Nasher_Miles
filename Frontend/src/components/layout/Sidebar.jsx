import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../../store/slices/authSlice';

const Sidebar = ({ isCollapsed, setIsCollapsed, isMobile = false }) => {
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

   

    const menuItems = [
        { icon: 'dashboard', label: 'Dashboard', path: '/dashboard' },
        { icon: 'calendar_month', label: 'Attendance', path: '/attendance' },
        { icon: 'payments', label: 'Salary', path: '/salary' },
        { icon: 'person', label: 'Profile', path: '/profile' },
        { icon: 'folder_open', label: 'FMS', path: '/fms' },
        { icon: 'checklist', label: 'TODO', path: '/todo' },
        { icon: 'assignment_ind', label: 'Delegation', path: '/delegation' },
        { icon: 'check_box', label: 'Checklist', path: '/checklist' },
        { icon: 'inventory_2', label: 'IMS', path: '/ims' },
        { icon: 'groups', label: 'HRMS', path: '/hrms' },
        { icon: 'support_agent', label: 'Help Ticket', path: '/help' },
    ];

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    return (
        <aside className={`${isCollapsed ? 'w-20' : 'w-72'} flex-col border-r border-border-main bg-bg-card transition-all duration-300 ${isMobile ? 'flex w-full border-r-0' : 'hidden md:flex'} shrink-0 h-full overflow-hidden`}>
            {/* Branding - Hidden in mobile since MainLayout shows it */}
            {!isMobile && (
                <div className="p-4 border-b border-border-main flex items-center justify-between">
                    <div className={`flex items-center gap-3 transition-opacity duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
                        <div className="size-10 flex items-center justify-center shadow-sm overflow-hidden">
                            <img src="/d-tab-logo.png" alt="D-Tab Logo" className="w-full h-full object-contain" />
                        </div>
                        {!isCollapsed && (
                            <div className="flex flex-col">
                                <h1 className="text-base font-bold text-text-main leading-tight">D-Tab</h1>
                                <p className="text-text-muted text-xs">v2.4</p>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-2 rounded-lg hover:bg-bg-main text-text-muted transition-colors"
                    >
                        <span className="material-symbols-outlined text-[20px]">
                            {isCollapsed ? 'menu_open' : 'menu'}
                        </span>
                    </button>
                </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
                {!isCollapsed && <p className="px-3 pt-2 pb-2 text-[10px] font-bold text-text-muted uppercase tracking-widest transition-opacity duration-300">Modules</p>}

                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-all group ${isActive
                                ? 'bg-primary/10 text-primary'
                                : 'text-text-muted hover:bg-bg-main'
                                }`}
                            title={isCollapsed ? item.label : ''}
                        >
                            <span className={`material-symbols-outlined transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-primary' : 'text-slate-500'}`}>
                                {item.icon}
                            </span>
                            {!isCollapsed && <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>}
                        </button>
                    );
                })}
            </nav>

            {/* Footer User */}
            <div className="p-4 border-t border-border-main">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 text-text-muted group transition-colors"
                >
                    <div className="relative">
                        <div className="bg-bg-main rounded-full size-10 flex items-center justify-center font-bold text-text-main border-2 border-primary/20">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 size-3 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
                    </div>
                    {!isCollapsed && (
                        <div className="flex flex-col items-start overflow-hidden flex-1">
                            <span className="text-sm font-bold text-text-main truncate w-full text-left">{user?.name || 'User'}</span>
                            <span className="text-xs text-text-muted truncate w-full text-left capitalize">{user?.role || 'Staff'}</span>
                        </div>
                    )}
                    {!isCollapsed && (
                        <span className="material-symbols-outlined text-text-muted group-hover:text-red-500 transition-colors">logout</span>
                    )}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
