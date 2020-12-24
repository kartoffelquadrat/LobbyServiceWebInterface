/**
 * Just some functions to conveniently interact with REST APIs.
 */

function getFromApi(resource, onError) {
    return fetch(resource)
        .then(reply => verifyReturnCode(reply, 200))
        .then(reply => verifyJsonContentType(reply))
        .then(reply => extractJsonObject(reply))
        .catch(error => onError(error))
}

/**
 * Default error handling function, that simply logs if things go wrong and returns an empty (but valid) json object.
 * @param error
 * @returns {string}
 */
function onUpdateError(error) {
    console.log('Unable to retrieve resource form API: ' + error)
    return "{}";
}

/**
 * Analyzes an HTTP reply and only returns it back, it the header declares the return code to equal the expected type. (Typically you'd check for a 200.)
 * @param reply
 * @returns {*}
 */
function verifyReturnCode(reply, expectedValue) {
    if (reply.status == expectedValue) {
        return reply;
    } else {
        // Embed expected and received codes in error object and fire it.
        let error = new Error("Server replied with unexpected return code.");
        error.response = {"expected":expectedValue, "received":reply.status};
        throw error;
    }
}

/**
 * Analyzes a HTTP reply and only returns it back, if the header declares the content to by JSON formatted.
 * @param reply
 * @returns {*}
 */
function verifyJsonContentType(reply) {
    let contentType = reply.headers.get('content-type')
    if (contentType.includes('application/json')) {
        return reply;
    } else {
        alert("Wrong content type!");
        throw new Error(`Sorry, content-type ${contentType} not supported.`)
    }
}

/**
 * Extract the actual message payload, assuming the reply came in JSON format.
 * @param response as the HTTP payload
 * @returns {Promise<T | never>}
 */
function extractJsonObject(response) {
    return response.json()
        .then(json => {
            if (response.ok) {
                return json
            } else {
                return Promise.reject(Object.assign({}, json, {
                    status: response.status,
                    statusText: response.statusText
                }))
            }
        })
}

/**
 * Serializes a JS object to JSON and sends it to a remote API, synchronously.
 * @param object
 * @param resource
 */
function postToApi(object, resource, urlparam) {
    console.log("Sending... " + object)
    let xhr = new XMLHttpRequest();
    xhr.open("POST", resource+urlparam, false);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(object));
}