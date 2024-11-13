import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';

const Notifications = () => {
    const { state } = useContext(AppContext);

    return (
        <div>
            <h3>Notifications</h3>
            <ul>
                {state.notifications.map((notification, index) => (
                    <li key={index}>{notification}</li>
                ))}
            </ul>
        </div>
    );
};

export default Notifications;
