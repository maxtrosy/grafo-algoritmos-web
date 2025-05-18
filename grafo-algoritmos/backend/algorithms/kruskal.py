# Algoritmo de Kruskal para encontrar el árbol de expansión mínima

def find(parent, i):
    if parent[i] == i:
        return i
    parent[i] = find(parent, parent[i])  # Path compression
    return parent[i]

def union(parent, rank, x, y):
    xroot = find(parent, x)
    yroot = find(parent, y)
    if xroot == yroot:
        return
    if rank[xroot] < rank[yroot]:
        parent[xroot] = yroot
    elif rank[xroot] > rank[yroot]:
        parent[yroot] = xroot
    else:
        parent[yroot] = xroot
        rank[xroot] += 1

def kruskal(graph):
    edges = graph['edges']
    nodes = graph['nodes']
    edges = sorted(edges, key=lambda item: item[2])  # Ordena las aristas por peso

    parent = {}
    rank = {}
    for node in nodes:
        parent[node] = node
        rank[node] = 0

    mst = []
    total_weight = 0

    for u, v, w in edges:
        x = find(parent, u)
        y = find(parent, v)
        if x != y:
            mst.append({'from': u, 'to': v, 'weight': w})
            total_weight += w
            union(parent, rank, x, y)
        if len(mst) == len(nodes) - 1:
            break

    return {
        'mst': mst,
        'totalWeight': total_weight
    }
