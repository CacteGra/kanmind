        // Loading from local state
        let taskIdCounter = 0;
        var taskArray = [];
        let boardTitle;
        let taskLinks = {};
        persistence.loadTasks();
        console.log(taskIdCounter);
        let draggedElement = null;
        let linkingMode = false;
        let allBoards;

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

        // Create task when loading local state
        function createTaskElement(task) {
            console.log('createtaskelement');
            title = document.getElementById("titleValue");
            description = document.getElementById("descriptionValue");
            priority = document.getElementById("priorityValue");
            author = document.getElementById("authorValue");
            const taskDiv = document.createElement('div');
            taskDiv.className = 'task';
            taskDiv.draggable = true;
            console.log(task.id);
            taskDiv.dataset.taskId = task.id;
            var linkedTitle = '';
            console.log(taskArray);
            var htmlArray = [];
            var taskElements;
            // Adding linked tasks to task
            if (task.linked) {
                taskArray.forEach(theTask => {
                    console.log("taskarraying");
                    console.log(task.linked);
                    if (task.linked.includes(theTask.id)) {
                        linkedTitle = theTask.title;
                        htmlArray.push(`<span class="link-badge span-${theTask.id}" title="${linkedTitle}"> ${linkedTitle.substring(0, 15)}${linkedTitle.length > 15 ? '...' : ''},</span>`);
                        console.log(linkedTitle);
                    };
                });
            };
            taskElements = htmlArray.join('');
            if (task.linked) {
                htmlTasks = `<div class="task-links" id="links-${task.id}" linked-data="${task.linked}" style="display: block;"><span class="linked">🖇</span>${taskElements}</div>`;
            } else {
                htmlTasks = `<div class="task-links" id="links-${task.id}" linked-data="" style="display: none;"><span class="linked">🖇</span></div>`;
            };
            taskDiv.innerHTML = `
                <div class="title-buttons">
                    <div class="task-title">${task.title}</div>
                    <div class="modify-task edit-form" id=${task.id} onclick="editTaskModal(this)">📝</div>
                    <div class="modify-task delete-bin" id=${task.id} onclick="deleteTask(this)">🗑️</div>
                    <div class="modify-task" id=${task.id} onclick="linkTask(this)">🔗</div>
                </div>
                <div class="task-description">${task.description}</div>
                <div class="task-meta">
                    <span class="task-priority priority-${task.priority}">${task.priority}</span>
                    <span class="task-assignee">${task.assignee}</span>
                </div>
                ${htmlTasks}
            `;

            // Add drag event listeners
            taskDiv.addEventListener('dragstart', handleDragStart);
            taskDiv.addEventListener('dragend', handleDragEnd);
            taskDiv.addEventListener('click', handleTaskClick);

            return taskDiv;
        }

        // Create task live
        function createBaseTaskElement(task) {
            title = document.getElementById("titleValue");
            description = document.getElementById("descriptionValue");
            priority = document.getElementById("priorityValue");
            author = document.getElementById("authorValue");
            statusValue = document.getElementById("modalSubmit");
            statusValue = statusValue.name;

            // Abandon adding task if missing value
            if (!title.value || !description.value || !priority.value || !author.value || !statusValue) {
                return false;
            }

            // Priority number to label
            if (priority.value == 0) {
                priorityLabel = "low"
            }
            else if (priority.value == 1) {
                priorityLabel = "medium";
            }
            else{
                priorityLabel = "high";
            }
            const taskDiv = document.createElement('div');
            taskDiv.className = 'task';
            taskDiv.draggable = true;
            taskID = ++taskIdCounter;
            taskTaskId = `task-${taskID}`;
            taskDiv.dataset.taskId = taskTaskId;
            
            taskDiv.innerHTML = `
                <div class="title-buttons">
                    <div class="task-title">${title.value}</div>
                    <div class="modify-task edit-form" id=${taskTaskId} onclick="editTaskModal(this)">📝</div>
                    <div class="modify-task delete-bin" id=${taskTaskId} onclick="deleteTask(this)">🗑️</div>
                    <div class="modify-task" id=${taskTaskId} onclick="linkTask(this)">🔗</div>
                </div>
                <div class="task-description">${description.value}</div>
                <div class="task-meta">
                    <span class="task-priority priority-${priorityLabel}">${priorityLabel}</span>
                    <span class="task-assignee">${author.value}</span>
                </div>
                <div class="task-links" id="links-${taskTaskId}"><span class="linked">🖇</span></div>
            `;

            // Add drag event listeners
            taskDiv.addEventListener('dragstart', handleDragStart);
            taskDiv.addEventListener('dragend', handleDragEnd);
            document.getElementById(`${statusValue}-tasks`).appendChild(taskDiv)
            const newTask = {
                id: `task-${taskID}`,
                title: title.value,
                description: description.value,
                priority: priorityLabel,
                assignee: author.value,
                status: statusValue,
                linked: `task-${taskID}`
            };
            // Add to array for local state
            taskArray.push(newTask);
            // Saving local state
            persistence.saveTasks();
            return taskDiv;
        }

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
                console.log(thisTaskId.nodeValue);
                taskArray.forEach(theTask => {
                    console.log(theTask.id);
                      if (theTask.id === thisTaskId.nodeValue) {
                        console.log("if");
                        theTask.status = this.attributes['data-status'].nodeValue;
                      }
                })
                // Update local save
                persistence.saveTasks(boardTitle);
            }
        }

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

        // function addNewTaskModal(status) {
            // document.getElementById("newTaskModal").classList.remove("hide");
            // document.getElementById("modalOverlay").classList.remove("hide");
            // document.getElementById("modalSubmit").name = status;
            // document.getElementById("titleValue").focus();
            // document.getElementById("titleValue").select();
        // }

        function editTaskModal(editTaskId) {
            document.getElementById("editTaskModal").classList.remove("hide");
            document.getElementById("modalOverlay").classList.remove("hide");
            document.getElementById("editTitleValue").focus();
            document.getElementById("editTitleValue").select();
            var currentTask = editTaskId.parentNode.parentNode;
            var currentTaskId = editTaskId.id;
            var currentColumn = document.querySelector('[data-task-id=' + currentTaskId + ']');
            console.log(currentColumn);
            var statusName = currentColumn.parentNode.parentNode.attributes["data-status"];
            console.log(statusName);
            console.log(currentTask.querySelector(".task-title"));
            var currentTitle = currentTask.querySelector(".task-title");
            var currentDescription = currentTask.querySelector(".task-description");
            console.log(currentTask.querySelector(".task-priority"));
            var currentPriority = currentTask.querySelector(".task-priority");
            var currentAuthor = currentTask.querySelector(".task-assignee");
            var editModal = document.getElementById("innerEditModal");
            editModal.innerHTML = `
                <div class="task-title"><input id="editTitleValue" placeholder="Title" value="${currentTitle.innerText}" autofocus></div>
                <div class="task-description"><input id="editDescriptionValue" placeholder="Description" value="${currentDescription.innerText}"></div>
                <div class="">
                    <label class="task-priority" for="priority">Priority:</label><br />
                    <input type="range" min="0" max="2" id="editPriorityValue" name="priority" list="values" value="${currentPriority.innerText}">

                    <datalist id="values">
                        <option value="0" label="low">low</option>
                        <option value="1" label="medium">medium</option>
                        <option value="2" label="high">high</option>
                    </datalist>
                </div>
                <div class="task-meta">
                <input id="editAuthorValue" placeholder="Author" value="${currentAuthor.innerText}">
                </div>
                <input id="editTaskStatus" type="hidden" value="${statusName.value}">
                <input id="taskID" type="hidden" value="${currentTaskId}">
            `
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
            replacedForm = document.getElementById('taskForm');
            if (buttonRole == "Edit Task") {
                replacedForm.addEventListener('submit', editTask);
                button = document.getElementById("submitTask");
                console.log(buttonRole);
                button.innerText = "➕ " + buttonRole;
            } else {
                replacedForm.addEventListener('submit', handleFormSubmit);
                button = document.getElementById("submitTask");
                button.innerText = "➕ " + buttonRole;
            }
            //form.addEventListener('submit', handleFormSubmit);
            // Change form submission function
            // form.addEventListener('submit', handleEditFormSubmit);
            // form.addEventListener('submit', handleFormSubmit);
        }

        function addNewTaskModal(status) {
            currentTaskStatus = status;
            openTaskModal("Add Task");
        }

        function editTaskModal(editTaskId) {
            openTaskModal("Edit Task");
            var taskId = document.getElementById("taskID");
            taskId.value = editTaskId.id;
            var currentTask = editTaskId.parentNode.parentNode;
            var currentTaskId = editTaskId.id;
            var currentColumn = document.querySelector('[data-task-id=' + currentTaskId + ']');
            var statusName = currentColumn.parentNode.parentNode.attributes["data-status"];
            currentTaskStatus = statusName.value;
            document.querySelectorAll('.priority-option').forEach(option => {
                option.classList.remove('selected');
            });
            console.log(currentColumn);
            console.log(currentTaskStatus);
            console.log(currentTask.querySelector(".task-title"));
            var currentTitle = currentTask.querySelector(".task-title");
            var currentDescription = currentTask.querySelector(".task-description");
            console.log(currentTask.querySelector(".task-priority"));
            var currentPriority = currentTask.querySelector(".task-priority");
            var currentAuthor = currentTask.querySelector(".task-assignee");
            document.getElementById("taskTitle").value = currentTitle.innerText;
            document.getElementById("taskDescription").value = currentDescription.innerText;
            document.querySelector('.priority-option[data-priority="'+currentPriority.innerText.toLowerCase()+'"]').classList.add('selected');
            document.getElementById("taskAssignee").value = currentAuthor.innerText;
        }

        function openTaskModal(buttonRole) {
            const modal = document.getElementById('taskModal');
            const form = document.getElementById('taskForm');
            
            // Reset form
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

            const newTask = {
                id: `task-${++taskIdCounter}`,
                title: title,
                description: description,
                priority: priority,
                assignee: assignee,
                status: currentTaskStatus,
                linked: null
            };
            
            const taskElement = createTaskElement(newTask);
            document.getElementById(`${currentTaskStatus}-tasks`).appendChild(taskElement);
            // Add to array for local state
            taskArray.push(newTask);
            // Saving local state
            persistence.saveTasks();
            updateTaskCounts();
            updateStats();
            closeTaskModal();
        }

        function deleteTask(deleteId) {
            var indexNumber;
            var linkedIndexNumber;
            taskArray.forEach(theTask => {
                console.log(theTask.id);
                indexNumber = taskArray.indexOf(theTask);
                if (theTask.id === deleteId.id) {
                    // Delete task in array
                    taskArray.splice(indexNumber, 1);
                    // Delete task in HTML by moving up the hierarchy
                    var wholeTask = deleteId.parentNode;
                    wholeTask = wholeTask.parentNode;
                    wholeTask.parentNode.removeChild(wholeTask);
                } else {
                    linkedIndexNumber = taskArray.indexOf(deleteId);
                    theTask.linked.splice(linkedIndexNumber, 1);
                    const taskInLinks = document.getElementsByClassName(`span-${deleteId}`);
                    while(taskInLinks.length > 0){
                        taskInLinks[0].parentNode.removeChild(taskInLinks[0]);
                    }
                }
            });
            // Save new array to local
            persistence.saveTasks();
        }

        function editTask(e) {
            e.preventDefault();
            var taskId = document.getElementById("taskID");
            currentTask = document.querySelector('[data-task-id=' + taskId.value + ']');
            console.log(taskId);
            const title = document.getElementById('taskTitle').value.trim();
            const description = document.getElementById('taskDescription').value.trim();
            const assignee = document.getElementById('taskAssignee').value.trim() || 'Unassigned';
            const selectedPriority = document.querySelector('.priority-option.selected');
            const priority = selectedPriority ? selectedPriority.dataset.priority : 'medium';
            if (!title) {
                alert('Please enter a task title');
                return;
            }
            linkedTasks = document.getElementById("links-"+taskId.value);
            linkedTasksArray = linkedTasks.getAttribute('linked-data').split(",");
            console.log(linkedTasks);
            console.log(linkedTasksArray);
            const newTaskEdit = {
                id: taskId.value,
                title: title,
                description: description,
                priority: priority,
                assignee: assignee,
                status: currentTaskStatus,
                linked: linkedTasksArray
            };
            console.log(newTaskEdit);
            taskArray.forEach(theTask => {
                arrayTaskId = theTask.id
                console.log(newTaskEdit.id);
                if (arrayTaskId === newTaskEdit.id) {
                    // Edit task in array
                    indexNumber = taskArray.indexOf(theTask);
                    taskArray[indexNumber] = newTaskEdit;
                    // Save edited array to local
                    persistence.saveTasks();
                    var linkedTitle = '';
                    console.log(linkedTasks);
                    // Edit task in HTML
                    currentTask.innerHTML = `
                        <div class="title-buttons">
                            <div class="task-title">${newTaskEdit.title}</div>
                            <div class="modify-task edit-form" id=${newTaskEdit.id} onclick="editTaskModal(this)">📝</div>
                            <div class="modify-task delete-bin" id=${newTaskEdit.id} onclick="deleteTask(this)">🗑️</div>
                            <div class="modify-task" id=${newTaskEdit.id} onclick="linkTask(this)">🔗</div>
                        </div>
                        <div class="task-description">${newTaskEdit.description}</div>
                        <div class="task-meta">
                            <span class="task-priority priority-${newTaskEdit.priority}">${newTaskEdit.priority}</span>
                            <span class="task-assignee">${newTaskEdit.assignee}</span>
                        </div>
                        ${linkedTasks.outerHTML}
                    `;
                }
            });
            // Update linked tasks with this new task title
            const taskInLinks = document.getElementsByClassName(`span-${newTaskEdit.id}`);
            console.log(taskInLinks);
            for (let i = 0; i < taskInLinks.length; i++) {
                taskInLinks[i].setAttribute('title', newTaskEdit.title);
                taskInLinks[i].textContent = ` ${newTaskEdit.title.substring(0, 15)}${newTaskEdit.title.length > 15 ? '...' : ''},`;
            };
            closeTaskModal();
        }

        function handleTaskClick(e) {
            if (!linkingMode) return;
            
            e.stopPropagation();
            const clickedTask = this;
            const clickedTaskId = clickedTask.dataset.taskId;
            // Second click - link to target task
            const sourceTaskId = linkSourceTask.dataset.taskId;
            
            if (sourceTaskId !== clickedTaskId) {
                // Create link
                createLink(sourceTaskId, clickedTaskId);
                updateLinkModeButton('✅ Linked! Select another task');
                console.log("removing everything");
                btn = document.querySelector('.activating');
                btn.classList.remove('activating');
                btn.classList.add("activated");
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
                }, 2000);
            }
        }

        function createLink(sourceId, targetId) {
            // Initialize arrays if they don't exist
            if (!taskLinks[sourceId]) {
                taskLinks[sourceId] = [];
            }
            console.log("in createlink");
            // Add link if it doesn't already exist
            if (!taskLinks[sourceId].includes(targetId)) {
                console.log("about to create link");
                taskLinks[sourceId].push(targetId);
                taskArray.forEach(theTask => {
                    indexNumber = taskArray.indexOf(theTask);
                    arrayTaskId = theTask.id;
                    if (arrayTaskId === sourceId) {
                        taskArray[indexNumber].linked = targetId;
                        console.log(taskArray[indexNumber].linked);
                    } else if (arrayTaskId === targetId) {
                        taskArray[indexNumber].linked = sourceId;
                        console.log(taskArray[indexNumber].linked);
                    }
                });
                updateTaskLinkDisplay(sourceId);
                updateTaskLinkDisplay(targetId);
                
                // Mark tasks as linked
                document.querySelector(`[data-task-id="${sourceId}"]`).classList.add('linked');
                document.querySelector(`[data-task-id="${targetId}"]`).classList.add('linked');
                
            }
        }

        function updateTaskLinkDisplay(taskId) {
            console.log(taskId);
            const linksContainer = document.getElementById(`links-${taskId}`);
            if (!linksContainer) return;
            
            const linkedTasks = [];
            
            // Find tasks this task links to
            if (taskLinks[taskId]) {
                linkedTasks.push(...taskLinks[taskId]);
            }
            
            // Find tasks that link to this task
            for (const [sourceId, targets] of Object.entries(taskLinks)) {
                if (targets.includes(taskId) && !linkedTasks.includes(sourceId)) {
                    linkedTasks.push(sourceId);
                }
            }
            
            if (linkedTasks.length > 0) {
                const linkedArray = [];
                // 
                const taskElements = linkedTasks.map(linkedId => {
                    linkedArray.push(linkedId);
                    linksContainer.setAttribute('linked-data', linkedId);
                    const linkedTask = document.querySelector(`[data-task-id="${linkedId}"]`);
                    const title = linkedTask ? linkedTask.querySelector('.task-title').textContent : 'Unknown';
                    return `<span class="link-badge span-${linkedId}" title="${title}"> ${title.substring(0, 15)}${title.length > 15 ? '...' : ''},</span>`;
                }).join('');
                console.log(linkedTasks);
                // Updating task with new linked task array
                taskArray.forEach(theTask => {
                    console.log("taskarraying");
                    if (theTask.id === taskId) {
                    indexNumber = taskArray.indexOf(theTask);
                    taskArray[indexNumber].linked = linkedArray;
                    };
                });

                persistence.saveTasks();
                linksContainer.innerHTML = '<span class="linked">🖇</span>'+taskElements;
                linksContainer.style.display = 'block';
            } else {
                linksContainer.style.display = 'none';
            }
        }

        function linkTask(btn) {
            linkingMode = !linkingMode;
            const tasks = document.querySelectorAll('.task');
            linkSourceTask = btn.parentNode.parentNode;
            linkSourceTask.classList.add('link-source');
            
            // Changing link button
            if (linkingMode) {
                btn.classList.add('activating');
                btn.innerHTML = '🔗 Select task to link';
                tasks.forEach(task => {
                    task.classList.add('linking-mode');
                    task.draggable = false;
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

        // Initialize the board
        function initializeBoard() {
            console.log(taskArray);
            // Create generic task examples when non exist
            if (taskArray.length === 0) {
                console.log("no tasks");
                initialTasks.forEach(task => {
                    taskIdCounter = Math.max(taskIdCounter, parseInt(task.id.split('-')[1]) || 0);
                    const taskElement = createTaskElement(task);
                    console.log(taskIdCounter);
                    document.getElementById(`${task.status}-tasks`).appendChild(taskElement);
                    const newTask = {
                        id: task.id,
                        title: task.title,
                        description: task.description,
                        priority: task.priority,
                        assignee: task.assignee,
                        status: task.status,
                        linked: null
                    };
                    taskArray.push(newTask);
                });
                persistence.saveTasks();
            };
            
            setupDropZones();
            updateTaskCounts();
            updateStats();
            setupModal();
        }

        // Start the application
        document.addEventListener('DOMContentLoaded', initializeBoard);
        document.addEventListener('DOMContentLoaded', () => {
            multiview.switchView('dashboard');
            currentBoardId = boardTitle;
        }),

        function checkHidden(element){
          var classAttr = element.attributes['class'];
          console.log(classAttr);
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
