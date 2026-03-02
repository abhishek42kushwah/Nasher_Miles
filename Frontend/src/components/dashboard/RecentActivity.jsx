import React from 'react';

const RecentActivity = () => {
    const activities = [
        {
            module: 'HRMS',
            description: 'New policy document uploaded',
            user: 'Sarah Jenkins',
            time: '2 mins ago',
            status: 'Completed',
            color: 'blue'
        },
        {
            module: 'Help Ticket',
            description: 'Ticket #2049 reported: Login issue',
            user: 'Mike Ross',
            time: '15 mins ago',
            status: 'Pending',
            color: 'purple'
        },
        {
            module: 'FMS',
            description: 'Monthly expense report generated',
            user: 'System',
            time: '1 hour ago',
            status: 'Processing',
            color: 'orange'
        },
        {
            module: 'IMS',
            description: 'Inventory stock level low alert',
            user: 'Warehouse Bot',
            time: '3 hours ago',
            status: 'Completed',
            color: 'emerald'
        }
    ];

    const statusClasses = {
        Completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
        Pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
        Processing: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
    };

    const moduleColors = {
        blue: "bg-blue-500",
        purple: "bg-purple-500",
        orange: "bg-orange-500",
        emerald: "bg-emerald-500"
    };

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Activity</h3>
                    <p className="text-sm text-slate-500">Real-time log of company-wide updates</p>
                </div>
                <button className="text-sm font-bold text-slate-500 hover:text-primary flex items-center gap-1.5 transition-colors">
                    Filter <span className="material-symbols-outlined text-[18px]">filter_list</span>
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-separate border-spacing-y-2">
                    <thead>
                        <tr className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                            <th className="px-4 py-2">Module</th>
                            <th className="px-4 py-2">Description</th>
                            <th className="px-4 py-2">User</th>
                            <th className="px-4 py-2">Time</th>
                            <th className="px-4 py-2">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {activities.map((activity, index) => (
                            <tr key={index} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <td className="px-4 py-4 font-bold text-slate-900 dark:text-white first:rounded-l-xl flex items-center gap-2.5">
                                    <span className={`w-2.5 h-2.5 rounded-full ${moduleColors[activity.color]}`}></span>
                                    {activity.module}
                                </td>
                                <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{activity.description}</td>
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-2.5">
                                        <div className="bg-slate-200 dark:bg-slate-700 text-[10px] font-bold size-7 rounded-full flex items-center justify-center">
                                            {activity.user.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <span className="text-slate-600 dark:text-slate-400 font-medium">{activity.user}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-4 text-slate-500 font-medium">{activity.time}</td>
                                <td className="px-4 py-4 last:rounded-r-xl">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold ${statusClasses[activity.status]}`}>
                                        {activity.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <button className="w-full mt-4 py-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all">
                View All Activity Logs
            </button>
        </div>
    );
};

export default RecentActivity;
