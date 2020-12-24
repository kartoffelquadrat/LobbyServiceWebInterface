/**
 * Generic functionality for all top navigation bars.
 */

/**
 * Sets the name in the navbar and registers tha handler for the logout button.
 */
function setupNavbar()
{
    // Correctly display user name.
    $('#username-display').text(capitalizeFirstLetter(getUserName()));

    // Assign logout funtion to logout button.
    $('#logout-button').on('click', logout);
}

// https://stackoverflow.com/questions/1026069/how-do-i-make-the-first-letter-of-a-string-uppercase-in-javascript
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}