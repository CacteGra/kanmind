heatmap = {

        heatColor: function(count) {
            if (count === 0) return "#1E293B";   // deep slate (empty)
            if (count <= 1) return "#006D32";    // light green
            if (count <= 3) return "#006D32";    // medium green
            if (count <= 6) return "#37dd5bff";    // bright green
            return "#39D353";                    // neon green
        },


        generateBoardHeatmap: function(board) {
            const days = 30;
            const today = new Date();
            const counts = new Array(days).fill(0);
            board
                .forEach(t => {
                    t.timestamps.forEach(timestamp => {
                        const delta = Math.floor((today - new Date(timestamp)) / (1000 * 60 * 60 * 24));
                        if (delta >= 0 && delta < days) {
                            counts[delta] += 1;
                        }
                    });
                });

            let html = `<div class="heatmap-div"><div class="gh-heatmap">`;

            for (let i = days - 1; i >= 0; i--) {
                const count = counts[i];
                html += `<div class="gh-cell" style="background:${heatmap.heatColor(count)}"></div>`;
            }

            html += `</div></div>`;
            return html;
        },

        generateTaskHeatmap: function(task) {
            const days = 30;
            today = new Date();
            const counts = new Array(days).fill(0);
            console.log(task);
            timestamps = task.timestamps;
            timestamps.forEach(t => {
                const delta = Math.floor((today - new Date(t)) / (1000 * 60 * 60 * 24));
                if (delta >= 0 && delta < days) {
                    counts[delta] += 1;
                }
            });

            let html = `<div class="heatmap-div"><div class="gh-heatmap">`;

            for (let i = days - 1; i >= 0; i--) {
                const count = counts[i];
                html += `<div class="gh-cell" style="background:${heatmap.heatColor(count)}"></div>`;
            }

            html += `</div></div>`;
            return html;
        },

        updateTaskHeatmap: function(task) {
            const days = 30;
            today = new Date();
            const counts = new Array(days).fill(0);
            console.log(task);
            timestamps = task.timestamps;
            timestamps.forEach(t => {
                const delta = Math.floor((today - new Date(t)) / (1000 * 60 * 60 * 24));
                if (delta >= 0 && delta < days) {
                    counts[delta] += 1;
                }
            });

            let html = `<div class="gh-heatmap">`;

            for (let i = days - 1; i >= 0; i--) {
                const count = counts[i];
                html += `<div class="gh-cell" style="background:${heatmap.heatColor(count)}"></div>`;
            }

            html += `</div>`;
            return html;
        },

}