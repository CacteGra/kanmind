boards = {

    removeElementsByClass(className){
        const elements = document.getElementsByClassName(className);
        for (element of elements) {
            element.innerHTML = "";
        }
    },


    closeUlModal: function () {
        const modal = document.getElementById('modalOverlay');
        modal.classList.add('hide');
        allUl = document.getElementsByTagName("ul");

        var checkbox = document.getElementById("check01");
        checkbox.checked = false;

        var checkbox = document.getElementById("check02");
            checkbox.checked = false;
    },

    addOverlay: function() {
        document.getElementById("modalOverlay").classList.remove("hide");
    },

    createBoard: function() {
        // Show modal for new board title
        document.getElementById("newBoardModal").classList.remove("hide");
        document.getElementById("modalOverlay").classList.remove("hide");
        document.getElementById("boardTitleValue").focus();
        document.getElementById("boardTitleValue").select();
    },

    newBoardSubmit: function(submitButton) {
        boardTitle = submitButton.parentNode.querySelector("#boardTitleValue").value;
        // Save new board to local storage
        taskArray = [];
        persistence.saveTasks();
        // Remove previous board tasks from board
        boards.removeElementsByClass("repertory");
    },

    changeBoardTitle: function() {
        boardName = document.getElementById("boardName");
        boardName.innerHTML = boardTitle;
    },
    
    // Get all boards name
    getBoards: function() {
        keys = Object.keys(localStorage);
        allBoards = keys.filter(e => e !== 'lastBoard');
    },

    // Get all tasks from board
    boardTasks: function(boardTitle) {
        savedTasks = localStorage.getItem(boardTitle);
        return JSON.parse(savedTasks);
    },

    listAllBoards: function() {
        boards.addOverlay();
        var listHtml = "";
        keys = boards.getBoards();
        console.log(keys);
        if (keys) {
            keys = keys.filter(e => e !== 'lastBoard');
            i = keys.length;
            console.log(keys);
            boardName = document.getElementById("boardName");
            while ( i-- ) {
                if (boardName.innerText !== keys[i]) {
                    listHtml += `<li onclick="boards.changeTaskBoard(keys[i])">${keys[i]}</li>`;
                }
            };
        }
        if (listHtml === "") {
            listHtml = `<li style="color: #acacac;">None.</li>`;
        };
        console.log(listHtml);
        boardsList = document.getElementById("boardsListing");
        boardsList.innerHTML = listHtml;
    },

    changeTaskBoard: function(e) {
        allTasks = localStorage.getItem(e);
        tasks = JSON.parse(allTasks);
        boards.changeBoardTitle(e);
        allStatuses = document.getElementsByClassName("tasks repertory");
        for (allStatus of allStatuses) {
            allStatus.innerHTML = "";
        }
        tasks.forEach(task => {
            const taskElement = createTaskElement(task);
            document.getElementById(`${task.status}-tasks`).appendChild(taskElement);
            ++taskIdCounter;
        });

    }
}
