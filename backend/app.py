from flask import Flask, request, jsonify
from flask_cors import CORS
import re

from algorithms.bfs import bfs
from algorithms.dfs import dfs
from algorithms.dijkstra import dijkstra
from algorithms.kruskal import kruskal
from algorithms.prim import prim

app = Flask(__name__)
CORS(app)

def parse_letter_matrix(data):
    """Parse a letter-labeled adjacency matrix into a numerical matrix"""
    header = data.strip().split('\n')[0].split()
    nodes = header[1:]  
    
    node_index = {node: idx for idx, node in enumerate(nodes)}
    
    size = len(nodes)
    matrix = [[0] * size for _ in range(size)]
    
    for line in data.strip().split('\n')[1:]:
        parts = line.split()
        if not parts:
            continue
            
        row_node = parts[0]
        row_idx = node_index[row_node]
        
        for col_idx, weight in enumerate(parts[1:]):
            if weight == '0':
                matrix[row_idx][col_idx] = 0
            else:
                matrix[row_idx][col_idx] = int(weight)
    
    return matrix, nodes

def validate_graph_matrix(matrix):
    """Validate the graph matrix structure"""
    if not isinstance(matrix, list):
        raise ValueError("Graph must be a list")
    if not matrix:
        raise ValueError("Graph cannot be empty")
    if not all(isinstance(row, list) for row in matrix):
        raise ValueError("Each graph row must be a list")
    if not all(len(row) == len(matrix) for row in matrix):
        raise ValueError("Adjacency matrix must be square")
    return True

def convert_start_node(start, nodes):
    """Convert letter node to index if needed"""
    if isinstance(start, str):
        if start not in nodes:
            raise ValueError(f"Start node '{start}' not found in graph nodes")
        return nodes.index(start)
    return start

@app.route("/run_bfs", methods=["POST"])
def run_bfs():
    try:
        data = request.get_json()
        
        if not data or "matrix" not in data:
            return jsonify({"error": "Missing 'matrix' in request"}), 400

        if isinstance(data["matrix"], str) and re.match(r'^[A-Z]', data["matrix"].strip().split('\n')[0].split()[0]):
            matrix, nodes = parse_letter_matrix(data["matrix"])
            start = convert_start_node(data.get("start", nodes[0]), nodes)
        else:
            matrix = data["matrix"]
            nodes = list(range(len(matrix)))
            start = data.get("start", 0)
        
        validate_graph_matrix(matrix)
        
        if start < 0 or start >= len(matrix):
            raise ValueError(f"Start node must be between 0 and {len(matrix)-1}")

        result = bfs(matrix, start)
        return jsonify({
            "success": True,
            "result": result,
            "algorithm": "BFS",
            "start_node": nodes[start] if isinstance(data.get("start"), str) else start,
            "node_labels": nodes
        })

    except ValueError as e:
        return jsonify({"success": False, "error": str(e)}), 400
    except Exception as e:
        print(f"BFS Error: {str(e)}")
        return jsonify({"success": False, "error": "Internal server error"}), 500

@app.route("/run_dfs", methods=["POST"])
def run_dfs():
    try:
        data = request.get_json()
        
        if not data or "matrix" not in data:
            return jsonify({"error": "Missing 'matrix' in request"}), 400

        if isinstance(data["matrix"], str) and re.match(r'^[A-Z]', data["matrix"].strip().split('\n')[0].split()[0]):
            matrix, nodes = parse_letter_matrix(data["matrix"])
            start = convert_start_node(data.get("start", nodes[0]), nodes)
        else:
            matrix = data["matrix"]
            nodes = list(range(len(matrix)))
            start = data.get("start", 0)
        
        validate_graph_matrix(matrix)
        
        if start < 0 or start >= len(matrix):
            raise ValueError(f"Start node must be between 0 and {len(matrix)-1}")

        result = dfs(matrix, start)
        return jsonify({
            "success": True,
            "result": result,
            "algorithm": "DFS", 
            "start_node": nodes[start] if isinstance(data.get("start"), str) else start,
            "node_labels": nodes
        })

    except ValueError as e:
        return jsonify({"success": False, "error": str(e)}), 400
    except Exception as e:
        print(f"DFS Error: {str(e)}")
        return jsonify({"success": False, "error": "Internal server error"}), 500

@app.route('/run_dijkstra', methods=['POST'])
def run_dijkstra_route():
    try:
        data = request.get_json()
        matrix = data['matrix']
        start = data['start']
        result = dijkstra(matrix, start)
        return jsonify(result)
    except Exception as e:
        print("Dijkstra Error:", e)
        return jsonify({'error': str(e)}), 500

@app.route("/run_kruskal", methods=["POST"])
def run_kruskal():
    try:
        data = request.get_json()
        
        if not data or "matrix" not in data:
            return jsonify({"error": "Missing 'matrix' in request"}), 400

        if isinstance(data["matrix"], str) and re.match(r'^[A-Za-z]', data["matrix"].strip().split('\n')[0].split()[0]):
            matrix, node_labels = parse_letter_matrix(data["matrix"])
        else:
            matrix = data["matrix"]
            node_labels = list(range(len(matrix)))

        validate_graph_matrix(matrix)

        edges = []
        n = len(matrix)
        for i in range(n):
            for j in range(i+1, n):
                if matrix[i][j] > 0:
                    edges.append((i, j, matrix[i][j]))

        graph = {
            'nodes': list(range(n)),
            'edges': edges
        }
        kruskal_result = kruskal(graph)

        return jsonify({
            "success": True,
            "mst": kruskal_result['mst'],
            "totalWeight": kruskal_result['totalWeight'],
            "algorithm": "Kruskal",
            "node_labels": node_labels
        })

    except ValueError as e:
        return jsonify({"success": False, "error": str(e)}), 400
    except Exception as e:
        print(f"Kruskal Error: {str(e)}")
        return jsonify({"success": False, "error": "Internal server error"}), 500

    
@app.route("/run_prim", methods=["POST"])
def run_prim():
    try:
        data = request.get_json()

        if not data or "matrix" not in data:
            return jsonify({"error": "Missing 'matrix' in request"}), 400

        if isinstance(data["matrix"], str) and re.match(r'^[A-Za-z]', data["matrix"].strip().split('\n')[0].split()[0]):
            matrix, node_labels = parse_letter_matrix(data["matrix"])
            start = convert_start_node(data.get("start", node_labels[0]), node_labels)
        else:
            matrix = data["matrix"]
            node_labels = list(range(len(matrix)))
            start = data.get("start", 0)

        validate_graph_matrix(matrix)

        if start < 0 or start >= len(matrix):
            raise ValueError(f"Start node must be between 0 and {len(matrix)-1}")

        edges = []
        n = len(matrix)
        for i in range(n):
            for j in range(i+1, n):
                if matrix[i][j] > 0:
                    edges.append((i, j, matrix[i][j]))

        graph = {
            'nodes': list(range(n)),
            'edges': edges
        }
        prim_result = prim(graph)

        return jsonify({
            "success": True,
            "mst": prim_result['mst'],
            "totalWeight": prim_result['totalWeight'],
            "algorithm": "Prim",
            "start_node": node_labels[start],
            "node_labels": node_labels,
            "result": []  
        })

    except ValueError as e:
        return jsonify({"success": False, "error": str(e)}), 400
    except Exception as e:
        print(f"Prim Error: {str(e)}")
        return jsonify({"success": False, "error": "Internal server error"}), 500


if __name__ == "__main__":
    app.run(debug=True)