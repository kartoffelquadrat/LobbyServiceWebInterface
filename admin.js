function registerButtonHandlers() {
// register callback function for message send button
    $('#addButton').on('click', createNewUser);

    // register same callback for enter on password field
    $('#passwordField').keypress(function (event) {
        let keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13') {
            createNewUser();
        }
    });

    // make sure the first input field is focused
    $('#userIdField').on('shown.bs.modal', function () {
        $('#userIdField').focus();
    })
}

/**
 * Validates the input for a new user.
 * @returns {boolean}
 */
function validateInput() {
    let nameField = $('#nameField');
    let passwordField = $('#passwordField');
    let everythingOk = true;

    nameField.removeClass("invalid");
    passwordField.removeClass("invalid");

    if (!nameField.val()) {
        nameField.addClass("invalid");
        everythingOk = false;
    }
    if (!passwordField.val()) {
        passwordField.addClass("invalid");
        everythingOk = false;
    }

    return everythingOk;
}


function parseAndClearRegistrationFields() {

    let passwordField = $('#passwordField');
    let nameField = $('#nameField');
    let colourField = document.getElementById('colourField');
    let adminField = document.getElementById('adminField');

    // Construct a registration form from the parsed input data
    let registrationForm = {
        name: nameField.val().toLowerCase(),
        password: passwordField.val(),
        preferredColour: colourField.value.slice(1).toUpperCase(),
        role: "ROLE_" + adminField.value.toUpperCase()
    };

    // clear the field after the message was sent
    // Todo: only call this if the API call was successful.
    passwordField.val('');
    nameField.val('');

    // set focus back to first field of form
    $('#userIdField').focus();

    //return the registration form.
    return registrationForm;
}

/**
 * Sends a request to API to create a new user.
 */
function createNewUser() {

    // Validate input fields, abort if one of the fields was not set.
    if (!validateInput()) {
        console.log("Some input was not ok.");
        return;
    }

    // Parse the form field input data and sent it as a json object to the API
    let registrationForm = parseAndClearRegistrationFields();

    //postToApi(registrationForm, "/accounts/", "");
    fetch(getContextPath() + '/api/users/' + registrationForm.name + '?access_token=' + getAccessToken(), {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'put',
        body: JSON.stringify(registrationForm)
    })
        .then(reply => {
            if (reply.ok)
                // Looks good, update the UI.
                updateDisplayedAccounts()
            else {
                // If a non-200 came back, print the error message as alert.
                reply.text()
                    .then(text => alert(text));
            }
        });
}


/**
 * Sends an API request to update the colour of an existing user.
 */
function updateUserColour(user) {

    // Find out which user was clicked
    let username = user.data.id;

    //extract color from users colour picker
    let nextColour = document.getElementById('colour-field-' + username).value.slice(1).toUpperCase();
    console.log('Changing preferred colour of ' + username + ' to: ' + nextColour);

    // build a payload object that complies to the format expected by the backend:
    let postdata = {"colour": nextColour};

    // actually send request to API
    fetch(getContextPath() + '/api/users/' + username + '/colour?access_token=' + getAccessToken(), {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'post',
        body: JSON.stringify(postdata)})
        .then(reply => {
            if (reply.ok)

                // update list of displayed users
                updateDisplayedAccounts();
            else {
                reply.text()
                    .then(text => alert(text));
            }
        })
}

/**
 * Sends an API request to update the password of an existing user.
 */
function updateUserPassword(user) {

    // Find out which user was clicked
    let username = user.data.id;

    //extract next password from input field
    let passwordField = document.getElementById('password-field-' + username);
    let nextPassword = passwordField.value;
    console.log('Changing password colour of ' + username + ' to: ----------');

    // build a payload object that complies to the format expected by the backend:
    // Note: old password is not needed, for an admin token is used to authenticate the request.
    let postdata = {"nextPassword": nextPassword, "oldPassword": "---"};

    // actually send request to API
    fetch(getContextPath() + '/api/users/' + username + '/password?access_token=' + getAccessToken(), {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'post',
        body: JSON.stringify(postdata)})
        .then(reply => {
            if (reply.ok)

                // update list of displayed users
                updateDisplayedAccounts();
            else {
                reply.text()
                    .then(text => alert(text));
            }
        })
}

/**
 * Sends a request to api to delete an existing user by name
 * @param user
 */
function deleteUser(user) {
    console.log("Deleting user: " + user.data.id);
    // postToApi(null, "/accounts/" + user.data.id + "/", "");
    fetch(getContextPath() + '/api/users/' + user.data.id + '?access_token=' + getAccessToken(), {
        method: 'delete',
    })
        .then(reply => {
            if (reply.ok)

                // update list of displayed users
                updateDisplayedAccounts();
            else {
                reply.text()
                    .then(text => alert(text));
            }
        })
}

/**
 * Retrieves an updated list of existing accounts from the server and re-renders the displayed accounts.
 */
function updateDisplayedAccounts() {

    // retrieve the list of registered users from the API
    fetch(getContextPath() + '/api/users?access_token=' + getAccessToken())
        .then(result => result.json())
        .then(json => {
            if (json.error)
                throw Error(json.error);
            else {
                console.log("Retrieved accounts are:" + json);
                fillAccountsTable(json);
            }
        })
        .catch(error => { // redirect to login in case the credentials were rejected.
            console.log(error);
            location.replace(getContextPath() + '/');
        });
}

function fillAccountsTable(userdb) {
    //console.log(registeredPlayersJsonString);
    //let registererdPlayers = JSON.parse(registeredPlayersJsonString);

    // reset player table content and re-build table's static column names
    $('#playertable').empty();
    $('<tr>' +
        '<th class="span1" id="playerName">Name</th>' +
        '<th class="span3" id="playerPasswordHash">Password (Salted, Peppered, Hashed)</th>' +
        '<th class="span1" id="playerType">Type</th>' +
        '<th class="span2" id="playerPreferredColour">Colour</th>' + // span 2 does not seem to work here :/
        '<th class="span1" class="text-center" id="playerActions">Actions</th>' +
        '</tr>'
    ).appendTo('#playertable');

    // iterate over players, print all info per player, and a remove button
    $.each(userdb, function (key, player) {
        $('<tbody><tr>' +
            // Player name
            '<td>' + capitalizeFirstLetter(player.name) + '</td>' +

            // Salted hash of password
            '  <td><div class="input-group mb-3"><input id="password-field-'+player.name+'" type="password" class="form-control" aria-describedby="basic-addon2" placeholder="****************">' +
            '  <div class="input-group-append">' +
            '    <button class="btn btn-outline-secondary" type="button" id="password-edit-'+player.name+'">Update</button>' +
            '  </div></div></td>' +

            // Role of player
            '<td>' + capitalizeFirstLetter(player.role.slice(5)) + '</td>' +

            // show preferred colour
            '<td><div class="container"><div class="row"><div class="col-xs-6"><input class="flex-child" type="color" id="colour-field-' + player.name + '" value="#' + player.preferredColour + '" style="width:38px; height:38px;"></div><div class="col-xs-6"><button class="btn btn-outline-secondary mr-1" type="button" id="colour-edit-' + player.name + '">Update</button></div></div></div></td>' +

            // add a buttons that allow altering that user
            '<td>        ' +
            '<div class="input-group-append">\n' +
            '<button class="btn btn-outline-danger" type="button" id="remove-' + player.name + '">Delete</button>\n' +
            '</div>' +
            '</td>' +
            '</tr></tbody>').appendTo('#playertable');

        // also register callback for the newly created "remove" and "update' button.
        $('#remove-' + player.name).on('click', {id: player.name}, deleteUser);
        $('#colour-edit-' + player.name).on('click', {id: player.name}, updateUserColour);
        $('#password-edit-' + player.name).on('click', {id: player.name}, updateUserPassword);
    });
}
