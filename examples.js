const EXAMPLES = [
   {
      name: "Simple state",
      code: `/*
Emulation of working on some ticket/task. 

There is one field status that can be equil to any value from list ["Open", "InProgress", "Done"]. 

Then there are couple of events like: "StartWorking", "CompleteWorking" and "Reopen"
*/

return {
    statesDescription: {
        status: {
            selectionType: "ANY_OF",
            values: ["Open", "InProgress", "Done"]
        }
   },
   events: [
       {
            name: "StartWorking",
            handle: (state) => { if(state.status === "Open") state.status = "InProgress" }
       },
       {
            name: "CompleteWorking",
            handle: (state) => { if(state.status === "InProgress") state.status = "Done" }
       },
       {
            name: "Reopen",
            handle: (state) => { if(state.status === "Done" || state.status === "InProgress") state.status = "Open" }
       }
   ]
}`
   },
   {
      name: "Users buy products",
      code: `function registerUser(state, id) {
   if (Array.from(state.users).map(user => user.id).includes(id)) {
       return;
   }
   
   state.users.add({id: id, products: new Set()})
}
   
function buyProduct(state, userId, productId) {
   const users = Array.from(state.users);
   if (!users.map(user => user.id).includes(userId)) {
       return;
   }
   
   users.find(user => user.id === userId).products.add(productId);
}
    
return {
    statesDescription: {
        users: {
            selectionType: "ANY_COMBINATION_OF",
            objects: {
                id: {
                    selectionType: "ANY_OF",
                    unique: true,
                    values: ["user1", "user2"]
                },
                products: {
                    selectionType: "ANY_COMBINATION_OF",
                    values: ["product1", "product2"]
                }
            }
        }
   },
   markState: function(state) {
       if (state.id === 10) {
            return "Red"
       }
   
       return "Green";
   },
   marksThatEventsWillBeAppliedTo: ["Green"],
   events: [
       {
            name: "RegistrationUser1",
            handle: function (state) {
                registerUser(state, "user1");
            }
       },
       {
            name: "RegistrationUser2",
            handle: function (state) {
                registerUser(state, "user2");
            }
       },
       {
            name: "User1BuyProduct1",
            handle: function (state) {
                buyProduct(state, "user1", "product1");
            }
       },
       {
            name: "User1BuyProduct2",
            handle: function (state) {
                buyProduct(state, "user1", "product2");
            }
       },
       {
            name: "User2BuyProduct1",
            handle: function (state) {
                buyProduct(state, "user2", "product1");
            }
       },
       {
            name: "User2BuyProduct2",
            handle: function (state) {
                buyProduct(state, "user2", "product2");
            }
       }
   ]
}`
}]
