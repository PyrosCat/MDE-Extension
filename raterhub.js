if (document.URL.indexOf("taskIds=") == -1) {
    //defined in rh-status.js
    //let RHstatus = function () { //defined in raterhub.js and in background.js
    //    this.identifier = "this is an RH status";
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
    //let uoStr = "May contain upsetting-offensive content";
    //let hrStr = "Headphones required";
    //let hrsStr = "Headphones or speakers required";
    //let prStr = "Personalized";
    //let saprStr = "Speaking aloud required";
    //let hmStr = "Special device or app required";
    //let rhstatus;
    let msgStrs;
    let s_rhnrtnoise = null;
    let s_rhtasknoise = null;
    let s_saveRHstatus = null;


    try {
        SendSafeRuntimeMessage({ text: "WAKEUP", from: "RH" }, function (resp) {
        //    $("body").append('<button id="enableBut" type="button" title="Enable RL Alerts">Enable RL Alerts</button>');
        //    $('#enableBut').css("color", "red");
        //    $('#enableBut').click(function (ev) {
        //        $('#enableBut').text("RL Alerts Enabled");
        //        $('#enableBut').css("color", "black");
        //    });
        });
    }
    catch (err) {
    }

    chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
        /*  am I already monitoring? */


        if (msg.text && (msg.text == "RHRELOAD")) {
            if (msg.status == false) {
                rhcontrolListen("remove");
            }
            else {
                rhOpts = msg.rhOpts;
                rhOpts.rhstatus = new RHstatus();
                rhOpts.rhstatus.nrtstartcount = msg.saveRHstatus.nrtstartcount;
                rhOpts.rhstatus.nrtstopcount = msg.saveRHstatus.nrtstopcount;
                s_saveRHstatus = msg.saveRHstatus;
                msgStrs = msg.msgStrs;
                if (msg.testStatus)
                    rhTester();
                s_rhnrtnoise = msg.nrtbeep;
                s_rhtasknoise = msg.taskbeep;
                rhcontrolListen("install");
            }
        }
    });
}
let s_doctitle = document.title;
let s_intTimer = 0;
let s_listen = false;

/**
 * Create and inject the MDE status panel div into the RaterHub page.
 *
 * @param {Object} ev
 */
let rhOpts;

function unloader(ev) {
    //event.preventDefault();
    if (s_intTimer != 0) {
        clearTimeout(s_intTimer);
        s_intTimer = 0;
    }
    //clear reloader
    if (isValidChromeRuntime())
        SendSafeRuntimeMessage({ text: "CLEARELOAD" });
    //event.returnValue = null;
    return null;
}

/**
 * Handle chrome.runtime messages for RaterHub control commands.
 *
 * @param {boolean} action
 */
function rhcontrolListen(action) {
    div = document.body;
    if (action == "install") {
        if (s_intTimer != 0) {
            // we are already running - do nothing with this message
            return;
        }

        if (s_listen == false) {
            s_listen = true;
            window.addEventListener("beforeunload", unloader);
        }
        startReloader();
    }
    else if (action == "remove") {
        cancelReloader();
        if (s_listen == true) {
            window.removeEventListener("beforeunload", unloader);
            s_listen = false;
        }

        document.title = s_doctitle;
    }
}

/**
 * Cancel the pending auto-reload timer.
 */
function cancelReloader() {
    if (isValidChromeRuntime())
        SendSafeRuntimeMessage({ text: "CLEARELOAD" });
    if (s_intTimer != 0) {
        clearTimeout(s_intTimer);
        s_intTimer = 0;
    }
}

/**
 * Start the auto-reload countdown timer for the RaterHub queue.
 */
function startReloader() {
    if (s_intTimer != 0)
        clearTimeout(s_intTimer);
    // time to add to make endtime
    let sDate = new Date();
    let endtime = new Date(sDate.getTime() + (rhOpts.refreshsecs * 1000));
    // add check for tasks because server error triggered a nrt end message
    //rhOpts.rhstatus.nrt = 2;
    x = document.getElementsByClassName("ewok-rater-task-option");
    if (x.length > 0) {
        rhOpts.rhstatus.nrt = false;

    } else {
        x = document.getElementsByClassName("ewok-rater-no-tasks");
        if (x.length > 0) {
            rhOpts.rhstatus.nrt = true;
        }
    }
    if (rhOpts.rhstatus.nrt == 0 && rhOpts.opts == true) {
        let xList = document.getElementsByClassName("ewok-rater-task-option");
        for(let i = 0; i < xList.length; i++) {
            let childList = xList[i].children;
            for(let y = 0; y < childList.length; y++) {
                let tStr1 = childList[y].outerText;
                let tStr = tStr1.toUpperCase();
                //check for strings
                if (msgStrCheck("uo", msgStrs, tStr))
                    rhOpts.rhstatus.uo = true;
                if (msgStrCheck("ac", msgStrs, tStr))
                    rhOpts.rhstatus.ac = true;
                if (msgStrCheck("hr", msgStrs, tStr))
                    rhOpts.rhstatus.hr = true;
                if (msgStrCheck("hrs", msgStrs, tStr))
                    rhOpts.rhstatus.hrs = true;
                if (msgStrCheck("hrs", msgStrs, tStr))
                    rhOpts.rhstatus.hrs = true;
                if (msgStrCheck("mc", msgStrs, tStr))
                    rhOpts.rhstatus.mc = true;
                else if (msgStrCheck("hm", msgStrs, tStr))
                    rhOpts.rhstatus.hm = true;
                else
                    if (msgStrCheck("pr", msgStrs, tStr))
                        rhOpts.rhstatus.pr = true;
            }

            ////new code 
            //if (rhOpts.opts == true && rhOpts.rhstatus.nrt == false) {
            //    let mn = false;
            //    if (s_saveRHstatus.hr == false && rhOpts.rhstatus.hr == true)
            //        mn = true;
            //    else if (s_saveRHstatus.uo == false && rhOpts.rhstatus.uo == true)
            //        mn = true;
            //    else if (s_saveRHstatus.hrs == false && rhOpts.rhstatus.hrs == true)
            //        mn = true;
            //    else if (s_saveRHstatus.pr == false && rhOpts.rhstatus.pr == true)
            //        mn = true;
            //    else if (s_saveRHstatus.hm == false && rhOpts.rhstatus.hm == true)
            //        mn = true;
            //    else if (s_saveRHstatus.sapr == false && rhOpts.rhstatus.sapr == true)
            //        mn = true;
            //    else if (s_saveRHstatus.mc == false && rhOpts.rhstatus.mc == true)
            //        mn = true;

            ////    if (mn == true)
            ////        beep(s_rhtasknoise);
            //}

            //if (s_saveRHstatus.nrt == true) {
            //    if ( rhOpts.rhstatus.nrt == false) {
            //        if (s_saveRHstatus.nrtstopcount == 0) {//else we have been here before and reset rhstatus for text messaging in raterhub.js
            //            beep(s_rhnrtnoise);
            //        }
            //    }
            //}
            //end new code

        }
    }
    //tell background because it will reload when it's time
    if (isValidChromeRuntime()) {
        rhOpts.rhstatus.identifier = "and I changed it";
        SendSafeRuntimeMessage({ text: "SAVERHEND", rhOpts: rhOpts });
    }
    s_intTimer = setInterval(rh_calsetTimer, 1000, endtime);
}

/**
 * Calculate and set the reload interval based on current queue state.
 *
 * @param {number} endtime
 */
function rh_calsetTimer(endtime) {
    let timeStr;
    let d = new Date();
    let timeleft = endtime - d;
    if (timeleft < 0)
        timeStr = '-' + msToTime(Math.abs(timeleft), false);
    else
        timeStr = msToTime(timeleft, false);
    if (timeleft < 0)
        SendSafeRuntimeMessage({ text: "RELOADME" });
    document.title = 'Rater Hub (' + timeStr + ')';
}

//let tblofOpts = '<div id="RHTestDiv"<table id="status2send"><thead><tr><th>click to select</th></tr></thead><tbody>';
    //'<td class="selectstatus">May contain upsetting-offensive content</td></tr><tr>' +
    //'<td class="selectstatus">Headphones required</td></tr><tr>' +
    //'<td class="selectstatus">Headphones or speakers required</td></tr><tr>' +
    //'<td class="selectstatus">Personalized</td></tr><tr>' +
    //'<td class="selectstatus">Speaking aloud required</td></tr><tr>' +
    //'<td class="selectstatus">Special device or app required</td></tr><tr>' +
    //'<td class="selectstatus">Adult Content</td></tr></tbody></table><br>' +
    //'<button type="button" id="resetopts">reset selections</button><button type="button" id="sendstatus">Send status</button>';
//let msgStrs = [
//    { type: "uo", str: "May contain upsetting-offensive content" }, //checked
//    { type: "hr", str: "Headphones required" },
//    { type: "hrs", str: "Headphones or speakers required" },
//    { type: "pr", str: "Personalized" }, //checked
//    { type: "sapr", str: "Speaking aloud required" }, //checked
//    { type: "hm", str: "Special device or app required" },
//    { type: "ac", str: "Adult Content" }
//    //{ type: "mc", str: "Microphone Required" }, // string is "Microphone Required,Personalized" picked up as personalized at the moment
//];

/**
 * Run a RaterHub page diagnostic and report results to the background.
 */
function rhTester() {
    ////build rows
    //for(let i = 0; i < msgStrs.length; i++) {
    //    tblofOpts = tblofOpts + '<tr><td class="selectstatus">' + msgStrs[i].str + '</td></tr>';
    //}
    //tblofOpts = tblofOpts + '</tbody></table><br><button type="button" id="resetopts">reset selections</button><button type="button" id="sendstatus">Send status</button></div>';

    //$('body').append(tblofOpts);
    RH_createDivAndTable("RHTestDiv", msgStrs);

    let close = document.getElementById("status2send");
    close.addEventListener("click", function (ev) {
        ev.target.style.backgroundColor = "green";
        ev.target.classList.add("selected"); 
    });

    close = document.getElementById("resetopts");
    close.addEventListener("click", function () {
        let selectedElements = document.getElementsByClassName("selected");
        for (i = 0; i < selectedElements.length; i++) {
            selectedElements[i].style.backgroundColor = "white";
            selectedElements[i].classList.remove("selected"); 
        }
    });

    close = document.getElementById("sendstatus");
    close.addEventListener("click", function () {
        let newStatus = new RHstatus();
        newStatus.nrtstartcount = rhOpts.rhstatus.nrtstartcount;
        newStatus.nrtstopcount = rhOpts.rhstatus.nrtstopcount;
        let selectedElements = document.getElementsByClassName("selected");
        for (i = 0; i < selectedElements.length; i++) {
            let attr = selectedElements[i].textContent;
                let valindex = msgStrs.findIndex(x => x.str == attr);
                if (valindex != -1) {
                    let opt2change = msgStrs[valindex].type;
                    if (opt2change == "uo")
                        newStatus.uo = true;
                    if (opt2change == "hr")
                        newStatus.hr = true;
                    if (opt2change == "hrs")
                        newStatus.hrs = true;
                    if (opt2change == "pr")
                        newStatus.pr = true;
                    if (opt2change == "hr")
                        newStatus.hr = true;
                    if (opt2change == "sapr")
                        newStatus.sapr = true;
                    if (opt2change == "hm")
                        newStatus.hm = true;
                    if (opt2change == "ac")
                        newStatus.ac = true;
                    if (opt2change == "mc")
                        newStatus.mc = true;
                    if (opt2change == "nrt")
                        newStatus.nrt = true;
                }
            }
        //send new status
        rhOpts.rhstatus = newStatus;
        let sDate = new Date();
        let endtime = new Date(sDate.getTime() + (rhOpts.refreshsecs * 1000));
        SendSafeRuntimeMessage({ text: "SAVERHEND",  rhOpts: rhOpts });
    });
}

/**
 * Create and inject the MDE status panel div into the RaterHub page.
 *
 * @param {string} divStr
 * @param {string} rowStrs
 */
function RH_createDivAndTable(divStr, rowStrs) {
    //create DIV
    let div = document.createElement('div');
    div.setAttribute("id", divStr);
    document.body.appendChild(div);

    //Add reset button
    let btn = document.createElement("BUTTON");
    btn.setAttribute("id", "resetopts");
    btn.setAttribute("class", "Submit");
    let tNode = document.createTextNode("Reset Options");
    btn.appendChild(tNode);
    div.appendChild(btn);

    //Add send button
    btn = document.createElement("BUTTON");
    btn.setAttribute("id", "sendstatus");
    btn.setAttribute("class", "Submit");
    tNode = document.createTextNode("Send Status");
    btn.appendChild(tNode);
    div.appendChild(btn);

    //Add title P if edit
         tNode = document.createTextNode("Click on Msg to Toggle Selection");
        let para = document.createElement("P");
        para.appendChild(tNode);
        div.appendChild(para);
        para.style["font-weight"] = "bold";
     //create table
    let tbl = document.createElement("TABLE");
    tbl.setAttribute("id", "status2send");
    let tblBody = document.createElement("tbody");
    tbl.appendChild(tblBody);
    div.appendChild(tbl);
    //Add rows to table
    //'<tr tabindex="' + (i + 1) + '"><input type="hidden" class="placehold"/><td class="phtd">';
    for(let i = 0; i < rowStrs.length; i++) {
        let row = document.createElement("tr");
        let cell = document.createElement("td");
        cell.setAttribute("class", "selectstatus");
        let cellText = document.createTextNode(rowStrs[i].str);
        cell.appendChild(cellText);
        row.appendChild(cell);
        tblBody.appendChild(row);
    }
    //add nrt option
    row = document.createElement("tr");
    cell = document.createElement("td");
    cell.setAttribute("class", "selectstatus");
    cellText = document.createTextNode("NRT");
    cell.appendChild(cellText);
    row.appendChild(cell);
    tblBody.appendChild(row);
    msgStrs.push({ type: "nrt", str: "NRT" });
}