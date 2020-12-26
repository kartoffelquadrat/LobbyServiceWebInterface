function prepareLobbyPage() {

    // get list of games that are available and populate form drop down menu
    populateSessionOptions();

    // register callback for "start"-session button.
    $('#start-session-button').on('click', startSession);

    // ARL-long poll on "available-sessions"-resource and update displayed table if something changed
    observeResource('/api/sessions?hash=', updateSessionsTable, markOffline, "");
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
    $.each(sessions.unlaunchedGames, function (key, session) {  // ToDo: fix for updated sessions structure.
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
        $('#join-' + key).on('click', {id: key}, joinSession);
        // });
    })
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

    let createSessionForm = {
        "creator": getUserName(),
        "game": "Xox",  // Todo: dynamically retrieve from selection.
        "savegame": ""
    }

    fetch('/api/sessions?access_token=' + getAccessToken(), {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'post',
        body: JSON.stringify(createSessionForm)
    }).then(reply => {
        if (reply.status != 200)
            console.log("Failed to start session. Server replied: " + reply.status);
    });
}