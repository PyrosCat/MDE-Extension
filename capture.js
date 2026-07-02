
let tt = setInterval(function () {
    let helps = document.getElementById("helpsx");
    if (helps != undefined && helps != null) {
        //ask for data
        chrome.runtime.sendMessage({ text: "SENDCAPTUREDATA" }, function (data) {
            let helps = document.getElementById("helpsx");
            helps.addEventListener("click", function () {
                alert("MDE: In print dialog save as a PDF and set options to include headers, footers, and background graphics and scale to fit on a page.")
            });
            //my height and width 
            let img = new Image(window.innerWidth - 30, window.innerHeight - 50);
            img.src = data;
            let div = document.getElementById("divbox");
            $("#divbox").empty();
            div.appendChild(img);
            if (window) {
                window.onbeforeprint = function (ev) { document.getElementById("MyHeading").style.display = "none"; };
                window.onafterprint = function (ev) { document.getElementById("MyHeading").style.display = "block"; };
            }
        });
        clearInterval(tt);
    }
}, 500);


window.addEventListener('load', function (evt) {
    chrome.runtime.onMessage.addListener(
        function (request, sender, sendResponse) {
            if (request.text == "SHOWCAPTURE") {
                //$(document).ready(function () {
                    let helps = document.getElementById("helpsx");
                    helps.addEventListener("click", function () {
                        alert("MDE: In print dialog save as a PDF and set options to include headers, footers, and background graphics and scale to fit on a page.")
                    });
                    let img = new Image(request.w - 30, request.h - 50);
                    img.src = request.data;
                    let div = document.getElementById("divbox");
                    $("#divbox").empty();
                    div.appendChild(img);
                    if (window) {
                        window.onbeforeprint = function (ev) { document.getElementById("MyHeading").style.display = "none"; };
                        window.onafterprint = function (ev) { document.getElementById("MyHeading").style.display = "block"; };
                    }
            //    });
            }
            return false;
        });
});