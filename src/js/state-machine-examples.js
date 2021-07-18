exports.EXAMPLES = [
    {
        name: "1. Task workflow (simple state)",
        code: `/*
This is first example for emulation of working on some task. 

Here we have very simple state that consists from one variable with name "status".
There is single initial state where status="Open".

And there are a bunch of events that change "status" variable.
*/

return {
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
}`
    },
    {
        name: "2. Task workflow (object state)",
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

return {
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
}`
    },
    {
        name: "3. Task workflow (invalid state highlighting)",
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

return {
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
}`
    },
    {
        name: "4. Task workflow (invalid state fix)",
        code: `/*
This is fourth example for emulation of working on some task. 

In previous example we highlighted invalid state.

Here we just with "StartWorking" event handler in order to make the invalid state not possible.
*/

return {
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
}`
    }]
