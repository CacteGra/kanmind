persistence = {

    saveTasks: function() {
        localStorage.setItem('kanMindTasks', JSON.stringify(taskArray));
        localStorage.setItem('taskIdCounter', JSON.stringify(taskIdCounter));
    },

    loadTasks: function() {
        const savedTasks = localStorage.getItem('kanMindTasks');
        const savedCounter = localStorage.getItem('taskIdCounter');
        console.log(savedCounter);
        
        if (savedTasks) {
            const tasks = JSON.parse(savedTasks);
            tasks.forEach(task => {
                const taskElement = createTaskElement(task);
                document.getElementById(`${task.status}-tasks`).appendChild(taskElement);
            });
        }
        
        if (savedCounter) {
            console.log(savedCounter);
            var taskIdCounter;
            taskIdCounter = parseInt(savedCounter);
        }
    }
}