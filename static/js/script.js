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
        taskButton.onclick = function() {
            showForm();
        };
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

function showForm() {
    // Crear el contenedor principal
    const divForm = document.createElement('div');
    divForm.className = "bg-light d-flex justify-content-center align-items-center vh-100 position-fixed top-0 start-0 w-100";

    // Crear el contenedor del formulario
    const container = document.createElement('div');
    container.className = "container w-50";

    // Crear la tarjeta del formulario
    const card = document.createElement('div');
    card.className = "card shadow";

    // Encabezado de la tarjeta
    const cardHeader = document.createElement('div');
    cardHeader.className = "card-header";

    const title = document.createElement('h1');
    title.className = "h4";
    title.textContent = "Añadir Tarea";

    cardHeader.appendChild(title);

    // Cuerpo de la tarjeta
    const cardBody = document.createElement('div');
    cardBody.className = "card-body";

    // Crear el formulario
    const form = document.createElement('form');

    // Campo Título
    const titleGroup = document.createElement('div');
    titleGroup.className = "mb-3";

    const titleLabel = document.createElement('label');
    titleLabel.className = "form-label";
    titleLabel.setAttribute("for", "titulo");
    titleLabel.textContent = "Título";

    const titleInput = document.createElement('input');
    titleInput.className = "form-control";
    titleInput.setAttribute("type", "text");
    titleInput.setAttribute("id", "titulo");
    titleInput.setAttribute("name", "titulo");
    titleInput.setAttribute("placeholder", "Título de la tarea.");
    titleInput.setAttribute("required", ""); // Validación requerida

    titleGroup.appendChild(titleLabel);
    titleGroup.appendChild(titleInput);

    // Campo Descripción
    const descriptionGroup = document.createElement('div');
    descriptionGroup.className = "mb-3";

    const descriptionLabel = document.createElement('label');
    descriptionLabel.className = "form-label";
    descriptionLabel.setAttribute("for", "descripcion");
    descriptionLabel.textContent = "Descripción";

    const descriptionTextarea = document.createElement('textarea');
    descriptionTextarea.className = "form-control";
    descriptionTextarea.setAttribute("id", "descripcion");
    descriptionTextarea.setAttribute("name", "descripcion");
    descriptionTextarea.setAttribute("placeholder", "Descripción de la tarea.");
    descriptionTextarea.setAttribute("rows", "4");
    descriptionTextarea.setAttribute("required", ""); // Validación requerida

    descriptionGroup.appendChild(descriptionLabel);
    descriptionGroup.appendChild(descriptionTextarea);

    // Campo Estado
    const statusGroup = document.createElement('div');
    statusGroup.className = "mb-3";

    const statusLabel = document.createElement('label');
    statusLabel.className = "form-label";
    statusLabel.setAttribute("for", "estado");
    statusLabel.textContent = "Estado";

    const statusInput = document.createElement('input');
    statusInput.className = "form-control";
    statusInput.setAttribute("type", "text");
    statusInput.setAttribute("id", "estado");
    statusInput.setAttribute("name", "estado");
    statusInput.setAttribute("placeholder", "En progreso");
    statusInput.setAttribute("required", ""); // Validación requerida

    statusGroup.appendChild(statusLabel);
    statusGroup.appendChild(statusInput);

    // Botón Guardar Cambios
    const saveButton = document.createElement('button');
    saveButton.setAttribute("type", "submit"); // Tipo submit para disparar validación
    saveButton.className = "btn btn-primary";
    saveButton.textContent = "Guardar Cambios";

    // Botón Cancelar
    const cancelButton = document.createElement('button');
    cancelButton.className = "btn btn-danger";
    cancelButton.setAttribute("type", "button");
    cancelButton.textContent = "Cancelar";
    cancelButton.onclick = function () {
        divForm.remove(); // Cierra el formulario
    };

    // Manejar el envío del formulario
    form.onsubmit = function (e) {
        e.preventDefault(); // Evita el envío automático

        // Validar campos (opcional si quieres validación adicional)
        if (!form.checkValidity()) {
            form.reportValidity(); // Mostrar errores si hay algún campo inválido
            return;
        }

        const taskData = {
            titulo: titleInput.value,
            descripcion: descriptionTextarea.value,
            estado: statusInput.value,
        };

        // Guardar en localStorage
        const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
        tasks.push(taskData);
        localStorage.setItem("tasks", JSON.stringify(tasks));

        console.log("Tarea guardada:", taskData);
        alert("Tarea guardada correctamente.");
        divForm.remove(); // Cierra el formulario
    };

    // Agregar campos y botones al formulario
    form.appendChild(titleGroup);
    form.appendChild(descriptionGroup);
    form.appendChild(statusGroup);
    form.appendChild(saveButton);
    form.appendChild(cancelButton);

    // Agregar el formulario al cuerpo de la tarjeta
    cardBody.appendChild(form);

    // Ensamblar la tarjeta completa
    card.appendChild(cardHeader);
    card.appendChild(cardBody);

    // Agregar tarjeta al contenedor
    container.appendChild(card);

    // Agregar contenedor principal
    divForm.appendChild(container);

    // Mostrar el formulario en el cuerpo del documento
    document.body.appendChild(divForm);
}


//Guardar datos Tareas en el LocalStorage
function saveTaskToLocalStorage(event){
    event.preventDefault();

    const title = document.getElementById('titulo').value;
    const description = document.getElementById('descripcion').value;
    const state = document.getElementById('estado').value;
    const tags = document.getElementById('etiquetas').value;

    const task = {
        id:Date.now(),
        title,
        description,
        state,
        tags,
    };

    const tasks = JSON.parse(localStorage.getItem('tasks'))||[];

    tasks.push(task);

    localStorage.setItem('tasks', JSON.stringify(tasks));

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


