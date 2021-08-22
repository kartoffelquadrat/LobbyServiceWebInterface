function fillPreferenceTable(userdata) {

    // display name
    $('#name-td').text(capitalizeFirstLetter(getUserName()));

    // display colour
    $('#colour-field').attr('value', '#' + userdata.preferredColour);

    // display role
    let role = userdata.role;
    $('#role-td').text(capitalizeFirstLetter(role.split('_')[1]));

}

function getUserDataAndFillPreferenceTable() {

    // get json bundle with all user data as JSON from api backend
    fetch(getContextPath() + '/api/users/' + getUserName() + '?access_token=' + getAccessToken())
        .then(result => result.json())
        .then(json => {
            if (json.error)
                throw Error(json.error);
            else {
                console.log("Retrieved account details are:" + json);
                fillPreferenceTable(json)
            }
        })
        .catch(error => { // logout, redirect to login in case the credentials were rejected.
            console.log(error);
            logout();
        });
}