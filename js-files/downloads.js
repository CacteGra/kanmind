downloads = {

    openDownloadModal: function(markdown, boardName) {
        currentMarkdown = markdown;
        currentBoardName = boardName;
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
        const markdown = "# This is markdown";
        downloads.openDownloadModal(markdown, 'all_boards');
    },

}