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
        onSuccess: RENDER.renderGoalDetails
    });

    $('#goal-details').on('click', '#edit-goal-btn', onEditGoalBtnClick);
}

function onEditGoalBtnClick(event) {
    event.preventDefault();
    window.open(`/operations/goal/edit.html?id=${STATE.goalId}`, '_self');  //fix this line, OG without operations, , '_self'
}