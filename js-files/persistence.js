persistence = {

    saveTasks: function(boardId, taskDict) {
        // Save tasks and last board
        localStorage.setItem(boardId, JSON.stringify(taskDict))
        if (boardId === boardTitle) {
            localStorage.setItem('lastBoard', boardTitle);
        }
    },

    // Selecting last board if exists
    loadLastBoard: function() {
        localStorage.clear();
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

        tempTaskObj = boards.boardTasks(boardTitle);
        // Building tasks
        if (tempTaskObj) {
            taskObj = tempTaskObj;
            keys = Object.keys(tempTaskObj);
            keys.forEach(key => {
                task = tempTaskObj[key];
                const taskElement = createTaskElement(task);
                document.getElementById(`${task.status}-tasks`).appendChild(taskElement);
                ++taskIdCounter;
            });
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