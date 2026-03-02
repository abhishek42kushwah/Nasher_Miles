import React from 'react';

const AttendanceTrends = () => {
    return (
        <div className="bg-bg-card border border-border-main rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-lg font-bold text-text-main">Attendance Trends</h3>
                    <p className="text-sm text-text-muted">Monthly overview of employee presence</p>
                </div>
                <select className="bg-bg-main border-none rounded-xl text-sm px-4 py-2 focus:ring-2 focus:ring-primary/20 text-text-main cursor-pointer transition-all">
                    <option>This Month</option>
                    <option>Last Month</option>
                    <option>Last Quarter</option>
                </select>
            </div>

            <div className="h-[300px] w-full relative px-2">
                <svg className="overflow-visible" fill="none" height="100%" preserveAspectRatio="none" viewBox="0 0 478 150" width="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#137fec" stopOpacity="0.25"></stop>
                            <stop offset="100%" stopColor="#137fec" stopOpacity="0"></stop>
                        </linearGradient>
                    </defs>

                    {/* Grid lines - using semantic border color */}
                    <line stroke="currentColor" className="text-border-main/50" strokeDasharray="4 4" strokeWidth="1" x1="0" x2="478" y1="150" y2="150"></line>
                    <line stroke="currentColor" className="text-border-main/50" strokeDasharray="4 4" strokeWidth="1" x1="0" x2="478" y1="100" y2="100"></line>
                    <line stroke="currentColor" className="text-border-main/50" strokeDasharray="4 4" strokeWidth="1" x1="0" x2="478" y1="50" y2="50"></line>

                    {/* Area fill */}
                    <path d="M0 109 C50 109 50 40 100 40 C150 40 150 90 200 90 C250 90 250 30 300 30 C350 30 350 110 400 110 C440 110 440 60 478 60 V 150 H 0 Z" fill="url(#chartGradient)"></path>

                    {/* Line path */}
                    <path d="M0 109 C50 109 50 40 100 40 C150 40 150 90 200 90 C250 90 250 30 300 30 C350 30 350 110 400 110 C440 110 440 60 478 60" fill="none" stroke="#137fec" strokeLinecap="round" strokeWidth="3"></path>

                    {/* Data points */}
                    <circle cx="100" cy="40" r="4" fill="white" stroke="#137fec" strokeWidth="2"></circle>
                    <circle cx="200" cy="90" r="4" fill="white" stroke="#137fec" strokeWidth="2"></circle>
                    <circle cx="300" cy="30" r="4" fill="white" stroke="#137fec" strokeWidth="2"></circle>
                    <circle cx="478" cy="60" r="4" fill="white" stroke="#137fec" strokeWidth="2"></circle>
                </svg>

                <div className="flex justify-between mt-6 text-xs text-text-muted font-bold uppercase tracking-wider">
                    <span>Week 1</span>
                    <span>Week 2</span>
                    <span>Week 3</span>
                    <span>Week 4</span>
                </div>
            </div>
        </div>
    );
};

export default AttendanceTrends;
