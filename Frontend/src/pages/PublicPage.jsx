import React from 'react';
import { useNavigate } from 'react-router-dom';

const getPageConfig = (type) => {
    switch (type) {
        case 'help-center':
            return {
                title: 'Help Center',
                subtitle: 'How can we help you today?',
                content: (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {['Getting Started', 'Account Settings', 'Billing & Plans', 'Troubleshooting'].map((item) => (
                                <div key={item} className="p-4 border border-border-main rounded-xl hover:border-primary cursor-pointer transition-colors bg-bg-card">
                                    <h3 className="font-bold text-text-main mb-2">{item}</h3>
                                    <p className="text-sm text-text-muted">Learn more about {item.toLowerCase()} and how to manage it.</p>
                                </div>
                            ))}
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-900">
                            <h3 className="font-bold text-blue-800 dark:text-blue-300 mb-2">Popular Articles</h3>
                            <ul className="list-disc list-inside space-y-2 text-blue-700 dark:text-blue-400 text-sm">
                                <li>How to reset your password</li>
                                <li>Setting up 2FA authentication</li>
                                <li>Importing data from CSV</li>
                            </ul>
                        </div>
                    </div>
                )
            };
        case 'contact-support':
            return {
                title: 'Contact Support',
                subtitle: 'We are here to help 24/7',
                content: (
                    <div className="space-y-6">
                        <div className="bg-bg-card p-6 rounded-xl border border-border-main">
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-text-muted mb-1">Subject</label>
                                    <select className="w-full p-2 rounded-lg border border-border-main bg-bg-main outline-none focus:border-primary">
                                        <option>Technical Issue</option>
                                        <option>Billing Question</option>
                                        <option>Feature Request</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-text-muted mb-1">Message</label>
                                    <textarea className="w-full p-2 rounded-lg border border-border-main bg-bg-main outline-none focus:border-primary h-32" placeholder="Describe your issue..."></textarea>
                                </div>
                                <button className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors w-full">
                                    Submit Ticket
                                </button>
                            </div>
                        </div>
                        <div className="text-center">
                            <p className="text-text-muted text-sm">Or email us directly at <a href="#" className="text-primary font-bold">support@d-tab.com</a></p>
                        </div>
                    </div>
                )
            };
        case 'terms':
            return {
                title: 'Terms of Service',
                subtitle: 'Last updated: January 2026',
                content: (
                    <div className="space-y-4 text-text-muted text-sm leading-relaxed text-justify">
                        <p>Welcome to Enterprise ERP ("we," "our," or "us"). By accessing or using our services, you agree to be bound by these Terms of Service.</p>
                        <h3 className="font-bold text-text-main text-base">1. Acceptance of Terms</h3>
                        <p>By accessing our platform, you confirm that you can form a binding contract and that you accept these Terms.</p>
                        <h3 className="font-bold text-text-main text-base">2. User Responsibilities</h3>
                        <p>You differ to use the platform only for lawful purposes. You are responsible for maintaining the confidentiality of your account.</p>
                        <h3 className="font-bold text-text-main text-base">3. Data Privacy</h3>
                        <p>We care about your data. Please refer to our Privacy Policy to understand how we handle your information.</p>
                        <h3 className="font-bold text-text-main text-base">4. Termination</h3>
                        <p>We reserve the right to suspend or terminate your access if you violate these terms.</p>
                    </div>
                )
            };
        case 'privacy':
            return {
                title: 'Privacy Policy',
                subtitle: 'Your privacy is important to us',
                content: (
                    <div className="space-y-4 text-text-muted text-sm leading-relaxed text-justify">
                        <p>This Privacy Policy describes how Enterprise ERP collects, uses, and discloses your personal information.</p>
                        <h3 className="font-bold text-text-main text-base">1. Information We Collect</h3>
                        <p>We collect information you provide directly to us, such as when you create an account, update your profile, or contact customer support.</p>
                        <h3 className="font-bold text-text-main text-base">2. How We Use Information</h3>
                        <p>We use your information to provide, maintain, and improve our services, and to communicate with you.</p>
                        <h3 className="font-bold text-text-main text-base">3. Data Security</h3>
                        <p>We implement appropriate technical and organizational measures to protect your personal data.</p>
                        <h3 className="font-bold text-text-main text-base">4. Your Rights</h3>
                        <p>You have the right to access, correct, or delete your personal information at any time.</p>
                    </div>
                )
            };
        default:
            return { title: 'Page', content: null };
    }
};

const PublicPage = ({ type }) => {
    const navigate = useNavigate();
    const config = getPageConfig(type);

    return (
        <div className="min-h-screen bg-bg-main flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-bg-card border border-border-main rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-6 border-b border-border-main bg-bg-main/50 flex flex-col items-center text-center">
                    <div className="size-12 rounded-xl flex items-center justify-center shadow-sm overflow-hidden mb-3">
                        <img src="/d-tab-logo.png" alt="Logo" className="w-full h-full object-contain" />
                    </div>
                    <h1 className="text-2xl font-black text-text-main tracking-tight">{config.title}</h1>
                    {config.subtitle && <p className="text-text-muted text-sm font-medium mt-1">{config.subtitle}</p>}
                </div>

                {/* Content */}
                <div className="p-6 md:p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {config.content}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-border-main bg-bg-main/50">
                    <button
                        onClick={() => navigate('/login')}
                        className="w-full py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                        Back to Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PublicPage;
