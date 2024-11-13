import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import Notifications from '../components/Notification';
import "./Dashboard.css"
const Dashboard = () => {
    const { state } = useContext(AppContext);
    const { user } = state;

    return (
        <div>
            <h1>Welcome, {user.role}</h1>
            <Notifications />
            {/* Add role-specific dashboard components here */}
        </div>
    );
};

export default Dashboard;
