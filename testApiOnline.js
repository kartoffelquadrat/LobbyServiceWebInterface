function enableJSElements() {
    fetch('/api/online')
        .then(response => {
            console.log(response);
            if(response != 200)
                console.log("marking as offline");
                markOffline();
        })
        .catch(() => markOffline());    // for some reason catch clause is triggered.
}

function markOffline() {
    consol.log("removing class");
    $('#notonline').removeClass('d-none');
}