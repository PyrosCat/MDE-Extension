let newLink = 'https://raterlabs.appen.com/qrp/core/vendors/u<a href="https://raterlabs.appen.com/qrp/core/vendors/u" rel="nofollow" target="_blank" style="color:blue;opacity:.9">(Desktop Link)</a>';
let oldLink = 'https://raterlabs.appen.com/qrp/core/vendors/u';
let imgSrc = "https://raterlabs.appen.com/qrp/core/vendors/social_file/1065488/icon.png";
let desktoplink = "https://raterlabs.appen.com/qrp/core/vendors/u";

//not sure why I felt the need to make this a function. But, oh well. 
/**
 * Handle a cross-reference link click on the feedback page.
 */
let fe;

function isHeartThere() {
    let x = $("#site-menu ul").find('#lftimg');
    if (x.length == 0)
        return false;
    else
        return true;
}

try {
    SendSafeRuntimeMessage({ text: "WAKEUP", from: "FEEDBACK" }, function (resp) { console.log("back from wakeup, in feedback  now" + " " + chrome.runtime.lastError + resp); });
}
catch (err) {
    console.log("back from wakeup, in feedback now - had an error", Date(), chrome.runtime.lastError);
}


chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    /*  am I already monitoring? */
    if (msg.text == "PLAYTHIS") {
        beep(request.data);
        return false;
    }
    if (msg.text == "ALERTFROMBACKGROUND") {
        handleAlert(msg.msg);
        return false;
    }
   if (msg.text && (msg.text == "FEEDBACKL")) {
        f = $('#mobile-device').children();
        if (f.length == 0)
            return false;
        fe = f.children();
        x = fe[4];
        if (msg.status == true) {
            if (!isHeartThere()) {
                $("#site-menu ul").prepend('<li id="lftimg"><img src="' + imgSrc + '" style = "width:20px;height:20px;"></li>');
                //put "LFT" in the title
                /*let h = document.title;
                let newTitle = "(lft)" + h;
                document.title = newTitle;*/
            }
            x.innerHTML = newLink;
            $(".bu-sim-html").off("click", xrefClick);
            $(".bu-sim-html").click(xrefClick);
            createMessage();
        }
        else {
            //let imgli = $("#site-menu ul").find('#lftimg');
            //if (imgli.length == 1) {
            //    $(imgli[0]).remove();// remove it
            //}
            $('#lftimg').remove();
            x.innerHTML = oldLink;
            $(".bu-sim-html").off("click", xrefClick);
            $('#message4desktoplink').remove();
        }
        return false;
    }
    return false;
});

/**
 * Build and inject the MDE feedback helper message into the page.
 */
function createMessage() {
    if ($('#message4desktoplink').length == 0) {
        let desktopLink = '<li><div id="message4desktoplink">MDE will open result on desktop when you click</div></li>';
        let ul = $('#project-subnav').find("ul");
        if (ul.length > 0) {
            $(ul).append(desktopLink);
        }
    }
}

/**
 * Handle a cross-reference link click on the feedback page.
 *
 * @param {Object} ev
 */
function xrefClick(ev) {
    let href = ev.target.href;
    if (href != undefined && href.length > 0) {
        if (isValidChromeRuntime())
            SendSafeRuntimeMessage({ text: "OPENE", URL: href });

    }
}