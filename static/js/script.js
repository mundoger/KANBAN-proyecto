// Función para cargar las columnas y tareas desde el LocalStorage
function loadColumns(){
    const storedColumns = JSON.parse(localStorage.getItem('columns')) || [];
    fetch('/get_columns')
        .then(response => response.json())
        .then(serverColumns => {
            const combinedColumns = [...serverColumns,...storedColumns];
            displayColumns(combinedColumns);          
        })
        .catch(error=>console.error('Error al cargar columnas iniciales:',error));

}

//Mostrar columnas en el HTML
function displayColumns(columns){
    const board = document.getElementById("kanban-board");

    board.innerHTML='';

    const columnCount = columns.length;
    const columnWidthClass = `col-md-${Math.floor(12/columnCount)}`;

    columns.forEach(column => {   
        //Crear el contenedor de la columna
        const columnDiv=document.createElement("div");
        columnDiv.className = `${columnWidthClass} mb-4`;

        //Crear el encabezado de la columna
        const headerDiv=document.createElement("div");
        headerDiv.className="p-3 text-center border bg-light";
        const title=document.createElement("h2");
        title.textContent=column.title;

        headerDiv.appendChild(title);
        columnDiv.appendChild(headerDiv);        
        board.appendChild(columnDiv);
    });
}

//Función para añadir una nueva columna
function addColumn() {
    const titleInput = document.getElementById('new-column-title');
    const title = titleInput.value.trim();


    if(!title) {
        alert('Por favor, introduce un título para la columna.');
        return;
    }

    const newColumn = {
        id:`col-${Date.now()}`,
        title: title,
        tasks: []
    };

    //Agregar nueva columna
    const storedColumns=JSON.parse(localStorage.getItem('columns')) || [];
    storedColumns.push(newColumn);
    localStorage.setItem('columns',JSON.stringify(storedColumns));

    fetch('/get_columns')
        .then(response => response.json())
        .then(serverColumns => {
            const combinedColumns = [...serverColumns,...storedColumns];
            displayColumns(combinedColumns);          
        })
        .catch(error=>console.error('Error al cargar columnas iniciales:',error));

    titleInput.value='';
    
}

//Inicializar el tablero al cargar la página
document.addEventListener('DOMContentLoaded',loadColumns);


// // Función para crear un elemento de columna en el DOM
// function createColumnElement(column){
//     const columnElement = document.createElement('div');
//     columnElement.className='kanban-column';
//     columnElement.dataset.id=column.id;
//     columnElement.innerHTML = `
//     <h2>${column.title}</h2>
//     <button onclick="addTask('${column.id}')">Añadir tarea</button>
//     <div class="tasks"></div>
//     `;

//     return columnElement;
// }

// // Función para cargar tareas para una columna específica
// async function loadTasks(columnId){
//     try{
//         const response = await fetch(`/api/tasks?columnId=${columnId}`);
//         const tasks = await response.json();

//         const columnElement=document.querySelector(`[data-id="${columnId}"].tasks`);
//         columnElement.innerHTML='';

//         tasks.forEach(task => {
//             const taskElement = createTaskElement(task);
//             columnElement.appendChild(taskElement);
//         });
//     }catch (error){
//         console.error('Error al cargar las tareas:', error);
//     }
// }

// // Función para crear un elemento de tarea en el DOM


// // Función para añadir una nueva tarea a una columna


// // Función para eliminar una tarea


// // Función para editar una tarea


// // Función auxiliar para generar un ID único para nuevas tareas??


