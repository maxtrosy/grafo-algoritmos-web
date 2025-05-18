def prim(graph):
    nodes = graph['nodes']
    edges = graph['edges']  # edges: [(u, v, w), ...]
    n = len(nodes)
    if n == 0:
        return {'mst': [], 'totalWeight': 0}
    
    start_node = nodes[0]
    visited = set([start_node])
    mst = []
    total_weight = 0

    while len(visited) < n:
        # Encuentra la arista de menor peso que conecta un nodo visitado con uno no visitado
        min_edge = None
        min_weight = float('inf')
        for u, v, w in edges:
            if (u in visited and v not in visited) or (v in visited and u not in visited):
                if w < min_weight:
                    min_weight = w
                    min_edge = (u, v, w)
        if min_edge is None:
            # Grafo no conectado
            break
        u, v, w = min_edge
        mst.append({'from': u, 'to': v, 'weight': w})
        total_weight += w
        visited.add(v if u in visited else u)

    return {
        'mst': mst,
        'totalWeight': total_weight
    }
