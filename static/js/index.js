(function () {
    "use strict";

    window.addEventListener('load', function () {
        document.getElementById('summarize_btn').addEventListener('click', function (e) {
            e.preventDefault();
            var url = document.getElementById('input_url').value;
            var sentences = document.getElementById('input_sentences').value.replace(/\s+/g, '');
            var isValid = ((!isNaN(sentences) && (sentences != "")) && (url.replace(/\s+/g, '') != ""));

            console.log(url);
            if (!(!isNaN(sentences) && (sentences != ""))) {
                console.log("invalid sentence input");
            }
            if (!(url.replace(/\s+/g, '') != "")) {
                console.log("no url");
            }

            if (isValid) {
                console.log("start");
                api.summarizeUrl(url, sentences, function (err, summary) {
                    document.getElementById('summary_container').innerHTML = "";
                    if (summary.message != undefined) {
                        document.getElementById('summary_container').innerHTML = summary.message;
                    }
                    else {
                        //document.getElementById('data_container').innerHTML = "<p>" + summary.reduced + "</p>";
                        document.getElementById('summary_container').innerHTML = "<p id='summary_title'>" + summary.title + "</p>";
                        
                        

                        var sentences = [];
                        var content = summary.content
                        var index = [];
                        var start = 0;
                        var evenQuotes = true;
                        for (var i = 0; i < content.length; i++) {
                            if (content[i] == '"') {
                                evenQuotes = !evenQuotes;
                            }
                            if ((content[i] == ".") && evenQuotes) {
                                document.getElementById('summary_container').innerHTML += "<p>" + content.substring(start, i) + "." + "</p>";
                                start = i + 1;
                            }
                        }
                        console.log(sentences);

                    }
                    console.log("done");
                })
            }
        })
    });
}())


