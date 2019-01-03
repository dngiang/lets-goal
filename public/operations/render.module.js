
window.RENDER_MODULE = {
    renderGoalsList,
    renderGoalDetails,
    renderEditableGoal
};

function renderGoalsList(goals) {
    const goalsHtml = goals.map(goalToHtml).join('<hr/>');
    $('#goal-list').html(goalsHtml);

    function goalToHtml(goal) {
        let goalSummary = goal.content;
        if (goalSummary.length > 120) {
            goalSummary = `${goal.content.substring(0, 120)}...`;
        }
        return `
        <div id="goal-card" data-goal-id="${goal.id}">
            <h3 class="card-header">${goal.title}
            <button id="delete-goal-btn">Delete</button></h3>
            <p class="card-content">${goalSummary}</p>
            <p class="card-info">
                <i>${goal.user.name} | Last update on ${new Date(goal.updateDate).toLocaleDateString()}</i>
            </p>
        </div>
        `;
    }
}

function renderGoalDetails(goal) {
    $('#goal-details').html(`
        <br/>
        <button id="edit-goal-btn">Edit Goal</button>
		<h1>${goal.title}</h1>
		<i>${goal.user.name} | ${new Date(goal.updateDate).toLocaleString()}</i>
		<p>${goal.content}</p>
	`);
}

function renderEditableGoal(goal) {
    $('#title-txt').prop('disabled', false).val(goal.title);
    $('#content-txt').prop('disabled', false).val(goal.content);
}