import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import "./TaskList.css"
const TaskList = ({ tasks }) => {
    const { state, dispatch } = useContext(AppContext);
    const { user } = state;

    const handleAssign = (taskId) => {
        dispatch({ type: 'ASSIGN_TASK', payload: { taskId, userId: user.id } });
        dispatch({ type: 'ADD_NOTIFICATION', payload: `Task ${taskId} assigned to you.` });
    };

    const handleUpdateStatus = (taskId, status) => {
        dispatch({ type: 'UPDATE_TASK_STATUS', payload: { taskId, status } });
    };

    return (
        <div>
            <ul>
                {tasks.map((task) => (
                    <li key={task.id}>
                        <p>{task.title}</p>
                        <p>Status: {task.status}</p>
                        {user.role === 'Administrator' && !task.assignedTo && (
                            <button onClick={() => handleAssign(task.id)}>Assign to Self</button>
                        )}
                        {task.assignedTo === user.id && (
                            <select
                                onChange={(e) => handleUpdateStatus(task.id, e.target.value)}
                                value={task.status}
                            >
                                <option value="Pending">Pending</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                            </select>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TaskList;
