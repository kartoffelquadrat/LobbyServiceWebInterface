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

    // Assign redirect to settings page to settings button
    $('#settings-button').on('click', function () {
        window.location.href = getContextPath() + "/settings.html";
    })

    // If there is a dedicated lobby button (only present on settings page), associate forward to lobby function
    $('#lobby-button').on('click', function () {
        window.location.href = getContextPath() + "/lobby.html";
    })

    // If the user is an admin, fill additional button to toggle lobby and admin mode (or just go to admin zone if
    // currenlty settings page displayed)
    if (getRole() === 'ROLE_ADMIN') {
//        console.log('Adding lobby/admin mode toggle button to navbar.');
        $('#lobby-or-admin-button').text(toggleTarget);

        // Add a link
        if (toggleTarget.toLowerCase().includes('admin')) {
            $('#lobby-or-admin-button').removeClass('btn-outline-primary');
            $('#lobby-or-admin-button').addClass('btn-outline-danger');
            $('#lobby-or-admin-button').on('click', function () {
                window.location.href = getContextPath() + "/admin.html";
            });
        } else
            $('#lobby-or-admin-button').on('click', function () {
                window.location.href = getContextPath() + "/lobby.html";
            });
    }

    // Normal users should not see this button at all.
    else {
        // else remove the button entirely
        $('#lobby-or-admin-button').remove();
    }
}

// https://stackoverflow.com/questions/1026069/how-do-i-make-the-first-letter-of-a-string-uppercase-in-javascript
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}