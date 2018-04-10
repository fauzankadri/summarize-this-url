var api = (function () {
    var module = {};

    function send(method, url, data, callback) {
        var xhr = new XMLHttpRequest();
        xhr.onload = function () {
            if (xhr.status !== 200) callback("[" + xhr.status + "] " + xhr.responseText, null);
            else callback(null, JSON.parse(xhr.responseText));
        };
        xhr.open(method, url, true);
        if (!data) xhr.send();
        else {
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify(data));
        }
    }

    module.summarizeUrl = function (url, sentences, callback) {
        console.log("im here");
        send("GET", "/api/summarize/url/" + sentences + '/' + encodeURIComponent(url) + '/', null,  callback);
    };

    return module;
})();