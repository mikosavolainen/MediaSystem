import React from 'react';

const UserPerformance = () => {
    // Mocked performance data for simplicity
    const performanceData = [
        { expert: 'Expert 1', tasksCompleted: 10, avgCompletionTime: '5 mins' },
        { expert: 'Expert 2', tasksCompleted: 8, avgCompletionTime: '7 mins' },
    ];

    return (
        <div>
            <h3>User Performance</h3>
            <table>
                <thead>
                    <tr>
                        <th>Expert</th>
                        <th>Tasks Completed</th>
                        <th>Average Completion Time</th>
                    </tr>
                </thead>
                <tbody>
                    {performanceData.map((data, index) => (
                        <tr key={index}>
                            <td>{data.expert}</td>
                            <td>{data.tasksCompleted}</td>
                            <td>{data.avgCompletionTime}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UserPerformance;
