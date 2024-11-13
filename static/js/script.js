// Función para cargar las columnas y tareas desde el servidor
async function loadColumns(){
    try{
        const response = await fetch('/api/columns');
        const columns = await response.json();

        const kanbanBoard=document.getElementById('kanban-board');
        kanbanBoard.innerHTML = '';

        columns.forEach(column => {
            const columnElement = createColumnElement(column);
            kanbanBoard.appendChild(columnElement);
            loadTasks(column.id);
        });
    } catch (error) {
        console.error('Error al cargar las columnas:', error);
    }
}

// Función para crear un elemento de columna en el DOM


// Función para cargar tareas para una columna específica


// Función para crear un elemento de tarea en el DOM


// Función para añadir una nueva tarea a una columna


// Función para eliminar una tarea


// Función para editar una tarea


// Función auxiliar para generar un ID único para nuevas tareas??


// Cargar las columnas al cargar la página