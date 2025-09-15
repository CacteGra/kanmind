        // Loading from local state
        let taskIdCounter = 0;
        let taskArray;
        persistence.loadTasks();
        console.log(taskIdCounter);
        let draggedElement = null;

        // Sample tasks to start with
        // const initialTasks = [
        //     {
        //         id: 'task-1',
        //         title: 'Design Landing Page',
        //         description: 'Create wireframes and mockups for the new product landing page',
        //         priority: 'high',
        //         assignee: 'Alice',
        //         status: 'todo'
        //     },
        //     {
        //         id: 'task-2',
        //         title: 'API Integration',
        //         description: 'Connect frontend with the new REST API endpoints',
        //         priority: 'medium',
        //         assignee: 'Bob',
        //         status: 'inprogress'
        //     },
        //     {
        //         id: 'task-3',
        //         title: 'User Testing',
        //         description: 'Conduct usability tests with beta users',
        //         priority: 'low',
        //         assignee: 'Carol',
        //         status: 'review'
        //     },
        //     {
        //         id: 'task-4',
        //         title: 'Database Migration',
        //         description: 'Migrate user data to new database schema',
        //         priority: 'high',
        //         assignee: 'Dave',
        //         status: 'done'
        //     }
        // ];

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
            taskDiv.dataset.taskId = task.id;
            
            taskDiv.innerHTML = `
                <div class="modify-task">
                    <div class="edit-form" id=${task.id} onclick="editTask(this)">📝</div>
                    <div class="delete-bin" id=${task.id} onclick="deleteTask(this)">🗑️</div>
                </div>
                <div class="task-title">${task.title}
                </div>
                <div class="task-description">${task.description}</div>
                <div class="task-meta">
                    <span class="task-priority priority-${task.priority}">${task.priority}</span>
                    <span class="task-assignee">${task.assignee}</span>
                </div>
            `;

            // Add drag event listeners
            taskDiv.addEventListener('dragstart', handleDragStart);
            taskDiv.addEventListener('dragend', handleDragEnd);

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
                <div class="modify-task">
                    <div class="edit-form" id=${task.id} onclick="editTask(this)">📝</div>
                    <div class="delete-bin" id=${taskTaskId} onclick="deleteTask(this)">🗑️</div>
                </div>
                <div class="task-title">${title.value}
                </div>
                <div class="task-description">${description.value}</div>
                <div class="task-meta">
                    <span class="task-priority priority-${priorityLabel}">${priorityLabel}</span>
                    <span class="task-assignee">${author.value}</span>
                </div>
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
                status: statusValue
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
                localStorage.setItem('kanMindTasks', JSON.stringify(taskArray));
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

        function addNewTaskModal(status) {
            document.getElementById("newTaskModal").classList.remove("hide");
            document.getElementById("modalOverlay").classList.remove("hide");
            document.getElementById("modalSubmit").name = status;
            document.getElementById("titleValue").focus();
            document.getElementById("titleValue").select();
        }

        function addNewTask(status) {
            // modal form values
            
            const newTask = {
                id: `task-${++taskIdCounter}`,
                title: title,
                description: description,
                priority: priority.toLowerCase(),
                assignee: assignee,
                status: status
            };
            
            const taskElement = createTaskElement(newTask);
            document.getElementById(`${status}-tasks`).appendChild(taskElement);
            updateTaskCounts();
            updateStats();
        }

        function deleteTask(deleteId) {
            taskArray.forEach(theTask => {
                console.log(theTask.id);
                if (theTask.id === deleteId.id) {
                    // Delete task in array
                    indexNumber = taskArray.indexOf(theTask);
                    taskArray.splice(indexNumber, 1);
                    // Save new array to local
                    localStorage.setItem('kanMindTasks', JSON.stringify(taskArray));
                    // Delete task in HTML by moving up the hierarchy
                    var wholeTask = deleteId.parentNode;
                    wholeTask = wholeTask.parentNode;
                    wholeTask.parentNode.removeChild(wholeTask);
                }
            })
        }

        function editTask(taskEdit) {
            taskArray.forEach(theTask => {
                taskTaskId = theTask.id
                console.log(theTask.id);
                if (taskTaskId === taskEdit.taskId) {
                    // Edit task in array
                    indexNumber = taskArray.indexOf(theTask);
                    taskArray.splice(indexNumber, indexNumber, taskEdit);
                    // Save edited array to local
                    localStorage.setItem('kanMindTasks', JSON.stringify(taskArray));
                    // Edit task in HTML by moving up the hierarchy
                    var wholeTask = editId.parentNode;
                    wholeTask = wholeTask.parentNode;
                    wholeTask.innerHTML = `
                        <div class="modify-task">
                            <div class="edit-form" id=${taskEdit.taskId} onclick="editTask(this)">📝</div>
                            <div class="delete-bin" id=${taskEdit.taskId} onclick="deleteTask(this)">🗑️</div>
                        </div>
                        <div class="task-title">${taskEdit.title}
                        </div>
                        <div class="task-description">${taskEdit.description}</div>
                        <div class="task-meta">
                            <span class="task-priority priority-${taskEdit.priority}">${taskEdit.priority}</span>
                            <span class="task-assignee">${taskEdit.author}</span>
                        </div>
                    `;
                }
            })
        }

        // Initialize the board
        function initializeBoard() {
            // initialTasks.forEach(task => {
            //     taskIdCounter = Math.max(taskIdCounter, parseInt(task.id.split('-')[1]) || 0);
            //     const taskElement = createTaskElement(task);
            //     document.getElementById(`${task.status}-tasks`).appendChild(taskElement);
            // });
            
            setupDropZones();
            updateTaskCounts();
            updateStats();
        }

        // Start the application
        document.addEventListener('DOMContentLoaded', initializeBoard);

        // Define modal
        const closeModalBtn = document.querySelector("#cancelAdd");
        const modal = document.querySelector(".modal");
        const overlay = document.querySelector(".overlay");
        const clickSubmit = document.querySelector("#modalSubmit");
        const closeModal = function () {
            modal.classList.add("hide");
            overlay.classList.add("hide");
            var inputs = document.querySelectorAll('input');
            // Reset input values
            inputs.forEach(function(input) {
                input.value = '';
            });
        };

        // Closing modal for the following
        closeModalBtn.addEventListener("click", closeModal);
        clickSubmit.addEventListener("click", closeModal);
        overlay.addEventListener("click", closeModal);
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && !modal.classList.contains("hide")) {
                closeModal();
            }
        });