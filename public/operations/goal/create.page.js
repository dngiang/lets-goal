let STATE = {};
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

            window.open(`/index.html`, '_self');
        },
        onError: err => {
            alert('Internal Server Error');
            console.error(err);
        }
    });
}