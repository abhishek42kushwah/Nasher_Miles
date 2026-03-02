import React from 'react';
import LeftPanel from './components/LeftPanel';
import LoginForm from './components/LoginForm';

const LoginPage = () => {
    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white h-screen overflow-hidden flex font-display w-full">
            {/* Left Section: Visual & Features */}
            <LeftPanel />

            {/* Right Section: Login Form */}
            <div className="w-full lg:w-1/2 flex flex-col h-full bg-white dark:bg-slate-950 overflow-y-auto">
                {/* Top Helper Links */}
                <div className="flex justify-end p-6 md:p-10">
                    <div className="flex gap-6">
                        <a className="text-sm font-medium text-slate-500 hover:text-primary transition-colors" href="/help-center">Help Center</a>
                        <a className="text-sm font-medium text-slate-500 hover:text-primary transition-colors" href="/contact-support">Contact Support</a>
                    </div>
                </div>

                <div className="flex flex-1 flex-col justify-center items-center px-6 md:px-20 lg:px-24 py-10">
                    <LoginForm />
                </div>

                {/* Bottom Bar (Mobile/Tablet only) */}
                <div className="lg:hidden p-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex justify-center items-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-wider">
                        <span className="material-symbols-outlined text-sm">verified_user</span>
                        <span>Role-Based Access Control</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
