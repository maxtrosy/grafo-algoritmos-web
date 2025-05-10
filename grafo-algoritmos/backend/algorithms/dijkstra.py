def dijkstra(matrix, start):
    n = len(matrix)
    distances = [float('inf')] * n
    distances[start] = 0
    visited = [False] * n
    pq = [(0, start)]  # (distancia, nodo)

    while pq:
        current_distance, current_node = heapq.heappop(pq)

        if visited[current_node]:
            continue
        visited[current_node] = True

        for neighbor in range(n):
            weight = matrix[current_node][neighbor]
            if weight > 0:  # Si hay conexión
                distance = current_distance + weight
                if distance < distances[neighbor]:
                    distances[neighbor] = distance
                    heapq.heappush(pq, (distance, neighbor))

    # Para mantener la consistencia con otros algoritmos (lista de nodos en orden visitado)
    # Se puede devolver solo el orden de visita o los valores finales
    # Aquí devolvemos el orden de visita (como lo espera tu frontend):
    result = []
    for i, d in sorted(enumerate(distances), key=lambda x: x[1]):
        if d != float('inf'):
            result.append(i)
    return result