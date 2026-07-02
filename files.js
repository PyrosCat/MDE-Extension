//added code to preview images
//this is for the social file manager
let imgSrc = "https://raterlabs.appen.com/qrp/core/vendors/social_file/1065488/icon.png";

/**
 * Send a delete request for the selected file to the Appen backend.
 */
function isHeartThere() {
    let x = $("#site-menu ul").find('#lftimg');
    if (x.length == 0)
        return false;
    else
        return true;
}


// 

/**
 * Handle a table-cell click event in the file manager list.
 *
 * @param {Object} ev
 */
function clickTDCallback(ev) {
    let taburl = ev.currentTarget.innerText;
    putClipboard(taburl);
    SendSafeRuntimeMessage({ request: "OPENURL", url: taburl});
    //SendSafeRuntimeMessage({
    //   request: "SENDLOG", who: "social.js",
    //    messageLog: "saving: " + savedSocial.project + " locale: " + savedSocial.locale + " scope: " + savedSocial.scope
    // }); 
}

try {
    //console.log("sending wakep from social.js");
    SendSafeRuntimeMessage({ text: "WAKEUP", from: "FILES" }, function (resp) { console.log("back from wakeup, files:" + resp); });
}
catch (err) {
    console.log("back from wakeup, files - had an error", Date(), chrome.runtime.lastError);
}




chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    /*  am I already monitoring? */

    if (msg.text && (msg.text == "SFILES")) {
        if (msg.status == true) {
            // we are on
            // insert heart
            if (!isHeartThere())
                $("#site-menu ul").prepend('<li id="lftimg"><img src="' + imgSrc + '" style = "width:20px;height:20px;"></li>');
            // add on click for td
            $('tr td:nth-child(2)').off("click.socialTD");
            $('tr td:nth-child(2)').on("click.socialTD", clickTDCallback);
            $('tr td:nth-child(2)').addClass('hoverC');
            //go thru all children[0] set img handler for those that are image files
            $('tr').each(function () {
                if (this.children.length == 3 && this.children[0].tagName == "TD") {
                    let thisOne = this.children[0];
                    let name = thisOne.textContent;
                    let pieces = name.split('.');
                    if (pieces.length == 2) {
                        if (isImage(pieces[1])) {
                            setImgHandler(thisOne);
                            $(thisOne).css('cursor', 'pointer');
                        }
                    }
                }
            });
        }
        else {
            // we are off
            // remove heart
            if (isHeartThere()) {
                let imgli = $("#site-menu ul").find('#lftimg');
                if (imgli.length == 1) {
                    $(imgli[0]).remove();// remove it
                }
            }
            // remove hover and change of cursor
            // remove on click for tc
            $('tr td:nth-child(2)').off("click.socialTD");
            $('tr td:nth-child(2)').hover(function (el) { //make this a right click? 

            });
        }
    }
    return false;
});

/**
 * Return true if a filename has an image file extension.
 *
 * @param {string} strIn
 */
function isImage(strIn) {
    let str = strIn.toLowerCase();

    if (str == 'jpg' ||
        str == 'gif' ||
        str == 'png' ||
        str == 'img')
        return true;
    else
        return false;
}

/**
 * Open a file URL in a new tab when its link is clicked.
 *
 * @param {Object} ev
 */
function clickURL(ev) {
    let url = ev.currentTarget.nextElementSibling.textContent;
    putClipboard(url);
}

/**
 * Attach click handlers to image thumbnails in the file manager.
 *
 * @param {Object} item
 */
function setImgHandler(item) {
    // hover gets two functions - mouse on, mouse off
    $(item).off('hover');
    $(item).hover(showImage, deleteImage);
    //$(item).off('click');
    //$(item).click(clickURL);
}

/**
 * Inject and display a file image preview in the manager panel.
 *
 * @param {Object} el
 */
function showImage(el) {
    // now get url - make it medium and display it in the context window. 
    //get my next siblings text content for url 
    let newSrc = el.currentTarget.nextElementSibling.textContent.trim();
    $("#img-bar").remove();
    if (document.getElementById("img-bar") == null) {
        $('body').after('<div id="img-bar" class="img-bar"></div>');
        $("#img-bar").css('display', 'block');
        $("#img-bar").css('background-color', 'green');
        $("#img-bar").css('height', '100px');
        $("#img-bar").css('width', '100px');
        $("#img-bar").css('position', 'absolute');
        $("#img-bar").css('z-index', '1');
        $("#img-bar").css('border', 'solid');

    }

    // position this better
    let position = $(el.currentTarget).offset(); // position of small image = { left: xx, top: xx }
    let sPosition = $(el.currentTarget.nextElementSibling).offset();
    let moveLeft = (sPosition.left - position.left) / 2;
    position.left += moveLeft;
    $("#img-bar").css(position);
    //add image preview
    $("#img-bar").append('<img id="img-item" src="' + newSrc + '"/>');
    //       $("#img-bar").append('<p id="img-msg" ><b>Click on image to dismiss<b></p>');
    //       $("#img-msg").css("border-style", "double");
    $("#img-item").css('height', '80px');
    $("#img-item").css('width', '80px');
    $("#img-item").css('border', 'solid');
    $("#img-item").css('margin-top', '5px');
    $("#img-item").css('margin-bottom', '5px');
    $("#img-item").css('margin-right', '5px');
    $("#img-item").css('margin-left', '5px');
}

/**
 * Send a delete request for the selected file to the Appen backend.
 *
 * @param {Object} el
 */
function deleteImage(el) {
    $("#img-bar").remove();
}

