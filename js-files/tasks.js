        let draggedElement = null;
        let taskIdCounter = 1;

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

        function createTaskElement(task) {
            const taskDiv = document.createElement('div');
            taskDiv.className = 'task';
            taskDiv.draggable = true;
            taskDiv.dataset.taskId = task.id;
            
            taskDiv.innerHTML = `
                <div class="task-title">${task.title}</div>
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
            document.getElementById("status").value = status;
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

        // Initialize the board
        function initializeBoard() {
            initialTasks.forEach(task => {
                taskIdCounter = Math.max(taskIdCounter, parseInt(task.id.split('-')[1]) || 0);
                const taskElement = createTaskElement(task);
                document.getElementById(`${task.status}-tasks`).appendChild(taskElement);
            });
            
            setupDropZones();
            updateTaskCounts();
            updateStats();
        }

        // Start the application
        document.addEventListener('DOMContentLoaded', initializeBoard);

        const closeModalBtn = document.querySelector("#cancelAdd");
        const modal = document.querySelector(".modal");
        const overlay = document.querySelector(".overlay");
        const closeModal = function () {
            modal.classList.add("hide");
            overlay.classList.add("hide");
        };

        closeModalBtn.addEventListener("click", closeModal);

        overlay.addEventListener("click", closeModal);

        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && !modal.classList.contains("hide")) {
                closeModal();
            }
        });