from flask import Flask, render_template, request, jsonify

app=Flask(__name__)

#Definición de columnas
kanban_columns = [
    {"id":"todo","title":"Por hacer","tasks":[]},
    {"id":"inProgress","title":"En progreso","tasks":[]},
    {"id":"done","title":"Hecho","tasks":[]}
]

@app.route('/')
def index():
    return render_template('kanban.html')

@app.route('/api/columns', methods=['GET','POST'])
def manage_columns():
    if request.method == 'POST':
        new_column=request.json
        kanban_columns.append(new_column)
        return jsonify(kanban_columns)
    return jsonify(kanban_columns)

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