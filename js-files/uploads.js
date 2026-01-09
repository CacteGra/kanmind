uploads = {

    handleFileUpload: function(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const markdown = e.target.result;
            
            try {
                const parsedBoards = uploads.parseMarkdownToBoards(markdown);
                
                if (parsedBoards.length === 0) {
                    alert('⚠️ No boards found in the markdown file. Please check the format.');
                    return;
                }
                
                // Ask user if they want to replace or merge
                const action = confirm(
                    `Found ${parsedBoards.length} board(s) in the file.\n\n` +
                    `Click OK to ADD these boards to existing ones.\n` +
                    `Click Cancel to REPLACE all existing boards.`
                );
                
                if (!action) {
                    // Replace all boards
                    boards.length = 0;
                    boards.push(...parsedBoards);
                } else {
                    // Add to existing boards
                    boards.push(...parsedBoards);
                }
                
                renderBoards();
                
                // Show success message
                let totalTasks = 0;
                parsedBoards.forEach(b => totalTasks += b.tasks.length);
                
                alert(
                    `✅ Successfully imported!\n\n` +
                    `Boards: ${parsedBoards.length}\n` +
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