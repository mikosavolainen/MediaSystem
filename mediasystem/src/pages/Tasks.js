import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import TaskList from '../components/TaskList';

const Tasks = () => {
    const { state } = useContext(AppContext);
    return (
        <div>
            <h2>Tasks</h2>
            <TaskList tasks={state.tasks} />
        </div>
    );
};

export default Tasks;
