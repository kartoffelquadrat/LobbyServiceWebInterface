/**
 * Generic functionality for all top navigation bars.
 */

/**
 * Sets the name in the navbar and registers tha handler for the logout button.
 */
function setupNavbar(toggleTarget) {
    // Correctly display user name.
    $('#username-display').text(capitalizeFirstLetter(getUserName()));

    // Assign logout function to logout button.
    $('#logout-button').on('click', logout);

    // If the user is an admin, fill additional button to toggle lobby and admin mode.
    if (getRole() === 'ROLE_ADMIN') {
//        console.log('Adding lobby/admin mode toggle button to navbar.');
        $('#toggle-button').text(toggleTarget);

        // Add a link
        if(toggleTarget.toLowerCase().includes('lobby'))
            $('#toggle-button').on('click', function() {window.location.href = getContextPath() + "/lobby.html";});
        else
            $('#toggle-button').on('click', function() {window.location.href = getContextPath() + "/admin.html";});
    }

    // Normal users should not see this button at all.
    else {
        // else remove the button entirely
        $('#toggle-button').remove();
    }
}

// https://stackoverflow.com/questions/1026069/how-do-i-make-the-first-letter-of-a-string-uppercase-in-javascript
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}