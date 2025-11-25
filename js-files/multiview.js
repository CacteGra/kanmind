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
            
            allBoards.forEach(board => {
                const card = multiview.createBoardCard(board);
                grid.appendChild(card);
            });
        },

        heatColor: function(count) {
            if (count === 0) return "#1E293B";   // deep slate (empty)
            if (count <= 1) return "#0E4429";    // light green
            if (count <= 3) return "#006D32";    // medium green
            if (count <= 6) return "#26A641";    // bright green
            return "#39D353";                    // neon green
        },


        generateGitHubHeatmap: function(board) {
            const days = 30;
            const today = new Date();
            const counts = new Array(days).fill(0);
            console.log(board);
            board
                .filter(t => t.status === 'done')
                .forEach(t => {
                    const delta = Math.floor((today - t.timestamp) / (1000 * 60 * 60 * 24));
                    if (delta >= 0 && delta < days) {
                        counts[delta] += 1;
                    }
                });

            let html = `<div class="heatmap-div"><div class="gh-heatmap">`;

            for (let i = days - 1; i >= 0; i--) {
                const count = counts[i];
                html += `<div class="gh-cell" style="background:${multiview.heatColor(count)}"></div>`;
            }

            html += `</div></div>`;
            return html;
        },


        createBoardCard: function(thisBoard) {
            board = boards.boardTasks(thisBoard);
            console.log(board);
            const latestTask = multiview.getLatestTask(boards.boardTasks(thisBoard));
            const totalTasks = board.length;
            console.log(typeof(board));
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

                ${multiview.generateGitHubHeatmap(board)}
            `;
            
            return card;
        },

        getLatestTask: function(tasks) {
            // Exclude done tasks
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