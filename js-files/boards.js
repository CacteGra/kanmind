boards = {

    removeElementsByClass(className){
        const elements = document.getElementsByClassName(className);
        for (element of elements) {
            element.innerHTML = "";
        }
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

    listAllBoards: function() {
	var listHtml = "";
    var board;
	keys = Object.keys(localStorage);
	console.log(keys);
	keys = keys.filter(e => e !== 'lastBoard');
    i = keys.length;
    console.log(keys);
	while ( i-- ) {
        listHtml += `<li>${keys[i]}</li>`;
	}
	boardsList = document.getElementById("boardsListing");
    boardsList.innerHTML = listHtml;
    }
}
