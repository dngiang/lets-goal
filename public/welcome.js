let STATE = {};
// All these modules are are defined in operations js file
const RENDER = window.RENDER_MODULE;
const HTTP = window.HTTP_MODULE;
const CACHE = window.CACHE_MODULE;

$(document).ready(onPageLoad);

function onPageLoad() {
    updateAuthenticatedUI();
    
    if (STATE.authUser) {
        HTTP.getUserGoals({
            jwtToken: STATE.authUser.jwtToken,
            onSuccess: RENDER.renderGoalsList
        });
    } 
    
    $('#logout-btn').on('click', onLogoutBtnClick);
    $('#goal-list').on('click', '#delete-goal-btn', onDeleteGoalBtnClick);
    $('#goal-list').on('click', '#goal-card', onGoalCardClick);
}

function onLogoutBtnClick(event) {
    const confirmation = confirm('Are you sure you want to logout?');
    if (confirmation) {
        CACHE.deleteAuthenticatedUserFromCache();
        window.open('/auth/login.html', '_self');
    }
}

// Handle opening goal details
function onGoalCardClick(event) {
    const goalId = $(event.currentTarget).attr('data-goal-id');
    window.open(`goal/details.html?id=${goalId}`, '_self');
}

// Handle deleting goals
function onDeleteGoalBtnClick(event) {

    event.stopImmediatePropagation(); 

    const goalId = $(event.currentTarget)
        .closest('#goal-card')
        .attr('data-goal-id');
    // Step 2: Verify use is sure of deletion
    const userSaidYes = confirm('Are you sure you want to delete this goal?');
    if (userSaidYes) {
        // Step 3: Make ajax call to delete goal
        HTTP.deleteGoal({
            goalId: goalId,
            jwtToken: STATE.authUser.jwtToken,
            onSuccess: () => {
                // Step 4: If succesful, reload the goal list
                alert('Goal deleted succesfully, reloading results ...');
                HTTP.getUserGoals({
                    jwtToken: STATE.authUser.jwtToken,
                    onSuccess: RENDER.renderGoalsList
                });
            }
        });
    }
}

function updateAuthenticatedUI() {
    const authUser = CACHE.getAuthenticatedUserFromCache();
    if (authUser) {
        STATE.authUser = authUser;
        $('#nav-greeting').html(`Welcome, ${authUser.name}`);
        $('#auth-menu').removeAttr('hidden');
    } else {
        $('#default-menu').removeAttr('hidden');
    }
}