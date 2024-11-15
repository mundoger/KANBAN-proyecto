document.addEventListener("DOMContentLoaded", function() {
    loadColumns();

    document.getElementById("addColumn").addEventListener("click", addColumn);
});

function loadColumns() {
    fetch("/api/columns")
        .then(response => response.json())
        .then(data => {
            const kanbanBoard = document.getElementById("kanban-board");
            kanbanBoard.innerHTML = "";
            data.forEach(column => {
                // Crear columnas con tareas
            });
        });
}

function addColumn() {
    const title = document.getElementById("new-column-title").value;
    if (title) {
        const newColumn = {
            id: Date.now().toString(),
            title: title,
            tasks: []
        };
        fetch("/api/columns", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newColumn)
        })
        .then(() => loadColumns());
    }
}
