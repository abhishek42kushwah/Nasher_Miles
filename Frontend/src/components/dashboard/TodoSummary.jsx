import React from 'react';

const TodoSummary = () => {
    const tasks = [
        { title: 'Review Q3 Financials', due: 'Due Today', module: 'FMS', completed: false },
        { title: 'Approve Leave Requests', due: 'Due Tomorrow', module: 'HRMS', completed: false },
        { title: 'Update Inventory Log', due: 'Completed', module: 'IMS', completed: true },
        { title: 'Client Meeting Prep', due: 'Due in 2 days', module: 'TODO', completed: false },
    ];

    return (
        <div className="bg-bg-card border border-border-main rounded-2xl p-6 shadow-sm flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-base font-bold text-text-main tracking-tight">My Tasks</h3>
                <button className="text-xs font-bold text-primary hover:underline px-2 py-1 rounded-lg bg-primary/5">View All</button>
            </div>

            <div className="flex flex-col gap-4">
                {tasks.map((task, index) => (
                    <div key={index} className="flex items-start gap-4 p-3 rounded-xl hover:bg-bg-main transition-colors group">
                        <div className="mt-0.5 cursor-pointer">
                            <span className={`material-symbols-outlined text-[24px] ${task.completed ? 'text-emerald-500' : 'text-slate-300 group-hover:text-primary'} transition-colors`}>
                                {task.completed ? 'check_circle' : 'circle'}
                            </span>
                        </div>
                        <div className="flex-1">
                            <p className={`text-sm font-bold leading-tight ${task.completed ? 'text-text-muted/50 line-through' : 'text-text-main'}`}>
                                {task.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5">
                                <span className={`text-[10px] font-bold uppercase py-0.5 px-2 rounded-md ${task.due === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-bg-main text-text-muted'
                                    }`}>
                                    {task.due}
                                </span>
                                <span className="text-[10px] font-bold text-text-muted/30">•</span>
                                <span className="text-[10px] font-bold text-primary/80 uppercase tracking-wider">{task.module}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button className="mt-auto w-full py-3 bg-bg-main hover:bg-primary/5 text-primary text-xs font-bold rounded-xl transition-all border border-transparent hover:border-primary/20">
                + Create New Task
            </button>
        </div>
    );
};

export default TodoSummary;
