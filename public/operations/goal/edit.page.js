let STATE = {};
// All these modules are are defined in /public/operations
const RENDER = window.RENDER_MODULE;
const HTTP = window.HTTP_MODULE;
const CACHE = window.CACHE_MODULE;
const ETC = window.ETC_MODULE;

$(document).ready(onReady);

function onReady() {
    STATE.goalId = ETC.getQueryStringParam('id');
    STATE.authUser = CACHE.getAuthenticatedUserFromCache();

    HTTP.getGoalById({
        goalId: STATE.goalId,
        onSuccess: RENDER.renderEditableGoal
    });

    $('#goal-edit-form').on('submit', onEditSubmit);
}

function onEditSubmit(event) {
    event.preventDefault();
    const newGoal = {
        title: $('#title-txt').val(),
        content: $('#content-txt').val()
    };

    HTTP.updateGoal({
        goalId: STATE.goalId,
        newGoal: newGoal,
        jwtToken: STATE.authUser.jwtToken,
        onSuccess: goal => {
            alert('Goal changes saved succesfully, redirecting ...');
            window.open(`/goal/details.html?id=${STATE.goalId}`, '_self');
        },
        onError: err => {
            alert('There was a problem editing this goal, please try again later.');
        }
    });
}