import React from 'react';

const StatCard = ({ title, value, icon, trend, trendLabel, color = "blue" }) => {
    const colorClasses = {
        blue: "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
        green: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
        orange: "bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
        purple: "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
    };

    return (
        <div className="bg-bg-card rounded-2xl p-6 border border-border-main shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between h-[160px]">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-text-muted text-sm font-medium mb-1.5">{title}</p>
                    <h3 className="text-3xl font-bold text-text-main">{value}</h3>
                </div>
                <div className={`p-3 rounded-xl ${colorClasses[color] || colorClasses.blue}`}>
                    <span className="material-symbols-outlined text-[28px]">{icon}</span>
                </div>
            </div>

            <div className="flex items-center gap-2 mt-auto">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${trend.startsWith('+') ? 'bg-emerald-100/80 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' :
                    trend.startsWith('-') ? 'bg-red-100/80 text-red-700 dark:bg-red-900/40 dark:text-red-300' :
                        'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                    {trend}
                </span>
                <span className="text-slate-400 dark:text-slate-500 text-xs font-medium">{trendLabel}</span>
            </div>
        </div>
    );
};

export default StatCard;
