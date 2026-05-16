//status 08/21/18 - ready to test create when it doesn't find it
// there is a problem if timecards page is positioned on second page (etc)
//todo - add create button action

// when load on this page is complete
// it will get a message from background with info about which period we are working on (only 2 options)
// look through TR's for the period we are working on.
// 1st td will have period in aref.textcontent (0)
// second td is time worked, 3rd is status, 4th will be blank or have aref with content "Modify timecard" (3)

// if we find the period and it has already been submitted - tell them, close, return
// if we don't find it and there is a create button - create
// if we don't and there is no create tell them, close, return
// if we do find it and there is a modify simulate click
// if we don't find it and there is a create simulate create

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    //console.log("got message", request);

    if (request.text == "ALERTFROMBACKGROUND") {
        handleAlert(request.msg);
        return;
    }

    let href = "NONE";
    let msgStr = "NONE";
    if (request.text == 'SELECTI') {
        let period = request.period;
        $("table.data-table > tbody>tr").each(function () {
            let children = $(this).children();
            let curP = children[0].textContent.trim();
            curP = curP.replace(/ /g, "");
            if (curP == period) {
                if (children[3].innerText == "Modify Timecard") {
                    let a = $(children[3]).find('a');
                    if (a.length == 1) {
                        href = $(a[0]).attr('href');
                        href = location.origin + href;
                    }
                }
                else {
                    msgStr = "Unable to modify invoice for " + period + ", Current Invoice status is:" + children[2].innerText;
                }
                return false;
            }
        });
        if (href != "NONE") {
            // tell background to open it
            SendSafeRuntimeMessage({ text: "OPENI", url: href });
            window.close();
            sendResponse("open");
            return true;
        }
        else if (msgStr != "NONE") {
            SendSafeRuntimeMessage({ text: "SELECTP", msg: msgStr });
            sendResponse("error");
            return true;
        }
        // if we got here - it didn't find it to modify - so create it
        let children = $(".action-links").children();
        if (children.length > 0) {
            if (children[1].innerText == "Create") {
                href = $(children[0]).attr('href');
                href = location.origin + href;
                // tell background to open it
                SendSafeRuntimeMessage({ text: "OPENI", url: href });
                window.close();
                sendResponse("open");
                return true;
            }
        }

        // no create button - tell them unable to create
        SendSafeRuntimeMessage({ text: "SELECTP", msg: "Didn't find the invoice for period " + period + ", and unable to create one." });
        sendResponse("error");
        return true;
       // window.close();
    }
});
//wait for page to finish loading
let jsInitChecktimer = setInterval(checkForJS_Finish, 111);
 
/**
 * Poll until the invoice data has finished loading, then trigger rendering..
 */
function checkForJS_Finish() {
    if ($("#grid-no-results").css("display") != "none" || $(".information").length > 0) {
        clearInterval(jsInitChecktimer);
        // console.log($(".information").length, $("#grid-no-results").css("display"))
        SendSafeRuntimeMessage({ text: "READYI" }); //unprocessed message in background at the moment - 
    }
}





//$(document).ready(function () {
//    SendSafeRuntimeMessage({ text: "READYI" });
//});




