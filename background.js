// MDE Background Service Worker — main logic
// Version history tracked in manifest.json

//static vars
//these are constants used in this file
let version = "3.06"; //manifest, popup in short release msg 

let msgStrs = [
    { type: "uo", str: "May contain upsetting-offensive content" }, //checked
    { type: "hr", str: "Headphones required" },
    { type: "hrs", str: "Headphones or speakers required" },
    { type: "pr", str: "Personalized" }, //checked
    { type: "sapr", str: "Speaking aloud required" }, //checked
    { type: "hm", str: "Special device or app required" },
    { type: "ac", str: "Adult Content" },
    { type: "mc", str: "Microphone Required" } // string is "Microphone Required,Personalized" picked up as personalized at the moment
];

// code related to colors
//color opt code 
let colorOptions = [ //defined in background
    { id: "bColor", normal: "white", custom: null }, //page background
    { id: "fColor", normal: "black", custom: null }, //page foreground
    { id: "hbColor", normal: "orange", custom: null }, //MDE Alerts
    { id: "hfColor", normal: "blue", custom: null }, //hyperlink foreground
    { id: "fbColor", normal: "#adc0d6", custom: null }, //footer background
    { id: "ffColor", normal: "black", custom: null }, //footer foreground
    { id: "paColor", normal: "#537c2e", custom: null }, //PA font color
    { id: "aaColor", normal: "#c40707", custom: null }, //admin font color
    { id: "oaColor", normal: "#6e6e6e", custom: null }, //grey font color (actually - all others)
    { id: "ibColor", normal: "white", custom: null }, //input background
    { id: "ifColor", normal: "black", custom: null }, //input foreground
    { id: "pafColor", normal: "#adc0d6", custom: null }, //posts alt background
    { id: "pabColor", normal: "black", custom: null }, //posts alt foreground
    { id: "pfColor", normal: "black", custom: null }, //posts foreground
    { id: "pbColor", normal: "#eaf3fd", custom: null }, //posts background
    { id: "ubColor", normal: "white", custom: null }, //user table background
    { id: "ufColor", normal: "black", custom: null }, //user table foreground
    { id: "clbColor", normal: "white", custom: null }, //channel list background
    { id: "clfColor", normal: "black", custom: null }, //channel list foreground
    { id: "filbColor", normal: "white", custom: null }, //filter background
    { id: "filfColor", normal: "black", custom: null }, //filter foreground
    { id: "mColor", normal: "", custom: null } //my Name Color
];

let taskPage = "https://www.raterhub.com/evaluation/rater/task";
let raterChat = 'https://raterlabs.appen.com/qrp/core/vendors/social/chat/console/';
let raterhubPrefix = "https://www.raterhub.com/evaluation/rater";
let followers = "https://raterlabs.appen.com/qrp/core/vendors/profile/viewAllFollowers";
let recentTasks = "https://www.raterhub.com/evaluation/rater/task/recent_tasks";
let rhSettings = "https://www.raterhub.com/evaluation/rater/settings";


// when you capture send url use let url=chrome.runtime.getURL maybe - here to fix! 6/10/22
//chrome-extension://ciljmfoodkjpmdknmojbfkpgifaoledd/capture.html
//let captureURL = chrome.extension.getURL("capture.html");

let corrections = [{ old: "reslut", new: "result" }];
//defined in rhstatusobj.js
//let RHstatus = function () {
//    this.identifier = "this is an RH status";//defined in rh.js and in background.js
//    this.nrt = false;
//    this.uo = false;
//    this.hr = false;
//    this.hrs = false;
//    this.pr = false;
//    this.hm = false;
//    this.sapr = false;
//    this.ac = false;
//    this.mc = false;
//    this.nrtstart = false;
//    this.nrtstop = false;
//    this.nrtstartcount = 0;
//    this.nrtstopcount = 0;
//};
let RHMsgOptions = function () {
    this.uo = false;
    this.hr = false;
    this.hrs = false;
    this.pr = false;
    this.hm = false;
    this.sapr = false;
    this.ac = false;
    this.mc = false;
    this.nrtstart = false;
    this.nrtstop = false;
    this.textafter = 2;
};

let static_default_sounds = [ // msg, active, data to send, not in use, url
    { type: "CHAT", default: "beep-1.mp3", active: "" }, //chat
    { type: "NRT", default: "changes.mp3", active: "" },
    { type: "RHINDEX", default: "ding.mp3", active: "" },
    { type: "TRACKER", default: "five-sec.mp3", active: "" },
    { type: "WAH", default: "wahwah.mp3", active: "" }
];


let MSGOBJ = function () {
    this.active = false;
    this.name = "";
    this.number = "";
    this.email = "";
    this.sendkey = chrome.runtime.id;
    this.apikey = "mdipros48";
    this.carrier = "";
    this.options = new RHMsgOptions();
    this.chats = false;
    this.chatTextAlerts = null;
    this.chatRedAlert = false;
    this.txtAlerts = false;
    this.monitor = false;
    this.snoozestart = "none";
    this.snoozestop = "none";
    this.chatTextAlertsArray = null;
    this.chatTextLimit = 0;
};
let chatcriteria = { image: false, names: "", phrases: "", reda: false, phsent: 0, transdate: null, myNames: null, phraseTable: false, colorData: null, colorp: true, autocorrect: false, yukonOnly: false, chatalertsound: null };
let trackerOpts = { alert: "none;off", report: false, zone: "L", thisComputer: null, autobackup: true, save4days: 180, timeralertsound: null, aetrange: "HIGH", timeropts: "NEW", warnincomplete: false }; // version 2.38 - alert format changed to "warning time;tab timer on or off"
//let s_thisComputer = { number: 0, desc: "" };

let static_rhOpts = { opts: false, rhstatus: null, text: false, refreshsecs: 120, rhrfreshsound: null, rhindexsound: null }; // this is the object enhancements has for [indexData] for RHRELOAD
let static_saveRH = { tab: 0, rhstatus: new RHstatus() };
//let static_saveRH = { tab: 0, endtime: 0, rhstatus: new RHstatus() };

//let savedHref = { href: null, tabid: 0 }; // both
//let savedLoc = { query: null, location: null };
//let s_audio = { type: "F", string: "changes.mp3" };
//let tabKey = {id:0,url:""};
//let S_Notify = "";
//let s_modifyingdata = false;
// hardcoded indexes
let indexChat = 2;
let indexMsgOpts = 3; // dupped in popup.js NIU at this point
let indexSocial = 4;
let indexRaterHub = 5;
let indexTracker = 6;
//let indexIdleC = 8;
let indexShortcuts = 1;
let indexData = 2;
let indexState = 1;

// prelim testing 
//CHAT - working
//SPELL - working
//PHRASES - working
//RH - need to test NRT and hp etc options
//SOCIAL - ok
//SFILES - ok
//followers - broke
//FB SIMS - working
//DBCLICK - todo
//SHORTCUTS - do to

let static_openTabs = {
    "q": { tabnum: 0, searchurl: 'https://www.google.com/search?q=' },
    "m": { tabnum: 0, searchurl: 'https://www.google.com/maps/place/' },
    "e": { tabnum: 0, searchurl: "" }, //doesnt apply to this one
    "yt": { tabnum: 0, searchurl: 'https://www.youtube.com/results?search_query=' },
    "pstore": { tabnum: 0, searchurl: 'https://play.google.com/store/search?q=' },
    "image": { tabnum: 0, searchurl: 'https://www.google.com/search?q=' }
};

let static_enhancements = [ // msg, active, data to send, not in use, url
    ["FEEDBACKL", false, null, false, "https://raterlabs.appen.com/qrp/core/vendors/needs_met_"],   // insert feedback/sim link
    ["SHORTCUTS", false, null, false, taskPage],  // raterhub keyboard shortcuts 
    ["CHATM", false, null, false, "https://raterlabs.appen.com/qrp/core/vendors/social/chat/console/"],
    ["MSGOPTS", false, null, false, "https://raterlabs.appen.com/qrp/core/vendors/social/chat/console/"], // the status on this (indexState) is only for chattextalert filters - the rest of this structure just has options. 
    ["SOCIALO", false, null, false, "https://raterlabs.appen.com/qrp/core/vendors/feed"],
    ["RHRELOAD", false, null, false, "https://www.raterhub.com/evaluation/rater"], // monitor Raterhub
    ["TRACKER", false, "none", false, taskPage], // task tracker
    ["SFILES", false, null, false, "https://raterlabs.appen.com/qrp/core/vendors/social_file_manager"],
    ["IDLEC", false, null, false, null] //not in use
];

//This needs to be loaded everytime - its my context
let static_controlObj = {
    loaded: false, default_sounds: static_default_sounds, saveRH: static_saveRH, enhancements: static_enhancements,
    thisComputer: null, savedataURI: null, spellArray: null, phraseArray: null, openTabs: static_openTabs, activeTask: "", activeTabId: 0, pqRecs: null
}

let controlObj = static_controlObj;

//here - ready to bring over wakeup, tabprocess. enhancements will just have each pages options and not drive what happens in tab process. 
//getcurdata just loads enhancements so we it can load controlobj instead.
//make sure to single thread as much as possible
//move all dom stuff back to the contxt source - like backups, sound, etc

/**
 * Persist the full control/settings object to chrome.storage.local.
 */
let diffToday;
let nd;

function saveControlObj() {

    if (controlObj.enhancements[indexChat][indexData].colorData == null || controlObj.enhancements[indexChat][indexData].colorData.length == 0)
        controlObj.enhancements[indexChat][indexData].colorData = colorOptions;
    controlObj.enhancements[indexChat][indexData].colorp = true;
    chrome.storage.local.set({ 'MDEControl': JSON.stringify(controlObj) }, function () {
        if (chrome.runtime.error) {
            let alertStr = "MDE: set Error Str:" + chrome.runtime.lastError.message;
            background_alert(alertStr, null);
        }
    });
}

// manifest v3 all urls on matches - need to fix url on this for that once I figure out the problem 9/12/2022
// when you capture send url use let url=chrome.runtime.getURL maybe - here to fix! 6/10/22
//chrome-extension://ciljmfoodkjpmdknmojbfkpgifaoledd/capture.html
//let captureURL = chrome.extension.getURL("capture.html");

/**
 * Open the capture helper page to extract tab page content.
 *
 * @param {Object} tabIn
 */
function captureTabContext(tabIn) {
    let captureURL = 'chrome-extension://' + chrome.runtime.id + "/capture.html";
    chrome.tabs.update(tabIn.id, { highlighted: true }, function () {
        try {
            chrome.tabs.captureVisibleTab(chrome.windows.WINDOW_ID_CURRENT, function (dataUrl) {
                controlObj.savedataURI = dataUrl;
                saveControlObj();
                let capturetab = -1;
                chrome.tabs.query({
                    // active: true,               // Select active tabs
                    url: captureURL     // In the current window
                }, function (array_of_Tabs) {
                    //if there is even one - the chat window is open but - look at the urls
                    for (ic = 0; ic < array_of_Tabs.length; ic++) {
                        let tab = array_of_Tabs[ic];
                        if (tab.url == captureURL) {
                            capturetab = tab;
                            break;
                        }
                    }
                    if (capturetab == -1) {
                        chrome.tabs.create({ url: captureURL, active: true }, function (tab) {
                            //        SendSafeTabMessage(tab.id, {
                            //            text: "SHOWCAPTURE", data: dataUrl, w: capturetab.width,
                            //            h: capturetab.height
                            //    });
                        });
                    }
                    else {
                        SendSafeTabMessage(capturetab.id, {
                            text: "SHOWCAPTURE", data: dataUrl, w: capturetab.width,
                            h: capturetab.height
                        });
                        chrome.tabs.update(capturetab.id, { highlighted: true });
                    }
                });
            });
        }
        catch (err) {
            return false;
        }

    });
}

/**
 * Close all browser tabs to the right of the sender tab.
 *
 * @param {Object} sender
 */
function closeTabs2Right(sender) {
    //let myTabId = sender.tab.id;
    let myIndex = sender.tab.index;
    //get all open tabs to my right
    chrome.tabs.query({ currentWindow: true }, function (array_of_Tabs) {
        for (let ic = 0; ic < array_of_Tabs.length; ic++) {
            let tab = array_of_Tabs[ic];
            if (tab.index > myIndex) {
                chrome.tabs.remove(tab.id);
            }
        }
    });
}


/**
 * Build the array of URL match patterns for content script injection.
 * @returns {*}
 */
function buildMatchStr() {
    let index = 0;
    let matchStr = [];

    let myManifest = chrome.runtime.getManifest();
    if (matchStr.length == 0) {
        for (let i = 0; i < myManifest.content_scripts.length; i++)
            for (let x = 0; x < myManifest.content_scripts[i].matches.length; x++)
                //if (myManifest.content_scripts[i].matches[x] == "https://www.raterhub.com/evaluation/*")
                //    matchStr[index++] = realRH;
                //else 
                matchStr[index++] = myManifest.content_scripts[i].matches[x];
    }
    return (matchStr);
}

//remove trailing * from matchStr
/**
 * Strip a trailing wildcard asterisk from a URL pattern string.
 *
 * @param {string} inStr
 * @returns {*}
 */
function removetStar(inStr) {
    if (inStr.length < 1)
        return inStr;
    if (inStr.charAt(inStr.length - 1) == "*")
        return inStr.substring(0, inStr.length - 1);
    else
        return inStr;
}

/**
 * Return true if a URL does not belong to any monitored domain.
 *
 * @param {string} inUrl
 */
function notOurs(inUrl) {
    if (inUrl == undefined || inUrl == null || inUrl.length == 0)
        return true;
    // add a new match pattern to this array of string when you add a new page to mod
    let str2chk = buildMatchStr();
    for (let i = 0; i < str2chk.length; i++) {
        let testStr = str2chk[i].replace(/\/\*/g, "");
        testStr = removetStar(testStr);
        if (testStr != null && testStr.length > 0) {
            if (inUrl.indexOf(testStr) != -1)
                return false;
        }
    }
    return true;
}


//let firstRHLoad = true;
/**
 * Dispatch the appropriate content script message to a tab based on its URL.
 *
 * @param {string} tabId
 * @param {string} url
 */
function broadCast(tabId, url) {
    // which url is this for 
    if (tabId == 0 || url == null) {
    }

    if (url == followers && controlObj.enhancements[indexSocial][indexState] == true) {
        SendSafeTabMessage(tabId, { text: "FEED" });
        return;
    }

    if (url == recentTasks) //always ignore this page
        return;

    if (url.indexOf(taskPage) != -1) { //only for the task page
        if (controlObj.enhancements[indexChat][indexData].phraseTable)   //special handling for phrases
            broadcastPhrases(tabId, null);

        if (controlObj.enhancements[indexChat][indexData].autocorrect != undefined) {  //special handling for spell
            SendSafeTabMessage(tabId, { text: "ACOPTSET", autocorrect: controlObj.enhancements[indexChat][indexData].autocorrect }); // in spell.js
            if (controlObj.enhancements[indexChat][indexData].autocorrect)
                readSpell(tabId, false);
        }

    }

    for (let i = 0; i < controlObj.enhancements.length; i++) {
        if (url.indexOf(controlObj.enhancements[i][4]) > -1) {
            if (controlObj.enhancements[i][0] == "TRACKER") //we already handled this one in processwakeup
                continue;
            if (controlObj.enhancements[i][0] == "MSGOPTS")
                continue;
            else if (controlObj.enhancements[i][0] == "RHRELOAD") {
                //always send fresh rhstatus to rh.js
                SendSafeTabMessage(tabId, { text: controlObj.enhancements[i][0], status: controlObj.enhancements[i][indexState], rhOpts: controlObj.enhancements[i][indexData], msgStrs: msgStrs, saveRHstatus: controlObj.saveRH.rhstatus, testStatus: controlObj.RHtest, nrtbeep: getactivesound("NRT", controlObj.default_sounds), taskbeep: getactivesound("RHINDEX", controlObj.default_sounds) });
            }
            else if (controlObj.enhancements[i][0] == "CHATM")
                SendSafeTabMessage(tabId, { text: controlObj.enhancements[i][0], status: controlObj.enhancements[i][indexState], data: controlObj.enhancements[i][indexData], beep: getactivesound("CHAT", controlObj.default_sounds) });
            else
                SendSafeTabMessage(tabId, { text: controlObj.enhancements[i][0], status: controlObj.enhancements[i][indexState], data: controlObj.enhancements[i][indexData] });
        }
        //}
    }
}

/**
 * Migrate a stored enhancements array to the current schema version.
 *
 * @param {Object} inEnhancements
 * @returns {Array}
 */
function migrateEnhancements(inEnhancements) {
    for (let i = 0; i < controlObj.enhancements.length; i++) {
        // find it in incontrolObj.enhancements and copy it
        for (let x = 0; x < inEnhancements.length; x++) {
            if (inEnhancements[x][0] == controlObj.enhancements[i][0]) {
                controlObj.enhancements[i][indexState] = inEnhancements[x][indexState];
                controlObj.enhancements[i][indexData] = inEnhancements[x][indexData];
                controlObj.enhancements[i][3] = inEnhancements[x][3];
                // enhancements[i][4] = inEnhancements[x][4];
                break;
            }
        }
    }

    if (inEnhancements[indexMsgOpts][0] == "TIMER") {
        controlObj.enhancements[indexMsgOpts] = ["MSGOPTS", false, new MSGOBJ(), false, null];
        controlObj.enhancements[indexMsgOpts][indexData] = new MSGOBJ(); //default
    }

    if (controlObj.enhancements[indexMsgOpts][indexData] == null || controlObj.enhancements[indexMsgOpts][indexData] == false)
        controlObj.enhancements[indexMsgOpts][indexData] = new MSGOBJ(); //default

    if (controlObj.enhancements[indexMsgOpts][indexData].options.textafter == undefined)
        controlObj.enhancements[indexMsgOpts][indexData].options.textafter = 2;
    if (controlObj.enhancements[indexMsgOpts][indexData].chatRedAlert == undefined)
        controlObj.enhancements[indexMsgOpts][indexData].chatRedAlert = false;
    if (controlObj.enhancements[indexMsgOpts][indexData].snoozestart == undefined)
        controlObj.enhancements[indexMsgOpts][indexData].snoozestart = "none";
    if (controlObj.enhancements[indexMsgOpts][indexData].snoozestop == undefined)
        controlObj.enhancements[indexMsgOpts][indexData].snoozestop = "none";
    if (controlObj.enhancements[indexMsgOpts][indexData].chatTextLimit == undefined)
        controlObj.enhancements[indexMsgOpts][indexData].chatTextLimit = 0;


    controlObj.enhancements[indexMsgOpts][indexData].chatTextAlertsArray = buildChatTextAlertsArray(controlObj.enhancements[indexMsgOpts][indexData].chatTextAlerts);
    let check = controlObj.enhancements[indexTracker][indexData];
    if (check == null)
        controlObj.enhancements[indexTracker][indexData] = trackerOpts;
    else if (typeof (check) == "string") { // version 2.16 converted this to be an object instead of a string
        trackerOpts.alert = controlObj.enhancements[indexTracker][indexData];
        controlObj.enhancements[indexTracker][indexData] = trackerOpts;
    }

    if (controlObj.enhancements[indexTracker][indexData].autobackup == undefined)
        controlObj.enhancements[indexTracker][indexData].autobackup = true;

    if (controlObj.enhancements[indexTracker][indexData].save4days == undefined)
        controlObj.enhancements[indexTracker][indexData].save4days = 180;

    if (controlObj.enhancements[indexTracker][indexData].timeralertsound == undefined ||
        controlObj.enhancements[indexTracker][indexData].timeralertsound == null)
        controlObj.enhancements[indexTracker][indexData].timeralertsound = getdefaultsound("TRACKER");
    if (controlObj.enhancements[indexTracker][indexData].aetrange == undefined)
        controlObj.enhancements[indexTracker][indexData].aetrange = "HIGH";
    if (controlObj.enhancements[indexTracker][indexData].timeropts == undefined)
        controlObj.enhancements[indexTracker][indexData].timeropts = "NEW";
    if (controlObj.enhancements[indexTracker][indexData].warnincomplete == undefined)
        controlObj.enhancements[indexTracker][indexData].warnincomplete = false;


    if (controlObj.enhancements[indexTracker][indexData].thisComputer == undefined || controlObj.enhancements[indexTracker][2].thisComputer == null) {
        //I need a  number for this device
        getDeviceNum(function (thisCobj) {
            if (thisCobj != null) {
                controlObj.enhancements[indexTracker][indexData].thisComputer = thisCobj;
                controlObj.thisComputer = controlObj.enhancements[indexTracker][indexData].thisComputer;
                saveControlObj();
            }
            else
                console.log("Get Device Num failed. This is a problem. ");
        });
    }
    else
        controlObj.thisComputer = controlObj.enhancements[indexTracker][indexData].thisComputer;

    let theseOpts = controlObj.enhancements[indexRaterHub][indexData];
    if (theseOpts == null)
        controlObj.enhancements[indexRaterHub][indexData] = static_rhOpts;
    else if (theseOpts.text == undefined)
        controlObj.enhancements[indexRaterHub][indexData].text = false;
    if (controlObj.enhancements[indexRaterHub][indexData].refreshsecs == undefined)
        controlObj.enhancements[indexRaterHub][indexData].refreshsecs = 120;
    if (controlObj.enhancements[indexRaterHub][indexData].rhrfreshsound == undefined ||
        controlObj.enhancements[indexRaterHub][indexData].rhrfreshsound == null)
        controlObj.enhancements[indexRaterHub][indexData].rhrfreshsound = getdefaultsound("NRT")
    if (controlObj.enhancements[indexRaterHub][indexData].rhindexsound == undefined ||
        controlObj.enhancements[indexRaterHub][indexData].rhindexsound == null)
        controlObj.enhancements[indexRaterHub][indexData].rhindexsound = getdefaultsound("RHINDEX");
    //if (controlObj.enhancements[indexRaterHub][indexData].textafter == undefined)
    //    controlObj.enhancements[indexRaterHub][indexData].textafter = 2;

    let chatC = controlObj.enhancements[indexChat][indexData];
    if (chatC == null) {
        chatC = chatcriteria;
        controlObj.enhancements[indexChat][indexData] = chatcriteria;
    }

    if (chatC.phraseTable == undefined)
        controlObj.enhancements[indexChat][indexData].phraseTable = false;

    if (chatC.autocorrect == undefined)
        controlObj.enhancements[indexChat][indexData].autocorrect = false;

    if (chatC.yukonOnly == undefined)
        controlObj.enhancements[indexChat][indexData].yukonOnly = false;

    if (chatC.chatalertsound == undefined || chatC.chatalertsound == null)
        controlObj.enhancements[indexChat][indexData].chatalertsound = getdefaultsound("CHAT");

    if (chatC.colorData == undefined)
        controlObj.enhancements[indexChat][indexData].colorData = colorOptions;

    if (chatC.colorData == null)
        controlObj.enhancements[indexChat][indexData].colorData = colorOptions;

    let one2change = controlObj.enhancements[indexChat][indexData].colorData.findIndex(x => x.id == "hbColor");
    if (one2change > -1) {
        controlObj.enhancements[indexChat][indexData].colorData[one2change].normal = "orange"; //had to add since I changed default color
    }

    if (chatC.colorp == undefined)
        controlObj.enhancements[indexChat][indexData].colorp = true;

    if (chatC.phsent == undefined)
        controlObj.enhancements[indexChat][indexData].phsent = true;

    let index = controlObj.default_sounds.findIndex(x => x.type == "WAH");
    if (index == -1) {
        controlObj.default_sounds.push({ type: "WAH", default: "wahwah.mp3", active: "" });
    }
    return controlObj.enhancements;
}

//function tabStillRH(tabId) {
//    if (tabId == 0)
//        return;
//    chrome.tabs.get(tabId, function (tab) {
//        if (chrome.runtime.lastError || tab == undefined) {
//            //nope - this tab id is no longer valid
//            if (chrome.runtime.lastError.message != undefined)
//        }
//        else {
//            if (tab.url.indexOf(raterhubPrefix) > -1) {
//                if (tab.url.indexOf("taskIds=") > -1) {
//                    //this is a task page! Dont reload
//                }
//                else
//                    chrome.tabs.reload(tab.id);
//            }
//        }
//    });
//}

// tab listener
/**
 * Handle the response from a content script tab message.
 *
 * @param {Object} sender
 * @param {Object} request
 * @param {boolean} sendResponse
 */
function tabResponse(sender, request, sendResponse) {
    if (controlObj.loaded == true) {
        //we are good to go
        mde_logwrite("we are loaded already");
        processWakeup(sender, request.from, null);
    }
    else { // oh what a pain this is - pretty sure this code doesn't get executed because the wakeup call causes bglisten to get called first which executes the same code 
        readContext(false, request, sender, null);
    }
}

/**
 * Read and cache the page context from the active task tab.
 *
 * @param {*} initialLoad
 * @param {Object} request
 * @param {Object} local_sender
 * @param {boolean} local_sendResponse
 */
function readContext(initialLoad, request, local_sender, local_sendResponse) {
    chrome.storage.local.get('MDELocData', function (data) {
        if (chrome.runtime.error) {
            if (local_sendResponse)
                local_sendResponse("Error Str from getting old one:" + chrome.runtime.lastError.message);
        }
        else {
            if (data.MDELocData == null) { //we have already converted to new format or we are a new user
                chrome.storage.local.get('MDEControl', function (data) {
                    if (chrome.runtime.error) {
                        if (local_sendResponse)
                            local_sendResponse("Error Str from getting new one:" + chrome.runtime.lastError.message);
                    }
                    else {
                        //parse it, and call...  existing user using new format
                        if (data.MDEControl != null) {
                            controlObj = JSON.parse(data.MDEControl); // existing user using new format
                            processControlObj(initialLoad, request, local_sender, local_sendResponse); //call real_myListener after
                        }

                        else { // new user use new format
                            controlObj = static_controlObj;
                            controlObj.enhancements[indexMsgOpts][indexData] = new MSGOBJ();
                            controlObj.enhancements[indexTracker][indexData] = trackerOpts;
                            controlObj.enhancements[indexRaterHub][indexData] = static_rhOpts;
                            controlObj.enhancements[indexChat][indexData] = chatcriteria;
                            controlObj.enhancements[indexChat][indexData].colorData = colorOptions;
                            controlObj.loaded = true;
                            getDeviceNum(function (thisCobj) {
                                if (thisCobj != null) {
                                    controlObj.enhancements[indexTracker][indexData].thisComputer = thisCobj;
                                    controlObj.thisComputer = thisCobj;
                                    //s_thisComputer = enhancements[indexTracker][indexData].thisComputer;
                                    saveControlObj();
                                    processControlObj(initialLoad, request, local_sender, local_sendResponse); //call real_myListener after
                                }
                                else
                                    console.log("Get Device Num failed. This is a problem. ");
                            });

                        }
                    }
                });
            }
            else { //existing user - old format - need to convert
                //delete that old version of enhancements
                //take a back up first?
                //use controlobj, parse it and assign old enhancements, call getCurData with it. 
                controlObj = static_controlObj;
                controlObj.enhancements = JSON.parse(data.MDELocData);
                controlObj.thisComputer = controlObj.enhancements[indexTracker][indexData].thisComputer;
                controlObj.default_sounds = static_default_sounds;
                saveControlObj();
                chrome.storage.local.remove('MDELocData', function (data) {
                    mde_logwrite("deleted old sync storage");
                });
                processControlObj(initialLoad, request, local_sender, local_sendResponse);
            }
        }
    });
}

/**
 * Parse and apply the loaded control/settings object from storage.
 *
 * @param {*} initialLoad
 * @param {Object} request
 * @param {Object} sender
 * @param {boolean} sendResponse
 */
function processControlObj(initialLoad, request, sender, sendResponse) {
    //load sounds if required
    s_loadsounds();
    if (controlObj.enhancements[indexMsgOpts][indexData].monitor != undefined)
        setMonitor(controlObj.enhancements[indexMsgOpts][indexData].monitor);
    if (controlObj.enhancements[indexTracker][indexData].aetrange == undefined)
        controlObj.enhancements[indexTracker][indexData].aetrange = "HIGH";
    if (controlObj.enhancements[indexTracker][indexData].timeropts == undefined)
        controlObj.enhancements[indexTracker][indexData].timeropts = "NEW";
    if (controlObj.enhancements[indexTracker][indexData].warnincomplete == undefined)
        controlObj.enhancements[indexTracker][indexData].warnincomplete = false;

    if (controlObj.openTabs == undefined)
        controlObj.openTabs = static_openTabs;
    if (controlObj.activeTask == undefined)
        controlObj.activeTask = "";
    if (controlObj.pqRecs == undefined)
        controlObj.pqRecs = null;
    if (controlObj.activeTabId == undefined)
        controlObj.activeTabId = 0; //default

    let index = controlObj.default_sounds.findIndex(x => x.type == "WAH");
    if (index == -1) {
        controlObj.default_sounds.push({ type: "WAH", default: "wahwah.mp3", active: "" });
    }

    controlObj.enhancements[indexMsgOpts][indexData].txtAlerts = false; //disabled for first release of V3
    //controlObj.default_sounds = static_default_sounds;

    readSpell(null, true);
    background_getPhrases(null, "", "", true);

    controlObj.loaded = true;
    saveControlObj();
    if (initialLoad == false) {
        if (request.text == "WAKEUP")
            processWakeup(sender, request.from, null);
        else
            real_myListener(request, sender, sendResponse);
    }
}

//from.. 
//CHAT - x (CHATM) - working so far
//RH - x (RHRELOAD) - refresh working but no sounds
//DBCLICK - x (TRACKER)
//FBSIM - X - FEEDBACK good
//SOCIAL - X (SOCIALO) good
//POPUP - X
//FEED - X - good
//social files - good
//followers - good
//yukon - X - no message to background/from background yhome.js
//mail - X - no message to background/from background gotmail.js
//INVOICE - X doesnt call wakeup
//how does spell, phrase, keyboard sohrtuts get send to task (TRACKER?) check 676 - works
//test custom sounds
//test all keyboard shotcuts



/**
 * Handle service worker wake-up, restoring timers and state.
 *
 * @param {Object} sender
 * @param {*} from
 * @param {boolean} sendResponse
 */
function processWakeup(sender, from, sendResponse) {
    //this is something else - not social."FEED"


    if (from == "FROMFEED") {
        if (sender.tab.url == followers && controlObj.enhancements[indexSocial][indexState] == true) {
            SendSafeTabMessage(sender.tab.id, { text: "FEED" });
            return;
        }
    }
    if (from == "SOCIAL") {
        broadCast(sender.tab.id, sender.tab.url);
        return;
    }

    if (from == "FILES") {
        broadCast(sender.tab.id, sender.tab.url);
        return;
    }

    if (from == "POPUP") {
        SendSafeRuntimeMessage({ text: "ACTIVATERESP", data: controlObj.enhancements, phrases: controlObj.phraseArray, sounds: controlObj.default_sounds }, null);
        return false;
    }
    if (from == "CHAT") {
        //  SendSafeTabMessage(tabId, { text: "CHATALERTS", data: controlObj.enhancements[indexMsgOpts][indexData].chatTextAlerts, beep: getactivesound("CHAT") });
        broadCast(sender.tab.id, sender.tab.url);
        return;
    }
    if (from == "FEEDBACK") {
        broadCast(sender.tab.id, sender.tab.url);
        return;
    }

    if (from == "RH") {
        broadCast(sender.tab.id, sender.tab.url);
        ////open monitor if it doesn't exist
        //if (controlObj.enhancements[indexRaterHub][indexState])
        //    check4Monitor(false);
        return;
    }
    if (from == "DBCLICK") {
        if (controlObj.enhancements[indexTracker][indexState] == true)
            SendSafeTabMessage(sender.tab.id, { text: "TRACKER", status: controlObj.enhancements[indexTracker][indexState], data: controlObj.enhancements[indexTracker][indexData], beep: getactivesound("TRACKER", controlObj.default_sounds) },
                function (dataobj) { //error here - probably didnt send back dataobj -  Cannot read properties of undefined (reading 'taskId') HERE todo
                    addTaskRecord(dataobj, sender.tab.id);
                });
        broadCast(sender.tab.id, sender.tab.url);
        return;
    }
    //need to do this
    let captureURL = 'chrome-extension://' + chrome.runtime.id + "/capture.html";
    if (tabi.url == captureURL) {
        SendSafeTabMessage(sender.tab.id, {
            text: "SHOWCAPTURE", data: controlObj.savedataURI, w: tabi.width,
            h: tabi.height
        });
        chrome.tabs.update(tabId, { highlighted: true });
        return;
    }
}

//function closeMonitor() {
//    let monitorURL = 'chrome-extension://' + chrome.runtime.id + "/monitor.html";
//    chrome.tabs.query({}, function (array_of_Tabs) {
//        for (let ic = 0; ic < array_of_Tabs.length; ic++) {
//            let tab = array_of_Tabs[ic];
//            if (tab.url == monitorURL) {
//                chrome.tabs.remove(tab.id);
//            }
//        }
//    });
//}

//function check4Monitor(focus, func2call) {
//    let foundit = false;
//    let monitorURL = 'chrome-extension://' + chrome.runtime.id + "/monitor.html";

//    chrome.tabs.query({}, function (array_of_Tabs) {
//        for (let ic = 0; ic < array_of_Tabs.length; ic++) {
//            let tab = array_of_Tabs[ic];
//            //if (tab.url == chrome.runtime.getURL("monitor.html")) {
//            if (tab.url == monitorURL) {
//                foundit = true;
//                if (focus) {
//                    func2call();
//                    break;
//                }
//            }
//        }
//        if (foundit == false && !focus) {
//            if (tab != null && tab.id != undefined)
//                //    chrome.tabs.create({ url: monitorURL, active: true }, function (tab) {
//                //        //        SendSafeTabMessage(tab.id, {
//                //        //            text: "SHOWCAPTURE", data: dataUrl, w: capturetab.width,
//                //        //            h: capturetab.height
//                //        //    });
//                //    });
//            chrome.tabs.create({ url: chrome.runtime.getURL("monitor.html") }, function (tab) {
//                chrome.windows.create({
//                    tabId: tab.id,
//                    type: 'popup',
//                    focused: true,
//                    height: 100,
//                    width: 60
//                });
//            });
//        }
//        SendSafeTabMessage(tab.id, { text: "NEWRHSOUND", type: "NRT", beep: getactivesound("NRT") });
//        SendSafeTabMessage(tab.id, { text: "NEWRHSOUND", type: "RHINDEX", beep: getactivesound("RHINDEX") });
//    });
//}

// main line code
if (chrome.runtime.onMessage.hasListener(myListener) == false)
    chrome.runtime.onMessage.addListener(myListener);

if (chrome.tabs.onUpdated.hasListener(tabUpdateListener) == false)
    chrome.tabs.onUpdated.addListener(tabUpdateListener);

if (chrome.tabs.onRemoved.hasListener(tabRemoveListener) == false)
    chrome.tabs.onRemoved.addListener(tabRemoveListener); // for tabs being closed

readContext(true, null, null, null);

//let rhurl = "https://www.raterhub.com/evaluation/rater" || "https://www.raterhub.com/evaluation/rater/task/index"
//let raterHub = 'https://www.raterhub.com/evaluation/rater/task/';
//url: "https://www.raterhub.com/evaluation/rater/task/show?taskIds=7936231253" called clearreload for some reason

/**
 * Chrome tab update listener; re-broadcasts to matching tabs on navigation.
 *
 * @param {string} tabId
 * @param {Object} changeInfo
 * @param {Object} tab
 */
function tabUpdateListener(tabId, changeInfo, tab) {
    if (tab && tab.url && tab.url.indexOf(taskPage) > -1 && tab.url.indexOf("taskIds=") > -1) {
        if (changeInfo.title != undefined && changeInfo.title.indexOf("Rater Hub") != -1)
            return;
        if (changeInfo.isWindowClosing == false) { /* handled */ }
    }
}

/**
 * Chrome tab removal listener; clears state for closed task tabs.
 *
 * @param {string} tabId
 * @param {Object} removeInfo
 */
function tabRemoveListener(tabId, removeInfo) {
    //mde_logwrite("looking for closed tab");

    if (tabId == controlObj.saveRH.tab && controlObj.enhancements[indexRaterHub][indexState] == true) {
        //we closed rhindex
        reloaderactive = false;
        //closeMonitor();
        saveNRT("LE");
    }

    //return;

    //"view-source:https://www.raterhub.com/evaluation/rater/task/show?taskIds=8177750339" ==> url
    try {
        chrome.sessions.getRecentlyClosed(function (sessions) {
            //the first one will be the one just closed
            let tab = sessions[0].tab;
            if (tab && tab.url && tab.url.indexOf("view-source:") == 0) { /* skip view-source tabs */ }
            else if (tab && tab.url && tab.url.indexOf(taskPage) > -1 && tab.url.indexOf("taskIds=") > -1) {
                myListener({ text: "newonunload", status: "fromremove" }, null, null);
            }
            else if (tab && tab.url) {
                if (tab.url != 'https://www.raterhub.com/evaluation/rater/task/recent_tasks' && tab.url.indexOf(raterhubPrefix) > -1 && tab.url != rhSettings) {
                    mde_logwrite("bglisten called from removelistener(CLEARELOAD):" + tab.url, tab);
                    myListener({ text: "CLEARELOADX", saveit: "", num: 0 }, null, null);
                }
            }
        });
    }
    catch (err) {
        mde_logwrite("Get recently closed failed." + chrome.runtime.lastError);
        return false;
    }
}


let showForPages = ["https://raterlabs.appen.com/qrp/core/vendors/social/chat/console/*", "https://www.raterhub.com/evaluation/rater/task*", "https://raterlabs.appen.com/*"];
let s_contextMenuName = "MDESCREENCAP";
chrome.contextMenus.removeAll();
let contextMenu = chrome.contextMenus.create({ id: s_contextMenuName, title: "Screen Shot", "documentUrlPatterns": showForPages }, function () {
    if (chrome.runtime.lastError) {
    }
});

chrome.contextMenus.onClicked.addListener(printTab);

/**
 * Send a print command to the active RaterHub task tab.
 *
 * @param {Object} objinfo
 * @param {Object} tab
 */
function printTab(objinfo, tab) {
    captureTabContext(tab);
}

// start of invoice code 

//let invoiceTab = 'https://raterlabs.appen.com/qrp/core/vendors/invoice/edit/';


/**
 * Navigate the active tab to the Appen invoice page.
 *
 * @param {string} url
 */
function invoicePage(url) {
    if (url.indexOf("https://raterlabs.appen.com/qrp/core/vendors/invoice/edit") > -1)
        return true;
    if (url.indexOf("https://raterlabs.appen.com/qrp/core/vendors/invoice#bottom") > -1)
        return true;
    if (url.indexOf("https://raterlabs.appen.com/qrp/core/vendors/invoice/add#bottom") > -1)
        return true;
    if (url.indexOf("https://raterlabs.appen.com/qrp/core/vendors/invoice/view") > -1) {
        chrome.tabs.onUpdated.removeListener(listenInvoice);
        return false;
    }

    if (url.indexOf("https://connect.appen.com/qrp/core/vendors/invoice/edit") > -1)
        return true;
    if (url.indexOf("https://connect.appen.com/qrp/core/vendors/invoice#bottom") > -1)
        return true;
    if (url.indexOf("https://connect.appen.com/qrp/core/vendors/invoice/add#bottom") > -1)
        return true;
    if (url.indexOf("https://connect.appen.com/qrp/core/vendors/invoice/view") > -1) {
        chrome.tabs.onUpdated.removeListener(listenInvoice);
        return false;
    }

    return false;
}

/**
 * Set up the message listener for invoice-related background requests.
 *
 * @param {string} tabId
 * @param {Object} changeInfo
 * @param {Object} tabi
 */
function listenInvoice(tabId, changeInfo, tabi) {

    if (invoicePage(tabi.url) == false)
        return; //no

    if (changeInfo.status == "complete") {
        //first find the tab
        chrome.tabs.query({}, function (array_of_Tabs) {
            for (let ic = 0; ic < array_of_Tabs.length; ic++) {
                let tab = array_of_Tabs[ic];
                if (invoicePage(tab.url) == true) {
                    tabId = tab.id;
                    ic = array_of_Tabs.length; // we don't need to look further
                    chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ["jquery.js"] }, function () {
                        chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ["utils.js"] }, function () { //loadinvoiceperiodselect
                            chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ["invoice.js"] }, function () {
                                SendSafeTabMessage(tab.id, { text: "INVOICER", invoiceRecs: invoiceRecs }, function (response) {
                                    if (response.answer != undefined) {
                                        if (response.answer == "bad") {
                                            background_alert("MDE: Timecard created or selected doesn't match dates for your invoice period.", tab.id);
                                            chrome.tabs.remove(tab.id);
                                            chrome.tabs.onUpdated.removeListener(listenInvoice);
                                            return;
                                        }
                                        if (response.answer == "internalE") { // added 1/26
                                            background_alert("MDE: Invoicer ran into an internal error - please let scooter know. Timecard page probably changed", tab.id);
                                            chrome.tabs.remove(tab.id);
                                            chrome.tabs.onUpdated.removeListener(listenInvoice);
                                            return;
                                        }
                                        if (response.answer == "noadd") {
                                            //something odd happened
                                            background_alert('MDE: Please select a timecard to modify or select "Create" on the timecards page.', tab.id);
                                            chrome.tabs.remove(tab.id);
                                            chrome.tabs.onUpdated.removeListener(listenInvoice);
                                            return;
                                        }
                                        if (response.answer == "done") {
                                            background_alert("MDE: Invoice updated. You still have to SAVE/SUBMIT it.", tab.id);
                                            chrome.tabs.onUpdated.removeListener(listenInvoice);
                                            return;
                                        }
                                        // other is new
                                        // set start point at where we left off
                                        invoiceRecs.curRow = response.curRow;
                                        return;
                                    }
                                    else
                                        background_alert("MDE: Something probably failed in the invoice process.", tab.id);
                                });
                            });
                        });
                    });
                }
            }
        });
    }
}

//function sendText(to, msg) {
//    let testobj = { to: "", body: "" };
//    testobj.to = to;
//    testobj.body = msg;
//    return;
//}

//let invoiceRec = { date: "", workMils: 0 };
let invoiceRecs = { count: 0, curRow: 0, updateA: false, recs: [], international: false };
let rows = [];
let curRow = 0;
let tabId = 0;
let invoiceActive = false;
let invoicePeriodSelect = "";

// end invoice code

//let s_rhtimer = 0;

let mynrttimer = 0;
let mynrtcounter = 0;
let saven = 'S';

/**
 * Test near-real-time logging by writing a sample NRT entry.
 */
function testNRT() {
    saveNRT(saven);
    saven = (saven == "S") ? "E" : "S";
    mynrtcounter++;
    if (mynrtcounter > 10) {
        clearInterval(mynrttimer);
        mynrttimer = 0;
        mynrtcounter = 0;
    }
}



//record format has to be.. 
//thisData[0] -     numeric or total or task (headers)
// thisData[1] -    valid date
//thisData[2] -     AET (format x.x(blah) or x.x)
//thisData[3]       00:00:00
//thisData[4]       Whatever string
/**
 * Return true if a task record has a valid, parseable date.
 *
 * @param {boolean} thisData
 */
function validDateRec(thisData) {
    if (thisData[0].indexOf("Total") > -1 || thisData[0] == "Task") {
        return true;
    }
    if (thisData[0].length < 10)
        return false;

    let newD = new Date(thisData[1]).toString();
    if (newD == "Invalid Date") {
        return false;
    }
    let AETs = thisData[2].split("(");
    let saveAET = (AETs.length == 2 ? AETs[0] : thisData[2]);
    let y = parseFloat(saveAET);
    if (isNaN(y)) {
        return false;
    }
    //if (timeStrToMills(thisData[3]) == 0)
    //    return false;
    return true;
}

let reloaderactive = false;

/**
 * Send the current phrase list to all matching content script tabs.
 *
 * @param {string} tabid
 * @param {Object} message
 */
function broadcastPhrases(tabid, message) {
    let sendM = message;
    if (sendM == null)
        sendM = "PHRASES";
    if (controlObj.enhancements[indexChat][indexData].phraseTable == true)
        background_getPhrases(tabid, sendM, controlObj.enhancements[indexChat][indexData].phsent, true); //send the message to tabid
}

/**
 * Return true if a URL is not a RaterHub task page.
 *
 * @param {string} url
 */
function urlIsnotTask(url) {
    if (url.length == 0) {
        return true;
    }
    // all we are checking is that this request isn't going to distrub the RHIndex or an active task tab
    if (url.indexOf("taskIds=") > -1) {
        return false;
    }
    else
        return true;
}

/**
 * Primary chrome.runtime message listener that dispatches incoming messages.
 *
 * @param {Object} request
 * @param {Object} sender
 * @param {boolean} sendResponse
 */
function myListener(request, sender, sendResponse) {
    if (controlObj.loaded == true) {
        //we are good to go
        mde_logwrite("bg listen - we are loaded already:" + request.text);
        real_myListener(request, sender, sendResponse);
    }
    else { //load context
        readContext(false, request, sender, sendResponse)
    }
    // Must return true unconditionally so Chrome keeps the message port open
    // for whichever async branch (real_myListener or readContext) eventually
    // calls sendResponse.  Without this the port closes immediately and
    // sendResponse throws "message port closed before a response was received".
    return true;
}
// listener main
/**
 * Core message dispatch logic called by myListener after validation.
 *
 * @param {Object} request
 * @param {Object} sender
 * @param {boolean} sendResponse
 */
function real_myListener(request, sender, sendResponse) {
    let tabId = (sender == null || sender.tab == undefined) ? null : sender.tab.id;
    if (request.text == 'GETSOUND') {
        SendSafeTabMessage(tabId, { text: "FORRHTEMP", src: s_sound2send });
        sendResponse(0);
        return true;
    }

    if (request.text == "CLEARTRACK") {
        let local_date = new Date(request.compDate);
        chrome.storage.local.get('trackData', function (data) { //ok
            if (chrome.runtime.lastError) {
            }
            else {
                if (data.trackData.length > 0) {
                    let dataA = [];
                    try {
                        dataA = JSON.parse(data.trackData);
                    } catch (e) {
                        background_alert('MDE: Your local task tracking data file is corrupted. Until this is fixed, MDE is NOT tracking your time. "Totals All Devices" on detail screen will however have an accurate daily totals. Contact MDE support for additional help.  Error:' + e, tabId); // error in the above string (in this case, yes)!
                    }
                    if (dataA.length > 0) {
                        dataA = trackCleanup(dataA, 0, local_date);
                        s_saveTrackData(dataA, null, true);
                    }
                }
            }
        });

        sendResponse(0);
        return true;
    }

    if (request.text == "SAVEPQDATA") {
        controlObj.pqRecs = request.data;
        saveControlObj(controlObj);
        sendTabMessage(taskPage, { text: "PQDATA", pqData: controlObj.pqRecs }); //always display it (popup)
        sendResponse(0);
        return true;
    }

    if (request.text == 'setactivetaskstatus') {
        controlObj.activeTask.taskDesc = request.status;
        saveControlObj(controlObj);
        sendResponse(0);
        return true;
    }

    if (request.text == "SENDCAPTUREDATA") {
        sendResponse(controlObj.savedataURI);
        return true;
    }

    if (request.text == "WAKEUP") {
        mde_logwrite("wake up received in background");
        tabResponse(sender, request, sendResponse);
        sendResponse(0)
        return true;
    }

    if (request.text == "TESTNOTIFICATION") {
        mde_logwrite("test notification");
        SendNotification(request.msg, "popup");
        sendResponse(0)
        return true;
    }


    if (request.text == "BACKTHISUP") {
        p_download(request.url, request.fileName)
        sendResponse(0)
        return true;
    }

    if (request.text == "SENDLOG") {
        logObject(request.who, request.messageLog);
        return false;
    }

    if (request.text == "CONSOLELOG") {
        return false;
    }

    if (request.text == "SENDMESSAGE") {
        //text: "SENDMESSAGE", message: message, filter: sendText, poster: who, time:time
        let message = 'Chat alert trigger on *' + request.filter + '*. Post: ' + request.poster + " said " + request.message + " at " + request.time;
        sendTextMsg(message, false, "CHAT", request.filter);
        logObject("background", message);
        return false;
    }
    if (request.text == "OPENE") {
        if (request.URL != null) {
            let reqType = "e";
            if (controlObj.openTabs[reqType].tabnum == 0) {
                chrome.tabs.create({ url: request.URL }, function (tab) {
                    controlObj.openTabs[reqType].tabnum = tab.id;
                    saveControlObj();
                });
            }
            else {
                //check if tab is still valid
                let open = false;
                chrome.tabs.query({}, function (array_of_Tabs) {
                    for (let ic = 0; ic < array_of_Tabs.length; ic++) {
                        let tab = array_of_Tabs[ic];
                        if (tab != null) {
                            if (tab.id == controlObj.openTabs[reqType].tabnum && urlIsnotTask(tab.url)) {
                                open = true;
                                chrome.tabs.update(controlObj.openTabs[reqType].tabnum, { url: request.URL, active: true });
                            }
                            if (open)
                                break;
                        }
                    }

                    if (!open) {
                        //we didn't find it
                        chrome.tabs.create({ url: request.URL }, function (tab) {
                            controlObj.openTabs[reqType].tabnum = tab.id;
                            saveControlObj();

                        });
                    }
                });
            }
            // window.open(request.URL, "EATWIN");
        }
        return false;
    }

    if (request.text == "UPDYUKONLY") { //charcolors.js
        controlObj.enhancements[indexChat][indexData].yukonOnly = request.yukonOnly;
        saveControlObj();
        return false;
    }

    if (request.request == "OPENMAPQ") { //dbclick.js
        let reqType = "m";
        if (request.location != null) {
            let mapStr = controlObj.openTabs[reqType].searchurl + request.location;
            if (controlObj.openTabs[reqType].tabnum == 0) {
                chrome.tabs.create({ url: mapStr }, function (tab) {
                    controlObj.openTabs[reqType].tabnum = tab.id;
                    saveControlObj();
                });
            }
            else {
                //check if tab is still valid
                let open = false;
                chrome.tabs.query({}, function (array_of_Tabs) {
                    for (let ic = 0; ic < array_of_Tabs.length; ic++) {
                        let tab = array_of_Tabs[ic];
                        if (tab != null) {
                            if (tab.id == controlObj.openTabs[reqType].tabnum && urlIsnotTask(tab.url)) {
                                open = true;
                                chrome.tabs.update(controlObj.openTabs[reqType].tabnum, { url: mapStr, active: true });
                            }
                            if (open)
                                break;
                        }
                    }

                    if (!open) {
                        //we didn't find it
                        chrome.tabs.create({ url: mapStr }, function (tab) {
                            controlObj.openTabs[reqType].tabnum = tab.id;
                            saveControlObj();
                        });
                    }
                });
            }
            //window.open(mapStr, "MAPWIN");
            //chrome.tabs.create({ url: mapStr });
        }
        return false;

    }


    //after open/reload/switch focus to tab todo!
    if (request.request == "OPENQ") { //dbclick.js
        if (request.query != null) {
            let reqType = "q";
            let newStr = encodeURIComponent(request.query);
            newStr = newStr.replace("“", '"');
            if (newStr == "undefined")
                return false;
            let qStr = controlObj.openTabs[reqType].searchurl + newStr;
            if (request.localS)
                qStr = qStr + "&near=" + request.location;
            if (controlObj.openTabs[reqType].tabnum == 0) {
                chrome.tabs.create({ url: qStr }, function (tab) {
                    controlObj.openTabs[reqType].tabnum = tab.id;
                    saveControlObj();
                });
            }
            else {
                //check if tab is still valid
                let open = false;
                chrome.tabs.query({}, function (array_of_Tabs) {
                    for (let ic = 0; ic < array_of_Tabs.length; ic++) {
                        let tab = array_of_Tabs[ic];
                        if (tab != null) {
                            if (tab.id == controlObj.openTabs[reqType].tabnum && urlIsnotTask(tab.url)) {
                                open = true;
                                chrome.tabs.update(controlObj.openTabs[reqType].tabnum, { url: qStr, active: true });
                            }
                            if (open)
                                break;
                        }
                    }

                    if (!open) {
                        //we didn't find it
                        chrome.tabs.create({ url: qStr }, function (tab) {
                            controlObj.openTabs[reqType].tabnum = tab.id;
                            saveControlObj();
                        });
                    }
                });
            }

            //let w = window.open(qStr, "QUERYWIN");

        }
        return false;

    }
    //open new tab qith YT search for Q
    //let win1 = window.open('https://www.youtube.com/results?search_query=' + qStr2, "windowName=MyWin");
    //search?q=%s&tbm=isch
    //q + + "&tbm=isch",
    if (request.request == "OPENTAB") { //dbclick.js
        if (request.query != null) {
            let newStr = encodeURIComponent(request.query);
            //newStr = newStr.replace("+", "%2B"); // encodeURI doesn't encode +
            let qStr = controlObj.openTabs[request.type].searchurl + newStr;
            if (request.type == "image")
                qStr = qStr + "&tbm=isch";
            //if (request.type == "image")
            qStr = qStr + "&tbm=isch";
            if (request.type == "pstore")
                qStr = qStr + "&c=apps";
            if (controlObj.openTabs[request.type].tabnum == 0) {
                chrome.tabs.create({ url: qStr }, function (tab) {
                    controlObj.openTabs[request.type].tabnum = tab.id;
                    saveControlObj();
                });
            }
            else {
                //check if tab is still valid
                let open = false;
                chrome.tabs.query({}, function (array_of_Tabs) {
                    for (let ic = 0; ic < array_of_Tabs.length; ic++) {
                        let tab = array_of_Tabs[ic];
                        if (tab != null) {
                            if (tab.id == controlObj.openTabs[request.type].tabnum && urlIsnotTask(tab.url)) {
                                open = true;
                                chrome.tabs.update(controlObj.openTabs[request.type].tabnum, { url: qStr, active: true });
                            }
                            if (open)
                                break;
                        }
                    }

                    if (!open) {
                        //we didn't find it
                        chrome.tabs.create({ url: qStr }, function (tab) {
                            controlObj.openTabs[request.type].tabnum = tab.id;
                            saveControlObj();
                        });
                    }
                });
            }
        }
        return false;
    }

    if (request.text == "LOGT") {
        addTaskRecord(request.dataobj, tabId);
        return false;
    }

    /* phrase code start */
    if (request.text == "SAVEPHRASE") {
        let newPhrase = { Phrase: request.data };
        if (controlObj.phraseArray.length == 1 && controlObj.phraseArray[0].Phrase == "no data yet")
            controlObj.phraseArray[0].Phrase = request.data;
        // because the only way we can get here is if we already have read the phrases - I know this call won't cause the async action of actually reading local storage
        else
            controlObj.phraseArray.unshift(newPhrase);
        //SendSafeTabMessage(sender.tab.id, { text: "PHRASES", phsent: controlObj.enhancements[indexChat][indexData].phsent, phrases: phraseArray });

        sendTabMessage(raterChat, { text: "PHRASES", phsent: controlObj.enhancements[indexChat][indexData].phsent, phrases: controlObj.phraseArray });
        sendTabMessage(taskPage, { text: "PHRASES", phsent: controlObj.enhancements[indexChat][indexData].phsent, phrases: controlObj.phraseArray });
        background_setPhrases(controlObj.phraseArray, true);
        return false;
    }

    if (request.request == "SAVEPHRASEARRAY") {
        background_setPhrases(request.data, true);
        //send new phases to chat and tasks
        sendTabMessage(raterChat, { text: "PHRASES", phsent: controlObj.enhancements[indexChat][indexData].phsent, phrases: request.data });
        sendTabMessage(taskPage, { text: "PHRASES", phsent: controlObj.enhancements[indexChat][indexData].phsent, phrases: request.data });
        return false;
    }


    if (request.request == "TOGGLELOG") {
        setLogStatus(request.logstatus);
        return false;
    }

    if (request.text == "RESETAUDIO") {
        resetSoundSettings(request.type);
        return;
    }

    if (request.text == "SETSOUNDS") {
        for (let t = 0; t < request.sounds.length; t++) {
            if (request.sounds[t].sound != 'custom')
                updateSoundSettings(request.sounds[t].type, request.sounds[t].sound, true);
        }
        return;
    }

    if (request.request == "READSETAUDIO") {
        //set default audio and controlObj.enhancements to be this for this type
        let save_audio = request.audioStr;
        saveSound(request.type, request.audioStr, function (response) {
            if (response == null)
                updateSoundSettings(request.type, save_audio, true); //(how to send back to popup??)

        });
        return false;
    }

    if (request.request == "TESTCLEANUP") {
        chrome.storage.local.get('trackData', function (data) { //ok
            if (chrome.runtime.lastError) {
            }
            else {
                if (data.trackData.length > 0) {
                    let dataA = [];
                    try {
                        dataA = JSON.parse(data.trackData);
                    } catch (e) {
                        background_alert('MDE: Your local task tracking data file is corrupted. Until this is fixed, MDE is NOT tracking your time. "Totals All Devices" on detail screen will however have an accurate daily totals. Contact MDE support for additional help.  Error:' + e, tabId); // error in the above string (in this case, yes)!
                    }
                    if (dataA.length > 0) {
                        dataA = trackCleanup(dataA, controlObj.enhancements[indexTracker][indexData].save4days, null);
                        s_saveTrackData(dataA, null, false);
                    }
                }
            }
        });
        return false;
    }

    if (request.text == "DELETEPHRASE") {
        // because the only way we can get here is if we already have read the phrases - I know this call won't cause the async action of actually reading local storage
        let phraseArray = controlObj.phraseArray;
        let phrase = request.data;
        let startlen = phraseArray.length;
        phraseArray = phraseArray.filter(function (element) {
            return (element.Phrase.trim() != phrase.trim());
        });
        if (startlen == phraseArray.length)
        SendSafeTabMessage(sender.tab.id, { text: "PHRASES", phsent: controlObj.enhancements[indexChat][indexData].phsent, phrases: phraseArray });
        background_setPhrases(phraseArray, true);
        return false;
    }

    if (request.text == "MOVEPH2TOP") {
        // because the only way we can get here is if we already have read the phrases - I know this call won't cause the async action of actually reading local storage
        let phraseArray = controlObj.phraseArray;
        let phrase = request.data;
        let startlen = phraseArray.length;
        phraseArray = phraseArray.filter(function (element) {
            //if (element.Phrase.length > 0 && phrase.length > 0) 3/21/23
            return (element.Phrase.trim() != phrase.trim());
            //    else
            //        return 0;
        });

        if (startlen == phraseArray.length) { /* phrase already exists, no change */ }
        else
            phraseArray.unshift({ "Phrase": phrase.trim() });
        SendSafeTabMessage(sender.tab.id, { text: "PHRASES", phsent: controlObj.enhancements[indexChat][indexData].phsent, phrases: phraseArray });
        background_setPhrases(phraseArray, true);
        return false;
    }
    //commented out 10/12/23 because sometimes this thing just happens when it shouldn't
    //if (request.text == "SHOWMENUP") {
    //    broadcastPhrases(sender.tab.id, "OPENPHRASE");
    //    return false;
    //}

    if (request.text == "SAVECOMPNAME") {
        controlObj.enhancements[indexTracker][2].thisComputer.desc = request.newName;
        controlObj.thisComputer.desc = request.newName;
        saveControlObj();
        return false;
    }

    if (request.text == "GETPHRASES") {
        broadcastPhrases(sender.tab.id, null);
        return false;
    }

    if (request.text == "GETSPELL") {
        SendSafeTabMessage(sender.tab.id, { text: "ACOPTSET", autocorrect: controlObj.enhancements[indexChat][indexData].autocorrect }); // in spell.js
        readSpell(sender.tab.id, false);
        return false;
    }

    /* end phrase code*/
    /* START SPELL */
    if (request.text == "SAVESPELL") {
        if (controlObj.spellArray != null) {
            //if it's already in the database - we are going to modify it - not add it.
            controlObj.spellArray = updateSpellA(controlObj.spellArray, request.data);
            writeSpell();
            sendTabMessage(raterChat, { text: "SPELLARRAY", data: controlObj.spellArray, autocorrect: controlObj.enhancements[indexChat][indexData].autocorrect });
            sendTabMessage(taskPage, { text: "SPELLARRAY", data: controlObj.spellArray, autocorrect: controlObj.enhancements[indexChat][indexData].autocorrect });
        }
        else
            console.log("received savespell but controlObj.spellArray was null");
        return false;
    }

    if (request.text == "UPDATESPELL") {
        controlObj.spellArray = null;
        readSpell(null, true);
        return false;
    }

    /* end spell */

    // start test messaging 

    if (request.text == "RHALERTCONTROLSTATUSSET") {
        controlObj.enhancements[indexMsgOpts][indexData].txtAlerts = request.set;
        logObject("background", "sendtexts set to: " + controlObj.enhancements[indexMsgOpts][indexData].txtAlerts);
        saveControlObj();
        return false;
    }

    if (request.request == "TOGGLEMONITOR") {
        controlObj.enhancements[indexMsgOpts][indexData].monitor = !controlObj.enhancements[indexMsgOpts][indexData].monitor;
        setMonitor(controlObj.enhancements[indexMsgOpts][indexData].monitor);
        saveControlObj();
        sendResponse(controlObj.enhancements[indexMsgOpts][indexData].monitor);
        return true;
    }

    if (request.request == "TOGGLERHTEST") { //test rh index alerts
        controlObj.RHtest = !controlObj.RHtest;
        logObject("background", "RH Test set : " + controlObj.RHtest);
        sendResponse(controlObj.RHtest);
        return true;
    }

    if (request.text == "RHALERTCONTROLSAVE") {
        let msgObj = controlObj.enhancements[indexMsgOpts][indexData];
        msgObj.options.nrtstart = request.msgObj.options.nrtstart;
        msgObj.options.nrtstop = request.msgObj.options.nrtstop;
        msgObj.options.textafter = parseInt(request.msgObj.options.textafter);
        msgObj.options.uo = request.msgObj.options.uo;
        msgObj.options.ac = request.msgObj.options.ac;
        msgObj.options.hr = request.msgObj.options.hr;
        msgObj.options.pr = request.msgObj.options.pr;
        msgObj.options.hrs = request.msgObj.options.hrs;
        msgObj.options.sapr = request.msgObj.options.sapr;
        msgObj.options.hm = request.msgObj.options.hm;
        msgObj.active = oneSelected(msgObj.options);
        //msgObj.options.textafter = request.msgObj.options.textafter;
        msgObj.snoozestart = request.msgObj.snoozestart;
        msgObj.snoozestop = request.msgObj.snoozestop;
        msgObj.chatTextLimit = parseInt(request.msgObj.chatTextLimit);
        let sendIt2chat = false;
        if (msgObj.chatTextAlerts != request.chatTextAlerts) {
            msgObj.chatTextAlerts = request.chatTextAlerts;
            msgObj.chatTextAlertsArray = buildChatTextAlertsArray(request.chatTextAlerts);
            sendIt2chat = true;
        }
        if (msgObj.chatRedAlert != request.msgObj.chatRedAlert) {
            msgObj.chatRedAlert = request.msgObj.chatRedAlert;
            sendIt2chat = true;
        }
        if (sendIt2chat) {
            controlObj.enhancements[indexMsgOpts][indexState] = ((msgObj.chatTextAlerts == null || msgObj.chatTextAlerts.length == 0) && !msgObj.chatRedAlert) ? false : true;
            sendTabMessage(raterChat, {
                text: "MSGOPTS", status: controlObj.enhancements[indexMsgOpts][indexState], data: msgObj
            });
        }

        controlObj.enhancements[indexMsgOpts][indexData] = msgObj;

        if (
            msgObj.name != request.msgObj.name ||
            msgObj.carrier != request.msgObj.carrier ||
            msgObj.number != request.msgObj.number) {
            msgObj.name = request.msgObj.name;
            msgObj.number = request.msgObj.number;
            msgObj.carrier = request.msgObj.carrier;
            let s_parms = {
                "id": "",
                "name": msgObj.name,
                "number": "",
                "sendkey": msgObj.sendkey,
                "email": msgObj.email,
                "providers": msgObj.carrier,
                "status": "New",
                "data": "{}",
                "apikey": msgObj.apikey,
                "message": null
            };
            // SMS backend removed — save locally only
            saveControlObj();
        }
        else {
            saveControlObj();
        }
        return false;
    }

    if (request.text == "RHALERTCONTROLGET") { //all this does is get the msgobj so we can display it for the user to modify
        //popup is waiting for a  response
        //text = RHALERTMSGOBJ msgObj = null or msgObj
        let msgObj = controlObj.enhancements[indexMsgOpts][indexData];

        if (msgObj.email == "" || msgObj.email != request.useremail) { // we didn't have one before now (the email wasnt already stored in MSGOBJ)
            getUserInfo(
                function (data) {
                    if (data == "" || data == "{}") {
                        SendSafeRuntimeMessage({ text: "RHALERTMSGOBJ", msgObj: null });
                        return;
                    }
                    else {
                        msgObj = processUserInfo(data);
                        SendSafeRuntimeMessage({ text: "RHALERTMSGOBJ", msgObj: msgObj, chatTextAlerts: msgObj.chatTextAlerts, rhalertstatus: msgObj.txtAlerts });
                        return;
                    }
                },
                request.useremail,
                function (status) {
                    SendSafeRuntimeMessage({ text: "RHALERTMSGOBJ", msgObj: null });
                });
        }
        else
            SendSafeRuntimeMessage({ text: "RHALERTMSGOBJ", msgObj: msgObj, chatTextAlerts: msgObj.chatTextAlerts, rhalertstatus: msgObj.txtAlerts });
        return false;
    }
    //start color opt code
    if (request.text == "EXPCOLORS") {
        let bigLine = "";
        controlObj.enhancements[indexChat][indexData].colorData.forEach(function (el) {
            bigLine += el.id + '\t' + el.normal + '\t' + el.custom + '\n';
        });

        if (bigLine.length > 0) {
            let d = new Date();
            let lastDate = (d.getMonth() + 1) + '/' + d.getDate() + '/' + d.getFullYear();
            let fileName = "colors" + (d.getMonth() + 1) + d.getDate() + d.getFullYear() + ".txt";
            writeLine(bigLine, fileName);
            return fileName;
        }
        return false;
    }


    if (request.text == "REVERTCOLORS") {
        controlObj.enhancements[indexChat][indexData].colorData.forEach(function (el) {
            el.custom = null;
        });
        //chatcriteria.colorData = controlObj.enhancements[indexChat][indexData].colorData;
        saveControlObj();
        chrome.tabs.reload(sender.tab.id);
        return false;
    }

    if (request.text == "SAVECOLORS") {
        controlObj.enhancements[indexChat][indexData].colorData = request.data;
        //chatcriteria.colorData = request.data;
        saveControlObj();
        return false;
    }

    // end color opt
    if (request.text == "SAVEDATAA") {
        // i've being passed an array to put into localstorage
        if (request.data != null) {
            s_saveTrackData(request.data, request.datein, false);
        }
        sendResponse("data saved");
        return true;
    }

    //if (request.text == "onunload") {
    //    //closeNotification();
    //    let d = new Date();
    //    updateSubmitTime(request.dataobj.taskId, d, request.dataobj.taskDesc);
    //    // update data array with this time
    //    return false;

    //}

    if (request.text == "newonunload") {
        //closeNotification();
        if (controlObj.activeTask == "" && request.dataobj == null) {
            //no point in calling it
            mde_logwrite("newonunload no update. No point.");
        }
        else {
            //console.log(controlObj.activeTask);
            if (controlObj.activeTask == "")
                setActiveTask(request.dataobj, 0);
            mde_logwrite("newonunload. status:taskDesc:activetask:" + request.status + ':' + controlObj.activeTask.taskDesc + ':' + controlObj.activeTask.taskId);
            let d = new Date();
            if (request.status != null && request.status != "fromremove")
                controlObj.activeTask.taskDesc = request.status;
            //mde_logwrite("before upd record for task:" + JSON.stringify(controlObj.activeTask));
            updateSubmitTime(controlObj.activeTask.taskId, d, controlObj.activeTask.taskDesc);
            // update data array with this time
        }
        if (sendResponse != null) // if its null this call came from removetablistener
            sendResponse(0);
        return true;
    }

    if (request.text == "poptestonunload") {
        //closeNotification();
        let d = new Date();
        if (request.dataobj.workTime != 0) {
            nd = new Date(request.dataobj.dateofTask);
            d = addMins(nd, request.dataobj.workTime);
        }

        updateSubmitTime(request.dataobj.taskId, d, request.dataobj.taskDesc);
        // update data array with this time
        return false;

    }


    if (request.text == "SETRKOPTS") {
        controlObj.enhancements[indexTracker][indexData].alert = request.time;
        controlObj.enhancements[indexTracker][indexData].report = request.rpt;
        controlObj.enhancements[indexTracker][indexData].zone = request.zone;
        controlObj.enhancements[indexTracker][indexData].autobackup = request.autoBackup;
        controlObj.enhancements[indexTracker][indexData].save4days = request.save4days;
        controlObj.enhancements[indexTracker][indexData].aetrange = request.aetrange;
        controlObj.enhancements[indexTracker][indexData].timeropts = request.timeropts;
        controlObj.enhancements[indexTracker][indexData].warnincomplete = request.warnincomplete;


        saveControlObj();
        return false;
    }

    if (request.text == "PLAYIT") {
        //try {
        //    chrome.tabs.query({ active: true, lastFocusedWindow: true }, function (tab) {
        //        if (tab && tab.id == sender.tab.id)
        //            sendResponse(getactivesound(request.soundType));
        //        else {
        background_playSound(request.soundType, request.soundF,false);
        sendResponse(0);
        //        }
        //        return true;
        //    });
        //}
        //catch (err) {
        //    sendResponse(0);
        //    return true;
        //}
        return true;
    }

    if (request.text == "PLAYITTEST") {
        //let sound2use = request.soundF;
        //if (request.soundType != undefined)
        //    sound2use = getactivesound(request.soundType);
        //background_beep(sound2use, sender);
        background_playSound(request.soundType, "notused", false);
        sendResponse("Hopefully sound played");
        return true;
    }

    // end of tracker related


    if (request.request == "CLOSERTABS") { //dbclick.js
        closeTabs2Right(sender);
        return false;

    }

    if (request.request == "CAPTURETAB") { //dbclick.js
        // captureTab(sender);
    }

    if (request.text == "CLEARELOAD" || request.text == "CLEARELOADX") { //rh.js
        //clear re load info for RH
        //saveNRT("LE");
        //controlObj.saveRH.endtime = 0;
        // saveRH.tab = 0; did I really need to reset this?
        //if (s_rhtimer != 0) {
        //    clearInterval(s_rhtimer);
        //    s_rhtimer = 0;
        //}
        saveControlObj();
        if (request.text != "CLEARELOADX")
            sendResponse(0);

        return true;
    }

    //if (request.text == "CLEARELOAD") { //rh.js
    //    //clear re load info for RH
    //    //saveNRT("LE");
    //    saveRH.endtime = 0;
    //    // saveRH.tab = 0; did I really need to reset this?
    //    if (s_rhtimer != 0) {
    //        clearInterval(s_rhtimer);
    //        s_rhtimer = 0;
    //    }
    //    return false;

    //}
    if (request.text == "RELOADME") {
        chrome.tabs.reload(sender.tab.id);
        return true;
    }

    if (request.text == "SAVERHEND") {
        if (!reloaderactive) {
            saveNRT("B");
            reloaderactive = true;
        }

        //background_playSound("NRT","notused", false);

        //send2Monitor("RHINDEX");
        //sound2use = getactivesound("RHINDEX");
        //background_beep(sound2use, sender);

        //  1 = nrt, 0 = no nrt, 2 = server error on reload or something else
        // console.log(saveRH.rhstatus.nrt + ' ' + request.rhOpts.rhstatus.nrt + ' ' + saveRH.rhstatus.nrtstopcount + ' ' + saveRH.rhstatus.nrtstartcount);
        if (controlObj.saveRH.rhstatus.nrt == true) {
            if (request.rhOpts.rhstatus.nrt == false) {
                //if (controlObj.saveRH.rhstatus.nrtstopcount == 0) {//else we have been here before and reset rhstatus for text messaging in rh.js
                saveNRT("E");
                if (GetLogStatus()) {
                }
                //sound2use = getactivesound("NRT");
                //background_beep(sound2use, sender);
                background_playSound("NRT", "notused", false);
                //}
                //else
                //    console.log("didnt call it because " + (saveRH.rhstatus.nrtstopcount == 0));

            }
        }

        if (controlObj.saveRH.rhstatus.nrt == false) {
            if (request.rhOpts.rhstatus.nrt == true) {
                if (controlObj.saveRH.rhstatus.nrtstartcount == 0) {
                    saveNRT("S"); //else we have been here before and reset rhstatus for text messaging in rh.js
                    if (getactivesound("WAH", controlObj.default_sounds) != "none")
                        background_playSound("WAH", "notused", false);
                }
                //else
                //    console.log("didnt call it because " + (saveRH.rhstatus.nrtstartcount == 0));
            }
        }

        //maybe for another reason
        //let rhstatus = { nrt: false, uo: false, hr: false, hrs: false, pr: false, hm: false, opts: false };
        if (request.rhOpts.opts == true && request.rhOpts.rhstatus.nrt == false) {
            let mn = false;
            if (controlObj.saveRH.rhstatus.hr == false && request.rhOpts.rhstatus.hr == true)
                mn = true;
            else if (controlObj.saveRH.rhstatus.uo == false && request.rhOpts.rhstatus.uo == true)
                mn = true;
            else if (controlObj.saveRH.rhstatus.hrs == false && request.rhOpts.rhstatus.hrs == true)
                mn = true;
            else if (controlObj.saveRH.rhstatus.pr == false && request.rhOpts.rhstatus.pr == true)
                mn = true;
            else if (controlObj.saveRH.rhstatus.hm == false && request.rhOpts.rhstatus.hm == true)
                mn = true;
            else if (controlObj.saveRH.rhstatus.sapr == false && request.rhOpts.rhstatus.sapr == true)
                mn = true;
            else if (controlObj.saveRH.rhstatus.mc == false && request.rhOpts.rhstatus.mc == true)
                mn = true;

            if (mn == true) {
                if (GetLogStatus()) {
                }
                //sound2use = getactivesound("RHINDEX");
                //background_beep(sound2use, sender);
                background_playSound("RHINDEX", "notused", false);
            }
        }

        if (controlObj.enhancements[indexMsgOpts][indexData].txtAlerts) {
            controlObj.saveRH.rhstatus = processRHStatus(controlObj.saveRH.rhstatus, request.rhOpts.rhstatus, controlObj.enhancements[indexMsgOpts][indexData].options);
        }
        else
            controlObj.saveRH.rhstatus = request.rhOpts.rhstatus;

        // save reload info for rh
        //controlObj.saveRH.endtime = request.endtime;
        controlObj.saveRH.tab = sender.tab.id;
        saveControlObj();
        // to do - start timer to reload, etc...
        //if (controlObj.enhancements[indexRaterHub][indexState] && controlObj.saveRH.tab != 0) {
        //    s_rhtimer = setTimeout(function () { //right here - have to get rid/change this.
        //        tabStillRH(controlObj.saveRH.tab);
        //    }, (controlObj.enhancements[indexRaterHub][indexData].refreshsecs * 1000));
        //}
        return false;
    }

    if (request.request == "OPENURL") { //files.js
        chrome.tabs.create({ url: request.url });
        return false;

    }

    if (request.request == "SAVENAMES") { //chat.js
        controlObj.enhancements[indexChat][indexData].myNames = request.myNames;
        saveControlObj();
        return false;

    }

    if (request.request == "DELETELOG") { //popup
        chrome.storage.local.remove('MDENRTLOG', function () {
            reloaderactive = false;
            sendResponse("log deleted");
        });
        sendResponse("log deleted");
        return true;
    }

    if (request.request == "DELETETRACK") { //popup
        chrome.storage.local.remove('trackData', function () {
        });
        return false;
    }

    if (request.request == "VIEWLOG") { //popup
        let loadnrt = false;
        if (loadnrt) {
            background_alert("MDE: Load the log", tabId);
            mynrttimer = setInterval(testNRT, 30000);
        }
        else {
            //get log info and send it in a response
            chrome.storage.local.getBytesInUse('MDENRTLOG', function (bytesInUse) {
                if (bytesInUse == 0)
                    SendSafeRuntimeMessage({ text: "MDENRTLOGA", data: "No log to view" });
                else {
                    chrome.storage.local.get('MDENRTLOG', function (data) { //ok
                        if (chrome.runtime.lastError) {
                            SendSafeRuntimeMessage({
                                text: "MDENRTLOGA", data: "No log to view " + chrome.runtime.lastError.message
                            });
                        }
                        else
                            SendSafeRuntimeMessage({
                                text: "MDENRTLOGA", data: data.MDENRTLOG
                            });
                    });
                }
            });
        }
        return false;
    }

    //if (request.request == "BACKUPTRACK") { //popup
    //    return false;
    //}

    //if (request.request == "EXTRACTPHRASES") {
    //    extractPhrases();
    //    return false;
    //}

    //if (request.request == "EXTRACTALL") {
    //    extractAll();
    //    return false;
    //}

    if (request.request == "IMPORTALL") {
        if (getActiveTask() != "") {
            sendResponse({ msg: "Unable to restore data while there is an Active task - you can't do this while rating.", enhancements: null });
            return true;
        }
        let retStr = processImportAll(request.data);
        if (retStr.indexOf("Restore Failed") > -1)
            sendResponse({ msg: retStr, enhancements: null });
        else
            sendResponse({
                msg: retStr, enhancements: controlObj.enhancements, phrases: background_getPhrases(null, "", false, false),
                sounds: controlObj.default_sounds
            });
        return true;
    }

    if (request.request == "MERGEPHRASES") {
        let retStr = mergePhrases(request.data);
        sendResponse(retStr);
        return true;
    }

    if (request.request == "REFRESHPHRASES") {
        //read phrases again
        background_getPhrases(null, "", null, true);
        sendResponse(retStr);
        return true;
    }


    //if (request.request == "EXTRACTSPELL") {
    //    extractSpell();
    //    return false;
    //}

    if (request.request == "MERGESPELL") {
        let retStr = mergeSpell(request.data);
        sendResponse(retStr);
        return true;
    }

    if (request.request == "REBUILDT") {
        chrome.storage.local.get('trackData', function (data) { //ok
            let responseStr = "Totals Rebuilt";
            let dataA = [];
            if (chrome.runtime.lastError) {
                responseStr = "get Error Str:" + chrome.runtime.lastError.message;
            }
            try {
                dataA = JSON.parse(data.trackData);
            } catch (e) {
                background_alert('MDE: Your local task tracking data file is corrupted. Until this is fixed, MDE is NOT tracking your time. "Totals All Devices" on detail screen will however have an accurate daily totals. Contact MDE support for additional help.  Error:' + e, tabId); // error in the above string (in this case, yes)!
            }
            if (dataA.length > 0) {
                UpdCtotals(dataA, controlObj.enhancements[indexTracker][indexData].aetrange, null, true);
                SendSafeRuntimeMessage({ text: "TOTALSREBUILT", message: responseStr });
            }
        });
        return false;
    }

    if (request.request == "RESTORETRACKER") {
        let lines = request.data;
        let tabchar = "\t".charCodeAt(0);
        let data = { taskId: "", dateofTask: null, taskDesc: "", taskAET: "", extras: "", workTime: 0 };
        let dataA = new Array();
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].length < 1)
                continue;
            let thisData = lines[i].split('\t');
            if (!validDateRec(thisData)) {
                let resp = "Unexpected format in restore file. Record: " + lines[i];  // if this message changes - chg popup processfile too
                sendResponse(resp);
                return true;
            }
            if (thisData[0] != "Task" && thisData[0].indexOf("Total") == -1) { //this is not a header or total line
                let AETs = thisData[2].split("(");
                let saveAET = (AETs.length == 2 ? AETs[0] : thisData[2]);
                let saveDesc = (thisData.length == 6 ? thisData[5] : "");
                dataA.push({
                    taskId: thisData[0], dateofTask: thisData[1],
                    taskDesc: saveDesc, taskAET: saveAET, extras: thisData[4], workTime: timeStrToMills(thisData[3])
                });
            }

        }

        //backupTracker(dataA, "report");
        //saveTrackData(dataA);
        let resp = "Restored " + lines.length + " records from backup.";
        sendResponse(resp);
        s_saveTrackData(dataA, null, true); // right here - should rebuild c totals
        return true;

    }

    if (request.request == "VIEWTRACKER") { //popup
        //request: "VIEWTRACKER", zone: "P", invoice: true

        chrome.storage.local.getBytesInUse('trackData', function (bytesInUse) {
            if (bytesInUse == 0)
                SendSafeRuntimeMessage({ text: "TRACKERLOGA", data: "No tracker info to view", comp: controlObj.thisComputer });
            else {
                chrome.storage.local.get('trackData', function (data) { //ok
                    if (chrome.runtime.lastError) {
                        SendSafeRuntimeMessage({
                            text: "TRACKERLOGA", data: "No log to view " + chrome.runtime.lastError.message
                        });
                    }
                    else {
                        let a = getActiveTask();
                        SendSafeRuntimeMessage({
                            text: "TRACKERLOGA", data: data.trackData, activeTask: a, zone: request.zone, invoice: request.invoice,
                            comp: controlObj.thisComputer
                        });
                    }
                });
            }
        });
        return false;
    }


    if (request.request == "GETACTIVET") {
        sendResponse(getActiveTask());
        return true;

    }

    if (request.request == "GETCONTROLOBJ") {
        sendResponse(controlObj);
        return true;
    }



    if (request.request == "SENDLOG") {
        return false;
    }


    if (request.text == "POPUPOPTSCHANGED") {
        controlObj.enhancements = request.enhancements;
        saveControlObj();         // save controlObj.enhancements
        sendResponse(0);
        //send changed options to open tabs
        let str2chk = buildMatchStr();
        chrome.tabs.query({ url: str2chk }, function (array_of_Tabs) {
            for (let ic = 0; ic < array_of_Tabs.length; ic++) {
                let tab = array_of_Tabs[ic];
                if (notOurs(tab.url) == false) { // means it is one of ours
                    // if it's an active task page - we aren't going to touch it
                    if (tab.url.indexOf(taskPage) == -1)
                        broadCast(tab.id, tab.url);
                }
            }
        });

        if (controlObj.enhancements[indexChat][indexData].phraseTable) { //read phrases (do it now vs when tab opens) {
            background_getPhrases(null, "", 0, true);
        }

        //// if we need to set idle, do it now
        //if (enhancements.length > indexIdleC)
        //    controlIdle(enhancements[indexIdleC][indexState], enhancements[indexIdleC][indexData]); // here add code to popup to capture idlemins

        //if (chrome.tabs.onUpdated.hasListener(tabListener) == false)
        //    chrome.tabs.onUpdated.addListener(tabListener);
        return true;
    }
    // more invoice code
    if (request.text == "INVOICE") {
        //set rows, curRow (0), invoiceRec
        //send to invoice.js
        invoicePeriodSelect = request.period;
        rows = request.rows;
        invoiceRecs.count = rows.length;
        invoiceRecs.curRow = 0;
        invoiceRecs.recs = rows;
        invoiceRecs.updateA = request.updateA;
        invoiceRecs.international = request.international;
        tabId = 0;
        let selectInvoiceURL = setURL('/qrp/core/vendors/invoices', request.international);
        //if one is open close it
        chrome.tabs.query({ url: selectInvoiceURL }, function (array_of_Tabs) {
            if (array_of_Tabs.length == 0) {
                //if I am here then we didn't find one - go ahead and create one
                //install load listener for 
                //start the process 
                //after they select create or modify of an exting invoice, listener will send it INVOICE
                //in invoice.js record is searched for, updated, and add button is triggered which causes a reload of the tab
                //when we are done, uninstall listener, quit - done in the listener (saving tab so we can close invoice select page later)
                chrome.tabs.onUpdated.addListener(listenInvoice);
                //chrome.tabs.create({ url: selectInvoiceURL }, function (tab) {
                //    // send it a message and tell it to select the period

                //});
                chrome.tabs.create({ url: selectInvoiceURL }, function (tab) { //open tab
                    chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['jquery.js'] }, function () { //load jquery
                        chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ["utils.js"] }, function () { //loadinvoiceperiodselect
                            chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ["invoiceselect.js"] }, function () { //loadinvoiceperiodselect

                            });
                        });
                    });
                });
            }

            for (let ic = 0; ic < array_of_Tabs.length; ic++) {
                let tab = array_of_Tabs[ic];
                if (tab.url == selectInvoiceURL) { // not needed
                    background_alert("MDE: Please close any open Timecard pages before starting this process", tab.id);
                    return;
                }
            }
        });
        return false;

    }
    //end more invoice
}


//function notificationCalled(notificationId) {
//    S_Notify = notificationId;
//    printNotifications();
//}


// code related to the tracker

/**
 * Store the currently active task ID and data in the background state.
 *
 * @param {Date} dataobj
 * @param {string} tabId
 */
function setActiveTask(dataobj, tabId) {
    controlObj.activeTask = dataobj;
    controlObj.activeTabId = tabId;
    saveControlObj();
}

/**
 * Return the currently active task record from background state.
 * @returns {*}
 */
function getActiveTask() {
    return controlObj.activeTask;
}

/**
 * Persist the task tracking array to chrome.storage.local.
 *
 * @param {Date} dataxy
 * @param {Date} datein
 * @param {Date} updateAll
 */
function saveTrackData(dataxy, datein, updateAll) {
    // Save it using the Chrome extension storage API.
    //have to do the merge before saving for updctotals
    //let data = mergeData(dataA);
    let local_dataxy = dataxy;
    let local_datein = datein;
    let local_updateAll = updateAll;

    let newData = "";

    try {
        newData = JSON.stringify(dataxy);
    } catch (e) {
        background_alert("MDE time not saved:  Error Str:" + e, null); // error in the above string (in this case, yes)!
    }
    chrome.storage.local.set({ 'trackData': newData }, function () {
        if (chrome.runtime.lastError) {
            let alertStr = "MDE time not saved:  Error Str:" + chrome.runtime.lastError.message;
            background_alert(alertStr, null);
        }
        else {
            UpdCtotals(local_dataxy, controlObj.enhancements[indexTracker][indexData].aetrange, local_datein, local_updateAll);
        }
    });
}
//update task
/**
 * Update the submit timestamp on an existing task record.
 *
 * @param {string} taskIdin
 * @param {number} subTimein
 * @param {string} taskDescin
 * @returns {*}
 */
function updateSubmitTime(taskIdin, subTimein, taskDescin) {
    let taskId = taskIdin;
    let subTime = subTimein;
    let taskDesc = taskDescin;
    chrome.storage.local.get('trackData', function (data) { //ok
        if (chrome.runtime.lastError) {
        }
        else {
            // need to make sure there is data here
            if (data.trackData != null) {
                let dataArray = [];

                try {
                    dataArray = JSON.parse(data.trackData);
                } catch (e) {
                    background_alert('MDE: Your local task tracking data file is corrupted. Until this is fixed, MDE is NOT tracking your time. "Totals All Devices" on detail screen will however have an accurate daily totals. Contact MDE support for additional help.  Error:' + e, null); // error in the above string (in this case, yes)!
                }
                let tempObj = dataArray.find(function (element) {
                    return element.taskId == taskId;
                });
                if (tempObj != undefined) {
                    //if (taskDescin == getCancelledConstant()) { // they cancelled - just delete the one that is there
                    //    let newarray = dataArray.filter(function (element) {
                    //        return (element.taskId != tempObj.taskId);
                    //    });
                    //    dataArray = newarray;
                    //}
                    //else {
                    if (tempObj.workTime == 0) {
                        //if (tempObj != undefined) {
                        // calculate time it took if worktime is 0
                        let startTime = new Date(tempObj.dateofTask);
                        if (taskDesc != null && taskDesc.length > 0)
                            tempObj.taskDesc = taskDesc;
                        if (startTime != "Invalid Date") {
                            let subDate = new Date(subTime);
                            let timeTook = Math.abs(subDate - startTime);
                            tempObj.workTime += timeTook;
                            logObject("onunload", "updatesubtme", tempObj);
                        }
                    }
                    else {
                        //Ive got nothing to update. But activetask should be the task that was active
                        let at = getActiveTask();
                        if (at.taskId == taskId) { // I can use this to update
                            let startTime = new Date(at.dateofTask);
                            if (taskDesc != null && taskDesc.length > 0)
                                tempObj.taskDesc = taskDesc;
                            if (startTime != "Invalid Date") {
                                let subDate = new Date(subTime);
                                let timeTook = Math.abs(subDate - startTime);
                                tempObj.workTime += timeTook;
                            }
                            logObject("onunload", "updatesubtme(task not found used activetask)", tempObj);
                            //logObject("onunload", "updatesubtme(1)", tempObj);

                        }
                        else
                            console.log("no record to update for task:", taskId, subTime, taskDesc);
                    }
                }
                let newArray = mergeData(dataArray);
                s_saveTrackData(newArray, null, false);
                setActiveTask("", 0);
            }
            else { // no data - just create array and save
                let subDate = new Date(subTime);
                let dataobj = getActiveTask();
                let startTime = new Date(dataobj.dateofTask);
                if (taskDesc != null)
                    dataobj.taskDesc = taskDesc;
                if (startTime != "Invalid Date") {
                    let timeTook = Math.abs(subDate - startTime);
                    dataobj.workTime = timeTook;
                }
                let dataArray = [];
                dataArray.unshift(dataobj);
                s_saveTrackData(dataArray, null, false);
                setActiveTask("", 0);
            }
        }
    });
}

/**
 * Append a new task record to the tracking data and save.
 *
 * @param {Date} dataobjin
 * @param {string} tabId
 * @returns {*}
 */
function addTaskRecord(dataobjin, tabId) {
    let dataobj = dataobjin;
    setActiveTask(dataobj, tabId);

    chrome.storage.local.get('trackData', function (data) { //ok
        if (chrome.runtime.lastError) {
        }
        else {
            // need to make sure there is data here
            let dataArray = [];
            if (data.trackData != null) {
                try {
                    dataArray = JSON.parse(data.trackData);
                } catch (e) {
                    background_alert('From MDE: Your local task tracking data file is corrupted. Until this is fixed, MDE is NOT tracking your time. "Totals All Devices" on detail screen will however have an accurate daily totals. Contact support for additional help.  Error:' + e, tabId); // error in the above string (in this case, yes)!
                }

                //if the first rec is a different date than the date of this record - force a backup
                if (dataArray.length > 0) {
                    let obj = dataArray[0];
                    if (localCompMMDDYY(obj.dateofTask, dataobj.dateofTask) != true) {
                        // do a find to make sure it's not there
                        let obj = dataArray.find(function (element) {
                            return localCompMMDDYY(element.dateofTask, dataobj.dateofTask);
                        });
                        if (obj == undefined) {
                            //unless they have opt'ed out - take a backup
                            if (controlObj.enhancements[indexTracker][indexData].autobackup == true) {
                                if (controlObj.enhancements[indexTracker][indexData].report)
                                    SendSafeTabMessage(tabId, { text: "MAKEREPORTR", data: dataArray, aetrange: controlObj.enhancements[indexTracker][indexData].aetrange });

                                else
                                    SendSafeTabMessage(tabId, { text: "MAKEREPORTD", data: dataArray, aetrange: controlObj.enhancements[indexTracker][indexData].aetrange });
                            }
                            else
                                console.log("not taking report due to options");
                            dataArray = trackCleanup(dataArray, controlObj.enhancements[indexTracker][indexData].save4days, null);
                            consolidatedCleanup();
                            //load RE data for PQ checking
                            //sendTabMessage(taskPage, { text: "LOADPQDATA", data: dataArray, range: controlObj.enhancements[indexTracker][indexData].aetrange });
                            //check for incompletes on prior day
                            if (controlObj.enhancements[indexTracker][indexData].warnincomplete) {
                                let d = new Date();
                                let periodArray = buildperiod(d, "US");
                                let incompleteDay = anyIncomplete(dataArray, periodArray[0].startDate, periodArray[0].endDate);
                                if (incompleteDay != null)
                                    sendTabMessage(taskPage, { text: "ALERTFROMBACKGROUND", msg: "MDE: Incomplete task found at " + incompleteDay.dateofTask + ". Please fix this using the task details table on the popup at your convenience." });
                            }
                        }
                    }
                    //else {
                    //    let d = new Date();
                    //    let periodArray = buildperiod(d);
                    //    let incompleteDay = SPECanyIncomplete(dataArray, periodArray[0].startDate, periodArray[0].endDate, dataobj.taskId);
                    //    if (incompleteDay != null)
                    //        sendTabMessage(taskPage, { text: "ALERTFROMBACKGROUND", msg: "MDE: Incomplete task found at " + incompleteDay.dateofTask + " . Please fix this using the task details table on the popup at your convenience." });
                    //}
                    if (controlObj.enhancements[indexTracker][indexData].timeropts == "NEW" && controlObj.enhancements[indexTracker][indexData].alert != "none;off")
                        getTotals(dataArray);
                    if (dataobj.taskAET == "") {
                        logObject("addTaskRecord (1)", "Failed to get taskAET", dataobj);
                        dataobj.taskAET = "0.0";
                    }
                    logObject("LOGT", "addTaskRecord (1)", dataobj);
                    dataArray.unshift(dataobj);
                    s_saveTrackData(dataArray, null, false);
                    sendTimeTaken(dataArray, dataobj);
                }
                else { // no data - just create array and save
                    logObject("addTaskRecord(1)", "Creating database file with", dataobj);
                    if (dataobj.taskAET == "") {
                        logObject("addTaskRecord (2)", "LOGT Failed to get taskAET", dataobj);
                        dataobj.taskAET = "0.0";
                    }
                    dataArray.unshift(dataobj);
                    s_saveTrackData(dataArray, null, false);
                    sendTimeTaken(dataArray, dataobj);
                    setActiveTask(dataobj, tabId);
                }
            }
            else { // no data - just create array and save
                logObject("addTaskRecord(2)", "LOGT Creating database file with", dataobj);
                if (dataobj.taskAET == "")
                    dataobj.taskAET = "0.0";
                dataArray.unshift(dataobj);
                s_saveTrackData(dataArray, null, false);
                sendTimeTaken(dataArray, dataobj);
                setActiveTask(dataobj, tabId);
            }
        }
    });
}



/**
 * Save the spell-correction list to chrome.storage.local.
 */
function writeSpell() {
    //remove blank entries
    for (let i = 0; i < controlObj.spellArray.length;) {
        if (controlObj.spellArray[i].old == null || controlObj.spellArray[i].old == "") {
            controlObj.spellArray.splice(i, 1);
        }
        else
            i++;
    }
    chrome.storage.local.set({ 'MDESPcustom': JSON.stringify(controlObj.spellArray) });
}


/**
 * Load the spell-correction list from chrome.storage.local.
 *
 * @param {string} tabidin
 * @param {*} broadcastin
 */
function readSpell(tabidin, broadcastin) {
    let tabid = tabidin;
    let broadcast = broadcastin;
    //if (controlObj.spellArray == null) {
    chrome.storage.local.get('MDESPcustom', function processControlObj(data) { //ok
        if (chrome.runtime.lastError) {
        }
        else {
            let datacustom = null;
            if (data.MDESPcustom != null) {
                datacustom = JSON.parse(data.MDESPcustom);
                controlObj.spellArray = datacustom;
            }
            else {
                controlObj.spellArray = corrections;
                chrome.storage.local.set({ 'MDESPcustom': JSON.stringify(controlObj.spellArray) });
            }
            if (tabid != null)
                SendSafeTabMessage(tabid, { text: "SPELLARRAY", data: controlObj.spellArray, autocorrect: controlObj.enhancements[indexChat][indexData].autocorrect });
        }
        if (broadcast) {
            sendTabMessage(raterChat, { text: "SPELLARRAY", data: controlObj.spellArray, autocorrect: controlObj.enhancements[indexChat][indexData].autocorrect });
            sendTabMessage(taskPage, { text: "SPELLARRAY", data: controlObj.spellArray, autocorrect: controlObj.enhancements[indexChat][indexData].autocorrect });
        }
    });
    //    }
    //    else
    //        if (tabid != null)
    //            SendSafeTabMessage(tabid, { text: "SPELLARRAY", data: controlObj.spellArray, autocorrect: controlObj.enhancements[indexChat][indexData].autocorrect });
    //        else if (broadcast) {
    //            sendTabMessage(raterChat, { text: "SPELLARRAY", data: controlObj.spellArray, autocorrect: controlObj.enhancements[indexChat][indexData].autocorrect });
    //            sendTabMessage(taskPage, { text: "SPELLARRAY", data: controlObj.spellArray, autocorrect: controlObj.enhancements[indexChat][indexData].autocorrect });
    //        }
}


/**
 * Merge an imported spell list with the existing one, deduplicating.
 *
 * @param {Object} inSpellin
 * @returns {Array}
 */
function mergeSpell(inSpellin) {
    let inSpell = inSpellin;
    if (controlObj.spellArray == null) {
        //have to make sure there isnt a spell local storage area
        chrome.storage.local.get('MDESPcustom', function processControlObj(data) { //ok
            if (chrome.runtime.lastError) {
                return ("Error getting custom spellings" + chrome.runtime.lastError.message);
            }
            else {
                let datacustom = null;
                if (data.MDESPcustom != null) {
                    return ("cant do this, spell detected but wasnt loaded");
                }
                else {
                    controlObj.spellArray = inSpell;
                    writeSpell();
                    return ("Imported " + inSpell.length + " Records.");
                }
            }
        });
    }
    else {
        inSpell.forEach(function (thisObj) {
            let one2change = controlObj.spellArray.findIndex(x => x.old == thisObj.old);
            if (one2change > -1)
                controlObj.spellArray[one2change].new = thisObj.new;
            else
                controlObj.spellArray.push({ old: thisObj.old, new: thisObj.new });
        });
        writeSpell();
        return ("Imported " + inSpell.length + " Records.");
    }
}

// related to totals all devices
/**
 * Return the stored device/computer identifier string.
 * @returns {*}
 */
function getThisComputer() {
    return controlObj.thisComputer;
}


let detControlObj = { nextNum: 0, recs: null };

/**
 * Return the numeric device index for this computer.
 *
 * @param {Function} func2Call
 */
function getDeviceNum(func2Call) {
    let thisComputer = { number: 0, desc: "" };
    let local_func2Call = func2Call;
    chrome.storage.sync.get('MDECData', function (data) { //ok
        if (chrome.runtime.lastError) {
            local_func2Call(null);
        }
        else {
            if (data.MDECData != null)
                detControlObj = JSON.parse(data.MDECData);
            thisComputer.number = detControlObj.nextNum;
            thisComputer.desc = navigator.appVersion; //v3
            local_func2Call(thisComputer);
            detControlObj.nextNum += 1;
            saveCData(detControlObj);
        }
    });
}

/**
 * Update the cumulative productivity totals in the consolidated record.
 *
 * @param {Array} taskArrya
 * @param {Object} aetrange
 * @param {Date} optDate
 * @param {Date} updateall
 * @returns {Array}
 */
function UpdCtotals(taskArrya, aetrange, optDate, updateall) { //array, str, bool
    let thisComputer = getThisComputer();
    let total = { recs: 0, date: null, work: 0, raet: 0 };
    let totalCRec = { date: "", raetMils: 0, workMils: 0, platform: thisComputer.number + " " + thisComputer.desc.substr(0, 10) };
    let local_all = updateall;
    let local_optDate = optDate;
    let local_taskData = taskArrya;

    //is rec out of bounds for C totals.. 
    //let bounds = { start: null, end: null }; javascript date fields 
    let bounds = background_getBounds4today();

    if (optDate != null) {
        let compDate = new Date(optDate);
        if (compDate < bounds.start)
            //this date is before totals in C totals, so do nothing
            return;
    }


    chrome.storage.sync.get('MDECData', function (data) { //ok
        if (chrome.runtime.lastError) {
        }
        else {
            if (data.MDECData != null) {
                detControlObj = JSON.parse(data.MDECData);
            }
            else {
                console.log("unexpected null all device totals data");
                return;
            }

            if (detControlObj.recs == null)
                detControlObj.recs = new Array();

            if (local_all == false) { // just doing the date I was passed
                total = getTotalsToday(local_taskData, local_optDate, aetrange);
                totalCRec.date = total.date;
                totalCRec.raetMils = total.raet;
                totalCRec.workMils = total.work;

                let index = detControlObj.recs.findIndex(x => (x.date == total.date && x.platform == (thisComputer.number + " " + thisComputer.desc.substr(0, 10))));
                if (index != -1) {
                    if (total.recs == 0) {
                        //need to delete this rec - we don't have anything to report for this day (anymore)
                        let newarray = detControlObj.recs.filter(function (el) {
                            return !(el.date == total.date && el.platform == (thisComputer.number + " " + thisComputer.desc.substr(0, 10)));
                        });
                        detControlObj.recs = newarray;
                    }
                    else {
                        detControlObj.recs[index].raetMils = totalCRec.raetMils;
                        detControlObj.recs[index].workMils = totalCRec.workMils;
                    }
                }
                else if (total.recs > 0)
                    detControlObj.recs.push({ date: totalCRec.date, raetMils: totalCRec.raetMils, workMils: totalCRec.workMils, platform: totalCRec.platform });
                //write it
            }
            else {
                //doing all dates in the current two periods
                for (let curDay = new Date(bounds.start); curDay <= bounds.end; curDay = curDay.addDays(1)) {
                    totalCRec.date = (curDay.getMonth() + 1) + '/' + curDay.getDate() + '/' + curDay.getFullYear();
                    total = getTotalsToday(local_taskData, totalCRec.date, aetrange);
                    if (total && (total.work > 0 || total.raet > 0)) {
                        totalCRec.raetMils = total.raet;
                        totalCRec.workMils = total.work;
                        detControlObj.recs = updateThisday(detControlObj.recs, totalCRec);
                    }
                    else {
                        //need to delete this rec - we don't have anything to report for this day (anymore)
                        let newarray = detControlObj.recs.filter(function (el) {
                            return !(el.date == total.date && el.platform == (thisComputer.number + " " + thisComputer.desc.substr(0, 10)));
                        });
                        detControlObj.recs = newarray;
                    }
                }
            }
            saveCData(detControlObj);
        }
        return;
    });
}

/**
 * Remove task records older than the configured retention window.
 *
 * @param {Array} dataArray
 * @param {*} days
 * @param {Date} compDateIn
 * @returns {*}
 */
function trackCleanup(dataArray, days, compDateIn) {
    let saveDate = new Date();
    if (compDateIn == null) {
        let dday = new Date(Date.now());
        saveDate = dday.subDays(days);
    }
    else
        saveDate = compDateIn; //compDate is delete everything before this date
    let newData = dataArray.filter(function (obj) {
        let compDate = new Date(obj.dateofTask);
        return (compDate > saveDate);
    });
    //return newData
    return newData;
}


/**
 * Remove consolidated records outside the retention window.
 * @returns {*}
 */
function consolidatedCleanup() {
    chrome.storage.sync.get('MDECData', function (data) { //ok
        if (chrome.runtime.lastError) {
        }
        else {
            if (data.MDECData != null) {
                detControlObj = JSON.parse(data.MDECData);
                if (detControlObj.recs != null) {
                    let dday = new Date(Date.now());
                    dday = dday.subDays(21);
                    let newData = detControlObj.recs.filter(function (rec) {
                        let compDate = new Date(rec.date);
                        return (compDate > dday);
                    });
                    detControlObj.recs = newData;
                    saveCData(detControlObj);
                }
            }
        }
    });
}



/**
 * Return the start and end timestamps for today's tracking window.
 * @returns {Array}
 */
function background_getBounds4today() {
    let bounds = { start: null, end: null };
    //reuseing code from popup cause I'm lazy 
    let period = { desc: "", startDate: 0, endDate: 0, start2week: 0 };
    let today = new Date();
    let periodArray = new Array();

    for (let i = 0; i < 2; i++) {
        period.startDate = new Date(dates_getStartofPeriod(today));
        period.endDate = new Date(period.startDate.addDays(13));
        period.start2week = period.startDate.addDays(7);
        periodArray.push({ startDate: period.startDate, endDate: period.endDate, start2week: period.start2week });
        today = today.subDays(14);
    }

    bounds.start = periodArray[1].startDate;
    bounds.end = periodArray[0].endDate;
    return bounds;
}

/**
 * Recalculate and store the productivity totals for today.
 *
 * @param {Array} arrayIn
 * @param {Object} totalC
 * @returns {Array}
 */
function updateThisday(arrayIn, totalC) {
    let newArray = arrayIn;
    let index = arrayIn.findIndex(x => (x.date == totalC.date && x.platform == totalC.platform));
    if (index == -1)
        newArray.push({ date: totalC.date, raetMils: totalC.raetMils, workMils: totalC.workMils, platform: totalC.platform });
    else {
        newArray[index].raetMils = totalC.raetMils;
        newArray[index].workMils = totalC.workMils;
    }
    return newArray;
}

/**
 * Broadcast the elapsed task time to the active task tab.
 *
 * @param {Date} dataA
 * @param {Object} obj
 * @returns {*}
 */
function sendTimeTaken(dataA, obj) {
    let tt = 0;
    let smArray = dataA.filter(function (thisObj) {
        return thisObj.taskId == obj.taskId;
    });
    if (smArray.length >= 0) {
        smArray.forEach(function (thisobj) {
            if (thisobj.taskId == obj.taskId)
                tt += thisobj.workTime;
        });
    }
    if (tt > 0) {
        sendTabMessage(taskPage, { text: "TIMETAKEN", timet: tt });
    }
    return tt;
}


/**
 * Wrapper that saves tracking data and triggers a totals update.
 *
 * @param {Date} data
 * @param {Date} datein
 * @param {Date} updateAll
 */
function s_saveTrackData(data, datein, updateAll) {
    saveTrackData(data, datein, updateAll);
}

/**
 * Import and merge a full backup of tracking data into storage.
 *
 * @param {Object} lines
 * @returns {*}
 */
function processImportAll(lines) { // use for restore track data from backup
    let retMsg = "";
    //read this code again
    //this file has to match this format. If it doesn't just stop because this is way too dangerous
    //line 0 is "MDELocData"
    //line 1 is the stringified version of MDELocData
    //line 2 is MDESPcustom
    //line 3 is the stringified version of MDESPcustom
    //line 4 is MDEPHcustom
    //line 5 is the stringified version of MDEPHcustom
    //line 6 is trackData
    //line 7 is the stringified version of trackData
    // if there wasn't any data to backup for any of these, the second line will be "NONE"
    if (lines[0] != "MDELocData" ||
        lines[2] != "MDESPcustom" ||
        lines[4] != "MDEPHcustom" ||
        lines[6] != "trackData") {
        //set error message 
        retMsg = "Restore Failed. Unexpected file format in backup file. See background log for more info or contact mdipros48@gmail.com";
    }
    else {
        //migrate enhancements and then set them
        let tenhancements = JSON.parse(lines[1]);
        controlObj.enhancements = migrateEnhancements(tenhancements);
        saveControlObj();
        //save MDESPcustom if not none
        if (lines[3] != "NONE") {
            controlObj.spellArray = JSON.parse(lines[3]);
            chrome.storage.local.set({ 'MDESPcustom': lines[3] });
        }
        //save MDEPHcustom if not none
        if (lines[5] != "NONE") {
            let holdP = JSON.parse(lines[5]);
            background_setPhrases(holdP, true);
        }

        //save trackData if not none
        if (lines[7] != "NONE") {
            let dataA = JSON.parse(lines[7]);
            s_saveTrackData(dataA, null, false);
            //rebuildtotals
            UpdCtotals(dataA, controlObj.enhancements[indexTracker][indexData].aetrange, null, true);
            //set up environment
            //myListener({ request: "preactivate", enhancements: enhancements }, null, function (data) { });
        }
        retMsg = "Data has been restored";
    }
    return retMsg;
}

//related to test messaging 
// add send frequency logic
// if sending the nrt end message - need to count a few refreshs before sending - count in msgobj?
/**
 * Handle a RaterHub status update message from a content script.
 *
 * @param {Object} oldStatus
 * @param {Object} newStatus
 * @param {boolean} options
 * @returns {*}
 */
function processRHStatus(oldStatus, newStatus, options) {

    let msgBase = "Found at Index:";
    let msgDesc = "";
    let taskdesc = "";
    let nrtMsg = "NRT Start";
    let nrtendMsg = "NRT End";
    let newStatus2send = newStatus;


    if (options.nrtstart && oldStatus.nrt == 0 && newStatus.nrt == 1) {
        newStatus.nrtstartcount++;
        newStatus.nrtstopcount = 0;
        if ((newStatus.nrtstartcount) < options.textafter) {
            // we aren't going to switch status just yet.. 
            logObject("processRHStatus", "counting NRT start. Not sending message yet:" + newStatus.nrtstartcount);
            newStatus2send.nrt = false;
            return newStatus2send;
        }
        msgDesc = nrtMsg;
    }

    // only do this if there is possibly something at the index
    else {
        if (options.nrtstop && oldStatus.nrt == 1 && newStatus.nrt == 0) {
            newStatus.nrtstopcount++;
            newStatus.nrtstartcount = 0;
            if ((newStatus.nrtstopcount) < options.textafter) {
                // we aren't going to switch status just yet.. 
                newStatus2send.nrt = true;
                logObject("processRHStatus", "counting NRT Stop. Not sending message yet:" + newStatus.nrtstopcount);
                return newStatus2send;
            }
            msgDesc = nrtendMsg;
        }

        if (options.hr && oldStatus.hr == false && newStatus.hr == true) {
            taskdesc += (" " + msgStrGet('hr', msgStrs) + ",");
        }
        if (options.uo && oldStatus.uo == false && newStatus.uo == true) {
            taskdesc += (" " + msgStrGet('uo', msgStrs) + ",");
        }
        if (options.hrs && oldStatus.hrs == false && newStatus.hrs == true) {
            msgDesc += (" " + msgStrGet('hrs', msgStrs) + ",");
        }
        if (options.pr && oldStatus.pr == false && newStatus.pr == true) {
            taskdesc += (" " + msgStrGet('pr', msgStrs) + ",");
        }
        if (options.hm && oldStatus.hm == false && newStatus.hm == true) {
            taskdesc += (" " + msgStrGet('hm', msgStrs) + ",");
        }
        if (options.sapr && oldStatus.sapr == false && newStatus.sapr == true) {
            taskdesc += (" " + msgStrGet('sapr', msgStrs) + ",");
        }
        if (options.ac && oldStatus.ac == false && newStatus.ac == true) {
            taskdesc += (" " + msgStrGet('ac', msgStrs) + ",");
        }

    }

    if (taskdesc.length > 0) {
        if (msgDesc != "")
            msgDesc += " ";
        msgDesc += (msgBase + taskdesc);
    }

    if (msgDesc.length > 0)
        sendTextMsg(msgDesc, true, "RH", null); //last parm not used
    //if we got this far, counts can be reset because we either are sending the message fot this situation, or we returned before now.
    newStatus2send.nrtstopcount = 0;
    newStatus2send.nrtstartcount = 0;

    return newStatus2send;
}

/**
 * Build the array of keyword alert phrases for chat monitoring.
 *
 * @param {string} textString
 * @returns {Array}
 */
function buildChatTextAlertsArray(textString) {
    let pieces;
    if (textString == null || textString.length == 0)
        return null;
    let newArray = new Array();
    let currentDate = new Date();
    //parse the string and initialize date field
    pieces = textString.split(','); //the phrases we are checking for
    for (i = 0; i < pieces.length; i++) {
        newArray.push({ phrase: pieces[i], lastDate: currentDate });
    }
    return newArray;
}

/**
 * Return true if text alerts should be suppressed for this session.
 *
 * @param {Object} filter
 * @param {number} waitTime
 */
function dontSendtext(filter, waitTime) {
    let alertArray = controlObj.enhancements[indexMsgOpts][indexData].chatTextAlertsArray;
    if (GetLogStatus()) {
    }
    let curtime = new Date();
    let index = alertArray.findIndex(x => x.phrase == filter);
    if (index == -1) {
        if (filter != "fromtest")
        return false;
    }
    let mins = mydiff(alertArray[index].lastDate, curtime, "minutes"); //curtime - alertArray[index].lastDate

    if (mins > waitTime) {
        alertArray[index].lastDate = curtime;
        return false;
    }
    return true;
}

// who is ME (monitor), CHAT, or RH
/**
 * Dispatch a text alert message via the messaging backend.
 *
 * @param {string} textMsgIn
 * @param {number} timestamp
 * @param {*} who
 * @param {*} what
 */
function sendTextMsg(textMsgIn, timestamp, who, what) {
    let msgObj = controlObj.enhancements[indexMsgOpts][indexData];

    if (msgObj.txtAlerts == false)
        return;
    //check for snooze
    if (msgObj.snoozestart != "none" && msgObj.snoozestop != "none") {
        let msgtimeStart = timeHHMMtoMils(msgObj.snoozestart);
        let msgtimeStop = timeHHMMtoMils(msgObj.snoozestop);
        if (msgtimeStart == undefined || msgtimeStop == undefined) {
        }
        else {
            // get curtime
            let curTime = new Date();
            //time is in 24hr time. 
            if (GetLogStatus()) { /* debug logging removed */ }
            if (isTimeBetween(curTime, msgtimeStart, msgtimeStop)) {
                if (GetLogStatus()) console.log(" between");
                return;
            }
            else {
                if (GetLogStatus()) { /* debug logging removed */ }
            }
        }
    }

    //if the message is from Chat, we need to make sure we haven't sent too many in a short period of time
    //hardcoded at 60 secs for now

    if (who == "CHAT" && dontSendtext(what, controlObj.enhancements[indexMsgOpts][indexData].chatTextLimit)) {
        if (GetLogStatus())
        return;
    }
    let textMsg = (controlObj.thisComputer.desc.substr(0, 10)) + ":" + textMsgIn;
    let parms = {
        "id": "",
        "name": msgObj.name,
        "number": msgObj.number,
        "sendkey": msgObj.sendkey,
        "email": msgObj.email,
        "providers": msgObj.carrier,
        "status": "New",
        "data": "{}",
        "apikey": msgObj.apikey,
        "message": null
    };

    parms.message = textMsg;
    if (timestamp)
        parms.message += " on " + Date();

    logObject("SendText", "Message: " + textMsg);
    sendIt(parms)
        .then(function (result) {
            //ok
        })
        .catch(function (error) {
        });
    //sendItT(parms);
}

//gmjgfhomaafjkdfbkaaogdnegkcigdob

/**
 * Store and apply user account info received from a content script.
 *
 * @param {Date} data
 * @returns {*}
 */
function processUserInfo(data) {

    let dataObj = JSON.parse(data);
    let msgObj = controlObj.enhancements[indexMsgOpts][indexData];
    //    msgObj.name = dataObj.name;
    //    msgObj.number = dataObj.number;
    msgObj.sendkey = dataObj.sendkey;
    msgObj.carrier = dataObj.providers;
    if (msgObj.email == "" || msgObj.email != dataObj.email)
        msgObj.email = dataObj.email;

    saveControlObj();
    return msgObj;
}

//function send2Monitor(type) {
//    let local_type = type;
//    check4Monitor(true, function () { SendSafeRuntimeMessage({ text: "MONITORPLAYSOUND", type: local_type }); });
//}

/**
 * Handle selection of a single task item in the RH task list.
 *
 * @param {Object} status
 */
function oneSelected(status) {
    if (status.nrt || status.uo || status.ac || status.sapr || status.hr || status.pr || status.hrs || status.hm || status.nrtstart || status.nrtstop)
        return true;
    else
        return false;
}

//start text  message monitor - send a message once an hour 
let textMessageAliveMsgTimer = 0;

/**
 * Enable or disable the chat/task monitor for the active tab.
 *
 * @param {Object} state
 */
function setMonitor(state) {
    if (state) {
        if (textMessageAliveMsgTimer != 0)
            clearInterval(textMessageAliveMsgTimer);
        textMessageAliveMsgTimer = setInterval(function () {
            sendTextMsg('ok', true, "ME", null); //lastparm not used
        }, 3600000);
    }
    else
        if (textMessageAliveMsgTimer != 0) {
            clearInterval(textMessageAliveMsgTimer);
            textMessageAliveMsgTimer = 0;
        }
}

//function s_loadsounds() {
//    let soundIndex = controlObj.default_sounds.findIndex(x => x.type == "CHAT");
//    if (controlObj.enhancements[indexChat][indexData].chatalertsound != controlObj.default_sounds[soundIndex].default)
//        loadSound("CHAT", soundIndex, function (data, index) {
//            if (data != null)
//                controlObj.default_sounds[index].active = data;
//            else {
//                controlObj.default_sounds[index].active = controlObj.default_sounds[index].default;
//                controlObj.enhancements[indexChat][indexData].chatalertsound = controlObj.default_sounds[index].default;
//            }
//        });
//    else
//        controlObj.default_sounds[soundIndex].active = controlObj.default_sounds[soundIndex].default;

//    soundIndex = controlObj.default_sounds.findIndex(x => x.type == "NRT");
//    if (controlObj.enhancements[indexRaterHub][indexData].rhrfreshsound != controlObj.default_sounds[soundIndex].default)
//        loadSound("NRT", soundIndex, function (data, index) {
//            if (data != null)
//                controlObj.default_sounds[index].active = data;
//            else {
//                controlObj.default_sounds[index].active = controlObj.default_sounds[index].default;
//                controlObj.enhancements[indexChat][indexData].rhrfreshsound = controlObj.default_sounds[index].default;
//            }
//        });
//    else
//        controlObj.default_sounds[soundIndex].active = controlObj.default_sounds[soundIndex].default;

//    soundIndex = controlObj.default_sounds.findIndex(x => x.type == "RHINDEX");
//    if (controlObj.enhancements[indexRaterHub][indexData].rhindexsound != controlObj.default_sounds[soundIndex].default)
//        loadSound("RHINDEX", soundIndex, function (data, index) {
//            if (data != null)
//                controlObj.default_sounds[index].active = data;
//            else {
//                controlObj.default_sounds[index].active = controlObj.default_sounds[index].default;
//                controlObj.enhancements[indexChat][indexData].rhindexsound = controlObj.default_sounds[index].default;
//            }
//        });
//    else
//        controlObj.default_sounds[soundIndex].active = controlObj.default_sounds[soundIndex].default;

//    soundIndex = controlObj.default_sounds.findIndex(x => x.type == "TRACKER");
//    if (controlObj.enhancements[indexTracker][indexData].timeralertsound != controlObj.default_sounds[soundIndex].default)
//        loadSound("TRACKER", soundIndex, function (data, index) {
//            if (data != null)
//                controlObj.default_sounds[index].active = data;
//            else {
//                controlObj.default_sounds[index].active = controlObj.default_sounds[index].default;
//                controlObj.enhancements[indexChat][indexData].timeralertsound = controlObj.default_sounds[index].default;
//            }

//        });
//    else
//        controlObj.default_sounds[soundIndex].active = controlObj.default_sounds[soundIndex].default;
//}

/**
 * Return the default alert sound filename.
 *
 * @param {string} type
 * @returns {*}
 */
function getdefaultsound(type) {
    let index = controlObj.default_sounds.findIndex(x => x.type == type);
    if (index == -1) {
        return null;
    }

    logObject("getdefaultsound", "index:type" + index + ":" + type);
    return controlObj.default_sounds[index].default;
}

//function getactivesound(type) {
//    let index = controlObj.default_sounds.findIndex(x => x.type == type);
//    if (index == -1) {
//        return null;
//    }
//    logObject("getactivesound", "index:type" + index + ":" + type);
//    if (controlObj.default_sounds[index].active != "" && controlObj.default_sounds[index].active != null)
//        return controlObj.default_sounds[index].active;
//    else return controlObj.default_sounds[index].default;
//}
//"LOCALSTORAGE" means go to local storage for this
/**
 * Save updated sound preference settings to chrome.storage.
 *
 * @param {string} type
 * @param {string} str
 * @param {*} toPop
 */
function updateSoundSettings(type, str, toPop) {
    monitorURL = 'chrome-extension://' + chrome.runtime.id + "/monitor.html";
    let index = controlObj.default_sounds.findIndex(x => x.type == type);
    if (index == -1) {
        return;
    }
    if (controlObj.default_sounds[index].active != str) {
        //dont need to load it - its already in str
        controlObj.default_sounds[index].active = str;
        //now update controlObj.enhancements setting - so we will load it next time we restart
        if (type == "CHAT") {
            //controlObj.enhancements[indexChat][indexData].chatalertsound = "LOADSTORAGE";
            sendTabMessage(raterChat, { text: "NEWCHATSOUND", beep: getactivesound("CHAT", controlObj.default_sounds) });
        }
        else if (type == "WAH") {
            //controlObj.enhancements[indexRaterHub][indexData].rhrfreshsound = "LOADSTORAGE";
            sendTabMessage(monitorURL, { text: "NEWRHSOUND", type: "WAH", beep: getactivesound("WAH", controlObj.default_sounds) });
        }
        else if (type == "NRT") {
            controlObj.enhancements[indexRaterHub][indexData].rhrfreshsound = "LOADSTORAGE";
            sendTabMessage(monitorURL, { text: "NEWRHSOUND", type: "NRT", beep: getactivesound("NRT", controlObj.default_sounds) });
        }
        else if (type == "RHINDEX") {
            controlObj.enhancements[indexRaterHub][indexData].rhindexsound = "LOADSTORAGE";
            sendTabMessage(monitorURL, { text: "NEWRHSOUND", type: "RHINDEX", beep: getactivesound("RHINDEX", controlObj.default_sounds) });
        }
        else if (type == "TRACKER") {
            controlObj.enhancements[indexTracker][indexData].timeralertsound = "LOADSTORAGE";
        }
        if (toPop != undefined)
            SendSafeRuntimeMessage({ text: "UPDATEPOPSOUNDS", sounds: controlObj.default_sounds });
        saveControlObj();

    }
}

/**
 * Reset all sound settings to their factory defaults.
 *
 * @param {string} type
 */
function resetSoundSettings(type) {
    monitorURL = 'chrome-extension://' + chrome.runtime.id + "/monitor.html";
    let index = controlObj.default_sounds.findIndex(x => x.type == type);
    controlObj.default_sounds[index].active = controlObj.default_sounds[index].default;
    if (type == "CHAT") {
        controlObj.enhancements[indexChat][indexData].chatalertsound = controlObj.default_sounds[index].default;
        sendTabMessage(raterChat, { text: "NEWCHATSOUND", beep: getactivesound("CHAT", controlObj.default_sounds) });
    }
    else if (type == "NRT") {
        controlObj.enhancements[indexRaterHub][indexData].rhrfreshsound = controlObj.default_sounds[index].default;
        sendTabMessage(monitorURL, { text: "NEWRHSOUND", type: "NRT", beep: getactivesound("NRT", controlObj.default_sounds) });
    }

    else if (type == "RHINDEX") {
        controlObj.enhancements[indexRaterHub][indexData].rhindexsound = controlObj.default_sounds[index].default;
        sendTabMessage(monitorURL, { text: "NEWRHSOUND", type: "RHINDEX", beep: getactivesound("RHINDEX", controlObj.default_sounds) });
    }

    else if (type == "TRACKER")
        controlObj.enhancements[indexTracker][indexData].timeralertsound = controlObj.default_sounds[index].default;

    saveControlObj();
}



/**
 * Load the phrase list from chrome.storage and return it.
 *
 * @param {string} tabid
 * @param {Object} message
 * @param {Object} phsent
 * @param {Object} forcedread
 * @returns {*}
 */
function background_getPhrases(tabid, message, phsent, forcedread) {
    if (controlObj.phraseArray == null || forcedread) {
        chrome.storage.local.get('MDEPHcustom', function (data) { //ok
            if (chrome.runtime.lastError) {
            }
            else {
                let datacustom = null;
                if (data.MDEPHcustom != null) {
                    datacustom = JSON.parse(data.MDEPHcustom);
                    ////clean it up and then send it
                    //let tempA = datacustom.filter(element => element.phrase == null || element.phrase.length < 1);
                    //if (tempA.length != datacustom.length)
                    //    datacustom = tempA;
                    if (tabid != null)
                        SendSafeTabMessage(tabid, { text: message, phsent: phsent, phrases: datacustom });
                    else {
                        sendTabMessage(raterChat, { text: "PHRASES", phrases: controlObj.phraseArray, phsent: controlObj.enhancements[indexChat][indexData].phsent });
                        sendTabMessage(taskPage, { text: "PHRASES", phrases: controlObj.phraseArray, phsent: controlObj.enhancements[indexChat][indexData].phsent });
                    }
                    background_setPhrases(datacustom, false);
                }
                else {
                    /* get system default phrases */
                    if (tabid != null)
                        SendSafeTabMessage(tabid, { text: message, phsent: phsent, phrases: background_basephraseArray });
                    else {
                        sendTabMessage(raterChat, { text: "PHRASES", phrases: controlObj.phraseArray, phsent: controlObj.enhancements[indexChat][indexData].phsent });
                        sendTabMessage(taskPage, { text: "PHRASES", phrases: controlObj.phraseArray, phsent: controlObj.enhancements[indexChat][indexData].phsent });
                    }
                    background_setPhrases(background_basephraseArray, false);
                }
            }
        });
    }
    else if (tabid != null)
        SendSafeTabMessage(tabid, { text: message, phsent: phsent, phrases: controlObj.phraseArray });
    return controlObj.phraseArray;
}

/**
 * Save an updated phrase list to chrome.storage.
 *
 * @param {Date} data
 * @param {Object} saveData
 */
function background_setPhrases(data, saveData) {
    controlObj.phraseArray = data;
    if (saveData == true) {
        //remove any null phrases before saving
        for (let i = 0; i < controlObj.phraseArray.length; i++) {
            if (controlObj.phraseArray[i].Phrase == null || controlObj.phraseArray[i].Phrase.length == 0)
                controlObj.phraseArray.splice(i, 1);
        }

        if (controlObj.phraseArray.length == 0)
            chrome.storage.local.remove('MDEPHcustom', function () {
                controlObj.phraseArray = null;
            });
        else {
            chrome.storage.local.set({ 'MDEPHcustom': JSON.stringify(controlObj.phraseArray) }, function () {
                if (chrome.runtime.lastError) {
                }
            });
        }
        saveControlObj();
    }
}

//each line represents a phrase to add to phrases
//return message with info about what we did
/**
 * Merge an imported phrase list with the current one.
 *
 * @param {Object} lines
 * @returns {Array}
 */
function mergePhrases(lines) {
    let retStr = "no lines to add";
    let count = 0;
    if (lines.length > 0) {
        for (let i = 0; i < lines.length; i++) {
            let exists = controlObj.phraseArray.findIndex(x => x.Phrase == lines[i]);
            if (exists == -1) {
                controlObj.phraseArray.push({ Phrase: lines[i] });
                count++;
            }
        }
        background_setPhrases(controlObj.phraseArray, true);
        retStr = {
            msg: count + " added to phrase table.",
            phraseArray: controlObj.phraseArray
        };
    }
    return retStr;
}

//// context scripts get these two notifications 
//function background_beep(srcin, sender) {
//    background_playSound(srcin);
//    /*
//    if (sender.tab == undefined) {
//        SendSafeRuntimeMessage({ text: "PLAYTHIS", data: srcin });
//    }
//    else {
//        //chrome.tabs.update(sender.tab.id, { active: true });
//        SendSafeTabMessage(sender.tab.id, {
//            text: "PLAYTHIS", data: srcin
//        }, null);
//    }
//    */
//}


/**
 * Send an alert notification from the background to the popup.
 *
 * @param {string} msg
 * @param {string} tabId
 */
function background_alert(msg, tabId) {

    if (tabId != null)
        SendSafeTabMessage(tabId, {
            text: "ALERTFROMBACKGROUND", msg: msg
        }, null);
    else
        SendSafeRuntimeMessage({ text: "ALERTFROMBACKGROUND", msg: msg }, null);
}

let s_sound2send = "";

async function background_playSound(type, soundF, final) {
    // Check all windows controlled by the service worker to see if one
    // of them is the offscreen document with the given path
    let src2use = "";
    if (type == 'PLAYSOUNDF') {
        if (soundF == undefined) {
            return;
        }
        else
            src2use = soundF;
    }
    else
        src2use = getactivesound(type, controlObj.default_sounds);

    if (src2use == "NONE")
        return;

    s_sound2send = src2use;
    background_sendOffscreen(s_sound2send);
}



/**
 * Aggregate productivity totals across all stored task records.
 *
 * @param {Date} dataA
 */
function getTotals(dataA) {
    let today = new Date();
    let inDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    let weekStartdate = getStartofThisWeek(inDate);
    let periodStart = new Date(dates_getStartofPeriod(null));
    let totals = { today: "00:00:00", weektotal: "00:00:00", periodtotal: "00:00:00", surplus: "00:00:00", realWeekAET: "00:00:00", count: 0 }; //here
    let totalAET = 0;
    let totalTime = 0;
    let rweekaet = 0
    let totalTaskCount = 0;
    let zone = controlObj.enhancements[indexTracker][indexData].zone; // L or P

    let dday = new Date(Date.now());
    let lastDate = (dday.getMonth() + 1) + '/' + dday.getDate() + '/' + dday.getFullYear();
    let dComp = lastDate;
    let curDate = null;
    //let dataB = mergeData(dataA);
    let dataB = clone_taskarray(dataA);
    // sort them to be by date
    let reportData = localSort(dataB, "dateofTask", zone);
    //loop thru data and send it log messages
    for (let i = 0; i < reportData.length; i++) {
        let obj = reportData[i];
        // get date of this rec
        let curD = new Date(obj.dateofTask);
        curDate = (curD.getMonth() + 1) + '/' + curD.getDate() + '/' + curD.getFullYear();
        if (curDate != lastDate && totalTime > 0) {
            // if it's for this period - grab totals
            if (lastDate == dComp) { // if it's today grab those totals
                totals.today = millisToHoursMinutesAndSeconds(totalTime);
                if ((totalAET * 60000) > 0) {
                    let diff = (totalAET * 60000) - totalTime;
                    diffToday = diff;
                    totals.surplus = millisToHoursMinutesAndSeconds(diff);
                }
                else
                    totals.surplus = "00:00:00";


                if (diff < -499) { // less than rounds up to 0
                    totals.surplus = "-" + totals.surplus;
                }

                totals.count = totalTaskCount;

            }
            let ld = new Date(lastDate);
            if (ld.withoutTime() >= weekStartdate.withoutTime()) {
                //    if (d.withoutTime() < weekStartdate.withoutTime()) {
                // if it's for this week - grab totals
                totals.weektotal = millisToHoursMinutesAndSeconds(totalTime);
                totals.realWeekAET = millisToHoursMinutesAndSeconds(rweekaet * 60000);
                //rweekaet = 0;
            }
            if (ld.withoutTime() >= periodStart.withoutTime()) {
                //if (d.withoutTime() < periodStart.withoutTime()) {
                totals.periodtotal = millisToHoursMinutesAndSeconds(totalTime);
            }
            // if it's before this period - stop
            if (curD.withoutTime() < periodStart.withoutTime())
                break;
        }
        // add this entry to running totals
        let lastDate = curDate;
        totalTaskCount++;
        let start = new Date(obj.dateofTask);
        let end = obj.workTime;
        if (start != "Invalid Date" && end > 0 && obj.taskId != "") {
            totalTime += obj.workTime // total in milliseconds
            if (obj.taskAET == "")
                obj.taskAET = "0.0";
            if (obj.taskDesc != getReleasedConstant() && obj.taskDesc != getncConstant()) {
                rweekaet = rweekaet + processAET(obj.taskAET, controlObj.enhancements[indexTracker][indexData].aetrange);
                totalAET = totalAET + processAET(obj.taskAET, controlObj.enhancements[indexTracker][indexData].aetrange);
            }
            else {
                totalAET = totalAET + (obj.workTime / 60000);
            }
        }
    }
    // need to add this day to the totals
    if (lastDate == dComp && totalTime > 0) { // only day we have worked ever is today
        totals.today = millisToHoursMinutes(totalTime);
        totals.weektotal = millisToHoursMinutes(totalTime);
        totals.periodtotal = millisToHoursMinutes(totalTime);
        totals.realWeekAET = millisToHoursMinutes(rweekaet * 60000);
        totals.count = totalTaskCount;
        if ((totalAET * 60000) > 0) {
            let diff = (totalAET * 60000) - totalTime;
            diffToday = diff;
            totals.surplus = millisToHoursMinutes(diff);
        }
        else
            totals.surplus = "00:00:00";


        if (diff < -499) { // less than rounds up to 0
            totals.surplus = "-" + totals.surplus;
        }
    }
    else { // not sure this old comment is relevant (9/23) => special case - there is no data before this week/period
        let ld = new Date(lastDate);
        if (ld.withoutTime() >= weekStartdate.withoutTime()) {
            //    if (d.withoutTime() < weekStartdate.withoutTime()) {
            // if it's for this week - grab totals
            totals.today = stripSecs(totals.today);
            totals.weektotal = millisToHoursMinutes(totalTime);
            totals.realWeekAET = millisToHoursMinutes(rweekaet * 60000);
        }
        if (ld.withoutTime() >= periodStart.withoutTime()) {
            //if (d.withoutTime() < periodStart.withoutTime()) {
            totals.periodtotal = millisToHoursMinutes(totalTime);
        }

    }
    let newTotals = stripLeadingZeros(totals);
    sendTabMessage(taskPage, { text: "TOTALS", totals: newTotals, timet: 0 });
}
//here 10/21/23
/**
 * Load all configured sound files into the audio cache.
 */
function s_loadsounds() {
    let soundIndex = controlObj.default_sounds.findIndex(x => x.type == "CHAT");
    if (controlObj.default_sounds[soundIndex].active == 'LOADSTORAGE')
        loadSound("CHAT", soundIndex, function (data, index) {
            if (data != null)
                controlObj.default_sounds[index].active = data;
            else {
                controlObj.default_sounds[index].active = controlObj.default_sounds[index].default;
                controlObj.enhancements[indexChat][indexData].chatalertsound = controlObj.default_sounds[index].default;
            }
        });
    //else
    //    controlObj.default_sounds[soundIndex].active = controlObj.default_sounds[soundIndex].default;

    //    soundIndex = default_sounds.findIndex(x => x.type == "NRT");
    //    if (enhancements[indexRaterHub][indexData].rhrfreshsound != default_sounds[soundIndex].default)
    //        loadSound("NRT", soundIndex, function (data, index) {
    //            if (data != null)
    //                default_sounds[index].active = data;
    //            else {
    //                default_sounds[index].active = default_sounds[index].default;
    //                enhancements[indexChat][indexData].rhrfreshsound = default_sounds[index].default;
    //            }
    //        });
    //    else
    //        default_sounds[soundIndex].active = default_sounds[soundIndex].default;

    //    soundIndex = default_sounds.findIndex(x => x.type == "RHINDEX");
    //    if (enhancements[indexRaterHub][indexData].rhindexsound != default_sounds[soundIndex].default)
    //        loadSound("RHINDEX", soundIndex, function (data, index) {
    //            if (data != null)
    //                default_sounds[index].active = data;
    //            else {
    //                default_sounds[index].active = default_sounds[index].default;
    //                enhancements[indexChat][indexData].rhindexsound = default_sounds[index].default;
    //            }
    //        });
    //    else
    //        default_sounds[soundIndex].active = default_sounds[soundIndex].default;

    //    soundIndex = default_sounds.findIndex(x => x.type == "TRACKER");
    //    if (enhancements[indexTracker][indexData].timeralertsound != default_sounds[soundIndex].default)
    //        loadSound("TRACKER", soundIndex, function (data, index) {
    //            if (data != null)
    //                default_sounds[index].active = data;
    //            else {
    //                default_sounds[index].active = default_sounds[index].default;
    //                enhancements[indexChat][indexData].timeralertsound = default_sounds[index].default;
    //            }

    //        });
    //    else
    //        default_sounds[soundIndex].active = default_sounds[soundIndex].default;
}

