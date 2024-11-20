document.addEventListener('DOMContentLoaded', () => {
    // Variables
    const menuToggle = document.getElementById('menu-toggle');
    const sideMenu = document.getElementById('side-menu');
    const closeBtn = document.getElementById('close-btn');

    // Abrir el menú
    menuToggle.addEventListener('click', () => {
        sideMenu.classList.add('open');
    });

    // Cerrar el menú
    closeBtn.addEventListener('click', () => {
        sideMenu.classList.remove('open');
    });

    // Cerrar el menú también cuando se haga clic en un enlace del menú
    const menuItems = document.querySelectorAll('.side-menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            sideMenu.classList.remove('open');
        });
    });
});


let tasks = [];
let reports = [];
let projects = [];

function toggleDropdown() {
    document.getElementById("createDropdown").classList.toggle("show");
}

window.onclick = function (event) {
    if (!event.target.matches('.create-btn')) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        for (var i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}

function search() {
    var searchTerm = document.getElementById("searchInput").value.toLowerCase();
    var allItems = [...tasks, ...reports, ...projects];
    var filteredItems = allItems.filter(item =>
        item.name.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm)
    );
    updateTable(filteredItems);
}

function changeTab(tabName) {
    var i, tabContent, tabLinks;
    tabContent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabContent.length; i++) {
        tabContent[i].style.display = "none";
    }
    tabLinks = document.getElementsByClassName("tab");
    for (i = 0; i < tabLinks.length; i++) {
        tabLinks[i].className = tabLinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    event.currentTarget.className += " active";
}

function openModal(type) {
    document.getElementById("modal").style.display = "block";
    document.getElementById("modalTitle").innerText = `Crear Nuevo ${type.charAt(0).toUpperCase() + type.slice(1)}`;
    document.getElementById("itemForm").onsubmit = function (e) {
        e.preventDefault();
        createItem(type);
    };
}

function closeModal() {
    document.getElementById("modal").style.display = "none";
}

function createItem(type) {
    const name = document.getElementById("itemName").value;
    const description = document.getElementById("itemDescription").value;
    const dueDate = document.getElementById("itemDueDate").value;
    const responsible = document.getElementById("itemResponsible").value;

    const newItem = {name, description, dueDate, responsible, type};

    switch (type) {
        case 'task':
            tasks.push(newItem);
            break;
        case 'report':
            reports.push(newItem);
            break;
        case 'project':
            projects.push(newItem);
            break;
    }

    updateCounters();
    updateTable([...tasks, ...reports, ...projects]);
    closeModal();
}

function updateCounters() {
    document.getElementById("taskCount").innerText = tasks.length;
    document.getElementById("reportCount").innerText = reports.length;
    document.getElementById("projectCount").innerText = projects.length;
}

function updateTable(items) {
    const tbody = document.getElementById("itemList");
    tbody.innerHTML = '';

    if (items.length === 0) {
        tbody.innerHTML = `
                    <tr>
                        <td colspan="8" style="text-align: center; padding: 20px;">
                            Su solicitud de búsqueda no tiene ningún resultado.<br>
                            Intente restableciendo el filtro o cambie la frase de búsqueda.
                        </td>
                    </tr>
                `;
        return;
    }

    items.forEach(item => {
        const row = tbody.insertRow();
        row.innerHTML = `
                    <td></td>
                    <td>${item.name}</td>
                    <td>${item.type}</td>
                    <td>${item.dueDate}</td>
                    <td>Usuario Actual</td>
                    <td>${item.responsible}</td>
                    <td>${item.type === 'project' ? item.name : '-'}</td>
                    <td></td>
                `;
    });
}


