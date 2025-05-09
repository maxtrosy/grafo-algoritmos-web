def dfs(graph, start):
    visited = set()
    stack = [start]
    
    while stack:
        node = stack.pop()
        if node not in visited:
            visited.add(node)
            print(node, end=" ")
            for neighbor in graph[node]:
                stack.append(neighbor)
    
    return visited
