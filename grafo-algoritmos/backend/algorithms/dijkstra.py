import heapq

def dijkstra(graph, start):
    # Inicialización de las distancias y la cola de prioridad
    distances = {node: float('inf') for node in graph}
    distances[start] = 0
    pq = [(0, start)]  # (distancia, nodo)

    while pq:
        current_distance, current_node = heapq.heappop(pq)

        # Si la distancia es mayor a la que ya tenemos, ignoramos
        if current_distance > distances[current_node]:
            continue

        # Recorremos los vecinos del nodo actual
        for neighbor, weight in graph[current_node].items():
            distance = current_distance + weight

            # Si encontramos una distancia más corta, actualizamos
            if distance < distances[neighbor]:
                distances[neighbor] = distance
                heapq.heappush(pq, (distance, neighbor))

    return distances
