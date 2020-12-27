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
    updateStartButtonStatus(isInSession(getUserName(), sessions.sessions));
    updateSessionsTable(sessions.sessions);
}

/**
 * Called by the Async Get, whenever the list of available sessions changes on server side.
 * Iterates over the received collection and rebuilds the DOM, specifically the #sessiontable table.
 * @param sessions
 */
function updateSessionsTable(sessions) {

    console.log(sessions);

    // reset sessions table content and re-build table's static columns (first row, bold)
    $('#sessiontable').empty();
    $('<tr>' +
        '<th id="game">Game</th>' +
        '<th id="initiator">Initiator</th>' +
        '<th id="fill">Players</th>' +
        '<th id="action"> </th>' +
        '</tr>'
    ).appendTo('#sessiontable');


    // iterate over players, print all info per player, and a remove button
    $.each(sessions, function (key, session) {  // ToDo: fix for updated sessions structure.
        console.log(key + " - " + session);
        $('<tr>' +
            '<td>' + session.gameParameters.name + getPlayerIntervalString(session) + '</td>' +
            '<td>' + capitalizeFirstLetter(session.creator) + '</td>' +
            '<td>' + getPlayersIndicatorString(session) + '</td>' +
            // '<td>' + session.players.size() + " / " +  + '</td>' +
            //'<td>' +  + '</td>' +
            // add a button that allows removing that user
            '<td>        ' +
            '<div class="input-group-append float-right">\n' +
            '<button class="btn btn-outline-primary" type="button" id="join-' + key + '">Join</button>\n' +
            '</div>' +
            '</td>' +
            '</tr>').appendTo('#sessiontable');

        // also register callback for the newly created "remove" button.
        $('#join-' + key).on('click', {id: key}, joinSession);
        // });
    })
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
function updateStartButtonStatus(status) {
    let startButton = $('#start-session-button');

    if (!status) {
        startButton.removeClass('disabled');
        startButton.on('click', startSession);
    } else {
        startButton.addClass('disabled');
        startButton.off();
    }
}