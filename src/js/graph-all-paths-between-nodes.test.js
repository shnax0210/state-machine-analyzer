const findAllPaths = require('./graph-all-paths-between-nodes.js').findAllPaths;

test('Should throw an error when source and destination nodes are same', () => {
    expect(() => findAllPaths("node1", "node1", {}))
        .toThrowError(new Error('Source and destination node is same: node1'));
});

test('Should return empty when there are not paths between nodes', () => {
    const graph = {
        "node1": ["node2", "node3"],
        "node2": ["node3"],
    }

    const result = findAllPaths("node3", "node1", graph);

    expect(result.length).toEqual(0);
});

test('Should find all paths between nodes in graph', () => {
    const graph = {
        "node1": ["node2", "node3"],
        "node2": ["node3"]
    }

    const result = findAllPaths("node1", "node3", graph);

    expect(result.length).toEqual(2);
    expect(result).toEqual(expect.arrayContaining([["node1", "node3"]]));
    expect(result).toEqual(expect.arrayContaining([["node1", "node2", "node3"]]));
});
