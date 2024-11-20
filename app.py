from flask import Flask, render_template, request, jsonify

app=Flask(__name__)

@app.route('/')
def index():
    return render_template("index.html")

@app.route('/InicioSesion')
def InicioSesion():
    return render_template("InicioSesion.html")

@app.route('/iniciar-pantalla', methods = ['GET'] )
def submit():
    email = request.args['email']
    password = request.args['password']
    user_data = DataObject(email, password)
    return render_template("/principal.html", user = user_data)


@app.route('/principal')
def principal():
    return render_template("principal.html")

@app.route('/privacidad')
def privacidad():
    return render_template("privacidad.html")

@app.route('/seguridad')
def seguridad():
    return render_template("seguridad.html")

@app.route('/notificaciones')
def notificaciones():
    return render_template("notificaciones.html")

@app.route('/perfil')
def perfil():
    return render_template("perfil.html")

@app.route('/tareas')
def tareas():
    return render_template("tareas.html")


#Definición de columnas
kanban_columns = [
    {"id":"forDo","title":"Por hacer","tasks":[]},
    {"id":"inProgress","title":"En progreso","tasks":[]},
    {"id":"done","title":"Hecho","tasks":[]}
]


@app.route('/kanban')
def kanban():
    return render_template('kanban.html',columns=kanban_columns)

@app.route("/get_columns")
def get_columns():
    return jsonify(kanban_columns)

#---------------COLUMNAS-------------------
@app.route('/api/columns', methods=['GET', 'POST', 'DELETE', 'PUT'])
def manage_columns():
    global kanban_columns

    # Obtener todas las columnas
    if request.method == 'GET':
        return jsonify(kanban_columns), 200

    # Agregar una columna
    elif request.method == 'POST':
        new_column = request.json

        # Validar datos enviados
        if not new_column or 'id' not in new_column or 'title' not in new_column:
            return jsonify({"error": "Faltan datos para crear la columna."}), 400

        if not new_column['title'].strip():
            return jsonify({"error": "El título de la columna no puede estar vacío."}), 400

        kanban_columns.append(new_column)
        return jsonify({"message": "Columna agregada correctamente.", "columns": kanban_columns}), 201

    # Borrar una columna
    elif request.method == 'DELETE':
        column_id = request.json.get('id')

        # Validar que se envió un ID
        if not column_id:
            return jsonify({"error": "Se requiere un ID para eliminar la columna."}), 400

        # Filtrar las columnas y eliminar la correspondiente
        updated_columns = [column for column in kanban_columns if column['id'] != column_id]

        if len(updated_columns) == len(kanban_columns):
            return jsonify({"error": f"No se encontró la columna con ID {column_id}."}), 404

        kanban_columns = updated_columns
        return jsonify({"message": f"Columna '{column_id}' eliminada.", "columns": kanban_columns}), 200

    # Actualizar una columna
    elif request.method == 'PUT':
        data = request.json
        column_id = data.get('id')
        new_title = data.get('title')

        # Validar datos enviados
        if not column_id or not new_title:
            return jsonify({"error": "Faltan datos para actualizar la columna."}), 400

        for column in kanban_columns:
            if column['id'] == column_id:
                if not new_title.strip():
                    return jsonify({"error": "El título de la columna no puede estar vacío."}), 400

                column['title'] = new_title
                return jsonify({"message": "Título actualizado", "columns": kanban_columns}), 200

        return jsonify({"error": f"No se encontró la columna con ID {column_id}."}), 404

    return jsonify({"error": "Método no permitido."}), 405


@app.route('/api/columns/reorder', methods=['POST'])
def reorder_columns():
    global kanban_columns
    data = request.get_json()

    # Validar que el cuerpo de la solicitud contiene el orden
    if not data or 'order' not in data:
        return jsonify({"error": "Faltan datos para reordenar las columnas."}), 400

    new_order = data.get('order', [])

    # Validar que todos los IDs existan en las columnas actuales
    column_ids = [column['id'] for column in kanban_columns]
    if not all(column_id in column_ids for column_id in new_order):
        return jsonify({"error": "El orden contiene IDs no válidos."}), 400

    # Procesar el nuevo orden
    reordered_columns = [column for column_id in new_order for column in kanban_columns if column['id'] == column_id]
    kanban_columns = reordered_columns

    return jsonify({"message": "Orden actualizado correctamente", "columns": kanban_columns}), 200

# @app.route('/api/columns', methods=['GET','POST','DELETE','PUT'])

# # def get_columns():
# #     return jsonify(kanban_columns)

# def manage_columns():
#     global kanban_columns

#     #Obtener todas las columnas
#     if request.method == 'GET':
#             return jsonify(kanban_columns)
#     #Agregar una columna
#     elif request.method == 'POST':
#         new_column=request.json
#         kanban_columns.append(new_column)
#         return jsonify(kanban_columns)
#     #Borrar una columna
#     elif request.method == 'DELETE':
#         column_id=request.json.get('id')
#         kanban_columns=[column for column in kanban_columns if column['id'] != column_id]
#         return jsonify({"message" : f"Columna '{column_id}' eliminada."})
        
#     #Actualizar una columna
#     elif request.method == 'PUT':
#         data=request.json
#         column_id=data.get('id')
#         new_title=data.get('title')

#         for column in kanban_columns:
#             if column['id'] == column_id:
#                 column['title'] = new_title
#                 return jsonify ({"message": f"Título actualizado"})
            
#         return jsonify ({"error": f"No se encontró la columna"})

#     return jsonify({"error": "Método no permitido."})
    
# def add_column():
#     data=request.get_json()
#     new_column={
#         'id': data['id'],
#         'title': data['title']
#     }

# def reorder_columns():
#     data = request.get_json()
#     new_order = data.get('order', [])

#     # Procesa el nuevo orden de las columnas
#     global kanban_columns
#     reordered_columns = [column for column_id in new_order for column in kanban_columns if column['id'] == column_id]

#     # Reemplaza el orden de las columnas
#     kanban_columns = reordered_columns

#     # Devuelve una respuesta JSON válida
#     return jsonify({"message": "Orden actualizado correctamente", "columns": kanban_columns})
#---------------TAREAS-------------------
@app.route('/api/tasks',methods=['POST','DELETE','PUT'])
def manage_tasks():
    data=request.json
    if request.method == 'POST':
        #Agregar tarea a una columna :O
        column_id=data.get('columnId')
        for column in kanban_columns:
            if column['id'] == column_id:
                column["tasks"].append(data)
                break
            return jsonify(kanban_columns)
        #Eliminar tarea de una columna :O
    elif request.method == 'DELETE':
        task_id = data.get('taskId')
        column_id = data.get('columnId')
        for column in kanban_columns:
            if column['id'] == column_id:
                column['tasks']=[task for task in column['tasks'] if task['id'] != task_id]
                break
            return jsonify(kanban_columns)
        #Actualizar tarea :O
    elif request.method == 'PUT':
        task_id=data.get('id')
        for column in kanban_columns:
            for i, task in enumerate(column['tasks']):
                if task['id']==task_id:
                    column['tasks'][i]=data
                    return jsonify(kanban_columns)
    return jsonify({"error":"Método no permitido"}), 405

if __name__ == '__main__':
    app.run(debug=True)