const findAllActionalPaths = require("./state-machine-paths.js").findAllActionalPaths

test('Should find all actional paths', () => {
    const actions = [
        {
            name: "Action1",
            from: {id: "State1"},
            to: {id: "State2"}
        },
        {
            name: "Action2",
            from: {id: "State1"},
            to: {id: "State3"}
        },
        {
            name: "Action3",
            from: {id: "State2"},
            to: {id: "State3"}
        },
        {
            name: "Action4",
            from: {id: "State1"},
            to: {id: "State2"}
        },
    ]

    const result = findAllActionalPaths({id: "State1"}, {id: "State3"}, actions);

    expect(result.length).toEqual(3);

    const resultActionNames = result.map(actionSequence => actionSequence.map(action => action.name));
    expect(resultActionNames).toEqual(expect.arrayContaining([["Action1", "Action3"]]));
    expect(resultActionNames).toEqual(expect.arrayContaining([["Action2"]]));
    expect(resultActionNames).toEqual(expect.arrayContaining([["Action4", "Action3"]]));
});
