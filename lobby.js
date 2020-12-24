function prepareLobbyPage() {

    // get list of games that are available and populate form drop down menu
    populuateSessionOptions();

    // register callback for "start"-session button.
    $('#start-session-button').on('click', startSession);

    // ARL-long poll on "available-sessions"-resource and update displayed table if something changed
    observeResource('/api/lobby?hash=', updateSessionsTable, markOffline, "");
}

/**
 * Retrieves list of start-able game kinds from server and populates drop down menu of "start new session" form.
 */
async function populuateSessionOptions() {

    // retrieve list of all options from server
    let options = await getFromApi("/api/lobby/sessionoptions", onUpdateError);

    // add each of retrieved "options" to form element with id "boardgameoptions"
    $.each(options, function (i, item) {
        $('<option>' + item + '</option>').appendTo('#boardgameoptions');
    })
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
        '<th id="fill">#Players</th>' +
        '<th id="action"> </th>' +
        '</tr>'
    ).appendTo('#sessiontable');


    // iterate over players, print all info per player, and a remove button
    $.each(sessions.unlaunchedGames, function (key, session) {
        $('<tr>' +
            '<td>' + session.gameKind + '</td>' +
            '<td>' + session.creator + '</td>' +
            '<td>' + session.players.length + '</td>' +
            //'<td>' + session.players.size() + '</td>' +
            // add a button that allows removing that user
            '<td>        ' +
            '<div class="input-group-append float-right">\n' +
            '<button class="btn btn-outline-secondary" type="button" id="join-' + key + '">Join</button>\n' +
            '</div>' +
            '</td>' +
            '</tr>').appendTo('#sessiontable');

        // also register callback for the newly created "remove" button.
        $('#join-'+key).on('click',  {id: key} , joinSession);
    // });
})}

function joinSession(session)
{
    console.log("Joining: " +session.data.id);

    // TODO: Actually send a PUT on the resource (playerId as payload/extra path arg)
}

/**
 * triggered by "start"-button. Looks up which game type has been selected in '#boardgameoptions' field, builds a session bean and sends it to the rest endpoint.
 */
async function startSession() {

    // ToDo: retreive session token from cookie
    let token = await getOAuth2Token('max', 'abc123');

    // Look up game that has been selected by user
    let gameKind = $('#boardgameoptions').val();

    // ToDo: parse this from existing fields.
    let session = {"gameKind": gameKind, "creatorId": "Maximilian"};
    console.log(session);
    postToApi(session, "/api/lobby", "?access_token="+token);
}