persistence = {

    saveTasks: function() {
        // Save tasks and last board
        localStorage.setItem(boardTitle, JSON.stringify(taskArray));
        localStorage.setItem('lastBoard', boardTitle);
    },

    // Selecting last board if exists
    loadLastBoard: function() {
        // localStorage.clear();
        let lastBoardItem = localStorage.getItem('lastBoard');
        if (lastBoardItem == null) {
            var kanMindBoard = "KanMindTasks";
            localStorage.setItem('lastBoard', kanMindBoard);
            lastBoardItem = localStorage.getItem('lastBoard');
        }
        boardTitle = lastBoardItem;
    },

    loadTasks: function(e) {
        //localStorage.removeItem('kanMindTasks');
        //localStorage.removeItem('lastBoard');

        tempTaskArray = boards.boardTasks(boardTitle);
        // Building tasks
        if (tempTaskArray) {
            tempTaskArray.forEach(task => {
                const taskElement = createTaskElement(task);
                document.getElementById(`${task.status}-tasks`).appendChild(taskElement);
                ++taskIdCounter;
                // Composing array for linked tasks
                if (task.linked) {
                    taskLinks[task.id] = task.linked;
                };
            });
            taskArray = tempTaskArray;
        };
        boards.changeBoardTitle(e);
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