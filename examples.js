const examples = [{
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
   marks: [{
            label: "Valid",
            color: "lime"
        },
        {
            label: "NotValid",
            color: "red"
        }
   ],
   markState: function(state) {
       if (state.id === 10) {
            return "NotValid"
       }
   
       return "Valid";
   },
   marksThatEventsWillBeAppliedTo: ["Valid"],
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
