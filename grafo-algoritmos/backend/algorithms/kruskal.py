# Algoritmo de Kruskal para encontrar el árbol de expansión mínima

def find(parent, i):
    if parent[i] == i:
        return i
    return find(parent, parent[i])

def union(parent, rank, x, y):
    xroot = find(parent, x)
    yroot = find(parent, y)

    if rank[xroot] < rank[yroot]:
        parent[xroot] = yroot
    elif rank[xroot] > rank[yroot]:
        parent[yroot] = xroot
    else:
        parent[yroot] = xroot
        rank[xroot] += 1

def kruskal(graph):
    result = []  # Esta lista almacenará el árbol de expansión mínima
    edges = graph['edges']
    edges = sorted(edges, key=lambda item: item[2])  # Ordena las aristas por peso

    parent = {}
    rank = {}

    for node in graph['nodes']:
        parent[node] = node
        rank[node] = 0

    for u, v, w in edges:
        x = find(parent, u)
        y = find(parent, v)

        if x != y:
            result.append((u, v, w))
            union(parent, rank, x, y)

    return result
