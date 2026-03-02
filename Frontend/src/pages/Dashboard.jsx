import React from 'react';
import { useSelector } from 'react-redux';
import MainLayout from '../components/layout/MainLayout';
import StatCard from '../components/dashboard/StatCard';
import AttendanceTrends from '../components/dashboard/AttendanceTrends';
import RecentActivity from '../components/dashboard/RecentActivity';
import QuickActions from '../components/dashboard/QuickActions';
import TodoSummary from '../components/dashboard/TodoSummary';

const Dashboard = () => {
    const { user } = useSelector((state) => state.auth);

    return (
        <MainLayout title="Dashboard Overview">
            <div className="flex flex-col gap-6">
                {/* Welcome Message */}
                <div className="bg-gradient-to-r from-primary/10 to-transparent p-4 rounded-xl border border-primary/20">
                    <h2 className="text-xl font-bold text-text-main">
                        Welcome, <span className="text-primary">{user?.name || 'User'}</span>! 👋
                    </h2>
                    <p className="text-text-muted text-sm mt-1">Here's what's happening with your projects today.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Employees"
                        value="1,250"
                        icon="groups"
                        trend="+2%"
                        trendLabel="vs last month"
                        color="blue"
                    />
                    <StatCard
                        title="Present Today"
                        value="1,145"
                        icon="how_to_reg"
                        trend="92%"
                        trendLabel="Attendance rate"
                        color="green"
                    />
                    <StatCard
                        title="Pending Tasks"
                        value="12"
                        icon="pending_actions"
                        trend="Urgent"
                        trendLabel="Requires action"
                        color="orange"
                    />
                    <StatCard
                        title="Open Tickets"
                        value="5"
                        icon="confirmation_number"
                        trend="Low"
                        trendLabel="Avg response time"
                        color="purple"
                    />
                </div>

                {/* Main Dashboard Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Attendance Trends */}
                    <div className="lg:col-span-2">
                        <AttendanceTrends />
                    </div>

                    {/* Right Column: Quick Actions & Recent TODOs */}
                    <div className="flex flex-col gap-6">
                        <QuickActions />
                        <TodoSummary />
                    </div>
                </div>

                {/* Bottom Section: Recent Activity */}
                <RecentActivity />
            </div>
        </MainLayout>
    );
};

export default Dashboard;
