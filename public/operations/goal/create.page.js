let STATE = {};
// All these modules are are defined in /public/operations
const RENDER = window.RENDER_MODULE;
const HTTP = window.HTTP_MODULE;
const CACHE = window.CACHE_MODULE;

$(document).ready(onReady);

function onReady() {
    STATE.authUser = CACHE.getAuthenticatedUserFromCache();

    $('#new-goal-form').on('submit', onCreateSubmit);
}

function onCreateSubmit(event) {
    event.preventDefault();
    const newGoal ={
        title: $('#title-txt').val(),
        content: $('#content-txt').val()
    };

    HTTP.createGoal({
        jwtToken: STATE.authUser.jwtToken,
        newGoal: newGoal,
        onSuccess: goal => {
            alert('Goalcreated succesfully, redirecting ...');
            window.open(`/goal/details.html?id=${goal.id}`, '_self');
        },
        onError: err => {
            alert('Internal Server Error (see console)');
            console.error(err);
        }
    });
}