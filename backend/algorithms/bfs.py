from collections import deque

def bfs(graph, start):
    """
    Perform BFS on a weighted adjacency matrix graph.
    
    Args:
        graph (list of list): Weighted adjacency matrix where 0 means no connection
        start (int): Starting node index
        
    Returns:
        list: Indices of nodes visited in BFS order
    """
    num_nodes = len(graph)
    visited = []
    queue = deque()
    
    # Validate start node
    if start < 0 or start >= num_nodes:
        raise ValueError("Start node out of range")
    
    visited.append(start)
    queue.append(start)
    
    while queue:
        node = queue.popleft()
        
        # Explore neighbors (indices where weight > 0)
        for neighbor in range(num_nodes):
            if graph[node][neighbor] > 0 and neighbor not in visited:
                visited.append(neighbor)
                queue.append(neighbor)
    
    return visited