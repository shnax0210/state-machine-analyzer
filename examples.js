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
      name: "4. Task workflow (object state with sets)",
      code: `/*
This is a fourth example for emulation of working on some task. 

In addition to previous example, it has more complex state:
"assignee" field here may have any value from ["Nobody", "SomebodyFromTeamA", "SomebodyFromTeamB"]
and also there is new field "involvedTeams" that is not just value but set of values,
it's indicated by selectionType="ANY_COMBINATION_OF",
so "involvedTeams" can be equally to any combination of ["TeamA", "TeamB"] including empty set as well.

Also there are more marks that indicates invalid states.
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
                    values: ["Nobody", "SomebodyFromTeamA", "SomebodyFromTeamB"]
                },
                involvedTeams: {
                    selectionType: "ANY_COMBINATION_OF",
                    values: ["TeamA", "TeamB"]
                }
            }
        }
   },
   markState: (state) => {
        if(state.task.status === "Open" && state.task.assignee === "Nobody" && state.task.involvedTeams.size == 0) {
            return "Blue";
        }
        
        if(state.task.status === "InProgress" && state.task.assignee === "Nobody") {
            return "Red";
        }
        
        if(state.task.status === "Done" && state.task.involvedTeams.size == 0) {
            return "Magenta";
        }
        
        if(state.task.assignee !== "Nobody" && state.task.involvedTeams.size == 0) {
            return "Orange";
        }
        
        return "Green";
   },
   marksThatEventsWillBeAppliedTo: ["Blue", "Green"],
   events: [
       {
            name: "AssignTaskToTeamA",
            handle: (state) => { 
                state.task.assignee = "SomebodyFromTeamA";
                state.task.involvedTeams.add("TeamA");
            }
       },
       {
            name: "AssignTaskToTeamB",
            handle: (state) => { 
                state.task.assignee = "SomebodyFromTeamB" 
                state.task.involvedTeams.add("TeamB");
            }
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
}]
