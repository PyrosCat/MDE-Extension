//let data = { taskId: "", dateofTask: null, taskDesc: "", taskAET: "", extras: "", workTime: 0 };//definition of cancedataObj from getTrack
//at&amp;t internet
//AT&amp;T has historically been one of the largest telecommunications company in the United State
// c# nullable string
// 2/9/19 added code to try and catch &amp;


//this variable is set when submit or submit and release is pushed. 
//we use to to dected this type of close vs them closing the tab. 
//this is all to account for expired tasks. we want to know when a task was submitted.
//multiple taskids look like... taskIds=7795964707,7795964708,7795964709

// taskdesc has status of task
//when its first logged (with LOGT it will be blank)
//when page is unloaded it gets set to s_status - which defaults to incomplete
//if page was unloaded by submit or sard setstatus was set to submitted
//if page was unloaded by a release it gets set to released. 

let s_status = getncConstant();
let db_S_TimeTaken = 0;
let s_timersound = null;
let s_dataobj = null;
let s_totals = "00:00/00:00";
let s_pqData = null;
let s_keydwnpress = false;
let s_rememberAET = "";
let s_timeropts = "";


/**
 * Return true if the current page is a RaterHub task error page.
 *
 * @param {Object} zEvent
 */
let diff;
let r1;

function s_keyDwnClip(zEvent) {
    document.removeEventListener("keydown", s_keyDwnClip);
    document.removeEventListener("click", s_keyDwnClip)
    s_keydwnpress = true;
    if (s_dataobj == null || s_dataobj.query == null) {
        s_dataobj = findQshared();
    }
}


/**
 * Keydown handler for task-page shortcuts (Alt+J, Alt+L, etc.).
 *
 * @param {Object} zEvent
 */
function s_keyDwn(zEvent) {
    if (zEvent.altKey && zEvent.code === "KeyJ") {
        SendSafeRuntimeMessage({ request: "CLOSERTABS" });
    }

 
    if (zEvent.altKey && zEvent.code === "KeyQ") {
        getQ();
    }

    if (zEvent.altKey && zEvent.code === "KeyL") {
        getQL();
    }

    if (zEvent.altKey && zEvent.code === "KeyY") {
        getYTQ();
    }


    //Presbyter (view Entity Reference Page, Web Search results)
    if (zEvent.altKey && zEvent.code === "KeyI") {
        getImageQ();
    }

    if (zEvent.altKey && zEvent.code === "KeyX") {
        getPstoreQ();
    }


    if (zEvent.altKey && zEvent.code === "KeyW") {
        skip2task();
    }

    if (zEvent.altKey && zEvent.code === "KeyM") {
        mapQ();
    }


    if (zEvent.altKey && zEvent.code === "KeyZ") {
        r = document.getElementsByClassName("ewok-error-field");
        if (r != null && r.length > 0) {
            r1 = r[0];
            r1.scrollIntoView();
        }
    }
    //if (zEvent.altKey && zEvent.code === "KeyE") {
    //}


    //if (zEvent.altKey && zEvent.code === "KeyR") {
    //    radios = document.getElementsByTagName('input');
    //    for (i = 0; i < radios.length; i++) {
    //        if (radios[i].type == "radio") {
    //        }
    //    }
    //}


    //if (radios[i].value = "no") {
    //    radios[i].checked = true;

}


// mapq code

/**
 * Extract the search query and location from the current RaterHub task page.
 * @returns {*}
 */
function getRH() {

    let data = { query: null, location: null };
    let pClass;

    pClass = document.getElementsByClassName(".ewok-buds-query-inline");
    if (pClass != null && pClass.length > 0)
        children = pClass[0].children;
    if (pClass == null || pClass.length == 0 || children.length < 1) {
        // check for the other name
        pClass = document.getElementById("ewok-plus-query");
        if (pClass != null) {
            children = pClass.children;
            if (children.length > 0) {
                child = children[0].children;
                if (child.length > 2) { // check for 3 instead
                    data.query = child[1].innerText;
                    if (children.length > 2) {
                        let str2parse = children[1].innerText;
                        if (str2parse != "") {
                            let pieces = str2parse.split("User Location: ");
                            if (pieces.length != 2) { /* invalid, skip */ }
                            else
                                data.location = pieces[1];
                        }

                    }
                }
            }
        }
        s_CheckPutClip(data);
        return data;
    }

    let child = children[0];
    let str2parse = child.innerText;
    if (str2parse == "" || str2parse == "")
        return data;
    let pieces = str2parse.split("\n");
    // "Query: Dow Jones live" == pieces[0]
    // "Locale: English (US)" == pieces[1]
    //  "User Location: Longmont, CO, USA" == pieces[2]
    // pieces[3] == "" is true, len is 4
    for (i = 0; i < pieces.length; i++) {
        let ss = pieces[i];
        if (ss != "") {
            if (ss.indexOf("Query: ") > -1) {
                let tq = ss.split("Query: ");
                if (tq.length == 2) { }
                else
                    data.query = tq[1];
            }
            else if (ss.indexOf("User Location: ") > -1) {
                let tq = ss.split("User Location: ");
                if (tq.length != 2) { }
                else
                    data.location = tq[1];
            }
        }
    }
    if (data.query == null) {
        //try this way - for shopping Q
        let div = document.getElementById("editable-102");
        if (div != null) {
            if (div.textContent.indexOf("Machine:") != 0) {
                let next = div.textContent.replace("Query:", "");
                if (next.length < div.textContent.length) {
                    let pieces = next.split("\n");
                    if (pieces.length > 1)
                        data.query = pieces[0];
                }
            }
        }
    }
    s_CheckPutClip(data);
    return data;
}

/**
 * Extract and cache query/location data from the active task page.
 */
function findQshared() {
    let dataobj;

    dataobj = getRH();
    if (dataobj.location == null || dataobj.location == "" || dataobj.location == "Please refer to map") {
        let bigboy = document.scripts;
        for(let i = 0; i < bigboy.length; i++) {
            let b = false;
            let tStr = bigboy[i];
            if (tStr.text.length > 0) {
                let w = tStr.text.indexOf('"politicalEntity":{"name":"');
                if (w > -1) {
                    let n = tStr.text.split('"politicalEntity":{"name":"');
                    // now n[1] has the location as the first string
                    // find term of the string
                    if (n.length == 2) {
                        w = n[1].indexOf('"');
                        if (w > 0) {
                            dataobj.location = n[1].substr(0, w);
                        }
                    }
                    break;
                }
                w = tStr.text.indexOf('"estimatedTaskTime":');
                if (w > -1) {
                    let n = tStr.text.split('"estimatedTaskTime":');
                    // now n[1] has the id as the first string
                    // find term of the string
                    if (n.length == 2) {
                        //split at ," 
                        let ty = n[1].split(',"');
                        s_rememberAET = ty[0];
                    }
                }

            }

        }
        if (dataobj.location == "Please refer to map")
            // we didn't find it
            dataobj.location = null;
    }
    if (dataobj.query != null) {
        s_dataobj = dataobj;
        s_CheckPutClip(dataobj);
        return dataobj;
    }

    let classes = document.getElementsByClassName("ewok-task-query");
    if (classes != null && (classes.length == 1 || classes.length == 2)) {
        let qStr = null;
        if (classes.length == 1)
            qStr = classes[0].innerText;
        else
            if (classes[0].className == classes[1].className)
                qStr = classes[0].innerText;
        if (qStr != null) {
            dataobj.query = qStr.replace(/&#39/g, "'");
            if (dataobj.query.indexOf("&amp;") != -1)
                dataobj.query = dataobj.query.replace(/&amp;/g, "&");
        }
    }
    else {
        let children = null;
        let pClass = document.getElementsByClassName(".ewok-buds-query-inline");
        if (pClass != null && pClass.length > 0)
            children = pClass[0].children;
        if (pClass != null && (pClass.length == 0 || children.length < 1)) {
            pClass = document.getElementById("ewok-plus-query");
            if (pClass != null)
                children = pClass[0].children;
        }
        if (children != null) {
            children = pClass.children;
            if (children.length > 0) {
                let child = children[0].children;
                if (child.length > 2) {
                    let qStr = child[1].innerText;
                    dataobj.query = qStr.replace(/&#39/g, "'");
                    if (dataobj.query.indexOf("&amp;") != -1)
                        dataobj.query = dataobj.query.replace(/&amp;/g, "&");
                }
            }
        }
        else {
            let pClass = document.getElementsByClassName("ewok-task-query");
            if (pClass != null && pClass.length > 0)
                dataobj.query = pClass[0].textContent;
        }
    }

    if (dataobj.query != null) {
        s_dataobj = dataobj;
        s_CheckPutClip(dataobj);
        return dataobj;
    }
    let imageq = document.getElementById("search-query-info");
    if (imageq != null) {
        let newQ = imageq.textContent;
        newQ = newQ.replace("[", "");
        newQ = newQ.replace("]", "");
        dataobj.query = newQ.trim();
    }
    if (dataobj.query == null) { //shopping quaility 
        let newQ = document.getElementById("editable-102");
        if (newQ != null) {
            if (newQ.textContent.indexOf("Machine:") != 0) {
                let f = newQ.textContent.replace("Query:", "");
                if (f != newQ) {
                    let j = f.split("\n");
                    if (j.length > 1)
                        dataobj.query = j[0];
                }
            }
        }
    }

    if (dataobj.query == null) { //UO SCRB's
        let newQ = document.getElementById("editable-173");
        if (newQ != null) {
            let f = newQ.textContent.replace("Query:", "");
            dataobj.query = f;
        }
        else { //prompts
            let div = document.getElementById("editable-29");
            if (div != null) {
                let c = div.children;
                if (c.length == 2 && c[1].textContent != undefined) {
                    let p = div.children[1].textContent;
                    dataobj.query = p.replace("Prompt:", "");
                    dataobj.query = dataobj.query.replace("\n", "");
                }
                else if (c.length == 1) {
                    let p = div.textContent;
                    dataobj.query = p.replace("Prompt:", "");
                    dataobj.query = dataobj.query.replace("\n", "");
                    dataobj.query = dataobj.query.trim();
                    //if (dataobj.query == "undefined") {
                    //    let div = document.getElementById("editable-2096");
                    //    if (div == null)
                    //        div = document.getElementById("editable-2096_copy2");
                    //    if (div != null) {
                    //        let c = div.children;
                    //        if (c.length == 2 && c[1].textContent != undefined) {
                    //            let p = div.children[1].textContent;
                    //            dataobj.query = p.replace("Prompt:", "");
                    //            dataobj.query = dataobj.query.replace("\n", "");
                    //        }
                    //        else if (c.length == 1) {
                    //            let p = div.textContent;
                    //            dataobj.query = p.replace("Prompt:", "");
                    //            dataobj.query = dataobj.query.replace("\n", "");
                    //        }
                    //    }

                    //}
                }
            }
        }
    }

    s_CheckPutClip(dataobj);
    return dataobj;
}

/**
 * Copy the task query to the clipboard if keyboard shortcut conditions are met.
 *
 * @param {Date} data
 */
function s_CheckPutClip(data) {
    s_dataobj = data;
    if (data != null && data.query != null) {
        if (s_keydwnpress) {
            putClipboard(data.query);
        }
        else {
        }
    }
    else {
    }
}
/**
 * Open a People Store search tab for the current task query.
 */
function getPstoreQ() {
    //let dataobj = findQshared();

    if (s_dataobj.query != null) {
        SendSafeRuntimeMessage({
            request: "OPENTAB", query: s_dataobj.query, type: "pstore"
        }); // code in background includes remove for this message
    }
}

// berry image search lp
//https://www.google.com/search?q=DeLand%2CFlorida%26tbm%3Disch
/**
 * Open a Google Images search tab for the current task query.
 */
function getImageQ() {

        //if (s_dataobj == null || s_dataobj.query == null) {
        //    //maybe this is an image task - get query a different way
        //    //berries
        //    //let f = document.getElementById("queries");
        //    //if (f != null) {
        //    //    win1 = window.open(f.children[0].href, "windowName=MyImg");
        //    //    SendSafeRuntimeMessage({
        //    //    request: "OPENTAB", query: dataobj.query, type: "image"
        //    //}); // code in background includes remove for this message
        //}
        if (s_dataobj.query != null) {
            // add word image to query
            //strip off the extra crap
            let newQ = s_dataobj.query.replace("(view Image Search results, Web Search results)", "");
            let newQ1 = newQ.replace("(view Entity Reference Page, Web Search results)", "");
            SendSafeRuntimeMessage({
                request: "OPENTAB", query: newQ1, type: "image"
            }); // code in background includes remove for this message
        }
    }

/**
 * Open a YouTube search tab for the current task query.
 */
function getYTQ() {
    //let dataobj = findQshared();

    if (s_dataobj.query != null) {
        SendSafeRuntimeMessage({ request: "OPENTAB", query: s_dataobj.query, type: "yt" }); // code in background includes remove for this message
    }
    //let win1 = window.open('https://www.youtube.com/results?search_query=' + qStr2, "windowName=MyWin");
}

/**
 * Return the plain search query string from the current task page.
 */
function getQ() {

    //let dataobj = findQshared();

    if (s_dataobj.query != null) {
        let newQ = s_dataobj.query.replace("(view Image Search results, Web Search results)", "");
        if (newQ != null) {
            s_dataobj.query = newQ;
            s_CheckPutClip(s_dataobj);
        }

        SendSafeRuntimeMessage({ request: "OPENQ", location: s_dataobj.location, query: newQ, localS: false }); // code in background includes remove for this message
    }
}

/**
 * Return the combined query and location string from the current task page.
 */
function getQL() {

    //let dataobj = findQshared();

    if (s_dataobj.query != null) {
        SendSafeRuntimeMessage({ request: "OPENQ", location: s_dataobj.location, query: s_dataobj.query, localS: true }); // code in background includes remove for this message
    }
}



/**
 * Open a Google Maps search for the current task location.
 */
function mapQ() {
    if (s_dataobj.location != null) {
        putClipboard(s_dataobj.query);
        SendSafeRuntimeMessage({ request: "OPENMAPQ", location: s_dataobj.location, query: s_dataobj.query }); // code in background includes remove for this message
    }
}

// tracker
/**
 * Read and return the current task tracking record from storage.
 * @returns {*}
 */
function getTrack() {

    let data = { taskId: "", dateofTask: null, taskDesc: s_status, taskAET: "", extras: "", workTime: 0 };//definition of dataObj
    let i;

    // get header info
    let pClass = document.getElementsByClassName("ewok-task-action-header");
    if (pClass != null && pClass.length != 1) {
        return data;
    }

    let children = pClass[0].children;
    //Mobile
    //Side By Side
    //Average Estimated Time = 9.0 minutes
    for (i = 0; i < children.length; i++) {
        if (children[i].innerText.indexOf("Average Estimated Time =") == 0) {
            data.taskAET = children[i].innerText.replace("Average Estimated Time =", " ");
            data.taskAET = data.taskAET.replace("minutes", "");
            data.taskAET = data.taskAET.replace("minute", "");
            data.taskAET = data.taskAET.trim();
        }
        else {
            data.extras = data.extras + children[i].innerText + " ";
            data.extras = data.extras.replace("Experimental", "Exp");
            data.extras = data.extras.replace("Side By Side", "SxS");
            data.extras = data.extras.replace("Mobile Exp Special Device or App Required", "Exp Spec Dev or App Reqd");
            data.extras = data.extras.replace("Headphones", "HP");
        }
    }
    /*
     * d = $(".ewok-task-disclaimer")
     * d.innerHTML = <div>\n  <span style="color:rgb(219,68,55);font-weight:bold">IMPORTANT:</span> In this task, you may be\n  exposed to queries, webpages, and/or topics that contain potentially\n  <b>upsetting-offensive (U-O) content</b>. If you do not feel comfortable reading these\n  instructions or rating this type of content, please release this task or opt out from the\n  <b>U-O rating group</b> on your\n  <a href="https://www.raterhub.com/evaluation/rater/settings" target="_blank">Rater Hub Settings page</a> (if you\n  are opted in).\n</div>'
    */
    let div = document.getElementById("editable-11");
    if (div != null && div.length != 0) {
        let c = div.children;
        if (c.length > 1 && c[1].text != undefined)
            data.extras = data.extras + " PQ";
    }
    else {
        let div = document.getElementsByClassName("pq-task-main-info");
        if (div != null && div.length != 0) {
            let c = div[0].children;
            if (c != null && c.length > 1 && c[1].text != undefined)
                data.extras = data.extras + " PQ";
        }
    }

    // for allitems in class check for either upsetting or "that contain potentially pornographic content".
    div = document.getElementsByClassName("ewok-task-disclaimer");
    for(let i = 0; i < div.length; i++) {
        let c = div[i].innerHTML;
        if (c.indexOf("upsetting-offensive") > -1)
            data.extras = data.extras + " UO";
        if (c.indexOf("that contain potentially <b>pornographic content</b>") > -1)
            data.extras = data.extras + " AC";

    }

    return data;
}

//main line code

let dStart = new Date();
let s_countd = 0;
let s_onebeep = false;
let contextData = "";

if (document.URL.indexOf("taskIds=") > -1 && isErrorTaskPage() == false) {
     
    try {
        SendSafeRuntimeMessage({ text: "WAKEUP", from: "DBCLICK" }, function (resp) { console.log("MDE: back from wakeup, in dbclick  no errors" ); });
    }
    catch (err) {
    }

    let trackObj = getTrack();

    chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
        if (msg.text == "TOTALS") {
            // let totals = { today: "00:00:00", weektotal: "00:00:00", periodtotal: "00:00:00", surplus: "00:00:00", realWeekAET: "00:00:00"};
            //        '<span id="notifyToday"></span><span id="notifySurplus"></span><span>)</span>' +
            //        '<span id="notifyWeek"></span>' +
            //s_totals = msg.totals;
            s_totals = (msg.totals.today + '/' + msg.totals.weektotal);

            sendResponse(0);
        }

        if (msg.text == "LOADPQDATA") {
            loadRatingExamples(function (data) {
                if (data != null)
                    SendSafeRuntimeMessage({ text: "SAVEPQDATA", data: data });
            });
        }

        if (msg.text == "PQDATA") {
            s_pqData = request.pqData;
            sendResponse(0);
        }

        if (msg.text == "PLAYTHIS") {
            beep(msg.data);
            sendResponse(0);
            return true;
        }

        if (msg.text == "ALERTFROMBACKGROUND") {
            handleAlert(msg.msg);
            sendResponse(0);
            return true;
        }

        if (msg.text == "MAKEREPORTR") {
            if (msg.data != null)
                backupTrack(msg.data, "report", msg.aetrange);
            sendResponse(0);
            return true;
        }

        if (msg.text == "MAKEREPORTD") {
            if (msg.data != null)
                backupTrack(msg.data, "data", msg.aetrange);
            sendResponse(0);
            return true;
        }


        if (msg.text && (msg.text == "SHORTCUTS")) {
            if (msg.status == false) {
                document.removeEventListener("keydown", s_keyDwn);
                document.removeEventListener("keydown", s_keyDwnClip);
                document.removeEventListener("click", s_keyDwnClip);
            }
            else {
                //$(document).ready(function () {
                    document.addEventListener("keydown", s_keyDwn);
                document.addEventListener("keydown", s_keyDwnClip);
                document.addEventListener("click", s_keyDwnClip);
                    let as = document.getElementsByTagName("a");
                    if (as != null)
                        for(let i = 0; i < as.length; i++) {
                            as[i].addEventListener('contextmenu', context);
                        }
            //    });
            }

            sendResponse(0);
            return true;
        }


        if (msg.text == "TIMETAKEN") {
            if (s_countd > 0) {
                if (!isNaN(msg.timet)) {
                    db_S_TimeTaken = msg.timet;
                }
            }
            sendResponse(0);
            return true;
        }

        if (msg.text == 'TRACKER') {
            if (msg.status == true) {
                window.addEventListener("beforeunload", function (ev) { //this is where we send the time record after unload
                    trackObj.taskDesc = s_status;
                    SendSafeRuntimeMessage({ text: "newonunload", status: s_status, dataobj: trackObj });
                    //event.returnValue = null;
                    return null;
                });  

                startContextChangedTimer();
                s_timersound = msg.beep;
                s_timeropts = msg.data.timeropts;
                trackObj.dateofTask = (dStart.getMonth() + 1) + '/' + dStart.getDate() + '/' + dStart.getFullYear() + ' ' + dStart.toLocaleTimeString();
                //https://www.raterhub.com/evaluation/rater/task/show?taskIds=9999999999
                //multiple taskids look like... taskIds=7795964707,7795964708,7795964709
                trackObj.taskId = buildTaskId(document.URL);
                if (trackObj.taskId == "")
                    SendSafeRuntimeMessage({ request: "SENDLOG", who: "dbclick.js", messageLog: ("failed to get taskId: " + url) });
                //                trackerOpts = { alert: "none;off", report: false, zone: "L", thisComputer: null, autobackup: true, save4days: 180, timeralertsound: getdefaultsound("TRACKER"), aetrange: "HIGH" }; // version 2.38 - alert format changed to "warning time;tab timer on or off"
                if (msg.data.alert.length > 0) {
                    let pieces = msg.data.alert.split(";");
                    if (pieces.length == 1) { // old format  
                        if (msg.data.alert == "none") {
                            s_onebeep = true;
                            s_countd = 0;
                        }
                        else {
                            s_countd = parseInt(msg.data.alert);
                            let newAET = trackObj.taskAET;
                            if (newAET.indexOf(" - ") != -1) {
                                let newTime = newAET.split(" - ");
                                if (msg.data.aetrange == "HIGH")
                                    newAET = newTime[1];
                                else if (msg.data.aetrange == "LOW")
                                    newAET = newTime[0];
                                else if (msg.data.aetrange == "MID") {
                                    let numl = parseFloat(newTime[0]);
                                    let numh = parseFloat(newTime[1]);
                                    diff = numh - numl;
                                    let num = numl + (diff / 2);
                                    newAET = num.toString();
                                    //end check for mid point
                                }
                            }
                            startTimer(newAET);
                        }
                    }
                    else {
                        if (pieces[1] == "on") {
                            if (pieces[0] == "none") {
                                s_onebeep = true;
                                s_countd = 0;
                            }
                            else
                                s_countd = parseInt(pieces[0]);
                            let newAET = trackObj.taskAET;
                            if (newAET.indexOf(" - ") != -1) {
                                let newTime = newAET.split(" - ");
                                if (msg.data.aetrange == "HIGH")
                                    newAET = newTime[1];
                                else if (msg.data.aetrange == "LOW")
                                    newAET = newTime[0];
                                else if (msg.data.aetrange == "MID") {
                                    let numl = parseFloat(newTime[0]);
                                    let numh = parseFloat(newTime[1]);
                                    diff = numh - numl;
                                    let num = numl + (diff / 2);
                                    newAET = num.toString();
                                    //end check for mid point
                                }
                            }
                            startTimer(newAET);
                        }
                    }
                }

                let formsCollection = document.getElementsByTagName("form");
                if (formsCollection != null)
                    for(let t = 0; t < formsCollection.length; t++) {
                        if (formsCollection[t].action == "https://www.raterhub.com/evaluation/rater/task/reject") {
                            formsCollection[t].addEventListener("submit", function (ev) {
                                let r = document.getElementById("ewok-release-release");
                                if (r != null && r.checked == true) {
                                    trackObj.taskDesc = getReleasedConstant();
                                    s_status = getReleasedConstant();
                                    SendSafeRuntimeMessage({ text: "setactivetaskstatus", status: s_status });
                                }
                            });
                        }
                    }
                let submit_button = document.getElementById('ewok-task-submit-button');
                if (submit_button)
                    submit_button.addEventListener("click", function (ev) {
                        trackObj.taskDesc = getSubmittedConstant();
                        s_status = getSubmittedConstant();
                    });
                submit_button = document.getElementById('ewok-task-submit-done-button');
                if (submit_button)
                    submit_button.addEventListener("click", function (ev) {
                        trackObj.taskDesc = getSubmittedConstant();
                        s_status = getSubmittedConstant();
                    });
                //submit_button = document.getElementById('ewok-task-cancel-button');
                //if (submit_button)
                //    submit_button.addEventListener("click", function (ev) {
                //        s_status = getCancelledConstant();
                //    });

                //trackObj.taskDesc = s_status;
                sendResponse(trackObj);
            }
            else
                sendResponse("Opt Off");
        }
        return true;
    });

    //end mineline code
    // related to countdown timer
}
//<a href="" data-oldhref="http://www.youtube.com/watch?v=8I3hr_5eE6g" style="">http://www.youtube.com/watch?v=8I3hr_5eE6g</a>
/**
 * Build and return a context descriptor object for the current task page.
 *
 * @param {Object} ev
 */
function context(ev) {
    let contextStr;
    if (ev.ctrlKey) {
        return;
    }

    if (ev.target.dataset.oldhref != undefined) {
        contextStr = ev.target.dataset.oldhref;
        let newStr = contextStr.split("url?q=https%3A%2F%2F");
        let str;
        if (newStr.length > 1) {
            str = "https://" + newStr[1];
        }
        else {
            newStr = contextStr.split("url?q=http%3A%2F%2F");
            if (newStr.length > 1) {
                str = str = "http://" + newStr[1];
            }
            else { //is this just a url ^^ like the one we get for speed pq? 
                let str2check = "";
                let putBack = "";
                newStr = contextStr.split("http://");
                if (newStr.length > 1) {
                    str2check = newStr[1];
                    putBack = "http://";
                }
                else {
                    newStr = contextStr.split("https://");
                    if (newStr.length > 1) {
                        str2check = newStr[1];
                        putBack = "https://";
                    }
                }
                if (str2check.length > 0) {
                    let next2check = str2check.split("/")
                    if (str2check != next2check) {
                        str = putBack + next2check[0];
                        let alertStr = "MDE: Click OK to open home page of " + str + " in a new tab to research EAT. Click cancel for default right-tab menu.";
                        if (confirm(alertStr)) {
                            ev.preventDefault();
                            SendSafeRuntimeMessage({ text: "OPENE", URL: str });
                            return;
                        }
                    }
                }
            }
        }

        if (newStr.length > 1) {
            let strsn = str.split("%2F");
            if (strsn.length > 1) {
                //send request to open
                let alertStr = "MDE: Click OK to open home page of " + strsn[0] + " in a new tab to research EAT. Click cancel for default right-tab menu.";
                if (confirm(alertStr)) {
                    ev.preventDefault();
                    SendSafeRuntimeMessage({ text: "OPENE", URL: strsn[0] });
                }
            }
        }
    }
}

let s_contextTimer = null;
/**
 * Start a debounce timer that fires when the task context stops changing.
 */
function startContextChangedTimer() {
    resetAlert4Context();
    s_contextTimer = setInterval(function () {
        if (isValidChromeRuntime("Warning - from MDE Tracker - the MDE extension has been updated mid task. Check your times on this task after submitting!") == false)
            clearInterval(s_contextTimer);
    },
        30000);
}


/**
 * Start the task work-time timer for the active task.
 *
 * @param {number} time
 */
function startTimer(time) {
    // time to add to make endtime
    let timeleft = (parseFloat(time) * 60000);
    let sDate = new Date();
    let endtime = new Date(sDate.getTime() + timeleft);
    //SendSafeRuntimeMessage({ request: "STARTIMER", endtime: endtime });
    let timer = setInterval(calsetTimer, 1000, endtime);
}

/**
 * Calculate and set the timer interval based on elapsed task time.
 *
 * @param {number} endtime
 */
function calsetTimer(endtime) {
    let timeStr;
    let d = new Date();
    let timeleft = endtime - d;
    timeleft = timeleft - db_S_TimeTaken;
    if (timeleft < 0)
        timeStr = '-' + msToTime(Math.abs(timeleft), false);
    else
        timeStr = msToTime(timeleft, false);
    if (s_timeropts == "NEW")
        document.title = 'RH(' + timeStr + '/' + "" + s_totals + ')';
    else
        document.title = 'RH(' + timeStr + ')';
    if ((timeleft / 1000) < s_countd && s_onebeep == false) {
        s_onebeep = true;
        beep(s_timersound);
    }
}

// didn't want to include the full dates.js file - this function is duped there
/**
 * Navigate directly to the task URL for a given task ID.
 */
function skip2task() {
    let classes = document.getElementsByClassName("ewok-task-query");
    if (classes != null && (classes.length == 1 || classes.length == 2)) {
        let qStr = null;
        let qElment = null;
        if (classes.length == 1) {
            qStr = classes[0].innerText;
            qElment = classes[0];
        }
        else
            if (classes[0].className == classes[1].className) {
                qStr = classes[0].innerText;
                qElment = classes[0];
            }

        if (qStr != null) {
            qElment.scrollIntoView();
            return;
        }
    }
    let yel = null;
    let hlist = document.getElementsByTagName("h2");
    for(let i = 0; i < hlist.length; i++) {
        if (hlist[i].textContent == "Task") {
            yel = hlist[i];
            break;
        }
    }

    if (yel != null) {
        yel.scrollIntoView();
        return;
    }

    hlist = document.getElementsByTagName("h3");
    for (i = 0; i < hlist.length; i++) {
        if (hlist[i].textContent == "Task") {
            yel = hlist[i];
            break;
        }
    }

    if (yel != null) {
        yel.scrollIntoView();
        return;
    }


    hlist = document.getElementsByTagName("h1");
    for (i = 0; i < hlist.length; i++) {
        if (hlist[i].textContent == "Task") {
            yel = hlist[i];
            break;
        }
    }

    if (yel != null) {
        yel.scrollIntoView();
        return;
    }

    return;
}

/**
 * Return true if the current page is a RaterHub task error page.
 */
function isErrorTaskPage() {
    let errorx = document.getElementById("error-page");
    if (errorx != null) {
        let h2 = document.getElementsByTagName("h2");
        if (h2 != null) {
            if (h2[0].textContent.indexOf("Error") > -1)
                return true;
            if (h2[0].textContent.indexOf("Unauthorized") > -1)
                return true;
        }
    }
    return false;
}

