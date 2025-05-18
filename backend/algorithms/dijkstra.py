import heapq

def dijkstra(matrix, start):
    n = len(matrix)
    distances = [float('inf')] * n
    previous = [None] * n
    visited = [False] * n
    steps = []

    distances[start] = 0
    heap = [(0, start)]

    while heap:
        dist_u, u = heapq.heappop(heap)
        if visited[u]:
            continue
        visited[u] = True
        steps.append(u)

        for v, weight in enumerate(matrix[u]):
            if weight > 0 and not visited[v]:
                if distances[v] > distances[u] + weight:
                    distances[v] = distances[u] + weight
                    previous[v] = u
                    heapq.heappush(heap, (distances[v], v))

    # Reconstruir caminos
    paths = {}
    for end in range(n):
        if distances[end] == float('inf'):
            paths[end] = []
        else:
            path = []
            current = end
            while current is not None:
                path.insert(0, current)
                current = previous[current]
            paths[end] = path

    return {
        "distances": {i: distances[i] for i in range(n)},
        "previous": {i: previous[i] for i in range(n)},
        "steps": steps,
        "paths": {i: paths[i] for i in range(n)}
    }
