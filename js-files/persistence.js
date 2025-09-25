persistence = {

    saveTasks: function() {
        // Save tasks
        console.log(boardTitle);
        localStorage.setItem(boardTitle, JSON.stringify(taskArray));
        localStorage.setItem('lastBoard', JSON.stringify(boardTitle));
    },

    loadTasks: function() {
        //localStorage.removeItem('kanMindTasks');
        //localStorage.removeItem('lastBoard');
        //localStorage.clear();
        let lastBoardItem = localStorage.getItem('lastBoard');
        console.log(lastBoardItem);
        if (lastBoardItem == null) {
            var kanMindBoard = "KanMindTasks";
            localStorage.setItem('lastBoard', JSON.stringify(kanMindBoard));
            lastBoardItem = localStorage.getItem('lastBoard');
        }
        boardTitle = JSON.parse(lastBoardItem);
        console.log(boardTitle);
        const savedTasks = localStorage.getItem(boardTitle);
        
        if (savedTasks) {
            const tasks = JSON.parse(savedTasks);
            tasks.forEach(task => {
                const taskElement = createTaskElement(task);
                document.getElementById(`${task.status}-tasks`).appendChild(taskElement);
                ++taskIdCounter;
            });
            taskArray = tasks;
        }
        boards.changeBoardTitle();
    },
    
    getAllStorage: function() {

        var values = [],
            keys = Object.keys(localStorage),
            i = keys.length;

        while ( i-- ) {
            values.push( localStorage.getItem(keys[i]) );
        }

        return values;
    }
}