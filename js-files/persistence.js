persistence = {

    saveTasks: function() {
        // Save tasks
        localStorage.setItem('kanMindTasks', JSON.stringify(taskArray));
    },

    loadTasks: function() {
        // localStorage.removeItem('kanMindTasks');
        const savedTasks = localStorage.getItem('kanMindTasks');
        
        if (savedTasks) {
            const tasks = JSON.parse(savedTasks);
            tasks.forEach(task => {
                const taskElement = createTaskElement(task);
                document.getElementById(`${task.status}-tasks`).appendChild(taskElement);
                ++taskIdCounter;
            });
            taskArray = tasks;
        }
    }
}