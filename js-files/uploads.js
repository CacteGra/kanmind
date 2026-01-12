uploads = {

    // MARKDOWN PARSING FUNCTIONS
    parseMarkdownToBoards: function(markdown) {
        const parsedBoards = {};
        
        // Split by board sections (looking for # emoji BoardName pattern)
        const boardSections = markdown.split(/^# /m).filter(s => s.trim());
        
        boardSections.forEach(section => {
            // Skip the "All Project Boards" header section
            if (section.includes('📊 All Project Boards') || section.includes('All Project Boards')) {
                return;
            }
            
            const lines = section.split('\n');
            if (lines.length === 0) return;
            
            // Parse board name and icon from first line
            const firstLine = lines[0].trim();
            
            let board = firstLine;
                        
            // Parse tasks from sections
            let currentStatus = null;
            let currentTask = null;
            
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                
                // Detect status sections
                if (line.startsWith('## ')) {
                    if (line.includes('To Do') || line.includes('📋')) {
                        currentStatus = 'todo';
                    } else if (line.includes('In Progress') || line.includes('🔄')) {
                        currentStatus = 'inprogress';
                    } else if (line.includes('Review') || line.includes('👀')) {
                        currentStatus = 'review';
                    } else if (line.includes('Done') || line.includes('✅')) {
                        currentStatus = 'done';
                    } else {
                        currentStatus = null; // Statistics or other sections
                    }
                    continue;
                }
                
                // Detect task title (### TaskName)
                if (line.startsWith('### ') && currentStatus) {
                    // Save previous task if exists
                    if (currentTask) {
                        taskObj[currentTask.id] = currentTask
                    }
                    
                    // Start new task
                    currentTask = {
                        id: `task-${taskIdCounter++}`,
                        title: line.substring(4).trim(),
                        description: '',
                        priority: 'medium',
                        assignee: 'Unassigned',
                        status: currentStatus,
                        timestamps: [],
                        board: board
                    };
                    continue;
                }
                
                // Parse task properties
                if (currentTask && line.startsWith('- **')) {
                    const propertyMatch = line.match(/- \*\*(.+?):\*\* (.+)/);
                    if (propertyMatch) {
                        const key = propertyMatch[1].toLowerCase();
                        const value = propertyMatch[2].trim();
                        
                        if (key === 'description') {
                            currentTask.description = value;
                        } else if (key === 'priority') {
                            currentTask.priority = value.toLowerCase();
                        } else if (key === 'assignee') {
                            currentTask.assignee = value;
                        } else if (key === 'last updated') {
                            try {
                                currentTask.timestamps.push(value);
                            } catch (e) {
                                currentTask.timestamps.push(new Date());
                            }
                        }
                    }
                }
            }
            
            // Last task
            if (currentTask) {
                taskObj[currentTask.id] = currentTask;
            }
            
            // Only add board if it has a valid name and at least one task or was intentionally created
            if (board && (Object.keys(taskObj).length > 0 || board !== 'All Project Boards')) {
                // let boardTasks = boards.boardTasks(board);
                // if (boardTasks) {
                //     boardTasks.forEach(boardTask => {
                //         taskObj[]
                //     })
                // }
                
                persistence.saveTasks(board, taskObj);
            }
            parsedBoards[board] = taskObj;
            console.log(parsedBoards);
        });
        
        return parsedBoards;
    },

    handleFileUpload: function(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const markdown = e.target.result;
            
            try {
                const parsedBoards = uploads.parseMarkdownToBoards(markdown);
                
                const parsedBoardsKeys = Object.keys(parsedBoards);
                if (parsedBoardsKeys.length === 0) {
                    alert('⚠️ No boards found in the markdown file. Please check the format.');
                    return;
                }
                
                // Ask user if they want to replace or merge
                const action = confirm(
                    `Found ${parsedBoards.length} board(s) in the file.\n\n` +
                    `Click OK to ADD these boards to existing ones.\n` +
                    `Click Cancel to REPLACE all existing boards.`
                );
                
                multiview.switchView();

                // Show success message
                let totalTasks = 0;
                parsedBoardsKeys.forEach(b => totalTasks += Object.values(parsedBoards[b]).length);
                
                alert(
                    `✅ Successfully imported!\n\n` +
                    `Boards: ${parsedBoardsKeys.length}\n` +
                    `Tasks: ${totalTasks}`
                );
                
            } catch (error) {
                console.error('Parse error:', error);
                alert('❌ Error parsing markdown file. Please check the format.\n\n' + error.message);
            }
            
            // Reset file input
            event.target.value = '';
        };
        
        reader.onerror = function() {
            alert('❌ Error reading file. Please try again.');
        };
        
        reader.readAsText(file);
    },
}