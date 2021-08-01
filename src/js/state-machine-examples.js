exports.EXAMPLES = [
    {
        name: "1.1 Task workflow (simple state)",
        code: `/*
This is first example for emulation of working on some task. 

Here we have very simple state that consists from one variable with name "status".
There is single initial state where status="Open".

And there are a bunch of events that change "status" variable.
*/

const stateMachineDefinition = {
    initialStates: [{
        status: "Open"
   }],
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
};

facade.renderGraph(facade.buildTransactions(stateMachineDefinition));`
    },
    {
        name: "1.2 Task workflow (object state)",
        code: `/*
This is second example for emulation of working on some task. 

Here state is not just one variable but object named "task".
This object has two fields: "status" and "assignee".

And there are a bunch of events that change "status" and "assignee" variable values.

But let's look to the states on final graph, there is one that may look not right:
task={
  status=InProgress,
  assignee=Nobody
}

Please check next examples to see what we can do with it.
*/

const stateMachineDefinition = {
    initialStates: [{
        task: {
            status: "Open",
            assignee: "Nobody"
        }
   }],
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
            handle: (state) => { if(state.task.status === "Open") state.task.status = "InProgress" }
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
};

facade.renderGraph(facade.buildTransactions(stateMachineDefinition));`
    },
    {
        name: "1.3 Task workflow (invalid state highlighting)",
        code: `/*
This is third example for emulation of working on some task. 

In previous example we found that state:
task={
  status=InProgress,
  assignee=Nobody
}

is not right. So here we define "isStateValid" function to check it.

As you may see from final graph there are only few states and our invalid state is colored red. 
This is because when state machine finds invalid state it stops and highlight the state with red.

However if you want not to stop state machine when it finds invalid state 
you can uncomment "continueOnInvalidState: true," line to achive it.
*/

const stateMachineDefinition = {
    initialStates: [{
        task: {
            status: "Open",
            assignee: "Nobody"
        }
   }],
   isStateValid: (state) => {
       if(state.task.status === "InProgress" && state.task.assignee === "Nobody") {
           return false;
       }
       
       return true;
   },
   /*continueOnInvalidState: true,*/
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
            handle: (state) => { if(state.task.status === "Open") state.task.status = "InProgress" }
       },
       {
            name: "CompleteWorking",
            handle: (state) => { if(state.task.status === "InProgress") state.task.status = "Done" }
       },
       {
            name: "Reopen",
            handle: (state) => { if(state.task.status === "Done" || state.task.status === "InProgress") state.task.status = "Open" }
       }
   ]
}

facade.renderGraph(facade.buildTransactions(stateMachineDefinition));`
    },
    {
        name: "1.4 Task workflow (invalid state fix)",
        code: `/*
This is fourth example for emulation of working on some task. 

In previous example we highlighted invalid state.

Here we just with "StartWorking" event handler in order to make the invalid state not possible.
*/

const stateMachineDefinition = {
    initialStates: [{
        task: {
            status: "Open",
            assignee: "Nobody"
        }
   }],
   isStateValid: (state) => {
       if(state.task.status === "InProgress" && state.task.assignee === "Nobody") {
           return false;
       }
       
       return true;
   },
   /*continueOnInvalidState: true,*/
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
            handle: (state) => { if(state.task.status === "Open" && state.task.assignee !== "Nobody" ) state.task.status = "InProgress" }
       },
       {
            name: "CompleteWorking",
            handle: (state) => { if(state.task.status === "InProgress") state.task.status = "Done" }
       },
       {
            name: "Reopen",
            handle: (state) => { if(state.task.status === "Done" || state.task.status === "InProgress") state.task.status = "Open" }
       }
   ]
};

facade.renderGraph(facade.buildTransactions(stateMachineDefinition));`
    },
    {
        name: "2 Billing address update",
        code: `/*
Examples emulates updating billing address from UI by ajax calls.
*/

const ADDRESS1 = {
    name: "ADDRESS1",
    tax: 5
}

const ADDRESS2 = {
    name: "ADDRESS2",
    tax: 10
}

function calculateTotalPrice(cart) {
    if(!cart.billingAddress) {
        return cart.price;
    }
    
    return cart.price + cart.billingAddress.tax;
}

function findThreadIndexWhereEventCanBeProcessed(state, eventName) {
    return state.threads.findIndex(thread => thread.transactions[0] === eventName);
}

function cleanProcessedThread(state, threadIndex) {
    const thread = state.threads[threadIndex];
    if(thread.transactions.length > 1) {
        thread.transactions.shift();
        return;
    }
    
    state.threads.splice(threadIndex, 1);
}

function executeIfNeededInThread(state, eventName, func) {
    const threadIndex = findThreadIndexWhereEventCanBeProcessed(state, eventName);
    
    if(threadIndex >= 0) {
        func(state.threads[threadIndex]);
        cleanProcessedThread(state, threadIndex);
    }
}

const stateMachineDefinition = {
    initialStates: [{
        cart: {
            price: 20,
            totalPrice: 20,
            billingAddress: null
        },
        ui: {
            totalPrice: 20
        },
        threads: [{
            transactions: ["SetBillingAddress1", "CalculateCart", "ReadPrice", "UpdatePriceOnUi"]
        },
        {
            transactions: ["SetBillingAddress2", "CalculateCart", "ReadPrice", "UpdatePriceOnUi"]
        }]
   }],
   isStateValid(state) {
       if(state.threads.length === 0 && state.ui.totalPrice !== calculateTotalPrice(state.cart)) {
           return false;
       }
       
       return true;
   },
   continueOnInvalidState: true,
   events: [
       {
            name: "SetBillingAddress1",
            handle: (state) => { executeIfNeededInThread(state, "SetBillingAddress1", () => state.cart.billingAddress = ADDRESS1) }
       },
       {
            name: "SetBillingAddress2",
            handle: (state) => { executeIfNeededInThread(state, "SetBillingAddress2", () => state.cart.billingAddress = ADDRESS2) }
       },
       {
            name: "CalculateCart",
            handle: (state) => { executeIfNeededInThread(state, "CalculateCart", () => state.cart.totalPrice = calculateTotalPrice(state.cart)) }
       },
       {
           name: "ReadPrice",
           handle: (state) => { executeIfNeededInThread(state, "ReadPrice", (thread) => thread.totalPrice = state.cart.totalPrice) }
       },
       {
           name: "UpdatePriceOnUi",
           handle: (state) => { executeIfNeededInThread(state, "UpdatePriceOnUi", (thread) => state.ui.totalPrice = thread.totalPrice) }
       }
   ]
};

facade.renderGraph(facade.buildTransactions(stateMachineDefinition));`
    }]
