multiview = {
        // VIEW SWITCHING LOGIC
        switchView: function(viewNameButton) {
            var viewName = viewNameButton.id;
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
                viewNameButton.id = "kanban";
                multiview.renderDashboard();
            } else if (viewName === 'kanban') {
                document.getElementById('kanbanView').classList.add('active');
                console.log(document.getElementById('kanbanView').classList);
                viewNameButton.id = "dashboard";
                const board = boardTitle;
                console.log(allBoards);
                multiview.renderKanbanBoard(boardTitle);
            }
        },

        // DASHBOARD RENDERING
        renderDashboard: function() {
            const grid = document.getElementById('boardsGrid');
            grid.innerHTML = '';
            console.log(allBoards);
            allBoards.forEach(board => {
                const card = multiview.createBoardCard(board);
                grid.appendChild(card);
            });
        },

        createBoardCard: function(thisBoard) {
            board = boards.boardTasks(thisBoard);
            console.log(board);
            const latestTask = multiview.getLatestTask(boards.boardTasks(thisBoard));
            console.log(Object.keys(board).length);
            const totalTasks = Object.keys(board).length;
            console.log(typeof(board));
            board = Object.values(board);
            const doneTasks = board.filter(t => t.status === 'done').length;

            const card = document.createElement('div');
            card.className = 'column board-column';
            card.onclick = () => multiview.openBoard(thisBoard);
            
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
                    <div class="board-title">${thisBoard}</div>
                </div>
                
                <div class="board-stats">
                    <div class="stat-badge">📋 ${totalTasks} Tasks</div>
                    <div class="stat-badge">✅ ${doneTasks} Done</div>
                </div>
                
                ${taskPreviewHTML}

                ${heatmap.generateBoardHeatmap(board)}
            `;
            
            return card;
        },

        getLatestTask: function(tasks) {
            // Exclude done tasks
            tasks = Object.values(tasks);
            tasks = tasks.filter(t => t.status !== 'done');
            if (!tasks || tasks.length === 0) return null;
            // Using timestamp
            // return tasks.sort((a, b) => b.timestamp - a.timestamp)[0];
            // Using last in array
            return tasks[tasks.length - 1];
        },

        openBoard: function(boardId) {
            boardTitle = boardId;
            console.log(boardTitle);
            viewNameButton = document.getElementsByClassName("toggle-tables")[0];
            viewNameButton.id = "kanban";
            multiview.switchView(viewNameButton);
        },

        // KANBAN BOARD RENDERING
        renderKanbanBoard: function(boardId) {
            boards.changeTaskBoard(boardId);
        },
}