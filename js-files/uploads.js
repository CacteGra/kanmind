uploads = {

    handleFileUpload: function(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        
        reader.readAsText(file);
    },
}