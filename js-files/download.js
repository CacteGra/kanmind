        let currentMarkdown = '';
        let currentBoardName = '';

        function getLatestTask(tasks) {
            if (!tasks || tasks.length === 0) return null;
            return tasks.sort((a, b) => b.timestamp - a.timestamp)[0];
        }

        function calculateProgress(tasks) {
            if (!tasks || tasks.length === 0) return 0;
            const completedTasks = tasks.filter(task => task.status === 'done').length;
            return Math.round((completedTasks / tasks.length) * 100);
        }

        function formatTimeAgo(timestamp) {
            const now = new Date();
            const diff = now - timestamp;
            const minutes = Math.floor(diff / 60000);
            const hours = Math.floor(diff / 3600000);
            const days = Math.floor(diff / 86400000);
            
            if (minutes < 60) return `${minutes}m ago`;
            if (hours < 24) return `${hours}h ago`;
            return `${days}d ago`;
        }

        // MARKDOWN GENERATION FUNCTIONS
        function generateBoardMarkdown(board) {
            const progress = calculateProgress(board.tasks);
            const totalTasks = board.tasks.length;
            const todoTasks = board.tasks.filter(t => t.status === 'todo').length;
            const inProgressTasks = board.tasks.filter(t => t.status === 'inprogress').length;
            const reviewTasks = board.tasks.filter(t => t.status === 'review').length;
            const doneTasks = board.tasks.filter(t => t.status === 'done').length;

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
                const statusTasks = board.tasks.filter(t => t.status === status.key);
                if (statusTasks.length > 0) {
                    markdown += `## ${status.emoji} ${status.name}\n\n`;
                    statusTasks.forEach(task => {
                        markdown += `### ${task.title}\n\n`;
                        markdown += `- **Description:** ${task.description}\n`;
                        markdown += `- **Priority:** ${task.priority.toUpperCase()}\n`;
                        markdown += `- **Assignee:** ${task.assignee}\n`;
                        markdown += `- **Last Updated:** ${task.timestamp.toLocaleString()}\n\n`;
                    });
                }
            });

            return markdown;
        }

        function generateAllBoardsMarkdown() {
            let markdown = `# 📊 All Project Boards\n\n`;
            markdown += `**Generated:** ${new Date().toLocaleString()}\n\n`;
            markdown += `**Total Boards:** ${boards.length}\n\n`;
            markdown += `---\n\n`;

            boards.forEach((board, index) => {
                markdown += generateBoardMarkdown(board);
                if (index < boards.length - 1) {
                    markdown += `\n---\n\n`;
                }
            });

            return markdown;
        }

        // DOWNLOAD FUNCTIONS
        function downloadMarkdown() {
            const blob = new Blob([currentMarkdown], { type: 'text/markdown' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${currentBoardName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.md`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }

        function copyToClipboard() {
            navigator.clipboard.writeText(currentMarkdown).then(() => {
                alert('✅ Markdown copied to clipboard!');
            }).catch(err => {
                console.error('Failed to copy:', err);
                alert('❌ Failed to copy to clipboard');
            });
        }

        function showMarkdownPreview(markdown, boardName) {
            currentMarkdown = markdown;
            currentBoardName = boardName;
            document.getElementById('markdownPreview').textContent = markdown;
            document.getElementById('markdownModal').classList.add('active');
        }

        function closeModal() {
            document.getElementById('markdownModal').classList.remove('active');
        }

        function downloadBoardMarkdown(boardId) {
            const board = boards.find(b => b.id === boardId);
            if (!board) return;
            
            const markdown = generateBoardMarkdown(board);
            showMarkdownPreview(markdown, board.name);
        }

        function downloadAllBoards() {
            const markdown = generateAllBoardsMarkdown();
            showMarkdownPreview(markdown, 'all_boards');
        }