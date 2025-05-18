def dfs(matrix, start):
    visited = []
    stack = [start]
    n = len(matrix)

    while stack:
        node = stack.pop()
        if node not in visited:
            visited.append(node)
            for neighbor in range(n - 1, -1, -1):
                if matrix[node][neighbor] != 0 and neighbor not in visited:
                    stack.append(neighbor)
                    
    return visited
