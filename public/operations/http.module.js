window.HTTP_MODULE = {
    signupUser,
    loginUser,
    getUserGoals,
    getGoalById,
    createGoal,
    updateGoal,
    deleteGoal
};

function signupUser(options) {
    const { userData, onSuccess, onError } = options;
    $.ajax({
        type: 'POST',
        url: '/api/user',
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify(userData),
        success: onSuccess,
        error: err => {
            console.error(err);
            if (onError) {
                onError(err);
            }
        }
    });
}

function loginUser(options) {
    const { userData, onSuccess, onError } = options;
    $.ajax({
        type: 'POST',
        url: '/api/auth/login',
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify(userData),
        success: onSuccess,
        error: err => {
            console.error(err);
            if (onError) {
                onError(err);
            }
        }
    });
}

function getUserGoals(options) {
    const { jwtToken, onSuccess, onError } = options;
    $.ajax({
        type: 'GET',
        url: '/api/goal',
        contentType: 'application/json',
        dataType: 'json',
        data: undefined,
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', `Bearer ${jwtToken}`);
        },
        success: onSuccess,
        error: err => {
            console.error(err);
            if (onError) {
                onError(err);
            }
        }
    });
}

function getGoalById(options) {
    const { goalId, onSuccess } = options;
    $.getJSON(`/api/goal/${goalId}`, onSuccess);
}

function createGoal(options) {
    const { jwtToken, newGoal, onSuccess, onError } = options;

    $.ajax({
        type: 'POST',
        url: '/api/goal',
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify(newGoal),
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', `Bearer ${jwtToken}`);
        },
        success: onSuccess,
        error: err => {
            console.error(err);
            if (onError) {
                onError();
            }
        }
    });
}

function updateGoal(options) {
    const {jwtToken, goalId, newGoal, onSuccess, onError } = options;

    $.ajax({
        type: 'PUT',
        url: `/api/goal/${goalId}`,
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify(newGoal),
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', `Bearer ${jwtToken}`);
        },
        success: onSuccess,
        error: err => {
            console.error(err);
            if (onError) {
                onError();
            }
        }
    });
}

function deleteGoal(options) {
    const { goalId, jwtToken, onSuccess, onError } = options;
    $.ajax({
        type: 'delete',
        url: `/api/goal/${goalId}`,
        contentType: 'application/json',
        dataType: 'json',
        data: undefined,
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', `Bearer ${jwtToken}`);
        },
        success: onSuccess,
        error: err => {
            console.error(err);
            if (onError) {
                onError(err);
            }
        }
    });
}