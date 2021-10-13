function createNewPath(path, newNode) {
    const newPath = Array.from(path);
    newPath.push(newNode);
    return newPath;
}

function recordPathsWhenReachNode(currentPath, destinationNode, graph, result) {
    const currentNode = currentPath[currentPath.length - 1];

    if (!graph[currentNode]) {
        return;
    }

    graph[currentNode].forEach(childNode => {
        if (currentPath.includes(childNode)) {
            return;
        }

        const pathToChildNode = createNewPath(currentPath, childNode);
        if (childNode === destinationNode) {
            result.push(pathToChildNode);
            return;
        }

        recordPathsWhenReachNode(pathToChildNode, destinationNode, graph, result);
    })
}

function findAllPaths(sourceNode, destinationNode, graph) {
    if (sourceNode === destinationNode) {
        throw new Error(`Source and destination node is same: ${sourceNode}`)
    }

    const startPath = [sourceNode];
    const result = [];

    recordPathsWhenReachNode(startPath, destinationNode, graph, result);

    return result;
}

exports.findAllPaths = findAllPaths;
