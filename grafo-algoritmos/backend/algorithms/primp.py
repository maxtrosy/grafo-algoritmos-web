# Algoritmo de Prim para encontrar el árbol de expansión mínima

def prim(graph):
    result = []  # Esta lista almacenará el árbol de expansión mínima
    nodes = graph['nodes']
    edges = graph['edges']
    
    # Selección de un nodo inicial (por ejemplo, el primer nodo en el grafo)
    start_node = nodes[0]
    visited = {start_node}
    min_edges = [(start_node, v, w) for u, v, w in edges if u == start_node or v == start_node]

    while min_edges:
        min_edge = min(min_edges, key=lambda x: x[2])  # Elige el borde con el peso más pequeño
        min_edges.remove(min_edge)
        u, v, weight = min_edge

        if v not in visited:
            visited.add(v)
            result.append(min_edge)
            for edge in edges:
                if edge[0] == v and edge[1] not in visited:
                    min_edges.append((v, edge[1], edge[2]))

    return result
