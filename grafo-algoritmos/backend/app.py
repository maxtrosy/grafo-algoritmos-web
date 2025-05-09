from flask import Flask, request, jsonify
from flask_cors import CORS

# Importa las funciones de los módulos ubicados en backend/algorithms
from algorithms.bfs import bfs
from algorithms.dfs import dfs
from algorithms.dijkstra import dijkstra
from algorithms.kruskal import kruskal
from algorithms.primp import prim  

app = Flask(__name__)
CORS(app)

@app.route("/run_bfs", methods=["POST"])
def run_bfs():
    try:
        data = request.get_json()
        print("Datos recibidos:", data)

        if "matrix" not in data:
            return jsonify({"error": "Missing 'matrix' in request"}), 400

        graph = data["matrix"]
        start = data.get("start", 0)

        # Validación básica de la matriz
        if not all(len(row) == len(graph) for row in graph):
            return jsonify({"error": "Adjacency matrix must be square"}), 400

        result = bfs(graph, start)
        return jsonify({"result": result})

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        print(f"Error during BFS: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@app.route("/run_dfs", methods=["POST"])
def run_dfs():
    data = request.get_json()
    graph = data["graph"]
    start = data["start"]
    result = dfs(graph, start)
    return jsonify(result=result)

@app.route("/run_dijkstra", methods=["POST"])
def run_dijkstra():
    data = request.get_json()
    graph = data["graph"]
    start = data["start"]
    result = dijkstra(graph, start)
    return jsonify(result=result)

@app.route("/run_kruskal", methods=["POST"])
def run_kruskal():
    data = request.get_json()
    graph = data["graph"]
    result = kruskal(graph)
    return jsonify(result=result)

@app.route("/run_prim", methods=["POST"])
def run_prim():
    data = request.get_json()
    graph = data["graph"]
    result = prim(graph)
    return jsonify(result=result)

if __name__ == "__main__":
    app.run(debug=True)
