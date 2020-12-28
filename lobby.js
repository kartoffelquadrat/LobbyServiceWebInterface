function prepareLobbyPage() {

    // get list of games that are available and populate form drop down menu
    populateSessionOptions();

    // ARL-long poll on "available-sessions"-resource and update displayed table if something changed
    observeResource('/api/sessions?hash=', onSessionsChanged, markOffline, "");
}

/**
 * Retrieves list of start-able game kinds from server and populates drop down menu of "start new session" form.
 */
function populateSessionOptions() {

    // retrieve list of all options from server
    fetch("/api/gameservices")
        .then(result => result.json())
        .then(options => {    // add each of retrieved "options" to form element with id "boardgameoptions"
            $.each(options, function (i, item) {
                $('<option>' + item + '</option>').appendTo('#boardgameoptions');
            })
        });
}

/**
 * Called whenever the sessions resource observer registers an update
 * @param sessions as the new sessions bundle. The actual sessions are in a field called sessions.
 */
function onSessionsChanged(sessions) {

    // Disable / enable the "create new session" button.
    updateCreateButtonStatus(isInSession(getUserName(), sessions.sessions));

    // Build the HTML table, based on the received session information.
    updateSessionsTable(sessions.sessions);

    // Add listeners for the generated action buttons in the generated HTML table.
    associateJoinButtons();
    associateLeaveButtons();
    associateDeleteButtons();
    associateLaunchButtons();
}

/**
 * Called by the Async Get, whenever the list of available sessions changes on server side.
 * Iterates over the received collection and rebuilds the DOM, specifically the #sessiontable table.
 * @param sessions
 */
function updateSessionsTable(sessions) {

    // reset sessions table content and re-build table's static columns (first row, bold)
    $('#sessiontable').empty();
    $('<tr>' +
        '<th id="game">Game</th>' +
        '<th id="creator">Creator</th>' +
        '<th id="fill">Players</th>' +
        '<th id="action"> </th>' +
        '</tr>'
    ).appendTo('#sessiontable');

    let userActiveInASession = isInSession(getUserName(), sessions);

    // iterate over players, print all info per player, and a remove button
    $.each(sessions, function (key, session) {  // ToDo: fix for updated sessions structure.
        console.log(key + " - " + session);
        $('<tr>' +
            '<td>' + session.gameParameters.name + getPlayerIntervalString(session) + '</td>' +
            '<td>' + capitalizeFirstLetter(session.creator) + '</td>' +
            '<td>' + getPlayersIndicatorString(session) + '</td>' +
            '<td>        ' +
            '<div id="actions-' + key + '" class="input-group-append float-right">\n' +
            buildActionButtons(key, getUserName(), session, userActiveInASession) +
            '</div>' +
            '</td>' +
            '</tr>').appendTo('#sessiontable');

        // also register callback for the newly created "remove" button.
        // $('#join-' + key).on('click', {id: key}, joinSession);
        // });
    })
}

/**
 * Prepares HTML code for the buttons section of a session row.
 * If the player is active in at least on session (creator or player), all join buttons are deactivated. If the session
 * matches one where the player is creator, "join is replaced by "Delete" and "Launch", where the latter is only active
 * if the required amount of players is present. If the user is just a player participant of the session, "join" is
 * replaced by "Leave".
 *
 * @param sessionkey as id of the session for which the buttons are generated
 * @param player as the name of the currently logged in player
 * @param sessions as the map with all sessions by their ids
 * @param active as flag to indicate whether the player is already involved in at least one session.
 * @returns {string} HTML code for the required buttons.
 */
function buildActionButtons(sessionkey, player, session, active) {

    // if not yet involved to any session -> ordinary join button
    if (!active)
        return '<button class="btn btn-outline-primary" type="button" id="join-' + sessionkey + '">Join</button>\n';

    // else (already involved to a session, but...)
    else {
        // ... not involved in this one -> deactivated join button
        if (!session.players.includes(getUserName()))
            return '<button class="btn btn-outline-primary disabled" type="button" id="join-' + sessionkey + '">Join</button>\n';

        // ... involved in this one as ordinary player -> leave button
        if (isNonCreatorPlayer(getUserName(), session))
            return '<button class="btn btn-outline-warning" type="button" id="leave-' + sessionkey + '">Leave</button>\n';

        // ... involved in this one as creator -> delete button, launch button (act / deact depending on player-amount)
        return '<button class="btn btn-outline-danger" style="margin-right: 5px" type="button" id="leave-' + sessionkey + '">Delete</button>\n' +
            '<button class="btn btn-outline-primary ' + buildDisabledLaunchTag(session) + '" type="button" id="launch-' + sessionkey + '">Launch</button>';
    }
}

/**
 * Helper function that tells whether a player is a non-creator player of a session.
 */
function isNonCreatorPlayer(player, session) {
    let isCreator = player === session.creator;
    let isPlayer = session.players.includes(player);

    return isPlayer && !isCreator;
}

/**
 * Helper function that find out whether a provided session has the right amount of player to be launched. If so, the
 * empty string is returned. Otherwise 'disabled' is returned.
 */
function buildDisabledLaunchTag(session) {

    let currentAmount = session.players.length;
    if (session.gameParameters.minSessionPlayers > currentAmount)
        return 'disabled';
    return '';
}

/**
 * Builds an indicator string that tells how many players are allows in a session.
 * If the max and min value are identical, the string displays just a value, not an interval.
 * @param session
 */
function getPlayerIntervalString(session) {
    let min = session.gameParameters.minSessionPlayers;
    let max = session.gameParameters.maxSessionPlayers;

    if (min === max)
        return ' [' + min + ']';
    else
        return ' [' + min + '-' + max + ']';
}

/**
 * Builds an indicator string that tells amount and set of players registered to a session.
 */
function getPlayersIndicatorString(session) {

    let players = session.players;
    let playerString = '[' + players.length + ']:';

    $.each(players, function (index, player) {
        playerString = playerString + ' ' + capitalizeFirstLetter(player);
    });
    return playerString;
}

function joinSession(session) {
    console.log("Joining: " + session.data.id);
    //
    // TODO: Actually send a PUT on the resource (playerId as payload/extra path arg)
}

/**
 * triggered by "start"-button. Looks up which game type has been selected in '#boardgameoptions' field, builds a session bean and sends it to the rest endpoint.
 */
function startSession() {

    let selectedGame = document.getElementById('boardgameoptions');

    let createSessionForm = {
        "creator": getUserName(),
        "game": selectedGame.value,
        "savegame": ""
    }

    fetch('/api/sessions?access_token=' + getAccessToken(), {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'post',
        body: JSON.stringify(createSessionForm)
    }).then(reply => {
        if (reply.status == 401)
            logout(); // ToDo: First try to renew token, call logout() if that failed.
        if (reply.status != 200)
            console.log("Failed to start session. Server replied: " + reply.status);
    });
}

/**
 * Analyzes a received sessions object and tells whether the provided player is associated as creator-or-player in at least one session.
 * @param playername
 * @param sessions
 */
function isInSession(playername, sessions) {
    let inSession = false;

    // mark inSession true if player appears in at least one session
    $.each(sessions, function (sessionid, session) {
        inSession = inSession || session.players.includes(getUserName());
    });
    return inSession;
}

/**
 * Helper function to set the enabled disabled status of the start button (that allows creation of new sessions).
 * Button is set to enabled if false (player is not in a session), disabled if true (player is in a session).
 */
function updateCreateButtonStatus(status) {
    let startButton = $('#start-session-button');

    if (!status) {
        startButton.removeClass('disabled');
        startButton.off(); // avoid double registrations.
        startButton.on('click', startSession);
    } else {
        startButton.addClass('disabled');
        startButton.off();
    }
}

/**
 * Assigns join-user-to-selected-session API call to all enabled "join" buttons.
 */
function associateJoinButtons() {
    console.log('Associate join buttons not yet implemented.');
    let joinButtons = $('[id^=join-]');
    console.log('found ' + joinButtons.length);
    $.each(joinButtons, function (index, joinButton) {
        let sessionJoinButtonString = joinButton.id;
        let sessionId = sessionJoinButtonString.substring(5);
        console.log(sessionId);
        if (!$(joinButton).hasClass('disabled'))
            $(joinButton).on('click', function (event) {
                joinSession(sessionId);
            });
    });
}

/**
 * Helper function to request adding a user to a resource.
 * @param sessionid
 */
function joinSession(sessionid) {

    fetch('/api/sessions/' + sessionid + '/players/' + getUserName() + '?access_token=' + getAccessToken(), {
        method: 'put',
    })
        .then(result => {
            if (result.status == 401)
                throw Error('Bad credentials');
        })
        .catch(error => logout());
}

/**
 * Assigns remove-user-from-selected-session API call to all "leave" buttons.
 */
function associateLeaveButtons() {
    console.log('Associate leave buttons not yet implemented.');
}

/**
 * Assigns join-user-to-selected-session API call to all "delete" buttons.
 */
function associateDeleteButtons() {
    console.log('Associate delete buttons not yet implemented.');
}

/**
 * Assigns join-user-to-selected-session API call to all enabled "launch" buttons.
 */
function associateLaunchButtons() {
    console.log('Associate launch buttons not yet implemented.');
}