persistence = {

    saveTasks: function() {
        // Save tasks
        localStorage.setItem('kanMindTasks', JSON.stringify(taskArray));
        // Save task count
        localStorage.setItem('taskIdCounter', JSON.stringify(taskIdCounter));
    },

    loadTasks: function() {
        const savedTasks = localStorage.getItem('kanMindTasks');
        const savedCounter = localStorage.getItem('taskIdCounter');
        
        if (savedTasks) {
            const tasks = JSON.parse(savedTasks);
            tasks.forEach(task => {
                const taskElement = createTaskElement(task);
                document.getElementById(`${task.status}-tasks`).appendChild(taskElement);
            });
            taskArray = tasks;
        }
        
        if (savedCounter) {
            taskIdCounter = parseInt(savedCounter);
        }
    }
}