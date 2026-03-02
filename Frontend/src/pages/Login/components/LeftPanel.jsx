import React from 'react';

const LeftPanel = () => {
    return (
        <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden bg-slate-900">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-linear-to-br from-slate-900 via-slate-800 to-primary/40 mix-blend-multiply opacity-90"></div>
                <div
                    className="w-full h-full bg-cover bg-center opacity-40"
                    style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBuhMWXH71iklCagBY0U9nZUT2apxUtD4j7w8z7_K7INt6BmNqd5nVtavUd-10T0tQrnyt_zh5faSsXCuxsgY1FXnXBYp8Lmb_Rf-bRLwnazWKmG3IwyXZOjlPdyToyVSx3Wv-kzVWCisurRMWL4w2cZvHuqT0xaGSGoFsUbP4DaWDaZLNH5z7JdPTEskRHMdUX_vtQDLeZgDU4A4AR_ehPy7iCoyD8nQubdG2s4sgHqvWYtCFe_8nfcDMIgRQZxtPtdGvs33HbRDw')" }}
                >
                </div>
            </div>

            {/* Branding Top */}
            <div className="relative z-10 flex items-center gap-3">
                <div className="flex items-center justify-center size-10 shadow-sm overflow-hidden">
                    <img src="/d-tab-logo.png" alt="Logo" className="w-full h-full object-contain" />
                </div>
                <h1 className="text-white text-xl font-bold tracking-tight">Enterprise ERP</h1>
            </div>

            {/* Middle Content: Modules Grid */}
            <div className="relative z-10 flex flex-col gap-6 max-w-lg mt-12">
                <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                    Unified Management for <br /> <span className="text-blue-400">Modern Enterprises</span>
                </h2>
                <p className="text-slate-300 text-lg">Streamline your workflow with our integrated modules designed for efficiency and role-based security.</p>

                <div className="grid grid-cols-2 gap-4 mt-4">
                    <ModuleItem icon="badge" label="HRMS & Attendance" iconColor="text-blue-300" />
                    <ModuleItem icon="payments" label="Finance & Salary" iconColor="text-emerald-300" />
                    <ModuleItem icon="inventory_2" label="IMS & FMS" iconColor="text-amber-300" />
                    <ModuleItem icon="checklist" label="Tasks & Delegation" iconColor="text-purple-300" />
                </div>
            </div>

            {/* Footer / Role Indicator */}
            <div className="relative z-10 mt-auto pt-10">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-wider">
                    <span className="material-symbols-outlined text-base">verified_user</span>
                    <span>Secure Role-Based Access: Superadmin • Admin • User</span>
                </div>
            </div>
        </div>
    );
};

const ModuleItem = ({ icon, label, iconColor }) => (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl flex items-center gap-3">
        <span className={`material-symbols-outlined ${iconColor}`}>{icon}</span>
        <span className="text-white font-medium text-sm">{label}</span>
    </div>
);

export default LeftPanel;
