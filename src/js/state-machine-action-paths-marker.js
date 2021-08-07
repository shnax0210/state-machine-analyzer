const actionMarks = require('./constans.js').actionMarks;

function markAction(action) {
    if (action.mark === actionMarks.INVALID) {
        console.log(`Action ${JSON.stringify(action)} is already marked as invalid and it will be not overridden`);
        return;
    }

    action.mark = actionMarks.LEADS_TO_INVALID;
}

function markActionsAsLeadsToInvalid(actionalPathsToToMark) {
    actionalPathsToToMark.forEach(actionPath => actionPath.forEach(action => markAction(action)));
}

exports.markActionsAsLeadsToInvalid = markActionsAsLeadsToInvalid;
