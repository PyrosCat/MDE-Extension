//this file changes names on the main social screen
let imgSrc = "https://raterlabs.appen.com/qrp/core/vendors/social_file/1065488/icon.png";


/**
 * Handle chrome.runtime messages for social-page control commands.
 */
function isHeartThere() {
    let x = $("#site-menu ul").find('#lftimg');
    if (x.length == 0)
        return false;
    else
        return true;
}

/**
 * Transform a social post node with MDE formatting and controls.
 */
function transForm() {

    $(".alias").each(function (index) {
        // let NewName = lookup($(this).text);
        let newName = lookUp(this.text);
        if (newName != this.text)
            this.text = newName;
    });

    $(".social-comment a").each(function (index) {
        // let NewName = lookup($(this).text);
        let newName = lookUp(this.text);
        if (newName != this.text)
            this.text = newName;
    });

    $(".followers-list-item").each(function (index) {
        let oldStr = this.innerText.trim();
        let newStr = lookUp(oldStr);
        if (newStr != oldStr)
            this.innerHTML = this.innerHTML.replace(oldStr, newStr);
    });
}

//function listensocial(ev) {
//    if (ev.relatedNode.className == "content-section") {
//        let d = ev.relatedNode;
//        $(d).find(".alias").each(function (index) {
//            // let NewName = lookup($(this).text);
//            let newName = lookUp(this.text);
//            if (newName != this.text)
//                this.text = newName;
//        });
//        $(d).find(".social-comment a").each(function (index) {
//            // let NewName = lookup($(this).text);
//            let newName = lookUp(this.text);
//            if (newName != this.text)
//                this.text = newName;
//        });

//    }

//}

/**
 * Observe a social content node for new post insertions.
 *
 * @param {boolean} cList
 * @param {Object} observer
 */
function listenContentNode(cList, observer) {
    cList.forEach(function (ev) {
        if (ev.target.className == 'content-section') {
            d = ev.addedNodes;
            if (d.length > 0) {
                $(d).find(".alias").each(function (index) {
                    // let NewName = lookup($(this).text);
                    let newName = lookUp(this.text);
                    if (newName != this.text)
                        this.text = newName;
                });
                $(d).find(".social-comment a").each(function (index) {
                    // let NewName = lookup($(this).text);
                    let newName = lookUp(this.text);
                    if (newName != this.text)
                        this.text = newName;
                });
            }
        }
    });
}

let s_socialobserver;

/**
 * Install the MutationObserver for the social feed container.
 */
function installSocialObserver() {
    let contentNode = document.querySelector('.content-section');
    let config = { attributes: true, childList: true, subtree: true };

    s_socialobserver = new MutationObserver(listenContentNode);
    s_socialobserver.observe(contentNode, config);
}

/**
 * Handle chrome.runtime messages for social-page control commands.
 *
 * @param {boolean} action
 */
function socialcontrolListen(action) {
    let div;
    div = document.body;
    if (action == "install") {
        //install observer
        installSocialObserver();
        if (!isHeartThere())
            $("#site-menu ul").prepend('<li id="lftimg"><img src="' + imgSrc + '" style = "width:20px;height:20px;"></li>');

    }
    else if (action == "remove") {
        if (isHeartThere()) {
            let imgli = $("#site-menu ul").find('#lftimg');
            if (imgli.length == 1) {
                $(imgli[0]).remove();// remove it
            }
        }
        //remove observer
        s_socialobserver.disconnect();
        //    div.removeEventListener("DOMNodeInserted", listensocial, false);
    }
}

//main
try {
    SendSafeRuntimeMessage({ text: "WAKEUP", from: "SOCIAL" }, function (resp) { console.log("back from wakeup, social:" + resp); });
}
catch (err) {
}

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    /*  am I already monitoring? */
    if (msg.text && (msg.text == "SOCIALO")) {
        if (msg.status == false) {
            socialcontrolListen("remove");
        }
        else {
            loadFile(transForm);
            socialcontrolListen("install");
        }
    }
    return false;
});






