multiview = {
        // VIEW SWITCHING LOGIC
        switchView: function(viewName) {
            boards.getBoards();
            // Hide all views
            document.querySelectorAll('.view').forEach(view => {
                view.classList.remove('active');
            });

            // Update navigation buttons
            document.querySelectorAll('.nav-btn').forEach(btn => {
                btn.classList.remove('active');
            });

            // Show selected view
            if (viewName === 'dashboard') {
                document.getElementById('dashboardView').classList.add('active');
                multiview.renderDashboard();
            } else if (viewName === 'kanbanView') {
                document.getElementById('kanbanView').classList.add('active');
                const board = allBoards.find(b => b.id === currentBoardId);
                document.getElementById('navTitle').textContent = `${board.icon} ${board.name}`;
                multiview.renderKanbanBoard(currentBoardId);
            }
        },

        // DASHBOARD RENDERING
        renderDashboard: function() {
            const grid = document.getElementById('boardsGrid');
            grid.innerHTML = '';
            
            allBoards.forEach(board => {
                console.log(board);
                thisBoard = boards.boardTasks(board);
                console.log(thisBoard);
                const card = multiview.createBoardCard(thisBoard);
                grid.appendChild(card);
            });
        },

        createBoardCard: function(board) {
            const latestTask = multiview.getLatestTask(board.tasks);
            const totalTasks = board.length;
            console.log(typeof(board));
            const doneTasks = board.filter(t => t.status === 'done').length;

            const card = document.createElement('div');
            card.className = 'column board-column';
            card.onclick = () => multiview.openBoard(board.id);
            
            let taskPreviewHTML;
            if (latestTask) {
                taskPreviewHTML = `
                    <div class="task-preview">
                        <div class="task-title">${latestTask.title}</div>
                        <div class="task-description">${latestTask.description}</div>
                        <div class="task-meta">
                            <span class="task-priority priority-${latestTask.priority}">${latestTask.priority}</span>
                        </div>
                    </div>
                `;
            } else {
                taskPreviewHTML = `<div class="task-preview no-task">No tasks yet</div>`;
            }

            card.innerHTML = `
                <div class="board-header">
                    <div class="board-icon">${board.icon}</div>
                    <div class="board-title">${board.name}</div>
                </div>
                
                <div class="board-stats">
                    <div class="stat-badge">📋 ${totalTasks} Tasks</div>
                    <div class="stat-badge">✅ ${doneTasks} Done</div>
                </div>
                
                ${taskPreviewHTML}
            `;
            
            return card;
        },

        getLatestTask: function(tasks) {
            if (!tasks || tasks.length === 0) return null;
            // Using timestamp
            // return tasks.sort((a, b) => b.timestamp - a.timestamp)[0];
            // Using last in array
            return tasks[tasks.length - 1];
        },

        openBoard: function(boardId) {
            currentBoardId = boardId;
            multiview.switchView('kanban');
        },

        // KANBAN BOARD RENDERING
        renderKanbanBoard: function(boardId) {
            const board = allBoards.find(b => b.id === boardId);
            if (!board) return;

            // Update title
            document.getElementById('currentBoardTitle').textContent = `${board.icon} ${board.name}`;

            // Clear all columns
            ['todo', 'inprogress', 'review', 'done'].forEach(status => {
                document.getElementById(`${status}-tasks`).innerHTML = '';
            });

            // Render tasks
            board.tasks.forEach(task => {
                const taskElement = createTaskElement(task);
                document.getElementById(`${task.status}-tasks`).appendChild(taskElement);
            });

            updateTaskCounts();
            setupDragAndDrop();
        },
}