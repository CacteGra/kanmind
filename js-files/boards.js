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


    openBoardModal: function() {
      console.log("open board modal");
        // Show modal for new board title
        const modal = document.getElementById('boardModal');
        const overlay = document.querySelector(".overlay");
        overlay.classList.add("hide");
        const form = document.getElementById('boardForm');
        
        // Reset form
        form.reset();
                    
        // Show modal with animation
        modal.classList.add('show');
        document.getElementById('boardTitle').focus();
    },

    closeBoardModal: function() {
        const modal = document.getElementById('boardModal');
        modal.classList.remove('show');
    },

    handleBoardFormSubmit: function() {
        e.preventDefault();
        
        const title = document.getElementById('boardTitle').value.trim();
        
        if (!title) {
            alert('Please enter a task title');
            return;
        }

        boardTitle = title;
        
        taskArray = [];
        persistence.saveTasks();
        boards.newBoardSubmit();
        updateTaskCounts();
        updateStats();
        boards.closeBoardModal();
    },

    setupBoardModal: function() {
        const form = document.getElementById('boardForm');
        const modal = document.getElementById('boardModal');
        
        // Handle form submission
        form.addEventListener('submit', boards.handleBoardFormSubmit);
        
        // Close modal when clicking on the overlay (outside the modal)
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                boards.closeBoardModal();
            }
        });
        
        // Close modal with Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.classList.contains('show')) {
                boards.closeBoardModal();
            }
        });
        
        // Initialize priority selection buttons
        setupPrioritySelection();
    },

    newBoardSubmit: function(boardTitle) {
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
                    listHtml += `<li onclick="persistence.loadTasks(keys[i])">${keys[i]}</li>`;
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
        taskArray = tasks;
        boards.changeBoardTitle(e);
        allStatuses = document.getElementsByClassName("tasks repertory");
        for (allStatus of allStatuses) {
            allStatus.innerHTML = "";
        }
        persistence.loadTasks(e);

    }
}
