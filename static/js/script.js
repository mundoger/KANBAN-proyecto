// Función para cargar las columnas desde el LocalStorage
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


//Funcion para editar columnas
function editColumn(columnId) {
    const storedColumns = JSON.parse(localStorage.getItem('columns')) || [];
    const newTitle = prompt("Introduce el nuevo título de la columna:");
    if (newTitle) {
        const updatedColumns = storedColumns.map(column => {
            if (column.id === columnId){
                return {...column,title:newTitle};
            }
            return column;
        });

        localStorage.setItem('columns',JSON.stringify(updatedColumns));

        fetch('/api/columns',{
            method:'PUT',
            headers:{'Content-Type': 'application/json'},
            body: JSON.stringify({id: columnId, title: newTitle}),
        })
            .then(response => response.json())
            .then(data => {
                console.log('Columna actualizada:', data);
                loadColumns();
            })
            .catch(error => console.error('Error al actualizar la columna:', error));
    }
}

//Función para eliminar columnas
function deleteColumn(columnId){
    const storedColumns = JSON.parse(localStorage.getItem('columns')) || [];
    if (confirm("¿Estas seguro de que deseas eliminar esta columna?")){
        const updatedColumns = storedColumns.filter(column => column.id !== columnId);

        localStorage.setItem('columns',JSON.stringify(updatedColumns));

        fetch('/api/columns',{
            method:'DELETE',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({id: columnId}),
        })
            .then(response => response.json())
            .then(data => {
                console.log('Columna eliminada:', data);
                loadColumns();
            })
            .catch(error => console.error('Error al eliminar la columna:', error));
    }
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
        columnDiv.dataset.id = column.id;

        //Crear el encabezado de la columna
        const headerDiv=document.createElement("div");
        headerDiv.className="p-3  text-center border bg-light position-relative column-handle";
        const title=document.createElement("h4");
        title.textContent=column.title;

        //Botón Añadir tarea
        const columnElement = document.createElement('div');
        columnElement.className="d-flex justify-content-center align-items-center"
        const taskButton = document.createElement('button');
        taskButton.className="btn btn-primary text-center m-3 w-100";
        taskButton.textContent="Añadir Tarea";
        
        


        //Botón de opciones
        const optionsButton = document.createElement("button");
        optionsButton.className = "btn btn-light btn-sm dropdown-toggle position-absolute top-0 end-0 m-2";
        optionsButton.setAttribute("data-bs-toggle", "dropdown");
        optionsButton.setAttribute("aria-expanded", "false");
        optionsButton.innerHTML = `<i class="fas fa-ellipsis-v"></i>`;
        optionsButton.innerHTML= "&#8942";

        //Menú de opciones
        const optionsMenu = document.createElement("ul");
        optionsMenu.className = "dropdown-menu dropdown-menu-end"

        //Opción editar
        const editOption = document.createElement("li");
        const editLink=document.createElement("a");
        editLink.className="dropdown-item";
        editLink.href = "#";
        editLink.textContent="Editar";
        editLink.onclick = () => editColumn(column.id);
        editOption.appendChild(editLink);

        //Opción eliminar
        const deleteOption = document.createElement("li");
        const deleteLink = document.createElement("a");
        deleteLink.className = "dropdown-item";
        deleteLink.href = "#";
        deleteLink.textContent = "Eliminar";
        deleteLink.onclick = () => deleteColumn(column.id);
        deleteOption.appendChild(deleteLink);

        


        optionsMenu.appendChild(editOption);
        optionsMenu.appendChild(deleteOption);

        headerDiv.appendChild(title);
        headerDiv.appendChild(optionsButton);
        headerDiv.appendChild(optionsMenu);

        columnDiv.appendChild(headerDiv); 
        columnDiv.appendChild(columnElement);
        
        columnElement.appendChild(taskButton);

        board.appendChild(columnDiv);
        
    });
}

//Función para añadir una nueva columna
function addColumn() {
    const titleInput = document.getElementById('new-column-title');
    const title = titleInput.value.trim();
    const newColumn = {
        id: `col-${Date.now()}`,
        title: title,
        tasks: []
    };

    // Verifica si el título está vacío
    if (!title) {
        alert('Por favor, introduce un título para la columna.');
        return;
    }

    // Obtener columnas del servidor y verificar el límite
    fetch('/get_columns')
        .then(response => response.json())
        .then(serverColumns => {
            const storedColumns = JSON.parse(localStorage.getItem('columns')) || [];
            const totalColumns = serverColumns.length + storedColumns.length;

            if (totalColumns >= 6) {
                alert('No puedes agregar más de 6 columnas.');
                return;
            }

            storedColumns.push(newColumn);
            localStorage.setItem('columns', JSON.stringify(storedColumns));

            
            const combinedColumns = [...serverColumns, ...storedColumns];
            displayColumns(combinedColumns);

            // Limpia el campo de entrada
            titleInput.value = '';
        })
        .catch(error => console.error('Error al cargar columnas del servidor:', error));
}



//Función para mover columnas
document.addEventListener('DOMContentLoaded', () => {
    const kanbanBoard = document.getElementById('kanban-board');

    // Inicializar SortableJS en el contenedor de columnas
    Sortable.create(kanbanBoard, {
        animation: 150, // Efecto suave al arrastrar
        ghostClass: 'sortable-ghost', // Clase para el elemento arrastrado
        handle: '.column-handle', // Define un "handle" para arrastrar
        onEnd: function (event) {
            // Callback después de mover una columna
            console.log('Columna movida de', event.oldIndex, 'a', event.newIndex);

            // Aquí puedes actualizar el orden de las columnas en localStorage o servidor
            moveColumn();
        },
    });
});

function moveColumn(){
    const movedColumn = Array.from(document.getElementById('kanban-board').children);

    const newOrder = movedColumn.map(column => column.dataset.id);

    const storedColumns=JSON.parse(localStorage.getItem('columns')) || [];

    const reorderedColumns=newOrder
    .map(id => storedColumns.find(column => column && column.id === id)).filter(column => column);
    // Guardar el nuevo orden
    localStorage.setItem('columns', JSON.stringify(reorderedColumns));

    console.log('Nuevo orden de columnas guardado:', reorderedColumns);

    // Sincronizar el nuevo orden con el servidor
    fetch('/api/columns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: newOrder }), // Enviar el nuevo orden al servidor
    })
        .then(response => response.json())
        .then(data => {
            console.log('Nuevo orden sincronizado con el servidor:', data);
        })
        .catch(error => console.error('Error al sincronizar el orden con el servidor:', error));
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


