import React, { createContext, useReducer } from 'react';

const initialState = {
    tasks: [],
    notifications: [],
    user: { role: 'Site Builder', id: 1 },  // Replace with dynamic user data
};

const reducer = (state, action) => {
    switch (action.type) {
        case 'SET_TASKS':
            return { ...state, tasks: action.payload };
        case 'ADD_NOTIFICATION':
            return { ...state, notifications: [...state.notifications, action.payload] };
        case 'ASSIGN_TASK':
            return {
                ...state,
                tasks: state.tasks.map(task =>
                    task.id === action.payload.taskId
                        ? { ...task, assignedTo: action.payload.userId }
                        : task
                ),
            };
        case 'UPDATE_TASK_STATUS':
            return {
                ...state,
                tasks: state.tasks.map(task =>
                    task.id === action.payload.taskId
                        ? { ...task, status: action.payload.status }
                        : task
                ),
            };
        default:
            return state;
    }
};

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    return (
        <AppContext.Provider value={{ state, dispatch }}>
            {children}
        </AppContext.Provider>
    );
};
