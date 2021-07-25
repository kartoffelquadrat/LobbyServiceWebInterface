/**
 * Helper functions for anything login / token related.
 */

/**
 * Prefills the username field and preselects password field in case the information is present in a cookie
 */
function preFillUserNameField() {
    let username = readCookie('user-name');
    if (username) {
        $('#user-name-field').val(username);
        $('#password-field').focus();
    }
}

/**
 * Assigns the credential based token retrieval function a click on login / enter press.
 */
function registerLoginHandler() {

    // register enter press on password field
    $('#password-field').keypress(function (event) {
        let keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13') {
            login();
        }
    });

    // register click on login button
    $('#loginButton').on('click', login);
}

/**
 * Retrieves an OAuth2 token pair using the provided credentials. On success the token is stored in a cookie and the
 * user is redirected to the main menu.
 */
function login() {

    // read out login data from input fields
    let username = document.getElementById('user-name-field').value.toLowerCase();
    let password = document.getElementById('password-field').value;

    // disable button until login attempt is finished
    $('#loginButton').prop("disabled", "true");

    // Lobby Service authentication meta-parameters and HTTP method
    const init = {
        body: "grant_type=password&username=" + username + "&password=" + password.replace(/\+/g, "%2B"), // Note: plus
                                                                                                          // escaping
                                                                                                          // required
                                                                                                          // here since
                                                                                                          // body
                                                                                                          // follows
                                                                                                          // URL param
                                                                                                          // syntax and
                                                                                                          // is parsed
                                                                                                          // like an
                                                                                                          // URL string
                                                                                                          // on server
                                                                                                          // side (see
                                                                                                          // header
                                                                                                          // parameter
                                                                                                          // "urlencoded").
        headers: {
            Authorization: "Basic YmdwLWNsaWVudC1uYW1lOmJncC1jbGllbnQtcHc=", // echo -n "bgp-client-name:bgp-client-pw"
                                                                             // | base64
            "Content-Type": "application/x-www-form-urlencoded"
        },
        method: "POST"
    };

    // Actually retrieves tokens from API. On success stores them in session cookie and redirects to main menu. On
    // failure displays an alert an reloads the page.
    fetch(getContextPath() + '/oauth/token', init)
        .then(result => result.json())  // returns a new promise, containing the parsed response (Even in case of bad
        // credentials, a parse-able json is returned. no error handling needed here.)
        .then(json => {
            // If the LS rejected the credentials:
            if (json.error) {
                alert(json.error_description);
                location.reload();
            }
            // Else, if the credentials were accepted (token in JSON reply)
            else {
                let expiryMoment = computeExpiryMoment(json.expires_in);
                persistLogin(username, json.access_token, json.refresh_token, expiryMoment);
                forwardToLanding();
            }
        })
    // Apparently not possible to force DOM update from promise finally. Therefore redirect to same page and fore
    // reload if bad credentials.
}

function computeExpiryMoment(remainingSeconds) {
    // Add remaining millisecond to current moment in milliseconds since 1970/01/01.
    let expiry = new Date().getTime() + remainingSeconds*1000;
    return expiry;
}

/**
 * Redirects an authenticated user to the principal menu.
 * For admins, this is eht user management panel
 * For players this is the lobby
 */
function forwardToLanding() {
    // Determine whether logged in user is admin or player
    fetch(getContextPath() + '/oauth/role?access_token=' + getAccessToken())
        .then(result => result.json())
        .then(json => {
            // Redirect players to session panel, admins to user management panel
            if (json[0].authority === 'ROLE_PLAYER')
                window.location.href = getContextPath() + "/lobby.html";
            else
                window.location.href = getContextPath() + "/admin.html";
        })
}


/**
 * Saves the access and refresh token in a session cookie.
 */
function persistLogin(username, access_token, refresh_token, access_token_expiry_moment) {

    // escape occurrences of '+' in tokens by '%2B', so they can be safely used as URL params from here on.
    access_token = access_token.replace(/\+/g, "%2B");
    refresh_token = refresh_token.replace(/\+/g, "%2B");

    // log and persist credential data
    console.log("Username: " + username);
    console.log("Access Token: " + access_token);
    console.log("Refresh Token: " + refresh_token);
    console.log("Access Token Expiry Moment: " + access_token_expiry_moment);
    document.cookie = "user-name=" + username + ";path=/";
    document.cookie = "access-token=" + access_token + ";path=/";
    document.cookie = "refresh-token=" + refresh_token + ";path=/";
    document.cookie = "access-token-expiry-moment=" + access_token_expiry_moment + ";path=/";
}

/**
 * Verifies whether the current session cookie contains username, acces-token and renewal-token
 */
function isLoginOk() {
    let username = readCookie('user-name');
    let access_token = readCookie('access-token');
    let refresh_token = readCookie('refresh-token');

    // TODO: return false if access token already expired.

    // evaluates to true if all strings properly set in cookie
    return username && access_token && refresh_token;
}

/**
 * Redirects all non-authenticated users to the login page.
 */
function anonymousIntercept() {
    if (!isLoginOk()) {
        let landingPage = getContextPath() + "/";
        window.location.replace(landingPage);
    }
}

function getUserName() {
    return readCookie('user-name');
}

function getAccessToken() {
    return readCookie('access-token');
}

function getRefreshToken() {
    return readCookie('refresh-token');
}

/**
 * Returns the system time at which the access token will expire. (Not to be confused with the remaining time until its
 * expiry)
 */
function getAccessTokenExpiryMoment() {
    return readCookie('access-token-expiry-moment');
}

/**
 * Returns (based on the expiry moment) the amount of millisecond remaining until the access token expiry (including a
 * 5 second buffer period).
 */
function getRemainingMilliSecondsBeforeAccessTokenExpiry() {

    return getAccessTokenExpiryMoment() - new Date().getTime() - 5 * 1000;
}

/**
 * Deletes the tokens from the cookie, keeps the username. Then reloads the page (forces redirect to login if protected
 * page.).
 */
function logout() {
    document.cookie = "access-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
    document.cookie = "refresh-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
    document.cookie = "access-token-expiry-moment=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
    window.location.replace(getContextPath() + "/");
}

/**
 * Invoke this function on every page load (except login page). If an access token is present, it will be renewed
 * shortly before its expiry, using the corresponding refresh token.
 * Once called, it is not necessary to interrupt this method. A page relocate implicitly kills potentially pending
 * sleeps promises.
 */
function timedTokenRenew() {

    // If no access token defined, print a warning and stop this function.
    if (!getAccessToken()) {
        console.error("Impossible to invoke delayed token renewal when no token is present!");
        return;
    }

    let timeUntilRenew = getRemainingMilliSecondsBeforeAccessTokenExpiry();
    sleep(timeUntilRenew).then(renewTokens);
}

/**
 * Helper function to renew the access token, using the current refresh token.
 */
function renewTokens() {
    console.log("Current access token will expire within the next couple of seconds. Attempting to use refresh token to update.")

    // Get new token pair, using refresh token
    let refreshToken = getRefreshToken();
    // Lobby Service authentication meta-parameters and HTTP method
    // See original login function for body payload details.
    const init = {
        body: "grant_type=refresh_token&refresh_token=" + refreshToken.replace(/\+/g, "%2B"),
        headers: {
            Authorization: "Basic YmdwLWNsaWVudC1uYW1lOmJncC1jbGllbnQtcHc=",
            "Content-Type": "application/x-www-form-urlencoded"
        },
        method: "POST"
    };

    // Actually retrieves tokens from API. On success stores them in session cookie and redirects to main menu. On
    // failure displays an alert an reloads the page.
    // TODO: do not use context path here. Use the path persisted in cookie on original login.
    fetch(getContextPath() + '/oauth/token', init)
        .then(result => result.json())  // returns a new promise, containing the parsed response (Even in case of bad
        // credentials, a parse-able json is returned. no error handling needed here.)
        .then(json => {
            // If the LS rejected the credentials:
            if (json.error) {
                alert(json.error_description);
                logout();
                location.reload();
            }
            // Else, if the credentials were accepted (token in JSON reply)
            else {
                console.log("Successfully renewed tokens using refresh token.");
                let expiryMoment = computeExpiryMoment(json.expires_in);
                persistLogin(getUserName(), json.access_token, json.refresh_token, expiryMoment);

                // recursively enable following token renewal based on renewed tokens
                timedTokenRenew();
            }
        })
}

/**
 * Helper function to get sleep functionality. See: https://stackoverflow.com/a/951057
 */
function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}