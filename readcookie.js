// https://stackoverflow.com/questions/10730362/get-cookie-by-name
// Call it with: var value = readCookie('param-name');
function lookUpCookie(name)
{
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function readCookie(name) {
    let value = lookUpCookie(name);
    if(value === 'undefined')
        return null;
    else
        return value;
}