const findAllTransactionalPaths = require("./state-machine-paths.js").findAllTransactionalPaths

test('Should find all transactional paths', () => {
    const transactions = [
        {
            name: "Transaction1",
            from: {id: "State1"},
            to: {id: "State2"}
        },
        {
            name: "Transaction2",
            from: {id: "State1"},
            to: {id: "State3"}
        },
        {
            name: "Transaction3",
            from: {id: "State2"},
            to: {id: "State3"}
        },
        {
            name: "Transaction4",
            from: {id: "State1"},
            to: {id: "State2"}
        },
    ]

    const result = findAllTransactionalPaths({id: "State1"}, {id: "State3"}, transactions);

    expect(result.length).toEqual(3);

    const resultTransactionNames = result.map(transactionSequence => transactionSequence.map(transaction => transaction.name));
    expect(resultTransactionNames).toEqual(expect.arrayContaining([["Transaction1", "Transaction3"]]));
    expect(resultTransactionNames).toEqual(expect.arrayContaining([["Transaction2"]]));
    expect(resultTransactionNames).toEqual(expect.arrayContaining([["Transaction4", "Transaction3"]]));
});
