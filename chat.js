//set image display when doing all names - moved source into a sep function since it is used twice.
// this code is all just for the ALERTL function
// functionality is working
// Fix the bug that the heart doesn't show. Installed alertl, installed chat image, heart was gone - or maybe it was installed and then opened the page.
// $(".user-count.right")

//NOTE for names with spaces in them - add them twice to the names file - one with space and one w/o ie: 
//sharbear	Sharon Elizabeth.S.1
//sharbear	SharonElizabeth.S.1		
// todo - transform all names in a posted reply - 
// pattern to dectect before buildname is @xxxxxxx: if you find that in text - try build name on it. 1/11/20
// first regex it, then find it and try to transform it.
// ^@([a-z,0-9,A-Z]+):

// listeners
// chat filters (for texting and desktop) listen monitor
// names
// image
// autocorrect
// phrases
let triedOnce = false;
let timer = null;
let logIt = false;
let alertphrases = ""; // used by alert texting
let s_redalertmonitor = false;
let s_needMonitor = false;
let s_alertsmonitor = false;
//let chatcriteria = { image: false, names: "", phrases: "", reda: false, phsent: 0, transdate: null, myNames: null, phraseTable: false, colrcoloroData: null };
chatcriteria = null;
let s_changeColors = false;

let s_transfornamestr = "MDE is Transforming names.Be patient.This message dissappears when it is done!";
let s_chatnoise = null;
let s_bigListenObserver = null;
let s_TitleObserver = null
let s_chatnamesmonitor = false;
let s_textalertmonitor = false;
let s_textmonitor = false;
let s_FirstLoad = true;

/**
 * Return a string with a single character replaced at a given index.
 *
 * @param {boolean} cList
 * @param {Object} observer
 */
function bigListenObserver(cList, observer) {
    let node;
    cList.forEach(function (ev) {
        if (ev.target.className == 'upvote-count') {
            applyUpVote(ev.target);
            return; // not for us - it's an upvote
        }
        if (ev.target.nodeName == 'TBODY') {
            if (ev.addedNodes.length == 1) {
                if (s_chatnamesmonitor == true) {
                    node = $(ev.addedNodes[0]).find('.post-meta');
                    if (node.length == 1)
                        listenPostMetaNode(node[0]);
                }
                if (s_chatnamesmonitor || s_alertsmonitor || s_changeColors) {
                    node = $(ev.addedNodes[0]).find('td.message');
                    if (node.length == 1) {
                        listenMessageNode(node[0]);
                        if (s_changeColors)
                            colorMonitor(node[0]);
                    }
                }
            }
        }
    });
}

/**
 * Handle chrome.runtime messages for chat control commands from the background.
 */
function chatcontrolListen() {
    let inp;
    //image and chat names
    if (s_needMonitor) {
        document.addEventListener("keydown", keyDwn);
        inp = document.getElementById("input");
        if (inp != null) {
            inp.addEventListener("input", emojiListen);
            inp.addEventListener("focus", focusListen);
        }
        installObserversChat();
        if (chatcriteria.reda)
            s_redalertmonitor = true;
        if (chatcriteria.image)
            s_chatnamesmonitor = true;
        if (chatcriteria.phrases != "" || chatcriteria.names != "")
            s_alertsmonitor = true;

        if (s_chatnamesmonitor) {
            installTitleObserver();
            lookUpChat("dummy");
        }
        if (s_FirstLoad) {
            checkLogo();
            s_FirstLoad = false;
        }
    }
    else {
        uninstallObserversChat();
        if (s_TitleObserver != null) {
            s_TitleObserver.disconnect();
        }
        s_TitleObserver = null;
        document.removeEventListener("keydown", keyDwn);
        inp = document.getElementById("input");
        if (inp != null) {
            inp.removeEventListener("input", emojiListen);
        }
        s_redalertmonitor = false;
        s_chatnamesmonitor = false;
        s_alertsmonitor = false;
    }

}

/**
 * Poll until the chat DOM is ready, then install observers.
 */
function installObserversChatReady() {
    // select the target node
    //  configuration of the observer:
    let config = { subtree: true, characterData: true, childList: true };
    let target = document.querySelector('#online-users');

    // create an observer instance
    let observer = new MutationObserver(function (mutations) {
        // if I am called - time to install real monitors 
        chatcontrolListen();
        //only install this click once.. 
        observer.disconnect();
    });


    // pass in the target node, as well as the observer options
    observer.observe(target, config);
}

/**
 * Install all MutationObservers for chat message and title monitoring.
 */
function installObserversChat() {
    //  configuration of the observer:
    let config = { subtree: true, characterData: true, childList: true };
    // select the target node
    let target = document.querySelector('#channel-content');
    // create an observer instance
    if (s_bigListenObserver != null)
        s_bigListenObserver.disconnect();
    s_bigListenObserver = new MutationObserver(bigListenObserver);
    // pass in the target node, as well as the observer options
    s_bigListenObserver.observe(target, config);
}

/**
 * Disconnect all active chat MutationObservers.
 */
function uninstallObserversChat() {
    if (s_bigListenObserver != null) {
        s_bigListenObserver.disconnect();
        s_bigListenObserver = null;
    }
}

/**
 * Observe the page title element for task-change navigation events.
 */
function installTitleObserver() {
    // select the target node
    let target = document.querySelector('title');
    // create an observer instance
    s_TitleObserver = new MutationObserver(function (mutations) {
        // We need only first event and only new value of the title
        //mutations[0].target.text = "Gina.R.204 on RaterLabs Chat"
        if (mutations[0].target.text !== null && mutations[0].target.text != "") {
            let workStrings = mutations[0].target.text.split(" on ");
            //name is first part
            if (workStrings.length == 2) {
                if (s_chatnamesmonitor && nameFile != null) {
                    let newName = subLookup(nameFile, workStrings[0]);
                    if (newName != workStrings[0]) {
                        let newTitle = document.title.replace(workStrings[0], newName);
                        document.title = newTitle;
                        //if (timer == null)
                        //    startTimer();
                    }
                    if (retro == false) {
                        doAllNames();
                    }
                }
            }
        }
    });

    // configuration of the observer:
    let config = { subtree: true, characterData: true, childList: true };

    // pass in the target node, as well as the observer options
    s_TitleObserver.observe(target, config);
}


/**
 * Observe a chat post metadata node for name and avatar updates.
 *
 * @param {Object} td
 */
function listenPostMetaNode(td) {
    let item = $(td).find('.profile-image');
    s_setImgHandler(item);
    let tr = td.parentElement;
    let innerEl = $(tr).find(".inner-name");
    if (innerEl == null || innerEl.length < 1) {
        return null; // something is wrong with this TR - doesn't fit the expect format
    }

    //lookup oldName
    let cTable = $(tr).find("table");
    let spanEl = $(cTable[0]).find("span");
    //let tempStr = spanEl[0].innerText;
    //spanEl[0].innerText = lookUp(tempStr);

    let name2Change = spanEl[0].innerText;

    let nameTitle = spanEl[0].title;

    //spanEl[0].title = 
    // to reply to Mark.D.996."
    // if name2change is not found in title, we know there is a mismatch
    // Christopher.E.166 == Christopher.E...

    if (nameTitle.indexOf(name2Change) == -1) {
        // name was too long
        let nameParts = nameTitle.split("Click to reply to ");
        if (nameParts.length == 2) {
            name2Change = nameParts[1];
            // get rid of that trailing "." from the title sentence
            if (name2Change.charAt(name2Change.length - 1) == ".") {
                name2Change = name2Change.slice(0, -1);
            }
        }
    }

    if (nameFile != null) {
        spanEl[0].innerText = subLookup(nameFile, name2Change);
        //let newTitle = document.title.replace(name2Change, spanEl[0].innerText);
        //document.title = newTitle;
    }
    else {
        //console.log("calling lookup chat from 297");
        lookUpChat(name2Change, spanEl[0]);
    }

}

/**
 * Process a newly inserted chat message node for alerts and formatting.
 *
 * @param {Object} td
 */
function listenMessageNode(td) {
    let i;
    let who;
    let wStr;
    //let message;
    //let messageString;
    //let timeStamp;
    let authorType;
    let callBeep = false;
    let r;
    //let sendRedText = "";
    //let diff = 0;

    tr = td.parentElement;
    x = $(tr).find(".inner-name");
    if (x == null || x.length < 1)
        return null; // something is wrong with this TR - doesn't fit the expect format

    who = x[0].innerText;
    wStr = x[0].children[0].className;
    let pieces = wStr.split(" ");
    if (pieces.length < 3)
        return; // not what I expected string should be.. "m-nick xxxxx  m-nick_scooter_4798241"; where xxx = staff, docent, senior, etc..
    // if pieces = 2 - then no xxxxx - normal grey person
    if (pieces[1] == null || pieces[1] == "")
        authorType = "Grey";
    else
        authorType = pieces[1];

    let aColor = getAlertColor();

    //if (s_redalertmonitor) {
    //    // if this  a red
    //    if (authorType == "staff") {
    //        sendRedText = "Red Post";
    //    }
    //}


    // now I have who (author - check against names)
    if (chatcriteria.names != "") {
        pieces = chatcriteria.names.split(',');
        if (pieces.length == 1) {
            if (chatcriteria.names.toUpperCase() == who.toUpperCase()) {
                // set the right color according to chatColors
                $(x).css("background-color", aColor); callBeep = true;
            }
        }
        else for (i = 0; i < pieces.length; i++) {
            if (pieces[i].toUpperCase() == who.toUpperCase()) {
                // highlight this name
                $(x).css("background-color", aColor); callBeep = true;
            }
        }
    }
    //check for redalert
    if (!callBeep && s_redalertmonitor && authorType == "staff") {
        // highlight this name
        $(x).css("background-color", aColor);
        callBeep = true;
    }


    /*get message and timestamp */
    //"We're ready! :)\n\n
    x = $(tr).find(".message");
    r = x.children();
    if (r.length < 4)
        return; // unexpected format

    //time stamp
    let time = "";
    let y = $(tr).find(".m-time");
    if (y.length == 1)
        time = y[0].textContent;

    message = r[1].innerText;
    let removeit = r[1].innerHTML.split("<br> <br> ")
    if (removeit.length == 2) {
        message = removeit[1];
        r[1].innerHTML = removeit[1];
    }

    // time = "03:45 AM - 06/13"
    //no alert if this message is more than 1 min old

    let compTime = transformTimeStr2Date(time); //returns a date object or null if it couldnt parse it
    if (compTime != null) {
        let curTime = new Date();
        //input is always a javascript date. output type can be STRING or TDATE (javascript date)
        curTime = convert2Pacific(curTime, "TDATE");
        diff = curTime - compTime;
    }

    //if (s_textalertmonitor == true) {
    //    sendText = check4filtermatch(message, null, alertphrases);
    //    if (sendText != null || sendRedText != null) {
    //        if (diff > 60000) {
    //            if (isValidChromeRuntime())
    //                SendSafeRuntimeMessage({
    //                    text: "SENDMESSAGE", message: message, filter: (sendRedText == null ? sendText : sendRedText), poster: who, time: time
    //                });
    //        }
    //    }
    //}

    if (s_chatnamesmonitor || s_alertsmonitor) {
        let messageClass = $(tr).find("div.message.left");
        messageClass[0].innerHTML = processMessage4Names(messageClass[0].innerHTML);
        let innerEl = $(tr).find(".inner-name");
        if (innerEl == null || innerEl.length < 1) {
            return null; // something is wrong with this TR - doesn't fit the expect format
        }

        // set callback to offer option to change
        let innerItem = innerEl[0]; //where did this come from here
        s_setNameChangeHandler(innerItem);
    }

    //check against phrases
    let testit;
    if (chatcriteria.phrases != "")
        testit = check4filtermatch(messageClass[0].textContent, chatcriteria.phrases, null);
    if (testit != null) {
        $(x).css("background-color", aColor);
        callBeep = true;
    }

    if (callBeep == true) {
        //beep(s_chatnoise);
        if (isValidChromeRuntime()) {
            //save my position
            //pos = s_getpos();
            //if (!document.hidden) 
                beep(s_chatnoise);
        //    else
        }
    }
}

/**
 * Log a debug message to the console if chat debug logging is on.
 *
 * @param {string} msg
 */
function s_logIt(msg) {
    if (logIt) { /* logging removed */ }
}

/**
 * Show or hide the "MDE is working" status banner in the chat.
 *
 * @param {boolean} onoff
 */
function setWorkingMessage(onoff) {
    let newMsg = "";
    if (onoff)
        newMsg = s_transfornamestr;
    let el = document.getElementById("input");
    el.textContent = newMsg;
    return;
}

// logo and enable chats alert button
/**
 * Detect the platform logo to determine which Appen chat environment is active.
 */
function checkLogo() {
    // does it exist..

    let imgDiv = document.getElementById("lftimage");
    let f = $('#header');

    if (f == null) {
        return;
    }

    //let enableBut = document.getElementById("enableBut");

    if (s_needMonitor)
        if (imgDiv != null) {
            $(imgDiv).remove();
            //    $(enableBut).remove();
        }
        else {
            let x = f.children();
            if (x.length < 2) {
                return;
            }

            //$(x[1]).prepend('<button id="lftimage" type="button" title="This heart indicates MDE is active on this page. To reload nicknames file, refresh the tab."><img src="https://raterlabs.appen.com/qrp/core/vendors/social_file/1065488/icon.png" style = "width:20px;height:20px;"></button>');
            $(x[1]).prepend('<button id="lftimage" class= "multicolor-text" type="button" title="Click to enable MDE alerts on this page.">Enable MDE Alerts</button>');          
                let heart = $('#lftimage');
            if (heart == null)
            $('#lftimage').click(function () {
                $('#lftimage').remove();
            });
        }
}


/**
 * Apply name substitution to a chat display name using the loaded name file.
 *
 * @param {string} oldName
 * @returns {string}
 */
function buildName(oldName) {
    // format is nameH999
    // find the first num
    // insert a '.' right before the num.
    // back up 2 and insert another .
    // remove the @ at the begining
    //handle both these cases - strip the [99999999] from the string 
    //"@MorrisN155", " @SharonElizabethS1[11213947]"
    //regex is /\[[0-9]{8}\]/g


    let numPeriod = true;
    let newStr = "";

    for (i = 0; i < oldName.length; i++) {
        let char = oldName.charAt(i);
        if (isNaN(char)) {
            //its a char - copy it
            newStr += char;
        }
        else {
            //its a num. Insert a ".' and then copy num
            if (numPeriod) {
                // first backup 1 and insert a '.' (because last char copied was the initial)
                newStr = newStr.substr(0, i - 1) + "." + newStr.substr(i - 1);
                newStr += '.';
                numPeriod = false;
            }
            newStr += char;
        }

    }


    let anotherStr = subLookup(nameFile, newStr);
    if (anotherStr == newStr) {
        return oldName;
    }
    else {
        //chat doesn't do the refer back right (I don't control that code) if the name has '.'s in it.
        anotherStr = anotherStr.replace(/\./g, "");
        //return "@" + anotherStr;
        return anotherStr;
    }
}

nameFile = null;
let myNameFile = null;
let retro = false;

/**
 * Iterate all visible chat names and apply substitutions from the name file.
 */
function doAllNames() {
    if (retro == true) {
        return;
    }
    if (nameFile == null) {
        return;
    }
    //now change names to newnames ONCE

    setWorkingMessage(true);
    $("td.inner-name").each(function (index) {
        retro = true;

        if ($(this).is(':visible')) {
            let sEl = $(this).find("span");
            let n2Change = sEl[0].innerText;
            let nameTitle = sEl[0].title;

            //spanEl[0].title = 
            // "Click to reply to Mark.D.996."
            // if name2change is not found in title, we know there is a mismatch
            // Christopher.E.166 == Christopher.E...

            if (nameTitle.indexOf(n2Change) == -1) {
                // name was too long
                let nameParts = nameTitle.split("Click to reply to ");
                if (nameParts.length == 2) {
                    n2Change = nameParts[1];
                    // get rid of that trailing "." from the title sentence
                    if (n2Change.charAt(n2Change.length - 1) == ".") {
                        n2Change = n2Change.slice(0, -1);
                    }
                }
            }


            let newName2 = n2Change;
            if (myNameFile != null && myNameFile.rows.length > 0) {
                for(let i = 0; i < myNameFile.rows.length; i++) {
                    if (myNameFile.rows[i].RaterLabs === n2Change) {
                        newName2 = myNameFile.rows[i].MDEandle;
                        break;
                    }
                }
            }

            if (n2Change == newName2) {
                for(let i = 0; i < nameFile.rows.length; i++) {
                    if (nameFile.rows[i].RaterLabs === n2Change) {
                        newName2 = nameFile.rows[i].MDEandle;
                        break;
                    }
                }
            }

            if (newName2 != n2Change)
                sEl[0].innerText = newName2;
        }

    });

    $("div.message.left").each(function (index) {
        // now change messageText too  
        retro = true;

        if ($(this).is(':visible')) {
            let tempStr = this.innerText;
            this.innerHTML = processMessage4Names(this.innerHTML);
        }
    });

    //transform name in the title
    let workStrings = document.title.split(" on ");
    //name is first part
    if (workStrings.length == 2) {
        let newName = subLookup(nameFile, workStrings[0]);
        if (newName != workStrings[0]) {
            let newTitle = document.title.replace(workStrings[0], newName);
            document.title = newTitle;
        }
    }

    // set img-context
    $(".profile-image").each(function () {
        s_setImgHandler(this);
    });

    //set name change-context
    $(".inner-name").each(function () {
        s_setNameChangeHandler(this);
    });

    if ($("#input").val() == s_transfornamestr)
        setWorkingMessage(false);

}

let alertOnce = true;

/**
 * Look up a name in the substitution file and return the mapped replacement.
 *
 * @param {string} nameFile
 * @param {string} oldName
 * @returns {*}
 */
function subLookup(nameFile, oldName) {
    s_logIt("Before lookup:" + oldName);
    if (myNameFile != null && myNameFile.rows.length > 0) {
        for(let i = 0; i < myNameFile.rows.length; i++) {
            if (myNameFile.rows[i].RaterLabs === oldName) {
                s_logIt("returning from MyNames:" + myNameFile.rows[i].MDEandle);
                return myNameFile.rows[i].MDEandle;
            }
        }
    }
    if (nameFile != null && nameFile.rows.length > 0) {
        for(let i = 0; i < nameFile.rows.length; i++) {
            if (nameFile.rows[i].RaterLabs === oldName) {
                s_logIt("returning from Names:" + nameFile.rows[i].MDEandle);
                return nameFile.rows[i].MDEandle;
            }
        }
        s_logIt("returning same name (1):" + oldName);
        return oldName;
    }
    //namefile is null just return oldName
    s_logIt("returning same name (2):" + oldName);
    return oldName;
}

/**
 * Fetch the external name-substitution CSV file via XHR.
 *
 * @param {string} oldName
 * @returns {*}
 */
function externalNamelookup(oldName) {
    if (nameFile != null)
        return subLookup(nameFile, oldName);
    else
        return oldName;
}

/**
 * Search for a message substring in the chat history and highlight matches.
 *
 * @param {string} oldName
 * @param {Object} el2Change
 */
function lookUpChat(oldName, el2Change) {
    //read Array if needed
    if (nameFile == null && triedOnce == false) {
        triedOnce = true;
        $.ajax({
            url: "https://raterlabs.appen.com/qrp/core/vendors/social_file/1065488/names.txt",
            method: 'get',
            //async: false,
            crossDomain: true,
            success: function (data, status, xhr) {
                nameFile = readTextDocument(data);
                newName = subLookup(nameFile, oldName);
                if (oldName == "dummy") {
                    //$("#input").val(s_transfornamestr);
                    doAllNames();
                    //setTimeout(function () { location.reload();}, 60000);
                }
                else if (el2Change != null) {
                    el2Change.innerText = newName;
                    //let newTitle = document.title.replace(oldName, newName);
                    //document.title = newTitle;
                }
            }, //end of sucess
            error: function (xhr, status, text) {
                let errmsg = "MDE: Delay loading Chat nicknames. Could be you need to log on again. Could be you need to refresh this page, or could be the RL servers are just slow.  " + xhr.status;
                if (alertOnce == true) {
                    alert(errmsg);
                    alertOnce = false;
                }
            }
        }); // end of ajax
        return;
    }
    else {
        if (oldName == "dummy") {
            // $("#input").val(s_transfornamestr);
            doAllNames();
            //$("#input").val(" ");
        }
    }
}



/**
 * Keydown handler for chat keyboard shortcuts (search, clear, etc.).
 *
 * @param {Object} zEvent
 */
function keyDwn(zEvent) {
    $('#lftimage').remove();

    if (zEvent.altKey && zEvent.code === "KeyC") {
        putClipboard("this is a test");
    }

    if (zEvent.altKey && zEvent.code === "KeyL") {
        logIt = logIt == false ? true : false;
        if (logIt) { /* log enabled */ }
        else
            console.log("Logging turned off at", Date());
    }
}
//allows them to insert emoji's and correct yukon repeating message being replied to
/**
 * Monitor the emoji picker and suppress unwanted emoji insertion.
 *
 * @param {Object} e
 */
function emojiListen(e) {
    let valStr = "";
    if (e.inputType == "insertText" || e.inputType == "insertCompositionText") {
        if (e.data) {
            let newData = e.data.codePointAt(0);
            if (parseInt(newData) > 255) {
                valStr = valStr + "&#" + parseInt(newData);
                let newStr = e.target.value.substring(0, e.target.value.length - e.data.length) + valStr;
                $("#input").val(newStr);
            }
        }
    }
}

//when reply is inserfted - removed extras (if they are there)
/**
 * Track focus state on the chat input box.
 *
 * @param {Object} e
 */
function focusListen(e) {
    message = $("#input").val();
    let removeit = message.split("\n\n");
    if (removeit.length == 2)
        $("#input").val(removeit[1]);
}


//


//main line code

// how to tell what I need
// if names, phrases, reda or chattextalert then I need listenmonitor
//if chat names I need listenimage 

try {
    SendSafeRuntimeMessage({ text: "WAKEUP", from: "CHAT" }, function (resp) {
    //    checkLogo();
    });
}
catch (err) {
}

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {

 
    if (msg.text == "PLAYTHIS") {
        beep(msg.sound);
    }

    if (msg.text == "NEWCHATSOUND") {
        s_chatnoise = msg.beep;
        return;
    }

    if (msg.text == "ALERTFROMBACKGROUND") {
        handleAlert(msg.msg);
        return;
    }

    if (msg.text && (msg.text == "CHATM")) {
        // set node listener
        if (msg.data != null)
            chatcriteria = msg.data;
        if (msg.data == null) {
            if (msg.status == true) {
            }
            else {
                if (s_needMonitor) {
                    s_needMonitor = false;
                    chatcontrolListen();
                }
            }
            return;
        }
        addColorPickerbutton();

        if (chatcriteria.image || chatcriteria.reda || chatcriteria.names != "" || chatcriteria.phrases != "" || chatcriteria.colorData != null || yukonOnly) {
            s_needMonitor = true;
            if (chatLoaded() == false) {
                installObserversChatReady();
            }
            else {
                chatcontrolListen();
            }
        }

        s_chatnoise = msg.beep;
        //chk4messages();
        //im using phrases
        if (chatcriteria.phraseTable == true)
            installPhrases();
        //im using autocorrect
        if (chatcriteria.autocorrect == true) {
            //ask background to send spell table
            if (isValidChromeRuntime())
                SendSafeRuntimeMessage({ text: "GETSPELL" }); //ask background for them
        }
        else
            internalactoptset(); //removes keyboard listens for autocorrect

        if (chatcriteria.colorData != null || chatcriteria.yukonOnly) {
            initColors(chatcriteria.colorData, chatcriteria.yukonOnly);
            s_changeColors = true;
        }

        if (chatcriteria.image && chatcriteria.myNames != null)
            myNameFile = chatcriteria.myNames;
    }


    //if (msg.text == 'MSGOPTS') { //all I care about is chattextalerts
    //    let x = $("#channel-list option:selected").val();
    //    let divName = "channel_" + x;
    //    s_redalertmonitor = msg.data.s_redalertmonitor;


    //    let div = document.getElementById(divName);

    //    //is this option active
    //    if (msg.data == null || msg.status == false) {
    //        //uninstall handler  - todo
    //        //div.removeEventListener("DOMNodeInserted", chatTextAlertHandler, false);
    //        s_textalertmonitor = false;
    //        uninstallObserversChat();
    //        alertphrases = ""
    //    }
    //    else {
    //        //alertphrases is specifically for text alerts - not the same as phrases for chat alerts
    //        alertphrases = ""; // reset it because im getting something new
    //        let local_alerts = msg.data.chatTextAlerts;
    //        SendSafeRuntimeMessage({ text: "SENDLOG", who: "chat.js", messageLog: ("Alert phrases sent " + local_alerts) });
    //        if (local_alerts != null) {
    //            let pieces = local_alerts.split(",");
    //            let newA = new Array();
    //            for (i = 0; i < pieces.length; i++) {
    //                if (pieces[i].length > 0)
    //                    newA.push(pieces[i]);
    //            }
    //            if (newA.length > 0)
    //                alertphrases = newA;
    //            SendSafeRuntimeMessage({
    //                text: "SENDLOG", who: "chat.js", messageLog: ("Alert Phrases set to: " + alertphrases + " Length:" + alertphrases.length)
    //            });
    //        }
    //    }

    //    //now set listener just for this fucntionality
    //    s_textalertmonitor = true;
    //    //    div.removeEventListener("DOMNodeInserted", chatTextAlertHandler, false);
    //    //    div.addEventListener("DOMNodeInserted", chatTextAlertHandler, false);
    //}

});

/**
 * Inject the quick-phrase menu into the chat input toolbar.
 */
function installPhrases() {
    if (isValidChromeRuntime())
        SendSafeRuntimeMessage({ text: "GETPHRASES" }); //populates s_phraseArray
}

// this is the listener for each thumbnail that brings up larger image with right click
/**
 * Attach click handlers to chat avatar images.
 *
 * @param {*} td
 */
function s_setImgHandler(td) {
    let newSrc;
    if (td) {
        $(td).on('contextmenu', function (e) {
            e.preventDefault();
            // now get url - make it medium and display it in the context window. 
            let tempUrl = e.target.src;
            if (tempUrl == undefined || tempUrl == null ||
                tempUrl == "https://raterlabs.appen.com/qrp/images/profile_placeholder_sm.png")
                return;
            newSrc = tempUrl.replace("-small.", "-large.");
            e.currentTarget; // td 
            e.currentTarget.parentNode // tr parent
            if (document.getElementById("img-bar") == null) {
                $('body').after('<div id="img-bar" class="img-bar"></div>');
                $("#img-bar").css('display', 'block');
                $("#img-bar").css('background-color', 'white');
                // border: 0px !important;
                // border-image:  !important;
                // position: fixed;
                $("#img-bar").css('height', 'auto');
                $("#img-bar").css('width', 'auto');
                // $("#img-bar").css('top', '50%');
                // $("#img-bar").css('left', '50%');
                $("#img-bar").css('position', 'absolute');
                $("#img-bar").css('z-index', '1');
                $("#img-bar").click(function (ev) {
                    // $("#img-bar").remove();
                    $("#img-bar").css('display', 'none');
                });

            }
            else {
                $("#img-bar").css('display', 'block');
                $("#img-bar").children().remove();
            }
            // position this better
            let position = $(e.currentTarget).offset(); // position of small image = { left: xx, top: xx }
            $("#img-bar").css(position);
            $("#img-bar").append('<img id="img-item" src="' + newSrc + '" alt="Profile" />');
            $("#img-bar").append('<p id="img-msg" ><b>Click on image to dismiss<b></p>');
            $("#img-msg").css("border-style", "double");
        });
    }
}
//this is what is usd to change names
/**
 * Observe a rater name element for live name-substitution updates.
 *
 * @param {*} td
 */
function s_setNameChangeHandler(td) {
    if (td) {
        $(td).on('contextmenu', function (e) {
            e.preventDefault();
            e.currentTarget.parentNode // tr parent
            if (document.getElementById("name-bar") == null) {
                //$('body').after('<div id="name-bar" class="name-bar"></div>');
                $(e.currentTarget.parentNode).after('<div id="name-bar" class="name-bar"></div>');
                $("#name-bar").css('display', 'block');
                $("#name-bar").css('background-color', 'white');
                // border: 0px !important;
                // border-image:  !important;
                // position: fixed;
                $("#name-bar").css('height', 'auto');
                $("#name-bar").css('width', 'auto');
                // $("#img-bar").css('top', '50%');
                // $("#img-bar").css('left', '50%');
                $("#name-bar").css('position', 'absolute');
                $("#name-bar").css('z-index', '1');
            }
            else {
                $("#name-bar").css('display', 'block');
            }
            // position this better
            let position = $(e.currentTarget).offset(); // position of small image = { left: xx, top: xx }
            $("#name-bar").css(position);
            $("#name-bar").append('<input type="text" id="name-in" name="name-in" size="10" value="" />');
            $("#name-in").val(e.currentTarget.innerText);
            $("#name-bar").append('<button type="button" id="name-sub">Change</button>');
            $("#name-bar").append('<button type="button" id="name-clr">Clear</button>');
            $("#name-bar").append('<button type="button" id="name-cnl">Cancel</button>');
            $("#name-cnl").click(function (ev) {
                $("#name-bar").remove();
            });
            $("#name-sub").click(function (ev) {
                let namet = $('#name-in').val();
                let name2Add = namet.trim();
                let titlet = "";
                let syblingofnamebar = $(ev.currentTarget.parentElement).siblings();
                if (syblingofnamebar.length > 0) {
                    let nametd = $(syblingofnamebar).find(".profile-image");
                    if (nametd.length > 0)
                        titlet = nametd[0].title;
                }

                if (titlet.length == 0) {
                    return;
                }
                //"Click to view Kelsie.H.096's social profile."
                let namepieces = titlet.split("Click to view ");
                if (namepieces.length == 1) {
                    return;
                }
                let name2Change = namepieces[1].replace("'s social profile.", "");
                if (myNameFile == null) {
                    let headers = ["MDEandle", "RaterLabs"];
                    myNameFile = { rows: [], headers: headers };
                }
                else {
                    for(let ixr = 0; ixr < myNameFile.rows.length; ixr++) {
                        if (myNameFile.rows[ixr].RaterLabs === name2Change) {
                            myNameFile.rows[ixr].MDEandle = name2Add;
                            //target2Change.
                            if (isValidChromeRuntime())
                                SendSafeRuntimeMessage({ request: "SAVENAMES", myNames: myNameFile });
                            $("#name-bar").remove();
                            return;
                        }
                    }
                }
                //do we already have a record of this one
                let row = {};
                row.MDEandle = name2Add;
                row.RaterLabs = name2Change;
                myNameFile.rows.push(row);
                if (isValidChromeRuntime())
                    SendSafeRuntimeMessage({ request: "SAVENAMES", myNames: myNameFile });
                let tbl2use = $('#name-bar').parent();
                let spl = $(tbl2use[0]).find("span");
                spl[0].innerText = name2Add;
                $("#name-bar").remove();
            });
            $("#name-clr").click(function (ev) {
                let nameClr = $('#name-in').val();
                if (myNameFile != null) {
                    for(let ixr = 0; ixr < myNameFile.rows.length; ixr++) {
                        if (myNameFile.rows[ixr].MDEandle === nameClr) {
                            myNameFile.rows.splice(ixr, 1);
                            if (isValidChromeRuntime())
                                SendSafeRuntimeMessage({ request: "SAVENAMES", myNames: myNameFile });
                            break;
                        }
                    }
                }
                $("#name-bar").remove();
            });
        });
    }
}

/**
 * Apply name substitutions to a newly received chat message.
 *
 * @param {string} str
 * @returns {*}
 */
function processMessage4Names(str) {
    // tempStr.indexOf("\n\n@")
    let newStr = str;
    let newStrT = null;
    let newName = null;
    let saveIt = null;

    //slit into pieces starting with @
    let pieces = str.match(/@([a-z,0-9,A-Z]+):/g);
    if (pieces != null) {
        for(let i = 0; i < pieces.length; i++) {
            //trim what we dont need
            saveIt = pieces[i];
            pieces[i] = pieces[i].trim(); //and blanks
            newStrT = pieces[i].replace(/@/g, "");
            newStrT = newStrT.replace(/:/g, "");
            newName = buildName(newStrT);
            if (newName != newStrT) {
                newStr = newStr.replace(newStrT, newName);
            }
        }
    }
    //now replace ones like..  @MaryD402[11226708]:
    //get rid of nums
    newStrT = str.replace(/\[[0-9]{8}\]/g, "");
    pieces = newStrT.match(/@([a-z,0-9,A-Z]+)/g);
    if (pieces != null) {
        for(let i = 0; i < pieces.length; i++) {
            //trim what we dont need
            saveIt = pieces[i];
            pieces[i] = pieces[i].trim(); //and blanks
            newStrT = pieces[i].replace(/@/g, "");
            //newStrT = newStrT.replace(/:/g, "");
            newName = buildName(newStrT);
            if (newName != newStrT) {
                newStr = newStr.replace(newStrT, newName);
            }
        }
    }
    return newStr;
}

// time = "03:45 AM - 06/13"
// going for f = new Date("00:05:06 04/15/20")
//code doesn't work for last years posts - who cares. its a once a year thing - baaaaa 
/**
 * Parse a chat timestamp string into a JavaScript Date object.
 *
 * @param {string} timeStrIn
 * @returns {*}
 */
function transformTimeStr2Date(timeStrIn) {
    //split into two pieces
    let isAM = false;

    let pieces = timeStrIn.split(" - ");
    if (pieces.length != 2)
        return null;

    let timepieces = pieces[0].split(" "); //03:45 AM
    if (timepieces.length != 2)
        return null;

    //look for am/pm in pieces 0
    if (timepieces[1] != "AM" && timepieces[1] != "PM")
        return null;

    let offset = 0;
    if (timepieces[1] == "PM")
        offset = 12;
    else
        isAM = true;

    timepieces = timepieces[0].split(":");
    if (timepieces.length != 2)
        return null;

    let hh = parseInt(timepieces[0]);
    if (isAM && hh == 12)
        hh = 0; //chat messages have a time of 12:xx AM instead of 00:xx AM for some reason.
    // split it up
    let mm = parseInt(timepieces[1]);
    if (hh != 12)
        hh = hh + offset;
    let timeStr = hh + ":" + mm + ":00" + " " + pieces[1] + '/';

    //now the year. 
    let today = new Date();
    let year = today.getFullYear();

    timeStr += year;

    let newDate = new Date(timeStr);
    if (isNaN(newDate))
        return null;

    return newDate;
}

////this one is left over from leapforce live
//function alertfunction(ev) {
//    let x = ev.relatedNode;
//    //let who;
//    //let wStr;
//    //let message;
//    //let messageString;
//    //let timeStamp;
//    //let authorType;


//    if (x.className == "upvote-count")
//        return (null); // not for us - it's an upvote


//    tr = ev.srcElement;
//    if (tr.className == "message announce") {
//        x = $(tr).find(".message");
//        if (x[1].textContent.indexOf("NEW TOPIC:") > -1 ||
//            x[1].textContent.indexOf("CURRENT TOPIC:") > -1) {
//            if (isValidChromeRuntime())
//                beep(s_chatnoise);
//        //        SendSafeRuntimeMessage({
//        //            text: "PLAYIT", soundF: "not used", soundType: "CHAT"
//        //        });
//        }
//    }
//    return;
//}



/**
 * Check whether a chat message matches any active keyword filter.
 *
 * @param {Object} message
 * @param {string} phraseStr
 * @param {Array} phraseArray
 * @returns {*}
 */
function check4filtermatch(message, phraseStr, phraseArray) {

    let pieces;

    if (phraseStr != null)
        pieces = phraseStr.split(','); //the phrases we are checking for
    else
        pieces = phraseArray;

    if (pieces.length == 1)
        if (phrasesMatchFound(message, pieces[0]))
            return pieces[0];
        else
            return null;
    else for (i = 0; i < pieces.length; i++) {
        if (phrasesMatchFound(message, pieces[i]))
            return pieces[i];
    }
    return null;
}

/**
 * Handle a phrase-match event and insert the matched phrase text.
 *
 * @param {Object} inmessage
 * @param {string} str
 * @returns {boolean}
 */
function phrasesMatchFound(inmessage, str) {
    if (str && str.length > 0 && inmessage && inmessage.length > 0) {
        let workingStr = str.toUpperCase();
        let message = inmessage.toUpperCase();
    }
    else {
        console.log("str or inmessage were blank", str, inmessage);
        return false;
    }

    if (message.indexOf(workingStr) > -1)
        return true;
    else {
        if (workingStr[0] == '"' && workingStr[workingStr.length - 1] == '"') {
            //its surrounded by quotes -  remove them
            workingStr = setCharAt(workingStr, 0, ' ');
            workingStr = setCharAt(workingStr, workingStr.length - 1, ' ');
            //now look again - simplest case!
            if (message.indexOf(workingStr) > -1)
                return true;
            //remove the blanks and if its not found, we are done
            workingStr = workingStr.trim();
            if (message.indexOf(workingStr) == -1)
                return false;
            //walk the message and check for.. (return true when a match is found) - no matches at the end - return false.
            let startIndex = 0;
            while (startIndex < message.length && (index = message.indexOf(workingStr, startIndex)) > -1) {
                //one starts here 
                //check for begining of the string
                if (index == 0) {
                    if (message.length == workingStr.length) //all we have is this phrase so we are good
                        return true;
                    if (!isAlphaNumeric(message[index + workingStr.length]))
                        //this one is a match
                        return true;
                }
                //check for end of the string and char before was not alphanum
                else if (index + workingStr.length >= message.length && !isAlphaNumeric(message[index - 1]))
                    return true;
                //check for non alpha at beg and end.
                else if (!isAlphaNumeric(message[index - 1]) && !isAlphaNumeric(message[index + workingStr.length]))
                    return true;
                startIndex = index + workingStr.length;
            }
        }
        else
            return false;
    }

    return false;
}


// picked up at stackoverflow
/**
 * Return a string with a single character replaced at a given index.
 *
 * @param {string} str
 * @param {number} index
 * @param {string} chr
 */
function setCharAt(str, index, chr) {
    if (index > str.length - 1) return str;
    return str.substring(0, index) + chr + str.substring(index + 1);
}


