downloads = {

    calculateProgress: function(tasks) {
        if (!tasks || tasks.length === 0) return 0;
        const completedTasks = tasks.filter(task => task.status === 'done').length;
        return Math.round((completedTasks / tasks.length) * 100);
    },

    // MARKDOWN GENERATION FUNCTIONS
    generateBoardMarkdown: function(board) {
        tasks = Object.values(Object.values(board));
        const progress = downloads.calculateProgress(tasks);
        const totalTasks = tasks.length;
        const todoTasks = tasks.filter(t => t.status === 'todo').length;
        const inProgressTasks = tasks.filter(t => t.status === 'inprogress').length;
        const reviewTasks = tasks.filter(t => t.status === 'review').length;
        const doneTasks = tasks.filter(t => t.status === 'done').length;

        let markdown = `# ${board.icon} ${board.name}\n\n`;
        markdown += `**Generated:** ${new Date().toLocaleString()}\n\n`;
        markdown += `## 📊 Board Statistics\n\n`;
        markdown += `- **Total Tasks:** ${totalTasks}\n`;
        markdown += `- **To Do:** ${todoTasks}\n`;
        markdown += `- **In Progress:** ${inProgressTasks}\n`;
        markdown += `- **Review:** ${reviewTasks}\n`;
        markdown += `- **Done:** ${doneTasks}\n`;
        markdown += `- **Progress:** ${progress}%\n\n`;

        // Group tasks by status
        const statuses = [
            { name: 'To Do', key: 'todo', emoji: '📋' },
            { name: 'In Progress', key: 'inprogress', emoji: '🔄' },
            { name: 'Review', key: 'review', emoji: '👀' },
            { name: 'Done', key: 'done', emoji: '✅' }
        ];

        statuses.forEach(status => {
            const statusTasks = tasks.filter(t => t.status === status.key);
            if (statusTasks.length > 0) {
                markdown += `## ${status.emoji} ${status.name}\n\n`;
                statusTasks.forEach(task => {
                    markdown += `### ${task.title}\n\n`;
                    markdown += `- **Description:** ${task.description}\n`;
                    markdown += `- **Priority:** ${task.priority.toUpperCase()}\n`;
                    markdown += `- **Assignee:** ${task.assignee}\n`;
                    markdown += `- **Last Updated:** ${task.timestamps.toLocaleString()}\n\n`;
                });
            }
        });

        return markdown;
    },

    generateAllBoardsMarkdown: function() {
        boards.getBoards();
        let markdown = `# 📊 All Project Boards\n\n`;
        markdown += `**Generated:** ${new Date().toLocaleString()}\n\n`;
        markdown += `**Total Boards:** ${boards.length}\n\n`;
        markdown += `---\n\n`;

        allBoards.forEach((board, index) => {
            allBoardTasks = boards.boardTasks(board);
            markdown += downloads.generateBoardMarkdown(allBoardTasks);
            if (index < allBoards.length - 1) {
                markdown += `\n---\n\n`;
            }
        });

        return markdown;
    },

    // DOWNLOAD FUNCTIONS
    downloadMarkdown: function() {
        const blob = new Blob([currentMarkdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${currentBoardName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    openDownloadModal: function(markdown, boardName) {
        currentMarkdown = markdown;
        currentBoardName = boardName;
        markdown = downloads.generateAllBoardsMarkdown();
        const modal = document.getElementById('downloadModal');

        // Show modal with animation
        modal.classList.add('show');
        document.getElementById('taskTitle').focus();
        document.getElementById('markdownPreview').textContent = markdown;
    },

    closeDownloadModal: function() {
        const modal = document.getElementById('downloadModal');
        modal.classList.remove('show');
    },

    setupDownloadModal: function() {
        const modal = document.getElementById('downloadModal');
        
        // Close modal when clicking on the overlay (outside the modal)
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                downloads.closeDownloadModal();
            }
        });
        
        // Close modal with Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.classList.contains('show')) {
                downloads.closeDownloadModal();
            }
        });
    },

    downloadAll: function() {
        const markdown = downloads.generateAllBoardsMarkdown();
        downloads.openDownloadModal(markdown, 'all_boards');
    },

}