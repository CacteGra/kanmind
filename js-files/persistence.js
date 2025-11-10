persistence = {

    saveTasks: function() {
        // Save tasks and last board
        console.log(boardTitle);
        localStorage.setItem(boardTitle, JSON.stringify(taskArray));
        localStorage.setItem('lastBoard', JSON.stringify(boardTitle));
    },

    loadTasks: function() {
        //localStorage.removeItem('kanMindTasks');
        //localStorage.removeItem('lastBoard');
        //localStorage.clear();

        // Selecting last board if exists
        let lastBoardItem = localStorage.getItem('lastBoard');
        console.log(lastBoardItem);
        if (lastBoardItem == null) {
            var kanMindBoard = "KanMindTasks";
            localStorage.setItem('lastBoard', JSON.stringify(kanMindBoard));
            lastBoardItem = localStorage.getItem('lastBoard');
        }
        boardTitle = JSON.parse(lastBoardItem);
        console.log(boardTitle);
        taskArray = boards.boardTasks(boardTitle);
        console.log(taskArray);
        
        // Building tasks
        // if (taskArray) {
        //     taskArray.forEach(task => {
        //         const taskElement = createTaskElement(task);
        //         document.getElementById(`${task.status}-tasks`).appendChild(taskElement);
        //         ++taskIdCounter;
        //         // Composing array for linked tasks
        //         console.log(task.linked);
        //         if (task.linked) {
        //             taskLinks[task.id] = task.linked;
        //         };
        //     });
        // };
        console.log("ending building");
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