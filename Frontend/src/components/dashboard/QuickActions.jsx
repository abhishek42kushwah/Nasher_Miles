import React from 'react';

const QuickActions = () => {
    const actions = [
        { icon: 'add_task', label: 'New Task', color: 'blue' },
        { icon: 'event_available', label: 'Apply Leave', color: 'emerald' },
        { icon: 'upload_file', label: 'Upload File', color: 'orange' },
        { icon: 'receipt_long', label: 'Payslip', color: 'purple' },
    ];

    const colorClasses = {
        blue: "text-blue-600 group-hover:bg-blue-600",
        emerald: "text-emerald-600 group-hover:bg-emerald-600",
        orange: "text-orange-600 group-hover:bg-orange-600",
        purple: "text-purple-600 group-hover:bg-purple-600",
    };

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-5 tracking-tight">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
                {actions.map((action, index) => (
                    <button
                        key={index}
                        className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 hover:scale-[1.03] transition-all group border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                    >
                        <span className={`material-symbols-outlined mb-2 text-[26px] p-2 rounded-xl transition-all duration-300 ${colorClasses[action.color]} group-hover:text-white`}>
                            {action.icon}
                        </span>
                        <span className="text-xs font-bold text-slate-700 dark:text-white group-hover:text-primary transition-colors">{action.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default QuickActions;
