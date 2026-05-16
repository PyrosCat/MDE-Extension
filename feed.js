// for https://raterlabs.appen.com/qrp/core/vendors/profile/viewAllFollowers
try {
    //console.log("sending wakep from feed.js");
    SendSafeRuntimeMessage({ text: "WAKEUP", from: "FROMFEED" }, function (resp) { console.log("back from wakeup, feed:" + resp); });
}
catch (err) {
    console.log("back from wakeup, feed - had an error", Date(), chrome.runtime.lastError);
}

/**
 * Transform the Appen followers feed page layout and inject MDE controls..
 */
function followers_transform() {
        let myName = $(".left-column a").text();
        if (myName.length != 0)
            $(".left-column a").text(lookUp(myName));
        $(".middle").each(function (index) {
            let parent = $(this).parent();
            let children = $(parent).children();
            if (children.length == 2) {
                let aref = children[1];
                let oldName = $(aref).text();
                let newName = lookUp(oldName);
                if (newName != oldName)
                    $(aref).text(newName);
            }
        });
    }


chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    /*  am I already monitoring? */
    // text = feed, names = array of new names
    if (msg.text && (msg.text == "FEED")) {
        loadFile(followers_transform);
    }
});

