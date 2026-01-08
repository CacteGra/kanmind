// Global variables
let taskIdCounter = 0;
let taskObj = {};
let boardTitle;
let draggedElement = null;
let linkingMode = false;
let linkingOrigin = null;
let hideCancelLink = "cancel-link-hidden";
let allBoards;
let currentTaskStatus;

// Sample tasks to start with
const initialTasks = [
    {
        id: 'task-1',
        title: 'Design Landing Page',
        description: 'Create wireframes and mockups for the new product landing page',
        priority: 'high',
        assignee: 'Alice',
        status: 'todo'
    },
    {
        id: 'task-2',
        title: 'API Integration',
        description: 'Connect frontend with the new REST API endpoints',
        priority: 'medium',
        assignee: 'Bob',
        status: 'inprogress'
    },
    {
        id: 'task-3',
        title: 'User Testing',
        description: 'Conduct usability tests with beta users',
        priority: 'low',
        assignee: 'Carol',
        status: 'review'
    },
    {
        id: 'task-4',
        title: 'Database Migration',
        description: 'Migrate user data to new database schema',
        priority: 'high',
        assignee: 'Dave',
        status: 'done'
    }
];

// Create task element
function createTaskElement(task) {
    const taskDiv = document.createElement('div');
    taskDiv.className = 'task';
    taskDiv.draggable = true;
    taskDiv.dataset.taskId = task.id;
    taskDiv.dataset.boardId = boardTitle;

    // Linked tasks
    let htmlArray = [];
    if (task.linked) {
        Object.keys(task.linked).forEach(key => {
            Object.keys(task.linked[key]).forEach(linkTaskId => {
                const linkedTask = task.linked[key][linkTaskId];
                htmlArray.push(`<span class="link-badge span-${linkedTask.id}" title="${linkedTask.title}" onclick="highlightLinked('${linkedTask.id}')"> ${linkedTask.title.substring(0, 15)}${linkedTask.title.length > 15 ? '...' : ''},</span>`);
            });
        });
    }

    const taskElements = htmlArray.join('');
    const htmlTasks = taskElements ? 
        `<div class="task-links" id="links-${task.id}" linked-data="${task.linked}" style="display: block;"><span class="linked">🖇</span>${taskElements}</div>` :
        `<div class="task-links" id="links-${task.id}" linked-data="" style="display: none;"><span class="linked"></span></div>`;

    const linkingButton = linkingOrigin == task.id ?
        `<div class="modify-task activating" id=${task.id} onclick="linkTask(this)">🔗 Select task to link</div>` :
        `<div class="modify-task" id=${task.id} onclick="linkTask(this)">🔗</div>`;

    taskDiv.innerHTML = `
        <div class="title-buttons">
            <div class="task-title">${task.title}</div>
            <div class="modify-task edit-form" id=${task.id} onclick="editTaskModal(this)">📝</div>
            <div class="modify-task delete-bin" id=${task.id} onclick="deleteTask(this)">🗑️</div>
            ${linkingButton}
            ${checkWorkedOn(task.id)}
            <div class="modify-task ${hideCancelLink}" onclick="cancelLink()">❌</div>
        </div>
        <div class="task-description">${task.description}</div>
        <div class="task-meta">
            <span class="task-priority priority-${task.priority}">${task.priority}</span>
            <span class="task-assignee">${task.assignee}</span>
        </div>
        ${heatmap.generateTaskHeatmap(task)}
        ${htmlTasks}
    `;

    // Add drag event listeners
    taskDiv.addEventListener('dragstart', handleDragStart);
    taskDiv.addEventListener('dragend', handleDragEnd);
    taskDiv.addEventListener('click', handleTaskClick);
    return taskDiv;
}

// Create base task element
function createBaseTaskElement(task) {
    const title = document.getElementById("titleValue");
    const description = document.getElementById("descriptionValue");
    const priority = document.getElementById("priorityValue");
    const author = document.getElementById("authorValue");
    const statusValue = document.getElementById("modalSubmit").name;

    if (!title.value || !description.value || !priority.value || !author.value || !statusValue) {
        return false;
    }

    const priorityLabel = priority.value == 0 ? "low" : priority.value == 1 ? "medium" : "high";
    const taskDiv = document.createElement('div');
    taskDiv.className = 'task';
    taskDiv.draggable = true;
    const taskID = ++taskIdCounter;
    const taskTaskId = `task-${taskID}`;
    taskDiv.dataset.taskId = taskTaskId;

    taskDiv.innerHTML = `
        <div class="title-buttons">
            <div class="task-title">${title.value}</div>
            <div class="modify-task edit-form" id=${taskTaskId} onclick="editTaskModal(this)">📝</div>
            <div class="modify-task delete-bin" id=${taskTaskId} onclick="deleteTask(this)">🗑️</div>
            <div class="modify-task" id=${taskTaskId} onclick="linkTask(this)">🔗</div>
            ${checkWorkedOn(taskTaskId)}
            <div class="modify-task ${hideCancelLink}" onclick="cancelLink()">❌</div>
        </div>
        <div class="task-description">${description.value}</div>
        <div class="task-meta">
            <span class="task-priority priority-${priorityLabel}">${priorityLabel}</span>
            <span class="task-assignee">${author.value}</span>
        </div>
        ${heatmap.generateTaskHeatmap(task)}
        <div class="task-links" id="links-${taskTaskId}"><span class="linked">🖇</span></div>
    `;

    // Add drag event listeners
    taskDiv.addEventListener('dragstart', handleDragStart);
    taskDiv.addEventListener('dragend', handleDragEnd);
    document.getElementById(`${statusValue}-tasks`).appendChild(taskDiv);

    const newTask = {
        id: taskTaskId,
        title: title.value,
        description: description.value,
        priority: priorityLabel,
        assignee: author.value,
        status: statusValue,
        linked: {},
        board: boardTitle
    };

    // Add to array for local state
    taskObj[newTask.id] = newTask;
    persistence.saveTasks(boardTitle, taskObj);
    return taskDiv;
}

// Drag and drop functions
function handleDragStart(e) {
    draggedElement = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.outerHTML);
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    draggedElement = null;
}

function setupDropZones() {
    const columns = document.querySelectorAll('.column');
    columns.forEach(column => {
        column.addEventListener('dragover', handleDragOver);
        column.addEventListener('drop', handleDrop);
        column.addEventListener('dragenter', handleDragEnter);
        column.addEventListener('dragleave', handleDragLeave);
    });
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function handleDragEnter(e) {
    e.preventDefault();
    this.classList.add('drag-over');
}

function handleDragLeave(e) {
    if (!this.contains(e.relatedTarget)) {
        this.classList.remove('drag-over');
    }
}

function handleDrop(e) {
    e.preventDefault();
    this.classList.remove('drag-over');
    if (draggedElement) {
        const tasksContainer = this.querySelector('.tasks');
        tasksContainer.appendChild(draggedElement);
        updateTaskCounts();
        updateStats();
        const thisTaskId = draggedElement.attributes['data-task-id'];
        // Update task status in array
        taskObj[thisTaskId.nodeValue].status = this.attributes['data-status'].nodeValue;;
        // Update local save
        persistence.saveTasks(boardTitle, taskObj);
    }
}

// Task count and stats
function updateTaskCounts() {
    const statuses = ['todo', 'inprogress', 'review', 'done'];
    statuses.forEach(status => {
        const tasks = document.querySelectorAll(`#${status}-tasks .task`);
        const countElement = document.getElementById(`${status}-count`);
        countElement.textContent = tasks.length;
    });
}

function updateStats() {
    const totalTasks = document.querySelectorAll('.task').length;
    const completedTasks = document.querySelectorAll('#done-tasks .task').length;
    const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    document.getElementById('total-tasks').textContent = totalTasks;
    document.getElementById('completed-tasks').textContent = completedTasks;
    document.getElementById('progress-percent').textContent = progressPercent + '%';
}

function setupPrioritySelection() {
    document.querySelectorAll('.priority-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.priority-option').forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
        });
    });
}

function setupModal() {
    const form = document.getElementById('taskForm');
    const modal = document.getElementById('taskModal');
    // Handle form submission
    form.addEventListener('submit', handleFormSubmit);
    // Close modal when clicking on the overlay (outside the modal)
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeTaskModal();
        }
    });
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
            closeTaskModal();
        }
    });
    // Initialize priority selection buttons
    setupPrioritySelection();
}

function changeSubmitModal(buttonRole) {
    const form = document.getElementById('taskForm');
    form.replaceWith(form.cloneNode(true));
    setupPrioritySelection();
    const replacedForm = document.getElementById('taskForm');

    if (buttonRole == "Edit Task") {
        replacedForm.addEventListener('submit', editTask);
        const button = document.getElementById("submitTask");
        button.innerText = "➕ " + buttonRole;
    } else {
        replacedForm.addEventListener('submit', handleFormSubmit);
        const button = document.getElementById("submitTask");
        button.innerText = "➕ " + buttonRole;
    }
}

function addNewTaskModal(status) {
    currentTaskStatus = status;
    openTaskModal("Add Task");
}

function editTaskModal(editTaskId) {
    openTaskModal("Edit Task");
    const taskId = document.getElementById("taskID");
    taskId.value = editTaskId.id;
    const currentTask = editTaskId.parentNode.parentNode;
    const currentTaskId = editTaskId.id;
    const currentColumn = document.querySelector('[data-task-id=' + currentTaskId + ']');
    const statusName = currentColumn.parentNode.parentNode.attributes["data-status"];
    currentTaskStatus = statusName.value;
    document.querySelectorAll('.priority-option').forEach(option => {
        option.classList.remove('selected');
    });

    const currentTitle = currentTask.querySelector(".task-title");
    const currentDescription = currentTask.querySelector(".task-description");
    const currentPriority = currentTask.querySelector(".task-priority");
    const currentAuthor = currentTask.querySelector(".task-assignee");

    document.getElementById("taskTitle").value = currentTitle.innerText;
    document.getElementById("taskDescription").value = currentDescription.innerText;
    document.querySelector('.priority-option[data-priority="'+currentPriority.innerText.toLowerCase()+'"]').classList.add('selected');
    document.getElementById("taskAssignee").value = currentAuthor.innerText;
}

// Modal functions
function openTaskModal(buttonRole) {
    const modal = document.getElementById('taskModal');
    const form = document.getElementById('taskForm');
    form.reset();
    changeSubmitModal(buttonRole);
    
    // Reset priority selection
    document.querySelectorAll('.priority-option').forEach(option => {
        option.classList.remove('selected');
    });
    document.querySelector('.priority-option[data-priority="medium"]').classList.add('selected');
    
    // Show modal with animation
    modal.classList.add('show');
    document.getElementById('taskTitle').focus();
}

function closeTaskModal() {
    const modal = document.getElementById('taskModal');
    modal.classList.remove('show');
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    const title = document.getElementById('taskTitle').value.trim();
    const description = document.getElementById('taskDescription').value.trim();
    const assignee = document.getElementById('taskAssignee').value.trim() || 'Unassigned';
    const selectedPriority = document.querySelector('.priority-option.selected');
    const priority = selectedPriority ? selectedPriority.dataset.priority : 'medium';
    
    if (!title) {
        alert('Please enter a task title');
        return;
    }
    const todayDate = ((new Date()).toISOString()).split('T')[0];
    const newTask = {
        id: `task-${++taskIdCounter}`,
        title: title,
        description: description,
        priority: priority,
        assignee: assignee,
        status: currentTaskStatus,
        timestamps: [todayDate],
        board: boardTitle,
        linked: new Object
    };
    
    // Add to array for local state
    taskObj[newTask.id] = newTask;
    const taskElement = createTaskElement(newTask);
    document.getElementById(`${currentTaskStatus}-tasks`).appendChild(taskElement);
    // Saving local state
    persistence.saveTasks(boardTitle, taskObj);
    updateTaskCounts();
    updateStats();
    closeTaskModal();
}

function deleteTask(deleteId) {
    const taskToDelete = taskObj[deleteId.id];
    // Delete from linked
    const linkedDict = taskToDelete.linked;
    const linkedBoards = Object.keys(linkedDict);
    linkedBoards.forEach(linkedBoard => {
        const linkedTasks = boards.boardTasks(linkedBoard);
        const linkedTasksIds = Object.keys(taskToDelete.linked[linkedBoard]);
        linkedTasksIds.forEach(linkedTaskId => {
            delete linkedTasks[linkedTaskId]["linked"][taskToDelete.board][deleteId.id];
            //const index = linkedArray.indexOf(deleteId.id);
            //linkedArray.splice(index, 1);
            //linkedTasks[linkedTask.id]["linked"][taskToDelete.board] = linkedArray;
            //delete linkedTasks[linkedTask.id]["linked"][taskToDelete.board][deleteId.id];
            persistence.saveTasks(linkedBoard, linkedTasks);
            if (linkedBoard == boardTitle) {
                const taskInLinks = document.getElementsByClassName(`span-${deleteId.id}`);
                while(taskInLinks.length > 0){
                    taskInLinks[0].parentNode.removeChild(taskInLinks[0]);
                }
            }
        })
    })          
    // Delete task in object
    delete taskObj[deleteId.id];
    // Delete task in HTML by moving up the hierarchy
    const wholeTask = deleteId.parentNode;
    wholeTask.parentNode.removeChild(wholeTask);
    // Save new array to local
    persistence.saveTasks(boardTitle, taskObj);
}

function editTask(e) {
    e.preventDefault();
    const taskId = document.getElementById("taskID").value;
    const currentTask = document.querySelector('[data-task-id=' + taskId + ']');
    const title = document.getElementById('taskTitle').value.trim();
    const description = document.getElementById('taskDescription').value.trim();
    const assignee = document.getElementById('taskAssignee').value.trim() || 'Unassigned';
    const selectedPriority = document.querySelector('.priority-option.selected');
    const priority = selectedPriority ? selectedPriority.dataset.priority : 'medium';
    if (!title) {
        alert('Please enter a task title');
        return;
    }
    
    const linkedTasks = document.getElementById("links-"+taskId);
    const oldTask = taskObj[taskId]
    const newTaskEdit = {
        id: taskId,
        title: title,
        description: description,
        priority: priority,
        assignee: assignee,
        status: currentTaskStatus,
        linked: oldTask.linked,
        timestamps: oldTask.timestamps,
        board: boardTitle
    };
    // Edit task in object
    taskObj[newTaskEdit.id] = newTaskEdit;
    // Save edited array to local
    persistence.saveTasks(boardTitle, taskObj);
    // Edit task in HTML
    currentTask.innerHTML = `
        <div class="title-buttons">
            <div class="task-title">${newTaskEdit.title}</div>
            <div class="modify-task edit-form" id=${newTaskEdit.id} onclick="editTaskModal(this)">📝</div>
            <div class="modify-task delete-bin" id=${newTaskEdit.id} onclick="deleteTask(this)">🗑️</div>
            <div class="modify-task" id=${newTaskEdit.id} onclick="linkTask(this)">🔗</div>
            <div class="modify-task ${hideCancelLink}" onclick="cancelLink()">❌</div>
        </div>
        <div class="task-description">${newTaskEdit.description}</div>
        <div class="task-meta">
            <span class="task-priority priority-${newTaskEdit.priority}">${newTaskEdit.priority}</span>
            <span class="task-assignee">${newTaskEdit.assignee}</span>
        </div>
        ${linkedTasks.outerHTML}
    `;
    // Update linked tasks with this new task title
    const taskInLinks = document.getElementsByClassName(`span-${newTaskEdit.id}`);
    for (let i = 0; i < taskInLinks.length; i++) {
        taskInLinks[i].setAttribute('title', newTaskEdit.title);
        taskInLinks[i].textContent = ` ${newTaskEdit.title.substring(0, 15)}${newTaskEdit.title.length > 15 ? '...' : ''},`;
    };
    closeTaskModal();
}

// Linking functions
function cancelLink() {
    const linkingReminder = document.querySelector(".linking-reminder");
    linkingReminder.style.display = 'none';
    updateLinkModeButton("Linking canceled");
    const btn = document.querySelector('.activating');
    if (btn) {
        btn.classList.remove('activating');
        btn.classList.add("activated");
    }
    linkingOrigin = null;
    const tasks = document.querySelectorAll('.task');
    tasks.forEach(task => {
        task.classList.remove('linking-mode', 'link-source');
        task.draggable = true;
    });
    setTimeout(() => {
        updateLinkModeButton('🔗');
        linkingMode = !linkingMode;
        const cancelButtons = document.querySelectorAll("."+hideCancelLink);
        const oldHideCancelLink = hideCancelLink;
        hideCancelLink = "cancel-link-hidden";
        cancelButtons.forEach(element => {
            element.classList.remove(oldHideCancelLink);
            element.classList.add(hideCancelLink);
        });
    }, 1000);
}

function handleTaskClick(e) {
    if (e.target.innerHTML == "❌") {
        return;
    };
    if (!linkingMode) return;
    
    e.stopPropagation();
    const clickedTask = this;
    const clickedTaskId = clickedTask.dataset.taskId;
    const clickedTaskBoardId = clickedTask.dataset.boardId;
    boardTasks = boards.boardTasks(clickedTaskBoardId);
    clickedtaskObj = boardTasks[clickedTaskId];
    // Second click - link to target task
    const sourceTaskId = linkSourceTask.dataset.taskId;
    const sourceTaskBoardId = linkSourceTask.dataset.boardId;
    boardTasks = boards.boardTasks(sourceTaskBoardId);
    sourcetaskObj = boardTasks[sourceTaskId];
    if (sourceTaskId == clickedTaskId && sourcetaskObj.board == clickedtaskObj.board) {
        return false;
    } else {
        // Create link
        text = createLink(sourcetaskObj, clickedtaskObj);
        updateLinkModeButton(text);
        linkingOrigin = null;
        btn = document.querySelector('.activating');
        if (btn) {
            btn.classList.remove('activating');
            btn.classList.add("activated");
        }
        const tasks = document.querySelectorAll('.task');
        tasks.forEach(task => {
            task.classList.remove('linking-mode', 'link-source');
            task.draggable = true;
        });
        linkSourceTask = null;
        
        setTimeout(() => {
            if (linkingMode) {
                updateLinkModeButton('🔗 Select first task');
                linkingMode = !linkingMode;
            }
            var cancelButtons = document.querySelectorAll("."+hideCancelLink);
            var oldHideCancelLink = hideCancelLink;
            hideCancelLink = "cancel-link-hidden";
            cancelButtons.forEach(element => {
                element.classList.remove(oldHideCancelLink);
                element.classList.add(hideCancelLink);
            });
        }, 1000);
    }
}

function createLink(sourceTask, targetTask) {
    // Check if link exists
    if (Object.keys(sourceTask["linked"]).length > 0) {
        if (sourceTask["linked"][targetTask.board] !== undefined) {
            testLinking = {...targetTask};
            delete testLinking['linked'];
            if (sourceTask["linked"][targetTask.board][targetTask.id] !== undefined) {
                return "Already Linked";
            }
        }
    }
    // Add link if it doesn't already exist
    var linkedDict = {};
    let sourceLinking = {};
    let targetLinking = {}
    targetLinking = {...targetTask};
    if (Object.keys(sourceTask.linked).length > 0) {
        if (sourceTask["linked"][targetTask.board] !== undefined) {
            linkedDict = sourceTask['linked'][targetTask.board];
        }
    }
    delete targetLinking['linked'];
    linkedDict[targetLinking.id] = targetLinking;
    sourceTask['linked'][targetLinking.board] = linkedDict;
    linkedDict = {};
    sourceLinking = {...sourceTask};
    if (Object.keys(targetTask.linked).length > 0) {
        linkedDict = targetTask['linked'][sourceTask.board];
    }
    delete sourceLinking['linked'];
    linkedDict[sourceLinking.id] = sourceLinking;
    targetTask['linked'][sourceTask.board] = linkedDict;
    var sourceTasks = boards.boardTasks(sourceTask.board);
    sourceTasks[sourceTask.id] = sourceTask;
    if (sourceTask.board === targetTask.board) {
        sourceTasks[targetTask.id] = targetTask;
        persistence.saveTasks(sourceTask.board, sourceTasks);
        taskObj = sourceTasks;
        updateTaskLinkDisplay(sourceTask);
        updateTaskLinkDisplay(targetTask);
        document.querySelector(`[data-task-id="${sourceTask.id}"]`).classList.add('linked');
    } else {
        persistence.saveTasks(sourceTask.board, sourceTasks);
        var targetTasks = boards.boardTasks(targetTask.board);
        targetTasks[targetTask.id] = targetTask;
        persistence.saveTasks(targetTask.board, targetTasks);
        taskObj = targetTasks;
        updateTaskLinkDisplay(targetTask);
    }
    // Mark tasks as linked
    document.querySelector(`[data-task-id="${targetTask.id}"]`).classList.add('linked');

    linkingReminder = document.querySelector(".linking-reminder");
    linkingReminder.style.display = 'none';
    return '✅ Linked! Select another task';
}

function updateTaskLinkDisplay(task) {
    taskId = task.id;
    const linksContainer = document.getElementById(`links-${taskId}`);
    if (!linksContainer) return;
    
    const linkedTasksBoards = Object.keys(task['linked']);
    // Find tasks this task links to
    if (linkedTasksBoards.length > 0) {
        const taskElements = [];
        linkedTasksBoards.forEach(key => {
            var linkedTasks = [];
            linkedTasks = Object.values(task.linked[key]);
            if (linkedTasks) {
                taskElements.push(linkedTasks.map(linkedId => {
                    linkedIdHtml = linkedId.id;
                    var linkedIdHtml;
                    linksContainer.setAttribute('linked-data', linkedIdHtml);
                    const title = linkedId.title;
                    return `<span class="link-badge span-${linkedIdHtml}" title="${title}" onclick="highlightLinked('${linkedIdHtml}')"> ${title.substring(0, 15)}${title.length > 15 ? '...' : ''},</span>`;
                }).join(' '));
            }
        })
        linksContainer.innerHTML = '<span class="linked">🖇</span>'+taskElements.join(' ');
        linksContainer.style.display = 'block';
    } else {
        linksContainer.style.display = 'none';
    }
}

function linkTask(btn) {
    linkingMode = !linkingMode;
    const tasks = document.querySelectorAll('.task');
    linkSourceTask = btn.parentNode.parentNode;
    linkingOrigin = linkSourceTask.dataset.taskId;
    linkSourceTask.classList.add('link-source');
    
    // Changing link button
    if (linkingMode) {
        var linkingReminder;
        linkingReminder = document.querySelector(".linking-reminder");
        linkingReminder.style.display = 'block';
        btn.classList.add('activating');
        btn.innerHTML = '🔗 Select task to link';
        tasks.forEach(task => {
            task.classList.add('linking-mode');
            task.draggable = false;
        });
        var cancelButtons = document.querySelectorAll("."+hideCancelLink);
        var oldHideCancelLink = hideCancelLink;
        hideCancelLink = "cancel-link";
        cancelButtons.forEach(element => {
            element.classList.remove(oldHideCancelLink);
            element.classList.add(hideCancelLink);
        });
    }
}

function updateLinkModeButton(text) {
    btn = document.querySelector('.activating');
    if (btn) {
        btn.innerHTML = text;
    } else {
        btn = document.querySelector('.activated');
        if (btn){
            btn.innerHTML = '🔗';
            btn.classList.remove('activated');
        }
    }
}

function highlightLinked(linkedId) {
    var linkedTask = document.querySelector('[data-task-id=' + linkedId + ']');
    linkedTask.style.background = "chartreuse";
    linkedTask.scrollIntoView();
    setTimeout(() => {
        linkedTask.style.background = "white";
    }, 1000);
}

function checkWorkedOn(taskId) {
    html = `<div class="modify-task worked" id="${taskId}" onclick="workedOn(this)">☑</div>`;
    taskObj[taskId].timestamps.forEach(timestamp => {
        if (timestamp == ((new Date()).toISOString()).split('T')[0]) {
            html = `<div class="modify-task worked" id=${taskId} onclick="workedOn(this)">☑</div>`;
        } else {
            html = `<div class="modify-task worked" id=${taskId} onclick="workedOn(this)">✅</div>`;
            
        }
    });
    return html;
}

function workedOn(taskId){
    timestamp = ((new Date()).toISOString()).split('T')[0];
    taskObj[taskId.id].timestamps.push(timestamp);
    taskId.innerHTML = "☑";
    persistence.saveTasks(boardTitle, taskObj);
    const newHeatmap = heatmap.updateTaskHeatmap(taskObj[taskId.id]);
    const currentTaskInfo = document.querySelector('[data-task-id=' + taskId.id + ']');
    const heatmapDiv = currentTaskInfo.querySelector('.heatmap-div');
    console.log(heatmapDiv);
    heatmapDiv.innerHTML = newHeatmap;
}

// Initialize the board
function initializeBoard() {
    persistence.loadLastBoard();
    persistence.loadTasks(boardTitle);
    // Create generic task examples when non exist
    if (Object.keys(taskObj).length === 0 && boardTitle === "KanMindTasks") {
        initialTasks.forEach(task => {
            taskIdCounter = Math.max(taskIdCounter, parseInt(task.id.split('-')[1]) || 0);
            var d = new Date();
            dayBefore = (new Date(d.setDate(d.getDate() - 2))).toISOString().split('T')[0];
            var d = new Date();
            lastWeek = (new Date(d.setDate(d.getDate() - 7))).toISOString().split('T')[0];
            var d = new Date();                 
            lastMonth = (new Date(d.setDate(d.getDate() - 30))).toISOString().split('T')[0];
            const newTask = {
                id: task.id,
                title: task.title,
                description: task.description,
                priority: task.priority,
                assignee: task.assignee,
                status: task.status,
                timestamps: [dayBefore, lastWeek, lastMonth],
                board: boardTitle,
                linked: null
            };
            newTask["linked"] = {};
            taskObj[newTask.id] = newTask;
            const taskElement = createTaskElement(newTask);
            document.getElementById(`${task.status}-tasks`).appendChild(taskElement);
        });
        persistence.saveTasks(boardTitle, taskObj);
    };
    
    setupDropZones();
    updateTaskCounts();
    updateStats();
    setupModal();
    boards.setupBoardModal();
    downloads.setupDownloadModal();
}

// Start the application
document.addEventListener('DOMContentLoaded', initializeBoard);
document.addEventListener('DOMContentLoaded', () => {
    multiview.switchView();
}),

function checkHidden(element){
    var classAttr = element.attributes['class'];
    if (classAttr.value.indexOf('hide') !== -1) {
    return false;
    } else {
    return true;
    }
}

// Define modal
const closeModalBtn = document.querySelector("#cancelAdd");
const closeEditModalBtn = document.querySelector("#cancelEdit");
const cancelNewBoard = document.querySelector("#cancelNewBoard");
const modal = document.querySelector("#newTaskModal");
const editModal = document.querySelector("#editTaskModal");
const newBoardModal = document.querySelector("#newBoardModal");
const overlay = document.querySelector(".overlay");
const clickSubmit = document.querySelector("#modalSubmit");
const clickEditSubmit = document.querySelector("#editModalSubmit");
const clickNewBoardSubmit = document.querySelector("#boardModalSubmit");
const closeModal = function () {
    if (checkHidden(modal)) {
        modal.classList.add("hide");
    }
    if (checkHidden(editModal)) {
        editModal.classList.add("hide");
    }
    if (checkHidden(newBoardModal)) {
        newBoardModal.classList.add("hide");
    }
    overlay.classList.add("hide");
    var checkbox = document.querySelector("input[name=submenu]");
    checkbox.checked = false;
    var inputs = document.querySelectorAll('input');
    // Reset input values
    inputs.forEach(function(input) {
        input.value = '';
    });
};

// Closing modal for the following
// closeModalBtn.addEventListener("click", closeModal);
// closeEditModalBtn.addEventListener("click", closeModal);
// cancelNewBoard.addEventListener("click", closeModal);
// clickSubmit.addEventListener("click", closeModal);
// clickEditSubmit.addEventListener("click", closeModal);
// clickNewBoardSubmit.addEventListener("click", closeModal);
// overlay.addEventListener("click", closeModal);
// document.addEventListener("keydown", function (e) {
//     if (e.key === "Escape" && !modal.classList.contains("hide") || e.key === "Escape" && !editModal.classList.contains("hide")) {
//         closeModal();
//     }
// });
