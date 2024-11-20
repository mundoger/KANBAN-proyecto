// Función para cargar las columnas desde el LocalStorage
function loadColumns() {
    const storedColumns = JSON.parse(localStorage.getItem('columns')) || [];
    fetch('/get_columns')
        .then(response => response.json())
        .then(serverColumns => {
            const combinedColumns = [...serverColumns, ...storedColumns];
            displayColumns(combinedColumns);
        })
        .catch(error => console.error('Error al cargar columnas iniciales:', error));

}


//Funcion para editar columnas
function editColumn(columnId) {
    const storedColumns = JSON.parse(localStorage.getItem('columns')) || [];
    const newTitle = prompt("Introduce el nuevo título de la columna:");
    if (newTitle) {
        const updatedColumns = storedColumns.map(column => {
            if (column.id === columnId) {
                return { ...column, title: newTitle };
            }
            return column;
        });

        localStorage.setItem('columns', JSON.stringify(updatedColumns));

        fetch('/api/columns', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: columnId, title: newTitle }),
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
function deleteColumn(columnId) {
    const storedColumns = JSON.parse(localStorage.getItem('columns')) || [];
    if (confirm("¿Estas seguro de que deseas eliminar esta columna?")) {
        const updatedColumns = storedColumns.filter(column => column.id !== columnId);

        localStorage.setItem('columns', JSON.stringify(updatedColumns));

        fetch('/api/columns', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: columnId }),
        })
            .then(response => response.json())
            .then(data => {
                console.log('Columna eliminada:', data);
                loadColumns();
            })
            .catch(error => console.error('Error al eliminar la columna:', error));
    }
}

function editTask(taskId) {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const task = tasks.find(t => t.id === taskId); 

    if (!task) {
        return alert("Tarea no encontrada.");
    }

    showForm(null,task);
}


//Función para eliminar tareas
function deleteTask(taskId){
    const storedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    if (confirm("¿Estás seguro de que deseas eliminar esta tarea?")){
        const updatedTasks = storedTasks.filter(task => task.id !== taskId);

        localStorage.setItem('tasks',JSON.stringify(updatedTasks));
        alert("Tarea eliminada.");
        displayColumns(JSON.parse(localStorage.getItem("columns"))); // Actualiza la vista
    }
    loadColumns();
}


//Mostrar columnas en el HTML
function displayColumns(columns) {
    const board = document.getElementById("kanban-board");
    board.innerHTML = '';

    const columnCount = columns.length;
    const columnWidthClass = `col-md-${Math.floor(12 / columnCount)}`;

    //Cargar tareas desde el LocalStorage
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];


    columns.forEach(column => {
        //Crear el contenedor de la columna
        const columnDiv = document.createElement("div");
        columnDiv.className = `${columnWidthClass} mb-4`;
        columnDiv.dataset.id = column.id;

        //Crear el encabezado de la columna
        const headerDiv = document.createElement("div");
        headerDiv.className = "p-3  text-center border bg-light position-relative column-handle";
        const title = document.createElement("h4");
        title.textContent = column.title;

        // Contenedor de tareas dentro de la columna
        const taskContainer = document.createElement('div');
        taskContainer.className = "kanban-task-container d-flex flex-column mt-3";  // Añadir la clase 'kanban-task-container'

        //Mostrar tareas asociadas a la columna
        const columnTasks = tasks.filter(task => task.columnId === column.id);
        columnTasks.forEach(task => {
            const taskCard = document.createElement('div');
            taskCard.className = "card mb-2 kanban-task";
            taskCard.innerHTML = `
            <div id="kanban-task" class="card-body">
                <h5 class="card-title">${task.title}</h5>
                <p class="card-text">${task.description}</p>
                <span class="badge bg-primary">${task.tags}</span>
            </div>
            `;
            // Botón de opciones
            const optionsButton = document.createElement("button");
            optionsButton.className = "btn btn-light btn-sm dropdown-toggle position-absolute top-0 end-0 m-2";
            optionsButton.setAttribute("data-bs-toggle", "dropdown");
            optionsButton.setAttribute("aria-expanded", "false");
            optionsButton.innerHTML = "&#8942"; // Icono de tres puntos

            // Menú de opciones
            const optionsMenu = document.createElement("ul");
            optionsMenu.className = "dropdown-menu dropdown-menu-end";

            const editOption = document.createElement("li");
            const editLink = document.createElement("a");
            editLink.className = "dropdown-item";
            editLink.href = "#";
            editLink.textContent = "Editar";
            editLink.onclick = () => editTask(task.id);
            editOption.appendChild(editLink);

            // Opción Eliminar
            const deleteOption = document.createElement("li");
            const deleteLink = document.createElement("a");
            deleteLink.className = "dropdown-item";
            deleteLink.href = "#";
            deleteLink.textContent = "Eliminar";
            deleteLink.onclick = () => deleteTask(task.id);
            deleteOption.appendChild(deleteLink);

            // Agregar opciones al menú
            optionsMenu.appendChild(editOption);
            optionsMenu.appendChild(deleteOption);


            taskCard.appendChild(optionsButton);
            taskCard.appendChild(optionsMenu);

            taskContainer.appendChild(taskCard);
        });

        //Botón Añadir tarea
        const columnElement = document.createElement('div');
        columnElement.className = "d-column justify-content-center align-items-center m-3"
        const taskButton = document.createElement('button');
        taskButton.className = "btn btn-primary text-center w-100";
        taskButton.textContent = "Añadir Tarea";
        taskButton.onclick = function () {
            showForm(column.id);
        };
        //Botón de opciones
        const optionsButton = document.createElement("button");
        optionsButton.className = "btn btn-light btn-sm dropdown-toggle position-absolute top-0 end-0 m-2";
        optionsButton.setAttribute("data-bs-toggle", "dropdown");
        optionsButton.setAttribute("aria-expanded", "false");
        optionsButton.innerHTML = `<i class="fas fa-ellipsis-v"></i>`;
        optionsButton.innerHTML = "&#8942";

        //Menú de opciones
        const optionsMenu = document.createElement("ul");
        optionsMenu.className = "dropdown-menu dropdown-menu-end"

        //Opción editar
        const editOption = document.createElement("li");
        const editLink = document.createElement("a");
        editLink.className = "dropdown-item";
        editLink.href = "#";
        editLink.textContent = "Editar";
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

        columnElement.appendChild(taskButton);
        columnElement.appendChild(taskContainer);

        columnDiv.appendChild(headerDiv);
        columnDiv.appendChild(columnElement);

        columnElement.appendChild(taskButton);

        board.appendChild(columnDiv);

    });
}

// Función para mostrar el formulario de tarea
function showForm(columnId, task = null) {
    const divForm = document.createElement('div');
    divForm.className = "bg-light d-flex justify-content-center align-items-center vh-100 position-fixed top-0 start-0 w-100";

    const container = document.createElement('div');
    container.className = "container w-50";

    const card = document.createElement('div');
    card.className = "card shadow";

    const cardHeader = document.createElement('div');
    cardHeader.className = "card-header";

    const title = document.createElement('h1');
    title.className = "h4";
    title.textContent = task ? "Editar Tarea" : "Añadir Tarea"; // Usamos el operador ternario para manejar si es editar o crear

    cardHeader.appendChild(title);

    const cardBody = document.createElement('div');
    cardBody.className = "card-body";

    const form = document.createElement('form');

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
    titleInput.value = task ? task.title : ""; // Precarga el título si existe la tarea

    titleGroup.appendChild(titleLabel);
    titleGroup.appendChild(titleInput);

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
    descriptionTextarea.value = task ? task.description : "" // Si hay tarea, precargamos la descripción

    descriptionGroup.appendChild(descriptionLabel);
    descriptionGroup.appendChild(descriptionTextarea);

    const tagsGroup = document.createElement('div');
    tagsGroup.className = "mb-3";

    const tagsLabel = document.createElement('label');
    tagsLabel.className = "form-label";
    tagsLabel.setAttribute("for", "etiquetas");
    tagsLabel.textContent = "Etiquetas";

    const tagsInput = document.createElement('input');
    tagsInput.className = "form-control";
    tagsInput.setAttribute("type", "text");
    tagsInput.setAttribute("id", "etiquetas");
    tagsInput.setAttribute("name", "etiquetas");
    tagsInput.setAttribute("placeholder", "Ej: Importante, Medio");
    tagsInput.setAttribute("required", "")
    tagsInput.value = task ? task.tags : "" // Si hay tarea, precargamos las etiquetas

    tagsGroup.appendChild(tagsLabel);
    tagsGroup.appendChild(tagsInput);

    const saveButton = document.createElement('button');
    saveButton.setAttribute("type", "submit"); 
    saveButton.className = "btn btn-primary";
    saveButton.textContent = "Guardar Cambios";

    const cancelButton = document.createElement('button');
    cancelButton.className = "btn btn-danger";
    cancelButton.setAttribute("type", "button");
    cancelButton.textContent = "Cancelar";
    cancelButton.onclick = function () {
        divForm.remove(); // Elimina el formulario si el usuario cancela
    };

    form.onsubmit = function (e) {
        e.preventDefault(); // Evita el comportamiento predeterminado de submit
        const taskData = {
            id: task ? task.id : Date.now(), // Usamos el ID de la tarea si está presente, si no generamos uno nuevo
            title: titleInput.value,
            description: descriptionTextarea.value,
            tags: tagsInput.value,
        };

        saveTaskToLocalStorage(taskData, columnId); // Guardamos la tarea
        loadColumns(); // Actualizamos las columnas para reflejar el cambio
        divForm.remove(); // Eliminamos el formulario después de guardar
    };

    form.appendChild(titleGroup);
    form.appendChild(descriptionGroup);
    form.appendChild(tagsGroup);
    form.appendChild(saveButton);
    form.appendChild(cancelButton);

    cardBody.appendChild(form);
    card.appendChild(cardHeader);
    card.appendChild(cardBody);

    container.appendChild(card);
    divForm.appendChild(container);

    document.body.appendChild(divForm);
}


//Guardar datos Tareas en el LocalStorage
function saveTaskToLocalStorage(task, columnId) {
    
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];

     // Buscar la tarea a editar por su ID
     const existingTaskIndex = tasks.findIndex(t => t.id === task.id);

     // Si la tarea existe, actualizamos sus datos
    if (existingTaskIndex !== -1) {
        tasks[existingTaskIndex] = { ...tasks[existingTaskIndex], ...task };
    } else {
        // Si no existe, la agregamos como una nueva tarea
        tasks.push({ ...task, columnId });
    }
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
    const taskContainers  = Array.from(kanbanBoard.getElementsByClassName('kanban-task-container'))

     // Hacer las columnas arrastrables
     Sortable.create(kanbanBoard, {
        animation: 150,
        ghostClass: 'sortable-ghost',
        handle: '.column-handle',
        onEnd: function (event) {
            console.log('Columna movida de', event.oldIndex, 'a', event.newIndex);
            moveColumn();
        },
    });

    function initializeTaskContainers() {
        // Seleccionar todos los contenedores de tareas
        const taskContainers = document.querySelectorAll('.kanban-task-container');
        
        // Inicializar Sortable para cada contenedor de tareas
        taskContainers.forEach(container => {
            Sortable.create(container, {
                animation: 150,
                ghostClass: 'sortable-ghost',
                group: 'tasks', // Esto permite mover tareas entre columnas
                draggable: '.kanban-task', // Clase de los elementos arrastrables
                onEnd: function (event) {
                    console.log('Tarea movida de', event.from.dataset.id, 'a', event.to.dataset.id);
                    moveTask(event);
                },
            });
        });
    }

    // Inicializar los contenedores al cargar la página
    loadColumns();
    initializeTaskContainers();

    

    function moveColumn() {
        const movedColumn = Array.from(document.getElementById('kanban-board').children);
    
        const newOrder = movedColumn.map(column => column.dataset.id);
    
        const storedColumns = JSON.parse(localStorage.getItem('columns')) || [];
    
        const reorderedColumns = newOrder
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

    
    function moveTask(event) {
        // Obtener las tareas actuales del localStorage
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        
        // Obtener el ID de la tarea movida (del elemento arrastrado)
        const taskElement = event.item;
        const taskTitle = taskElement.querySelector('.card-title').textContent;
        
        // Encontrar la tarea en el array de tareas
        const taskToMove = tasks.find(task => task.title === taskTitle);
        
        if (taskToMove) {
            // Obtener el ID de la columna destino
            const newColumnId = event.to.closest('.col-md-2, .col-md-3, .col-md-4, .col-md-6').dataset.id;
            
            // Actualizar la columna de la tarea
            taskToMove.columnId = newColumnId;
            
            // Actualizar el orden de las tareas en la nueva columna
            const newTaskOrder = Array.from(event.to.children).map(taskElement => {
                const title = taskElement.querySelector('.card-title').textContent;
                return tasks.find(task => task.title === title);
            });
            
            // Filtrar las tareas que no están en la columna actual
            const otherTasks = tasks.filter(task => task.columnId !== newColumnId);
            
            // Combinar las tareas reordenadas con las demás tareas
            const updatedTasks = [...otherTasks, ...newTaskOrder.filter(Boolean)];
            
            // Guardar en localStorage
            localStorage.setItem('tasks', JSON.stringify(updatedTasks));
            
            console.log('Tarea movida exitosamente:', {
                taskId: taskToMove.id,
                newColumnId: newColumnId,
                newOrder: newTaskOrder.map(t => t?.id)
            });
        }
    }
     // Observador para reinicializar Sortable cuando se añadan nuevas columnas o tareas
     const observer = new MutationObserver(() => {
        initializeTaskContainers();
    });

    // Observar cambios en el kanban-board
    observer.observe(kanbanBoard, {
        childList: true,
        subtree: true
    });
});






//Inicializar el tablero al cargar la página
document.addEventListener('DOMContentLoaded', loadColumns);


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


