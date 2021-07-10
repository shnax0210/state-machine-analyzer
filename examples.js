const EXAMPLES = [
   {
      name: "1. Task workflow (simple state)",
      code: `/*
This is first example for emulation of working on some task. 

Here we have very simple state that consists from one variable with name "status".
The "status" can be equally to any value from list ["Open", "InProgress", "Done"]. 

This model will be improved in subsequent examples.
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
      name: "2. Task workflow (object state)",
      code: `/*
This is second example for emulation of working on some task. 

Here state is not just one variable but object named "task".
This object has two fields: "status" and "assignee".
The "status" can be equally to any value from list ["Open", "InProgress", "Done"]. 
The "assignee" can be equally to any value from list ["Nobody", "Somebody"]. 

This model will be improved in subsequent examples.
*/

return {
    statesDescription: {
        task: {
            selectionType: "ANY_OF",
            objects: {
                status: {
                    selectionType: "ANY_OF",
                    values: ["Open", "InProgress", "Done"]
                },
                assignee: {
                    selectionType: "ANY_OF",
                    values: ["Nobody", "Somebody"]
                }
            }
        }
   },
   events: [
       {
            name: "AssignTask",
            handle: (state) => { state.task.assignee = "Somebody" }
       },
       {
            name: "UnAssignTask",
            handle: (state) => { if(state.task.status !== "InProgress") state.task.assignee = "Nobody" }
       },
       {
            name: "StartWorking",
            handle: (state) => { if(state.task.status === "Open" && state.task.assignee !== "Nobody") state.task.status = "InProgress" }
       },
       {
            name: "CompleteWorking",
            handle: (state) => { if(state.task.status === "InProgress" && state.task.assignee !== "Nobody") state.task.status = "Done" }
       },
       {
            name: "Reopen",
            handle: (state) => { if(state.task.status === "Done" || state.task.status === "InProgress") state.task.status = "Open" }
       }
   ]
}`
   },
   {
      name: "3. Task workflow (object state with marks)",
      code: `/*
This is third example for emulation of working on some task. 

It has same state structure as in previous example.
But adds "markState" function that marks:
- initial state where status=Open and assignee=Nobody with blue color;
- error state where status=InProgress and assignee=Nobody with red color.

Also this example defines "marksThatEventsWillBeAppliedTo" field that 
overrides default array of marks that all events apply to.
As we can see marksThatEventsWillBeAppliedTo=["Blue", "Green"]
so all events will be applied only to states with blue and green color 
but to states with red color. In such way you can easily check 
that there is no transactions that change state to red one.

This model will be improved in subsequent examples.
*/

return {
    statesDescription: {
        task: {
            selectionType: "ANY_OF",
            objects: {
                status: {
                    selectionType: "ANY_OF",
                    values: ["Open", "InProgress", "Done"]
                },
                assignee: {
                    selectionType: "ANY_OF",
                    values: ["Nobody", "Somebody"]
                }
            }
        }
   },
   markState: (state) => {
        if(state.task.status === "Open" && state.task.assignee === "Nobody") {
            return "Blue";
        }
        
        if(state.task.status === "InProgress" && state.task.assignee === "Nobody") {
            return "Red";
        }
        
        return "Green";
   },
   marksThatEventsWillBeAppliedTo: ["Blue", "Green"],
   events: [
       {
            name: "AssignTask",
            handle: (state) => { state.task.assignee = "Somebody" }
       },
       {
            name: "UnAssignTask",
            handle: (state) => { if(state.task.status !== "InProgress") state.task.assignee = "Nobody" }
       },
       {
            name: "StartWorking",
            handle: (state) => { if(state.task.status === "Open" && state.task.assignee !== "Nobody") state.task.status = "InProgress" }
       },
       {
            name: "CompleteWorking",
            handle: (state) => { if(state.task.status === "InProgress" && state.task.assignee !== "Nobody") state.task.status = "Done" }
       },
       {
            name: "Reopen",
            handle: (state) => { if(state.task.status === "Done" || state.task.status === "InProgress") state.task.status = "Open" }
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
