//todo 081520
// add options to modify data structures to test pop up
// Here  ready to hit invoice button an send request to backup 10/06/18
// if activated, when a new window is openned, if it matches the type I change, use this command 
// chrome.tabs.executeScript(null, {file: "content_script.js"});
// to execute the scriptload
//productivity is (AET/timeworked) * 100
// this is how they look by default 
//total at the top of tracker display doesn't include 1st sunday of the period.
/*
let enhancements = [ // msg, active, data to send, check tabid, urlclass
    ["FEEDBACKL", false, null, false, "https://raterlabs.appen.com/qrp/core/vendors/needs_met_"],   // insert feedback/sim link
    ["SHORTCUTS", false, null, true, "https://www.raterhub.com/evaluation/rater/task"],  // raterhub keyboard shortcuts
    ["CHATM", false, null, false, "https://raterlabs.appen.com/qrp/core/vendors/social/chat/console/"],
    ["MSGOPTS", false, null, false, null],
    ["SOCIALO", false, null, false, "https://raterlabs.appen.com/qrp/core/vendors/feed"],
    ["RHRELOAD", false, null, false, "https://www.raterhub.com/evaluation/rater"], // monitor Raterhub
    ["TRACKER", false, null, false, "https://www.raterhub.com/evaluation/rater/task"], //task tracker
    ["SFILES", false, null, false, "https://raterlabs.appen.com/qrp/core/vendors/social_file_manager"],
    ["IDLEC",false, null, false, null]]
// social feed options
];
*/
//type="application/pdf"

/*
 * SendSafeRuntimeMessage('belncckcaakhmonmcfmegbglccbjlebc', {
      msg: data
    },
    function(response) {});
    */
//these are defined in dbclick.js and popup.js and ltfuts 
let turnOffTexts = "Pause Text Alerts";
let turnOnTexts = "Enable Text Alerts";

let popup_PhraseArray = [{ Phrase: "Popup found no phrases" }];


let checkMark = '\u2714';
//let nocheckMark = "&nbsp;&nbsp;&nbsp;";
let nocheckMark = "   ";
let beenHere = false;
let s_headers = false;
let timer = "";
let selStr = "";
let val2Check = "";
let retColor = "black";
let nlchar = 0;
let nl = "";
let newSound = null;
let wS = "";

/** Single source of truth for the displayed version string.
 *  Update this whenever the extension version changes. */
const MDE_VERSION = '2.1.1 (06/21/2026)';

let defaultHelp = 'MDE v.' + MDE_VERSION + '. If you find this extension helpful, please consider supporting development efforts \u2014 click the Facebook link (top right) for ways to help.';
let help = {
    "SHORTCUTS": "Keyboard short cuts for the task page. Hover over (?) for more info.",
    "help": "Click Me for documentation, including change log.",
    "FEEDBACKL": "Adds a clickable link in the task result block to open the task URL directly in the desktop SIM or Feedback tool.",
    "imageh": "Show an assigned nickname next to usernames in RaterHub chat. Contact MDE support to get a nickname assigned.",
    "colorp": "For the chat color changes, use default OS color picker",
    "SOCIALO": "Saves your social task filter selections so they persist across sessions.",
    "SFILES": "Adds a file manager panel to social task pages. Makes URLs clickable and copies them to the clipboard.",
    "chatname": "Enter the chat username(s) to watch. You'll be alerted whenever they post. Separate multiple names with a comma. The chat room must be open in a tab.",
    "phrase": "Word or phrase to watch for in chat. Separate multiple terms with a comma. Wrap in double quotes for an exact phrase match. The chat room must be open in a tab.",
    "phrases": "Chat and Task Pages only: Enable phrase table (offers stored phrases when typing for phrases matched in task comment fields and chat).",
    "reda": "Trigger a visual or audio alert when the Poster alert name or Phrase alert appears in an open chat tab.",
    "SubmitReq": "Save your current option selections.",
    "nickname": "Your display nickname in chat. To add or change it, email mdipros48@gmail.com.",
    "RHRELOAD": "Auto-reloads RaterHub at the interval you set. Plays an alert sound when tasks appear after a period of no tasks (NRT).",
    "RHRELOADA": "Play an alert sound when specific task types appear on the RaterHub task index.",
    "RHRELOADT": "Receive a device notification when certain events occur on the RaterHub index.",
    "soundsettings": "Configure which sound plays for each MDE alert: Task Timer, Chat Alert, NRT start/end, and Task Alert.",
    //"helprh": "Alert for personalized, headphones, and U/O task types at index",
    "helps": "Show or hide the keyboard shortcuts list.",
    "TRACKER": "Track time spent on each task. Calculates AET usage, productivity %, and pay period totals.",
    "ViewTracker": "Open the tracker panel to see your task history, time totals, and invoice tools.",
    "phsent": 'Phrase matching is done at the sentence level vs word level. Sentences are delineated by a "," or "." or "-" when using this option.',
    "ViewLog": "View a log of NRT periods. Requires RH Refresh to be enabled with a RaterHub tab open when not working tasks.",
    "helpsp": "As you type, matching saved phrases are offered. Tab to select, Enter to insert. Use alt-a to open the phrase manager, alt-p to save selected text as a new phrase.",
    "specI": "Import autocorrect data from text file (file created with export in this program).",
    "actable": "Open the autocorrect table to view, add, edit, or remove entries. You can also export and import the table.",
    "spell": "Auto-replaces words as you type based on your saved autocorrect table. Works on task pages and in chat rooms.",
    "spectask": "Option changes take effect on new task tabs. To apply immediately, save your changes and refresh the open task tab.",
    "mdefaq": "Open the FAQ and change log.",
    "keyshow": "Click to show shortcuts. Click again to hide them.",
    "actableeye": "Open the autocorrect table to view, add, edit, or remove entries.",
    "phaseDisplay": "Open the phrase table to view, add, edit, or remove saved phrases.",
    "phaseDisplayeye": "Open the phrase table to view, add, edit, or remove saved phrases.",
    "useremail": "Text message alert forwarding via email — currently disabled in v2.0.0. Register your email with mdipros48@gmail.com to be ready when re-enabled.",
    "rhalertcontroleye": "Text alert settings — currently disabled in v2.0.0."
};

let indexMsgOpts = 3;
// these are defined here and in background
// hardcoded indexes
let indexChat = 2;
let indexSocial = 4;
let indexRaterHub = 5;
let indexTracker = 6;
//let indexIdleC = 8;
let indexShortcuts = 1;
let indexData = 2;
let indexState = 1;



let chatcriteria = { image: false, names: "", phrases: "", reda: false, phsent: 0, transdate: null, myNames: null, phraseTable: false, colorData: null, colorp: true, autocorrect: false, yukonOnly: false, chatalertsound: null };
//let savedTimer = { start: null, end: null, loop: false, tab: false, time: 0 };


//let s_savedTimer;
//let s_intTimer;
let s_timezone = "L";
let periodArray = null;
//save settings for sounds

/**
 * Read and apply an audio file setting from storage.
 *
 * @param {Object} newSounds
 */
function s_updateSounds(newSounds) {
    //if sound doesn't match active in s_sounds, change it
    for (let t = 0; t < newSounds.length; t++) {
        if (newSounds[t].sound != s_sounds[t].active) {
            if (newSounds[t].sound == 'customize')
                readSetAudioFile(newSounds[t]); //thru this process s_sounds will be set if they loaded something
            else if (newSounds[t].sound != 'custom')
                s_sounds[t].active = newSounds[t].sound;
        }
    }
}

/**
 * Update the sound selection dropdowns to reflect stored preferences.
 */
function s_UpdateSoundSelections() {
    let newSounds = [ // order must match same order as default_sounds aka s_sounds (defined in backgound.js)
        { type: "CHAT", sound: $("#chatalertsound").val() },
        { type: "NRT", sound: $("#nrtendalertsound").val() },
        { type: "RHINDEX", sound: $("#taskalertsound").val() },
        { type: "TRACKER", sound: $("#tasktimersound").val() },
        { type: "WAH", sound: $("#nrtstartalertsound").val() }
    ];

    s_updateSounds(newSounds);

    SendSafeRuntimeMessage({ text: "SETSOUNDS", sounds: newSounds });
}
// this function gets the options after the save button has been hit - from the screen
/**
 * Apply tracker display options (filters, ranges) to the UI controls.
 */
function setTrackerOpts() {
    let timer;
    let countdown = "none";
    let rpt = false;
    let timeron = "off";
    let autoBackup = false;
    let warnincomplete = false;

    if ($("#tabtimer").is(":checked")) {
        timeron = "on";
        countdown = $("#subAlert option:selected").val();
    }
    if ($("#warnincomplete").is(":checked")) {
        warnincomplete = true;
    }

    let saveD = $("#beforeautoD").val();
    s_headers = false;
    // get the text of the backupOpts options
    //if there is a check on headers or auto backup then the option is true, else its false
    //get the children of backupOpts
    // values are A R and B
    $("#backupOpts").children().each(function (index) {
        let optVal = $(this)[0].value;
        let text = $(this)[0].text;
        let optOn = false;
        if (text.indexOf(checkMark) > -1) {
            optOn = true;
        }
        if (optVal == 'A' && optOn)
            autoBackup = true;
        else
            if (optVal == 'R' && optOn) {
                rpt = true;
                s_headers = true;
            }
    });

    let aetrange = $('input[name="aetrange"]:checked').val();
    let timeropts = $('input[name="timeropts"]:checked').val();

    timer = countdown + ";" + timeron;
    enhancements[indexTracker][indexData].alert = timer;
    enhancements[indexTracker][indexData].report = rpt;
    enhancements[indexTracker][indexData].zone = s_timezone;
    enhancements[indexTracker][indexData].autobackup = autoBackup;
    enhancements[indexTracker][indexData].save4days = saveD;

    SendSafeRuntimeMessage({ text: "SETRKOPTS", time: timer, rpt: rpt, zone: s_timezone, autoBackup: autoBackup, save4days: saveD, aetrange: aetrange, timeropts: timeropts, warnincomplete: warnincomplete });

    //$("#savetracker").css('background-color', 'white');
    //$("#savetracker").css('color', 'black');
    ////if they had selected run backup now - we had better do that.
    //setTrackMsg("Option saved, will take effect on the next task.", "green");
}

/**
 * Set the status message text in the popup header bar.
 *
 * @param {Date} data
 * @param {*} color
 */
function setMsg(data, color) {
    $("#msgTextpop").text(data);
    $("#msgTextpop").css("color", color);
    // Reset to collapsed state for each new message
    $("#status-bar-body").removeClass("expanded").addClass("collapsed");
    $("#status-toggle-btn").text("more");
}

/**
 * Set the secondary return-status message in the popup.
 *
 * @param {Date} data
 * @param {*} color
 */
function setReturnMsg(data, color) {
    $("#msgTextret").text(data);
    $("#msgTextret").css("color", color);
}

/**
 * Set the tracker section status message.
 *
 * @param {Date} data
 * @param {*} color
 */
function setTrackMsg(data, color) {
    $("#trackerMsg").text(data);
    $("#trackerMsg").css("color", color);
    if (color == "red")
        alert(data);
}

/**
 * Set the tracker table header message text.
 *
 * @param {Date} data
 * @param {*} color
 */
function setTrackHeaderMsg(data, color) {
    $("#trackerHeader").text(data);
    $("#trackerHeader").css("color", color);
}
/*
 *             let overallT = {
                week1aetdesc: "", week1aet: "", week1time: "",
                week2aetdesc: "", week2aet: "", week2time: "",
                overallaet: "", overalltime: "", week1trueaet:"", week2trueaet: "", overalltrueaet:"",
            };
*/

/**
 * Update the tracker totals row with current aggregated values.
 *
 * @param {Date} data
 */
function setTrackTotals(data) {
    $("#week1aetdesc").text(data.week1aetdesc);
    $("#week1aet").text(data.week1aet);
    $("#week1aet").prop('title', data.week1trueaet);
    $("#week1time").text(data.week1time);
    $("#week2aetdesc").text(data.week2aetdesc);
    $("#week2aet").text(data.week2aet);
    $("#week2aet").prop('title', data.week2trueaet);
    $("#week2time").text(data.week2time);
    $("#overallaet").text(data.overallaet);
    $('#overallaet').prop('title', data.overalltrueaet);
    $("#overalltime").text(data.overalltime);
}

/**
 * Update the connection/extension status indicator in the popup.
 *
 * @param {Date} data
 */
function setStatus(data) {
    $("#status").text(data);
}
let save_message = defaultHelp;

/**
 * Handle mouseover on a tracker row to show detail tooltip.
 *
 * @param {Object} ev
 */
function hoverCallback(ev) {
    let id = ev.target.id;
    if (ev.type === "mouseenter") {
        // Only capture the base message on first entry (not on child re-entries)
        // to avoid the flicker where save_message resets mid-hover.
        let current = $("#msgTextpop").text();
        if (!$("#msgTextpop").hasClass("help-active")) {
            save_message = current;
        }
        let msg = help.hasOwnProperty(id) ? help[id] : null;
        if (msg) {
            $("#msgTextpop").addClass("help-active").text(msg);
        }
        // If no help entry, keep whatever is showing — don't flash "No help found"
    } else {
        $("#msgTextpop").removeClass("help-active").text(save_message);
        save_message = defaultHelp;
    }
}

/**
 * Initialize sound file references after storage load.
 *
 * @param {*} sounds
 * @param {string} elementId
 * @param {string} soundType
 */
function subInitsounds(sounds, elementId, soundType) {
    let tempStr = s_getsound(sounds, soundType);
    selStr = elementId + ' option[value="' + tempStr + '"]';
    $(selStr).prop('selected', true);
    let othStr = elementId + ' option[value="custom"]';
    if (tempStr != "custom")
        $(othStr).prop('disabled', true);
    else
        $(othStr).prop('disabled', false);
}

/**
 * Load and initialize all alert sound settings from storage.
 *
 * @param {*} sounds
 */
function s_initsounds(sounds) {

    subInitsounds(sounds, '#tasktimersound', "TRACKER");
    //let selStr = '#tasktimersound option[value="' + s_getsound(sounds, "TRACKER") + '"]';
    //$(selStr).prop('selected', true);

    subInitsounds(sounds, '#chatalertsound', "CHAT");

    //tempStr = s_getsound(sounds, "CHAT");
    //selStr = '#chatalertsound option[value="' + tempStr + '"]';
    //$(selStr).prop('selected', true);
    //let othStr = '#chatalertsound option[value="custom"]';
    //if (tempStr != "custom") 
    //    $(othStr).prop('disabled', true);
    //else
    //    $(othStr).prop('disabled', false);

    subInitsounds(sounds, '#nrtstartalertsound', "WAH");
    //selStr = '#nrtstartalertsound option[value="' + s_getsound(sounds, "WAH") + '"]';
    //$(selStr).prop('selected', true);
    subInitsounds(sounds, '#nrtendalertsound', "NRT");
    //selStr = '#nrtendalertsound option[value="' + s_getsound(sounds, "NRT") + '"]';
    //$(selStr).prop('selected', true);
    subInitsounds(sounds, '#taskalertsound', "RHINDEX");
    //selStr = '#taskalertsound option[value="' + s_getsound(sounds, "RHINDEX") + '"]';
    //$(selStr).prop('selected', true);

}

/**
 * Initialize the full popup UI after storage data is loaded.
 *
 * @param {Object} inEnhancements
 * @param {Array} inPhraseArray
 * @param {Object} sounds
 * @param {Array} clearRestoreArea
 */
function setupPop(inEnhancements, inPhraseArray, sounds, clearRestoreArea) {
    let dataA;
    let newSound;
    let rowClass;
    let chatcriteria;
    let compa1;
    let compb1;
    let newVal;
    let objRecs;
    let val;
    let x;
    popup_PhraseArray = inPhraseArray;
    if (clearRestoreArea)
        setReturnMsg("", "black");
    enhancements = inEnhancements;

    //set the sounds
    //#tasktimersound, #chatalertsound, #nrtendalertsound, #taskalertsound {
    s_initsounds(sounds);
    $("select#tasktimersound").change(function (ev) {
        //play the sound
        let newSound = $("#tasktimersound option:selected").val();
        beep_pop(newSound);
        $('#savesoundsettings').show();
    });

    $("select#nrtendalertsound").change(function (ev) {
        //play the sound
        newSound = $("#nrtendalertsound option:selected").val();
        beep_pop(newSound);
        $('#savesoundsettings').show();
    });
    $("select#nrtstartalertsound").change(function (ev) {
        //play the sound
        newSound = $("#nrtstartalertsound option:selected").val();
        if (newSound != "none")
            beep_pop(newSound);
        $('#savesoundsettings').show();
    });


    $("select#chatalertsound").change(function (ev) {
        //play the sound
        newSound = $("#chatalertsound option:selected").val();
        if (newSound != "customize")
            beep_pop(newSound);
        $('#savesoundsettings').show();
    });
    $("select#taskalertsound").change(function (ev) {
        //play the sound
        newSound = $("#taskalertsound option:selected").val();
        beep_pop(newSound);
        $('#savesoundsettings').show();
    });

    //set up popup with saved settings
    for (let i = 0; i < enhancements.length; i++) {
        if (enhancements[i][0] == "SOCIALO")
            continue;
        if (enhancements[i][0] == "CHATM") {
            if (enhancements[i][indexData] != null) {
                enhancements[i][indexData].names = enhancements[i][indexData].names.trim();
                enhancements[i][indexData].phrases = enhancements[i][indexData].phrases.trim();
                $("#chatname").val(enhancements[i][indexData].names);
                $("#phrase").val(enhancements[i][indexData].phrases);
                $("#reda").prop('checked', enhancements[i][indexData].reda);
                $("#phrases").prop('checked', enhancements[i][indexData].phraseTable);
                $("#imageh").prop('checked', enhancements[i][indexData].image);
                $("#colorp").prop('checked', enhancements[i][indexData].colorp);
                $("#phsent").prop('checked', enhancements[i][indexData].phsent);
                $("#spell").prop('checked', enhancements[i][indexData].autocorrect);
                chatcriteria = enhancements[i][indexData];
                if (chatcriteria.autocorrect == true) {
                    $("#actable").show();
                }
                else {
                    $("#actable").hide();
                }
                //    if (enhancements[i][indexData].phraseTable) //read phrases  
                //        getPhrases(null, "", 0);
            }
        }
        if (enhancements[i][0] == "RHRELOAD") {
            if (enhancements[i][indexState] == true) {
                $("#ViewLog").show();
                $(".rhAClass").show();
                $("#RHRELOADA").prop('checked', enhancements[i][indexData].opts);
                $('#rhrefreshsecs').val(enhancements[i][indexData].refreshsecs);
                $(".rhrefreshDisplay").show();

            }
            else {
                $("#ViewLog").hide();
                $(".rhAClass").hide();
                $(".rhrefreshDisplay").hide();
            }
        }
        if (enhancements[i][0] == "MSGOPTS") {
            //set useremail
            let msgObj = enhancements[i][indexData];
            if (msgObj != null && msgObj.email != undefined && msgObj.email.length > 0)
                $("#useremail").val(msgObj.email);
        }
        else {
            //console.log("setting", enhancements[i]);
            let uStr = "#" + enhancements[i][0];
            $(uStr).prop('checked', enhancements[i][indexState]);
            // chat is special
        }
        //if (enhancements[i][0] == "IDLEC") {
        //    if (enhancements[i][indexState] == true)
        //        $("#idlet").val(enhancements[i][indexData]);
        //}

        //this is where I set the tracker options on the screen
        if (enhancements[i][0] == "TRACKER") {
            let wS;
            let pieces = enhancements[i][indexData].alert.split(";");
            if (pieces.length == 1) { // old format  
                if (enhancements[i][indexData].alert == "none") {
                    $("#tabtimer").prop('checked', false); //its not checked
                    $("#subAlert").prop("disabled", true);
                    wS = "none";
                }
                else {
                    $("#tabtimer").prop('checked', true);
                    wS = enhancements[i][indexData].alert;
                }
            }
            else if (pieces.length == 2) {
                if (pieces[1] == "on")
                    $("#tabtimer").prop('checked', true);
                else {
                    $("#tabtimer").prop('checked', false);
                    $("#subAlert").prop("disabled", true);
                }
                wS = pieces[0];
            }
            $("#beforeautoD").val(enhancements[i][indexData].save4days);

            if (enhancements[i][indexData].aetrange == "HIGH")
                $("#highaetrange").prop("checked", true);
            if (enhancements[i][indexData].aetrange == "MID")
                $("#midaetrange").prop("checked", true);
            if (enhancements[i][indexData].aetrange == "LOW")
                $("#lowaetrange").prop("checked", true);
            if (enhancements[i][indexData].timeropts == "NEW")
                $('#newtasktimer').prop("checked", true);
            if (enhancements[i][indexData].timeropts == "OLD")
                $('#oldtasktimer').prop("checked", true);

            if (enhancements[i][indexData].warnincomplete)
                $('#warnincomplete').prop("checked", true);
            else
                $('#warnincomplete').prop("checked", false);

            let selStr = '#subAlert option[value="' + wS + '"]';
            $(selStr).prop('selected', true);
            //$("#rptheaders").prop('checked', enhancements[i][indexData].report);
            s_timezone = enhancements[i][indexData].zone; //here
            $("#backupOpts").children().each(function (index) {
                let optVal = $(this)[0].value;
                //                   let text = $(this)[0].text;
                if (optVal == 'A') {
                    if (enhancements[i][indexData].autobackup) {
                        $(this)[0].text = checkMark + $(this)[0].text;
                    }
                    else
                        $(this)[0].text = nocheckMark + $(this)[0].text;
                }
                else
                    if (optVal == 'R') {
                        if (enhancements[i][indexData].report)
                            $(this)[0].text = checkMark + $(this)[0].text;
                        else
                            $(this)[0].text = nocheckMark + $(this)[0].text;
                        s_headers = enhancements[i][indexData].report;
                    }
            });

            if (enhancements[i][indexState] == true) {
                $("#ViewTracker").show();
                //$("#loadTrack").show();

            }
            else
                $("#ViewTracker").hide();
        }

    }

    $("select#backupOpts").change(function (ev) {
        if (ev.target.value == "B") {
            runBackup(false, s_headers);
        }
        else if (ev.target.value == "R" || ev.target.value == "A") {
            let val2Check = ev.target.children[ev.target.selectedIndex].text;
            let set2 = (val2Check.indexOf(checkMark) > -1) ? false : true;
            if (set2 == false) { //strip it
                val2Check = val2Check.replace(checkMark, "");
            }
            else {
                val2Check = checkMark + val2Check;
            }
            ev.target.children[ev.target.selectedIndex].text = val2Check;
            // set back to default
        }
        selStr = '#backupOpts option[value="none"]'; //reset to none
        // value changed - set save to green
        $(selStr).prop('selected', true);
        setTrackerOpts();
    });

    $("#tabtimer").change(function (ev) {
        if ($("#tabtimer").is(":checked"))
            $("#subAlert").prop("disabled", false);
        else {
            selStr = '#subAlert option[value="none"]';
            $(selStr).prop('selected', true);
            $("#subAlert").prop("disabled", true);
        }
        setTrackerOpts();
    });

    $("#beforeautoD").change(function (ev) {
        setTrackerOpts();
    });

    $("#warnincomplete").change(function (ev) {
        setTrackerOpts();
    });


    $(".aetrangeradios").change(function (ev) {
        setTrackerOpts();
        //need to re-build table based on new selection.
        getData(function (dataA) {
            if (dataA != null) {
                buildTable(dataA, s_timezone, false, getFilterConstant($("#filterDetail option:selected").val())); // options are r = release, nc = incomplete,  ip = in progress or none = none which means no filter
            }
        });
    });

    $(".timerradios").change(function (ev) {
        setTrackerOpts();
    });

    $("select#subAlert").change(function (ev) {
        setTrackerOpts();
    });

    $("select#filterDetail").change(function (ev) {
        //set descConstant to what you want
        let filterConstant = getFilterConstant($("#filterDetail option:selected").val());


        getData(function (dataA) {
            if (dataA != null) {
                buildTable(dataA, s_timezone, false, filterConstant); // options are r = release, nc = incomplete,  ip = in progress or none = none which means no filter
            }
        });
    });

    $('input').hover(hoverCallback);
    $('a').hover(hoverCallback);
    $('button').hover(hoverCallback);
    $('label').hover(hoverCallback);
    $('#nickname').hover(hoverCallback);
    setMsg(defaultHelp, "black");

    // Status bar: initialise collapsed
    $("#status-bar-body").addClass("collapsed");

    // Quick links collapse — persist state
    chrome.storage.local.get(["linksCollapsed"], function (result) {
        if (result.linksCollapsed === true) {
            $("#links").hide();
            $("#NRTLOGMSGP").hide();
            $("#links-toggle-btn").html("&#8964;").attr("title", "Expand links");
            $("#links-section").addClass("links-collapsed");
        }
    });

    $("#links-toggle-btn").click(function () {
        let collapsed = $("#links").is(":visible");
        if (collapsed) {
            $("#links").slideUp(150);
            $("#NRTLOGMSGP").hide();
            $("#links-toggle-btn").html("&#8964;").attr("title", "Expand links");
            $("#links-section").addClass("links-collapsed");
        } else {
            $("#links").slideDown(150);
            $("#links-toggle-btn").html("&#8963;").attr("title", "Collapse links");
            $("#links-section").removeClass("links-collapsed");
        }
        chrome.storage.local.set({ linksCollapsed: collapsed });
    });

    // More / less toggle
    $("#status-toggle-btn").click(function () {
        let body = $("#status-bar-body");
        if (body.hasClass("collapsed")) {
            body.removeClass("collapsed").addClass("expanded");
            $(this).text("less");
        } else {
            body.removeClass("expanded").addClass("collapsed");
            $(this).text("more");
        }
    });

    // Dismiss — hide the whole status bar
    $("#status-dismiss-btn").click(function () {
        $("#popup-status-bar").slideUp(150);
    });
    $('#rhalertcontroleye').prop("disabled", true); //disable for first release of V3
    $('#useremail').prop("disabled", true); //disable for first release of V3

}

//function preactivate() {

//    chrome.storage.local.get('MDELocData', getCurDataCallBack);
//}

Date.prototype.toDateInputValue = (function () {
    let local = new Date(this);
    //local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
    return local.toISOString();
    //return local.toJSON().slice(0, 10);
});

/**
 * Handle an import-all backup file selected by the user.
 *
 * @param {Date} data
 */
function s_processImportAll(data) { // use for restore track data from backup
    let nlchar = "\n".charCodeAt(0);
    let nl = String.fromCharCode(nlchar);
    let lines = data.split(nl);
    let retColor = "black";
    SendSafeRuntimeMessage({ request: "IMPORTALL", data: lines }, function (response) {
        if (response.enhancements != null) {
            setupPop(response.enhancements, response.phrases, response.sounds, false);
            if (response.phrases != null)
                popup_PhraseArray = response.phrases;
        }
        else
            retColor = "red";
        setReturnMsg(response.msg, retColor); //here color not set
        SendSafeRuntimeMessage({ request: "REBUILDT" });
    });
}


/**
 * Parse and import a data file (tracking, phrases, or spell).
 *
 * @param {Date} data
 */
function processFile(data) { // use for restore track data from backup
    nlchar = "\n".charCodeAt(0);
    let tabchar = "\t".charCodeAt(0);
    let tab = String.fromCharCode(tabchar);
    nl = String.fromCharCode(nlchar);
    lines = data.split(nl);
    SendSafeRuntimeMessage({ request: "RESTORETRACKER", data: lines }, function (response) {
        setTrackMsg(response);
        if (response.indexOf("Unexpected format in restore file. Record:") == -1)
            SendSafeRuntimeMessage({ request: "VIEWTRACKER", zone: s_timezone, invoice: false });
    });
}

/**
 * Parse and import a phrase file and update storage.
 *
 * @param {Date} data
 */
function processPHFile(data) { // use for restore track data from backup
    nlchar = "\n".charCodeAt(0);
    tabchar = "\t".charCodeAt(0);
    tab = String.fromCharCode(tabchar);
    nl = String.fromCharCode(nlchar);
    lines = data.split(nl);
    SendSafeRuntimeMessage({ request: "MERGEPHRASES", data: lines }, function (response) {
        //for another read
        popup_PhraseArray = response.phraseArray;
        setMsg(response.msg, "black");
    });
}


/**
 * Reset the phrase list to factory defaults.
 */
function resetPhrases() {
    $('#wordtable').remove();
    $("#pphTablefindW").val("");
    $("#phraseArea").hide();
    $("#restoreallarea").show();
    $("#autoPTitle").hide();
    $("#phaseDisplay").show();
    if ($("#pphTableS").hasClass("changed"))
        $("#pphTableS").removeClass("changed");
    if ($("#pphTableD").hasClass("changed"))
        $("#pphTableD").removeClass("changed");
    window.scrollTo(0, 0);
}
/**
 * Reset the spell-correction list to factory defaults.
 */
function resetSpell() {
    $('#wordtable').remove();
    $("#pacTablefindW").val("");
    $("#spellArea").hide();
    $("#restoreallarea").show();
    $("#autoCTitle").hide();
    $("#actable").show();
    if ($("#pacTableS").hasClass("changed"))
        $("#pacTableS").removeClass("changed");
    if ($("#pacTableD").hasClass("changed"))
        $("#pacTableD").removeClass("changed");
    window.scrollTo(0, 0);
}
// main line code

let s_myComputer = { number: 0, desc: "Not Defined" };

window.addEventListener('load', function (evt) {
    //get status
    try {
        SendSafeRuntimeMessage({ text: "WAKEUP", from: "POPUP", enhancements: null });
    }
    catch (err) {
    }

    genSoundSelect();
    //setChats();
    //$("#cancelsoundsettings").hide();
    $("#NRTLOGMSGP").hide();
    //$('#processInv').hide();
    //$('#updateInv').hide();
    $('#headers').hide();
    $("#trackersubMenu").hide();
    $("#phraseArea").hide();
    $("#autoPTitle").hide();
    $("#spellArea").hide();
    $("#autoCTitle").hide();

    $("#NRTLOGMSG").val("");
    //$("#loadTrack").click(function () {
    //    loadTrackTestData();
    //});

    // FAQ visibility controlled by #faq-section overlay

    $('#CloseLog').click(function () {
        $("#NRTLOGMSGP").hide();
    });

    $('#helps').click(function () {
        if ($("#keyboardshortcuts").is(":visible")) {
            $("#keyshow").attr("src", "show.png");
            $("#keyboardshortcuts").hide();
        }
        else {
            $("#keyboardshortcuts").show();
            $("#keyshow").attr("src", "hide.png");
        }
        $("#helps").blur();
    });

    $('#cancelsoundsettings').click(function () {
        $("#soundsettings").hide();
        $("#ssbutt").text("Configure");
        s_initsounds(s_sounds);
        $('#savesoundsettings').hide();
    });

    $('#savesoundsettings').click(function () {
        $("#soundsettings").hide();
        $("#ssbutt").text("Configure");
        s_UpdateSoundSelections();
        $('#savesoundsettings').hide();
    });

    $('#ssbutt').click(function () {
        if ($("#soundsettings").is(":visible")) {
            $("#soundsettings").hide();
            $("#ssbutt").text("Configure");
        } else {
            $("#soundsettings").show();
            $("#ssbutt").text("Close");
        }
        $('#ssbutt').blur();
        $('#savesoundsettings').hide();
    });

    ////customize
    //$('#timeralertsound').click(function () {
    //    readSetAudioFile("TRACKER");
    //});

    //$('#chatalertsound').click(function () {
    //    readSetAudioFile("CHAT");
    //});
    //$('#nrtendalertsound').click(function () {
    //    readSetAudioFile("NRT");
    //});
    //$('#taskalertsound').click(function () {
    //    readSetAudioFile("RHINDEX");
    //});

    //reset
    $('#resettimeralertsound').click(function () {
        let index = s_sounds.findIndex(x => x.type == "TRACKER");
        if (index != -1) {
            selStr = '#tasktimersound option[value="' + s_sounds[index].default + '"]';
            $(selStr).prop('selected', true);
        }
        $('#savesoundsettings').show();
    });

    $('#resetchatalertsound').click(function () {
        index = s_sounds.findIndex(x => x.type == "CHAT");
        if (index != -1) {
            selStr = '#chatalertsound option[value="' + s_sounds[index].default + '"]';
            $(selStr).prop('selected', true);
        }
        $('#savesoundsettings').show();
    });
    $('#resetnrtendalertsound').click(function () {
        index = s_sounds.findIndex(x => x.type == "NRT");
        if (index != -1) {
            selStr = '#nrtendalertsound option[value="' + s_sounds[index].default + '"]';
            $(selStr).prop('selected', true);
        }
        $('#savesoundsettings').show();
    });

    $('#resetnrtstartalertsound').click(function () {
        index = s_sounds.findIndex(x => x.type == "WAH");
        if (index != -1) {
            selStr = '#nrtstartalertsound option[value="' + s_sounds[index].default + '"]';
            $(selStr).prop('selected', true);
        }
        $('#savesoundsettings').show();
    });


    $('#resettaskalertsound').click(function () {
        index = s_sounds.findIndex(x => x.type == "RHINDEX");
        if (index != -1) {
            selStr = '#taskalertsound option[value="' + s_sounds[index].default + '"]';
            $(selStr).prop('selected', true);
        }
        $('#savesoundsettings').show();
    });

    //play
    $('#playtimeralertsound').click(function () {
        beep_pop(getactivesound("TRACKER", s_sounds));
        //    SendSafeRuntimeMessage({
        //        //    text: "PLAYIT", soundF: "not used", soundType: "TRACKER"
        //        text: "PLAYITTEST", soundF: "not used", soundType: "TRACKER"
        //    });
    });
    $('#playchatalertsound').click(function () {
        let sound2play = $("#chatalertsound").val();
        if (sound2play == "custom")
            beep_pop(getactivesound("CHAT", s_sounds));
        else
            if (sound2play != "customize" && sound2play != "NONE")
                beep_pop(sound2play);
        //    beep_pop(getactivesound("CHAT", s_sounds));
    });
    $('#playnrtendalertsound').click(function () {
        beep_pop(getactivesound("NRT", s_sounds));
    });
    $('#playnrtstartalertsound').click(function () {
        beep_pop(getactivesound("WAH", s_sounds));
    });

    $('#playtaskalertsound').click(function () {
        beep_pop(getactivesound("RHINDEX", s_sounds));
    });

    $('#mdefaq').click(function () {
        // Show the overlay FAQ panel — no layout shift
        let notTracker = document.getElementById('notTracker');
        if (notTracker) notTracker.style.position = 'relative';
        let faqPanel = document.getElementById('faq-section');
        faqPanel.style.display = 'block';
        faqPanel.scrollTop = 0;
    });

    $('#faq-close-btn').click(function () {
        $('#faq-section').hide();
    });


    $('#closeTracker').click(function () {
        $("#trackersubMenu").hide();
        $('body').removeClass('tracker-open det-expanded-wide');
        $("#trackerTable").removeClass("det-expanded");
        $('#trackerTable > tbody').children().remove();
        $(".blueTitle").off("hover");
        $(".blueTitle td").off("click");
        $("#notTracker").show();
        $("#restoreallarea").show();
        selStr = '#filterDetail option[value="none"]';
        $(selStr).prop('selected', true);
    });


    $('#restoreTrack').click(function (ev) {
        let alertStr = "You have requested that your task data be restored from a file backup. Any task data stored currently by the tracker will be overwritten. If this is what you want to do, press OK and you will be given a file dialog where you will select the backup file to restore from. If you got here by accident, press cancel. Proceed wisely! "
        if (confirm(alertStr)) {
            SendSafeRuntimeMessage({ request: "GETACTIVET" }, function (response) {
                if (response != "") {
                    setStatus("Active Task: ", response.taskId);
                    setTrackMsg("Unable to restore data when there is an active task.", "red");
                    return;
                }

                let fileSelector = document.createElement('input');
                fileSelector.setAttribute('type', 'file');
                let selectDialogueLink = document.createElement('a');
                selectDialogueLink.setAttribute('href', '');
                selectDialogueLink.innerText = "Select File";
                $(fileSelector).change("change", function () {
                    if (fileSelector.files.length == 1) {
                        let reader = new FileReader();
                        let data;
                        reader.onload = function (data) {
                            data = reader.result;
                            processFile(reader.result);
                        };
                        reader.readAsText(fileSelector.files[0]);
                    }
                });
                $(fileSelector).trigger("click");
            });
        }
    });


    $('#ConfLog').click(function () {
        SendSafeRuntimeMessage({ request: "DELETELOG" }, function (response) {
            $("#NRTLOGMSGP").hide();
        });
    });

    $('#ClearLog').click(function () {
        $('#ConfLog').show();
    });

    $("#rebuildConsolidated").click(function (ev) {
        SendSafeRuntimeMessage({ request: "GETACTIVET" }, function (response) {
            if (response != "") {
                setStatus("Active Task: ", response.taskId);
                setTrackMsg("Unable to rebuild totals when there is an active task.", "red");
                return;
            }
            let yes = confirm("Are you sure you want to rebuild your totals for this device in the consolidated history?");
            if (yes) {
                SendSafeRuntimeMessage({ request: "REBUILDT" });
            }
        });
    });

    $("#clearTrack").click(function (ev) {
        SendSafeRuntimeMessage({ request: "GETACTIVET" }, function (response) {
            if (response != "") {
                setStatus("Active Task: ", response.taskId);
                setTrackMsg("Unable to delete data when there is an active task.", "red");
                return;
            }
            let before = $("#before").val();
            yes = confirm("are you sure (really sure) you want to erase all your task/work history before this date? If yes, be patient this is a very slow process.");
            if (yes)
                eraseData(before);
        });
    });


    $('#convertP').click(function () {
        if (s_timezone == "L") {
            $("#convertP").text("Set to Local")
            s_timezone = "P";
        }
        else {
            $("#convertP").text('Set to Pacific');
            s_timezone = "L";
        }
        setTrackerOpts(); //not checking for backup run because we aren't really doing that now
        SendSafeRuntimeMessage({ request: "VIEWTRACKER", zone: s_timezone, invoice: false });
    });

    $("#moreT").click(function () {
        showMore("this is a test", false, 1);
    });

    $("#fillinvoice").click(function (ev) {
        let updateallowed = $('#updateallowed').is(":checked");
        let international = $("#iInvoice").is(":checked");
        invoiceFromTable(updateallowed, international);
    });

    $("#fillinvoiceC").click(function (ev) {
        let updateallowed = $('#updateallowedC').is(":checked");
        let international = $("#iInvoice").is(":checked");
        invoiceFromTable(updateallowed, international);
    });

    $("#ViewLog").click(function (ev) {
        $("#spellArea").hide();
        $("#autoCTitle").hide();
        $("#phraseArea").hide();
        $("#autoPTitle").hide();
        $("#restoreallarea").show();
        SendSafeRuntimeMessage({ request: "VIEWLOG" });
    });

    $("#loadmp3").click(function (ev) {
        SetAudioFile("NRT");
    });

    $("#ViewTracker").click(function (ev) {
        setTrackMsg("", "black");
        let dTemp = new Date();
        if (s_timezone == "L") {
            $("#convertP").text("Set to Pacific")
        }
        else {
            $("#convertP").text('Set to Local');
            dTemp = convert2Pacific(dTemp, "TDATE");
        }
        //if (periodArray == null) {           
        periodArray = buildperiodSelectUS(dTemp, true);
        //}
        SendSafeRuntimeMessage({ request: "VIEWTRACKER", zone: s_timezone, invoice: false });
    });

    //auto correct table
    $("#pacTableE").click(function (ev) {
        extractSpell();
    });

    $("#pacTableI").click(function (ev) {
        let fileSelector = document.createElement('input');
        fileSelector.setAttribute('type', 'file');
        let selectDialogueLink = document.createElement('a');
        selectDialogueLink.setAttribute('href', '');
        selectDialogueLink.innerText = "Select File";
        $(fileSelector).change("change", function () {
            if (fileSelector.files.length == 1) {
                let reader = new FileReader();
                reader.onload = function () {
                    let data = reader.result;
                    processSPFile(reader.result);
                };
                reader.readAsText(fileSelector.files[0]);
            }
        });
        $(fileSelector).trigger("click");
        // do close actions
        resetSpell();
    });

    $("#pacTableC").click(function (ev) {
        resetSpell();
    });

    $("#pacTableF").click(function (ev) {
        //scroll to where the word is or where it would be
        //if not found, need to tell them
        //search old word first, then start over and search new word
        let value2chk = $("#pacTablefindW").val();

        if (value2chk.trim() != "") {
            // we are searching for a word within the bounds of the table
            if (value2chk < $("#wordtable > tbody").children('tr:last').find('td#oldword').text()) {
                $('#wordtable > tbody > tr').each(function () {
                    let word = $(this).find('td#oldword').text();
                    if (word.length > 0) {
                        if (word == value2chk) {
                            this.scrollIntoView();
                            return false;
                        }
                        else if (word > value2chk) {
                            //backup one
                            let gotoit = $(this).prev();
                            if (gotoit[0] == undefined) {
                                gotoit = $("#wordtable > tbody").children('tr:first');
                            }
                            gotoit[0].scrollIntoView();
                            return false;
                        }
                    }
                });
            }
            else {
                gotoit = $("#wordtable > tbody").children('tr:last');
                if ((gotoit[0] != undefined))
                    gotoit[0].scrollIntoView();
            }
        }
    });

    $("#pacTableA").click(function (ev) {
        let trs = '<tr class="newRow"><td id="oldword" class="wordtd editTd"><div contenteditable></td><td class="editTd"><div contenteditable></td></tr>';
        let t = $("#wordtable").find('tbody').prepend(trs);
        gotoit = $("#wordtable > tbody").children('tr:first');
        $(gotoit).find('td').children().on('input', function (el) {
            if ($("#pacTableS").hasClass("changed") == false)
                $("#pacTableS").addClass("changed");
        });
        gotoit = $("#wordtable > thead").children('tr:first');
        gotoit[0].scrollIntoView();
        $("#pacTablefindW").val("");
    });

    $("#pacTableD").click(function (ev) {
        $("#pacTablefindW").val("");
        //process updates, delete table, reset buttons, hide myself
        s_readSpell($('.greenRow'), function (trs, words) {
            // [{ old: "", new: "" }]
            let changed = false;
            $(trs).each(function () {
                let children = $(this).children();
                let oldWord = $(children[0]).text();
                found = false;
                for (let i = 0; i < words.length; i++) {
                    if (words[i].old == oldWord) {
                        changed = true;
                        words.splice(i, 1);
                        $(this).remove();
                    }
                }
            });
            if (changed)
                s_saveSpell(words, true);
            $("#pacTableD").removeClass("changed");
        });
    });

    $("#pacTableS").click(function (ev) {
        //process updates, delete table, reset buttons, hide myself
        s_readSpell($('#wordtable > tbody  > tr'), function (trs, words) {
            // [{ old: "", new: "" }]
            changed = false;
            let found = false;
            $(trs).each(function () {
                children = $(this).children();
                oldWord = $(children[0]).text();
                let newWord = $(children[1]).text();
                found = false;
                for (let i = 0; i < words.length; i++) {
                    if (words[i].old == oldWord) {
                        found = true;
                        if (words[i].new != newWord) {
                            changed = true;
                            words[i].new = newWord;
                        }
                    }
                }

                if (found == false && oldWord.length > 0) {
                    words.push({ old: oldWord, new: newWord });
                    changed = true;
                }
            });
            if (changed)
                s_saveSpell(words, true);
        });
        resetSpell();
    });

    $("#actable").click(function (ev) {
        $("#NRTLOGMSGP").hide();
        s_readSpell(null, function (ignore, wordsIn) {
            // [{ old: "", new: "" }]
            //sort data 
            let wordst = wordsIn.sort(function sortFunction(a, b) {
                let compa = a.old.trim();
                let compb = b.old.trim();
                if (compa.toLowerCase() == compb.toLowerCase())
                    return 0;
                if (compa.toLowerCase() > compb.toLowerCase())
                    return 1;
                if (compa.toLowerCase() < compb.toLowerCase())
                    return -1;
            });
            //now move entries with no new word to the top
            let words = wordst.sort(function sortFunction(a, b) {
                if (a.new && b.new) {
                    compa = a.new.trim();
                    compb = b.new.trim();
                    if ((compa.length > 0 && compb.length > 0) || (compa.length == 0 && compb.length == 0))
                        return 0;
                    if (compa.length == 0)
                        return -1;
                    else
                        return 1;
                }
                else
                    return 0;
            });

            $("#wordtable").remove();
            let table = $('<table id="wordtable" style="float:left"><thead></thead><tbody></tbody></table>');
            table.find('thead').append('<tr class="tblHead"><th>Word-Phrase</th><th>Correction</th></tr>');
            //first entry in spellArray has null data - don't display it ever
            for (let i = 0; i < words.length; i++) {
                if (words[i].old != "reservedautocorrect99") {
                    let word2display = words[i].old;
                    let correction2display = " ";
                    if (words[i].new && words[i].new.length > 0)
                        correction2display = words[i].new;
                    let rowClass = "normalRow";
                    if ((i % 2) == 0)
                        rowClass = "otherRow";
                    let trs = '<tr class="' + rowClass + '"><td id="oldword" class="wordtd editTd">' + word2display + '</td>' +
                        '<td class="editTd"><div contenteditable>' + correction2display + '</td>'
                    '</tr>';
                    table.find('tbody').append(trs);
                }
            }
            $('#wordtable').find('> tbody > tr > td').children().on('input', function (el) {
                if ($("#pacTableS").hasClass("changed") == false)
                    $("#pacTableS").addClass("changed");
                $(el.target).addClass("changed");
            });
            $("#spellArea").prepend(table);
            $(".wordtd").click(popup_liClick);
            $("#spellArea").show();
            $("#autoCTitle").show();
            $("#restoreallarea").hide();
            $('#wordtable').find('> tbody > tr > td').children().on('input', function (el) {
                if ($("#pacTableS").hasClass("changed") == false)
                    $("#pacTableS").addClass("changed");
                $(el.target).addClass("changed");
            });
            $("#pacTablefindW").val("");
            $("#actable").hide();
            $("#autoCTitle")[0].scrollIntoView();
        });

    });

    //test messaging
    $("#rhalertcontroleye").click(function (ev) {
        if (ev.ctrlKey) {
            if (confirm("Going to delete text message object. Are you sure") == true) {
                //read from local - write to gdrive
                //tell them you did it.
                SendSafeRuntimeMessage({ text: "DELTXTMSGOBJ", gdapi: true });
            }
        }
        else {
            //if email is blank - first they have to enter that info so we can get the record if there is one in the database
            let email = $("#useremail").val();
            email.trim();
            if (email == "") {
                setMsg("Enter a registered email address to lookup/update your info for this function. To register for text messaging alerts, send an email with your email address to mdipros48@gmail.com. I will register you and send more info about this functionality.");
                return;
            }
            //send message to get userinfo and give me back msgObj - a response will be sendt via a message from background. RHALERTMSGOBJ
            SendSafeRuntimeMessage({ text: "RHALERTCONTROLGET", useremail: email });
        }
    });

    //phrases table

    $("#phaseDisplayeye").click(function (ev) {
        $("#NRTLOGMSGP").hide();
        let phraseArray = popup_PhraseArray;
        if (phraseArray != null) {
            words = phraseArray.sort(function sortFunction(a, b) {
                //if (a.Phrase.length > 0 && b.Phrase.length > 0) { 03/21/23
                compa1 = a.Phrase;
                compa = compa1.trim();
                compb1 = b.Phrase;
                compb = compb1.trim();

                //compa = a.Phrase.text.trim();
                //compb = b.Phrase.text.trim();
                if (compa.toLowerCase() == compb.toLowerCase())
                    return 0;
                if (compa.toLowerCase() > compb.toLowerCase())
                    return 1;
                if (compa.toLowerCase() < compb.toLowerCase())
                    return -1;
                //    }
                //    else
                //        return 0;
            });

            $("#wordtable").remove();
            table = $('<table id="wordtable" style="float:left"><thead></thead><tbody></tbody></table>');
            table.find('thead').append('<tr class="tblHead"><th>Phrase</th></tr>');
            //first entry in spellArray has null data - don't display it ever
            for (let i = 0; i < words.length; i++) {
                let rowClass = "normalRow";
                if ((i % 2) == 0)
                    rowClass = "otherRow";
                let enCoded = encodeURI(words[i].Phrase);
                let trs = '<tr class="' + rowClass + '"><td id="phrasedet" class="wordtd editTd"><div contenteditable>' + words[i].Phrase + '<input id = "phrasedetold" name = "phrasedetold" type = "hidden" value = "' + enCoded + '" ></td></tr>';
                table.find('tbody').append(trs);
            }
            $('#wordtable').find('> tbody > tr > td').children().on('input', function (el) {
                if ($("#pphTableS").hasClass("changed") == false)
                    $("#pphTableS").addClass("changed");
                $(el.target).addClass("changed");
            });
            $("#phraseArea").prepend(table);
            $(".editTd").click(popup_liClick);
            $("#phraseArea").show();
            $("#autoPTitle").show();
            $("#restoreallarea").hide();
            $('#wordtable').find('> tbody > tr > td').children().on('input', function (el) {
                if ($("#pphTableS").hasClass("changed") == false)
                    $("#pphTableS").addClass("changed");
                $(el.target).addClass("changed");
            });
            $("#pphTablefindW").val("");
            $("#phraseDisplay").hide();
            $("#autoPTitle")[0].scrollIntoView();
        }
    });


    $("#pphTableE").click(function (ev) {
        extractPhrases();
    });

    $("#pphTableI").click(function (ev) {
        let fileSelector = document.createElement('input');
        fileSelector.setAttribute('type', 'file');
        let selectDialogueLink = document.createElement('a');
        selectDialogueLink.setAttribute('href', '');
        selectDialogueLink.innerText = "Select File";
        $(fileSelector).change("change", function () {
            if (fileSelector.files.length == 1) {
                let reader = new FileReader();
                reader.onload = function () {
                    let data = reader.result;
                    processPHFile(reader.result);
                };
                reader.readAsText(fileSelector.files[0]);
            }
        });
        $(fileSelector).trigger("click");
    });


    $("#pphTableC").click(function (ev) {
        resetPhrases();
    });
    //here
    $("#pphTableF").click(function (ev) {
        //scroll to where the word is or where it would be
        //if not found, need to tell them
        //search old word first, then start over and search new word
        value2chk = $("#pphTablefindW").val();

        if (value2chk.trim() != "") {
            // we are searching for a word within the bounds of the table
            if (value2chk < $("#wordtable > tbody").children('tr:last').find('td#phrasedet').text()) {
                $('#wordtable > tbody > tr').each(function () {
                    let word = $(this).find('td#phrasedet').text();
                    if (word.length > 0) {
                        if (word == value2chk) {
                            this.scrollIntoView();
                            return false;
                        }
                        else if (word > value2chk) {
                            //backup one
                            let gotoit = $(this).prev();
                            if (gotoit[0] == undefined) {
                                gotoit = $("#wordtable > tbody").children('tr:first');
                            }
                            gotoit[0].scrollIntoView();
                            return false;
                        }
                    }
                });
            }
            else {
                gotoit = $("#wordtable > tbody").children('tr:last');
                if ((gotoit[0] != undefined))
                    gotoit[0].scrollIntoView();
            }
        }
    });

    $("#pphTableA").click(function (ev) {
        let trs = '<tr class="newRow" ><td id="phrasedet" class="wordtd editTd"><div contenteditable></td></tr>';
        //       trs = '<tr class="newRow"><td id="oldword" class="wordtd editTd"><div contenteditable></td><td class="editTd"><div contenteditable></td></tr>';

        let t = $("#wordtable").find('tbody').prepend(trs);
        let gotoit = $("#wordtable > tbody").children('tr:first');
        $(gotoit).find('td').children().on('input', function (el) {
            if ($("#pphTableS").hasClass("changed") == false)
                $("#pphTableS").addClass("changed");
        });
        gotoit = $("#wordtable > thead").children('tr:first');
        gotoit[0].scrollIntoView();
        $("#pphTablefindW").val("");
    });

    $("#pphTableD").click(function (ev) {
        $("#pphTablefindW").val("");
        //process updates, delete table, reset buttons, hide myself
        phraseArray = popup_PhraseArray;
        if (phraseArray != null) {
            changed = false;
            $('.greenRow').each(function () {
                children = $(this).children();
                let phrase = $(children[0]).text();
                found = false;
                for (let i = 0; i < phraseArray.length; i++) {
                    if (phraseArray[i].Phrase == phrase) {
                        changed = true;
                        phraseArray.splice(i, 1);
                        $(this).remove();
                    }
                }
            });
            if (changed)
                s_setPhrases(phraseArray);
            $("#pphTableD").removeClass("changed");
        }
    });
    // use encodeURI(uri)
    // and decodeURI(enc)

    $("#pphTableS").click(function (ev) {
        //process updates, delete table, reset buttons, hide myself
        phraseArray = popup_PhraseArray;
        if (phraseArray != null) {
            // [{ old: "", new: "" }]
            changed = false;
            found = false;
            $('#wordtable > tbody  > tr').each(function () {
                children = $(this).children();
                let oldphrase1 = $(this).find('[id="phrasedetold"]').val(); //phrasedetold
                let oldphrase = decodeURI(oldphrase1);
                let newphrase = $(children[0]).text(); //phrasedetold
                found = false;
                for (let i = 0; i < phraseArray.length; i++) {
                    if (phraseArray[i].Phrase == oldphrase) {
                        found = true;
                        if (phraseArray[i].Phrase != newphrase) {
                            changed = true;
                            phraseArray[i].Phrase = newphrase;
                        }
                    }
                }

                if (found == false && newphrase.length > 0) {
                    phraseArray.push({ Phrase: newphrase });
                    changed = true;
                }
            });
            if (changed)
                s_setPhrases(phraseArray);
        }
        else
            setMsg("Couldnt save changes phrase array not found", "red");
        resetPhrases();
    });



    $("#thiscomputer").on('input', function () {
        let strddesc = $("#thiscomputer").val();
        if (strddesc != makeComputerNameShort(s_myComputer.desc)) { //they  actually changed it
            $("#saveCName").prop("disabled", false);
            $("#saveCName").css("background-color", "green");
        }
        else {
            $("#saveCName").prop("disabled", true);
            $("#saveCName").css("background-color", "white");
        }
    });

    $("#saveCName").click(function (ev) {
        strddesc = $("#thiscomputer").val();
        processNameChange(strddesc); //updates records in consolidated totals
        SendSafeRuntimeMessage({
            text: "SAVECOMPNAME", newName: strddesc
        });
        $("#saveCName").prop("disabled", true);
        $("#saveCName").css("background-color", "white");
    });

    $("#consolidated").click(function (ev) {
        getCData(function (dataA) {
            if (dataA != null && dataA.recs != null && dataA.recs.length > 0) {
                //if (periodArray == null) {
                dTemp = new Date();
                if (s_timezone == "P")
                    dTemp = convert2Pacific(dTemp, "TDATE");
                periodArray = buildperiodSelectUS(dTemp, false);
                //}
                $('.tablearea').children().remove();
                if (!buildConsolidated(dataA.recs, periodArray))
                    setStatus("No task data to display");
                window.scrollTo(0, 0);
                $("#when").change(function () {
                    $("#consolidated").trigger("click");
                });
                $("#wheni").change(function () {
                    $("#consolidated").trigger("click");
                });
                $('#invoice').hide();
            }
            else
                setStatus("No task data to display");

        });
    });

    $("#iInvoice").click(function (ev) {
        buildperiodSelectI(new Date(), true);
        if ($('#iInvoice').is(":checked")) {
            $('#wheni').show();
        }
        else {
            //buildperiodSelectUS(new Date(), true);
            $('#wheni').hide();
        }
    });

    $("#totals").click(function (ev) {
        //get selected period
        resetFilter();
        SendSafeRuntimeMessage({ request: "VIEWTRACKER", zone: "P", invoice: true });
        $("#when").change(function () {
            $('#totals').trigger('click');
        });
        $("#wheni").change(function () {
            $('#totals').trigger('click');
        });
    });

    $("#exportAll").click(function (ev) {
        SendSafeRuntimeMessage({ request: "GETCONTROLOBJ" }, function (response) {
            if (response != "") {
                extractAll(response);
                return;
            }
        });
    });

    $("#importJustTrack").click(function (ev) {
        let alertStr = "You have requested that your task data be restored from a file backup. Any task data stored currently by the tracker will be overwritten. If this is what you want to do, press OK and you will be given a file dialog where you will select the backup file to restore from. If you got here by accident, press cancel. Proceed wisely! "
        if (confirm(alertStr)) {
            SendSafeRuntimeMessage({ request: "GETACTIVET" }, function (response) {
                if (response != "") {
                    setStatus("Active Task: ", response.taskId);
                    setTrackMsg("Unable to restore data when there is an active task.", "red");
                    return;
                }

                let fileSelector = document.createElement('input');
                fileSelector.setAttribute('type', 'file');
                let selectDialogueLink = document.createElement('a');
                selectDialogueLink.setAttribute('href', '');
                selectDialogueLink.innerText = "Select File";
                $(fileSelector).change("change", function () {
                    if (fileSelector.files.length == 1) {
                        let reader = new FileReader();
                        reader.onload = function () {
                            let data = reader.result;
                            processFile(reader.result);
                        };
                        reader.readAsText(fileSelector.files[0]);
                    }
                });
                $(fileSelector).trigger("click");
            });
        }
    });


    $("#importAll").click(function (ev) {
        window.scrollTo(0, 0);
        let alertStr = "You have requested that all of your MDE data be restored from a file backup. Any task data or MDE options currently set will be overwritten. If this is what you want to do, press OK and you will be given a file dialog where you will select the backup file to restore from. If you got here by accident, press cancel. There is no going back from this, Proceed wisely! "
        if (confirm(alertStr)) {
            let fileSelector = document.createElement('input');
            fileSelector.setAttribute('type', 'file');
            let selectDialogueLink = document.createElement('a');
            selectDialogueLink.setAttribute('href', '');
            selectDialogueLink.innerText = "Select File";
            $(fileSelector).change("change", function () {
                if (fileSelector.files.length == 1) {
                    let reader = new FileReader();
                    reader.onload = function () {
                        let data = reader.result;
                        s_processImportAll(reader.result);
                    };
                    reader.readAsText(fileSelector.files[0]);
                }
            });
            $(fileSelector).trigger("click");
        }
    });


    $('input[type="checkbox"]').change(function (event) {
        setOptions();
    });

    $('input[type="checkbox"]').blur(function (event) {
        setOptions();
    });

    $('.txtChanged').change(function (event) {
        setOptions();
    });

    $('.txtChanged').blur(function (event) {
        setOptions();
    });

    //$('#chatname').change(function (event) {
    //    //check to see if its a request for the test area
    //    else
    //        setOptions();
    //});


    $('#rhrefreshsecs').change(function (event) {
        val = parseInt($('#rhrefreshsecs').val());
        if (val < 60) {
            $('#rhrefreshsecs').val("60");
            setOptions("Minimum refresh time is 60 seconds");
        }
        else
            setOptions();
    });

});

//<option value="beep-1.mp3">Beep</option>
//<option value="five-sec.mp3" selected>Ding Dong</option>
//<option value="changes.mp3">ChaChanges</option>
//<option value="countdown.mp3">Countdown</option>
//<option value="ding.mp3">Ding</option>
//<option value="flush.mp3">Splash</option>
//<option value="train.mp3">Train</option>
//<option value="shortbeep.mp3">Short Beep</option>

let sounds = [{ file: "beep-1.mp3", name: "Beep" },
{ file: "five-sec.mp3", name: "Ding Dong" },
{ file: "changes.mp3", name: "ChaChanges" },
{ file: "countdown.mp3", name: "Countdown" },
{ file: "ding.mp3", name: "Ding" },
{ file: "goat.mp3", name: "Goat" },
{ file: "frog.mp3", name: "Frog" },
{ file: "wahwah.mp3", name: "Sad Trombone" },
{ file: "shortbeep.mp3", name: "Short Beep" },
{ file: "flush.mp3", name: "Splash" },
{ file: "train.mp3", name: "Train" },
{ file: "NONE", name: 'None' }
];

let soundsEls = ["tasktimersound", "taskalertsound", "nrtendalertsound", "nrtstartalertsound", "chatalertsound"];

/**
 * Generate the HTML for a sound-selection dropdown.
 */
function genSoundSelect() {
    soundsEls.forEach(function (type) {
        let optionEl = document.getElementById(type);
        $(optionEl).empty();
        $(optionEl).append('<option value="customize">Load New Sound</option>');
        $(optionEl).append('<option value="custom">Custom</option>');

        sounds.forEach(function (el) {
            $(optionEl).append('<option value="' + el.file + '">' + el.name + '</option>');
        });
    });
}

let chatRooms = {
    "1": "Yukon",
    "19": "Leapforce Live",
    "33": "Sonora",
    "41": "Thames",
    "3": "Yukon International",
    "22": "Yukon Social"
};

/**
 * Return a string repeated a given number of times (padding utility).
 *
 * @param {string} inStr
 * @returns {*}
 */
function s(inStr) {
    for (let k in chatRooms) {
        if (chatrooms[k] == inStr)
            return k;
    }
    return

}

//let chatURL = "https://raterlabs.appen.com/qrp/core/vendors/social/chat/console/";


Date.prototype.justDate = function () {
    let d = new Date(this.valueOf());
    return (pad(d.getMonth() + 1)) + '/' + pad(d.getDate()) + '/' + d.getFullYear();
}

let s_sounds = null;

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    /*  am I already monitoring? */
    if (msg.text == "ACTIVATERESP") {
        setupPop(msg.data, msg.phrases, msg.sounds, true);
        s_sounds = msg.sounds;
        sendResponse(0);
        return true;
    }

    if (msg.text == "UPDATEPOPSOUNDS") {
        s_sounds = msg.sounds;
        s_initsounds(s_sounds);
        sendResponse(0);
        return true;
    }

    if (msg.text == "PLAYTHIS") {
        beep_pop(msg.data);
        sendResponse(0);
        return true;
    }

    if (msg.text && (msg.text == "MDENRTLOGA")) {
        let bigLine = "";
        let textlen = 1;
        if (msg.data.indexOf("No log to view") != -1)
            bigLine = msg.data;
        else {
            let nrtRec = { type: "b", dateMills: 0 };
            let nrtRecs = [];
            let tStr = "";
            nrtRecs = JSON.parse(msg.data);
            for (let i = 0; i < nrtRecs.length; i++) {
                nrtRec = nrtRecs[i];
                if (nrtRec.type == "B")
                    tStr = "RHI Tab Open";
                else if (nrtRec.type == "LE")
                    tStr = "RHI Tab Closed";
                else
                    tStr = (nrtRec.type == "S") ? "NRT Start" : "NRT End  ";
                let nrtDate = new Date(nrtRec.dateMills);
                let yearInt = parseInt(nrtDate.getFullYear()) - 2000;
                let curDate = (nrtDate.getMonth() + 1) + '/' + nrtDate.getDate() + '/' + yearInt;
                let curTime = nrtDate.getHours() + ':' + nrtDate.getMinutes() + ':' + nrtDate.getSeconds();
                let newStr = tStr + " " + curDate + ' ' + curTime;
                bigLine = bigLine + newStr + "\n";
            }
            textlen = i;
        }
        $("#NRTLOGMSG").val(bigLine);
        let elmnt = document.getElementById("NRTLOGMSG");
        elmnt.rows = textlen;
        $("#NRTLOGMSGP").show();
        $("#ConfLog").hide();
        elmnt.scrollIntoView();
    }

    if (msg.text == "TOTALSREBUILT") {
        setStatus(msg.message);
        $("#consolidated").trigger("click");  //refresh table
    }

    if (msg.text == "SETMESSAGE") {
        setMsg(msg.message, "black");
    }

    if (msg.text && (msg.text == "TRACKERLOGA")) {
        let dataA = null;
        let thereisTrackerData = false;
        if (msg.data.indexOf("No tracker info to view") == -1) {
            dataA = JSON.parse(msg.data);
            datasetup("on");
            thereisTrackerData = true;
        }
        else
            datasetup("off");

        if (thereisTrackerData && msg.activeTask != "")
            setStatus("Active Task: " + msg.activeTask.taskId);
        else
            setStatus("No Active task");

        //setStatus("");
        if (thereisTrackerData && msg.invoice == true) {
            $("#invoice").show();
            $("#afterTable").hide();
            $("#legend").hide();
            $("#aftertasks").hide();
        }
        else {
            $("#invoice").hide();
            $("#afterTable").show();
            $("#legend").show();
            $("#aftertasks").show();
        }

        $("#spellArea").hide();
        $("#autoCTitle").hide();
        $("#phraseArea").hide();
        $("#restoreallarea").show();
        $("#autoPTitle").hide();
        $("#consolidatedTableHeader").hide();

        buildTable(dataA, msg.zone, msg.invoice, getFilterConstant($("#filterDetail option:selected").val()));

        $("body").addClass("tracker-open");
        $("#notTracker").hide();
        $("#restoreallarea").hide();


        elmnt = document.getElementById("closeTracker");
        elmnt.scrollIntoView();
        if (msg.comp != undefined && msg.comp != null) {
            s_myComputer = msg.comp;
            if (s_myComputer.desc != null)
                $("#thiscomputer").val(s_myComputer.desc.substr(0, 10));
        }
    }
    if (msg.text == "RHALERTMSGOBJ") {
        if (msg.msgObj == null) {
            $("#txtmsgerrors").text("Unable to find record for this email address. Has it been registered via email with MDE support? Send an email to mdipros48@gmail.com for help.");
            $("#txtmsgerrors").show();
            return;
        }
        msgObj = msg.msgObj;
        $("#rhalertcontrol").hide();
        $("#restoreallarea").hide();
        $("#links").hide();
        $("#rhalert").show();
        $("#txtmsgerrors").hide();

        let alertDiv = document.getElementById("rhalertnrtstart");
        if (alertDiv == null) {
            $("#rhalert").append(rhAlertHTML);
            $("#rhalert").show();
            $("#rhaclose").show();
            //$("#rhasave").css('color', 'green');
            //$("#rhasave").css('background-color', 'white');
            getProviders(buildProvidersSelect, msgObj,
                function (status) {
                    $("#phalertstatus").text("Error retreiving providers list");
                });
            $('.textmsgcheck input[type="checkbox"]').change(function (event) {
                setTextOptions(event);
            });


            $('.textmsgcheck').change(function (event) {
                setTextOptions(event);
            });

            $("#usernumber").focus(function (ev) {
                $("#txtmsgerrors").hide();
                $("#txtmsgerrors").val("");
            });

            $("#rhasnoozeclear").click(function (ev) {
                $("#rhalertsnoozestop").val("");
                $("#rhalertsnoozestart").val("");
                setTextOptions(ev);
            });

            $("#thiscomputerMsgOpts").change(function () {
                strddesc = $("#thiscomputerMsgOpts").val();
                if (strddesc != makeComputerNameShort(s_myComputer.desc)) {
                    //they actually changed it
                    processNameChange(strddesc); //updates records in consolidated totals
                    SendSafeRuntimeMessage({
                        text: "SAVECOMPNAME", newName: strddesc
                    });
                    enhancements[indexTracker][indexData].thisComputer.desc = strddesc;
                    s_myComputer.desc = strddesc;
                }
            });

            $("#rhalertstatus").click(function () {
                let butValue = $("#rhalertstatus").text();
                if (butValue == turnOffTexts) {
                    SendSafeRuntimeMessage({ text: "RHALERTCONTROLSTATUSSET", set: false });
                    setRHstatusBut(false);
                }
                else {
                    SendSafeRuntimeMessage({ text: "RHALERTCONTROLSTATUSSET", set: true });
                    setRHstatusBut(true);
                }
            });

            $("#rhaclose").click(function () {
                $("#useremail").prop('disabled', false);
                $("#rhalert").hide();
                $("#rhalertcontrol").show();
                $("#restoreallarea").show();
                $("#links").show();
                $("#rhaclose").hide();
            });

            //$("#rhachange").click(function () {
            //    $("#useremail").prop('disabled', false);
            //});
        }
        else {
            $("#rhalert").show();
            $("#rhaclose").show();
        }
        if (s_myComputer.desc == "Not Defined")
            s_myComputer = enhancements[indexTracker][indexData].thisComputer;
        $("#thiscomputerMsgOpts").val(makeComputerNameShort(s_myComputer.desc));
        // set monitor status message 
        if (enhancements[indexMsgOpts][indexData].monitor)
            $("#txtmsgerrors").text("Monitor is on");

        //this code wont happen at this point msgIObj.email will have been filled in already - and disabled.
        //if (msgObj.email == "") {
        //    //we don't know who they are. so. they will be filling in this whole form and then when we save we will save their info for next time
        //    //$("#rhachange").prop('disabled', true);
        //}
        // $("#txtmsgerrors").text("");
        setRHstatusBut(msgObj.txtAlerts);
        $("#chatTextAlerts").val(msgObj.chatTextAlerts);
        $("#chatRedAlert").prop('checked', msgObj.chatRedAlert);
        $("#chatTextLimit").val(msgObj.chatTextLimit);

        $("#username").val(msgObj.name);
        $("#carrier").val(msgObj.carrier);
        $("#usernumber").val(msgObj.number);

        if (msgObj.snoozestart != "none")
            $("#rhalertsnoozestart").val(msgObj.snoozestart);
        else
            $("#rhalertsnoozestart").val("");
        if (msgObj.snoozestop != "none")
            $("#rhalertsnoozestop").val(msgObj.snoozestop);
        else
            $("#rhalertsnoozestop").val("");

        $("#useremail").val(msgObj.email);
        $("#useremail").prop('disabled', true);
        $("#useremail").prop('title', "click on change email button to allow updates to this field");
        $("#rhachange").prop('disabled', false);
        if (msgObj.active == true) {
            $("#phalertstatus").text("RH Alerts are active");
        }
        else {
            $("#phalertstatus").text("RH Alerts are not active");
        }
        $("#rhalertnrtstart").prop('checked', msgObj.options.nrtstart);
        $("#rhalertnrtstop").prop('checked', msgObj.options.nrtstop);
        if (msgObj.options.textafter != undefined) {
            $("#textafter").val(msgObj.options.textafter);
        }
        //else
        //    $("#textafter").val("2");
        $("#rhalertuo").prop('checked', msgObj.options.uo);
        $("#rhalertac").prop('checked', msgObj.options.ac);
        $("#rhalertsapr").prop('checked', msgObj.options.sapr);
        $("#rhalerthm").prop('checked', msgObj.options.hm);
        $("#rhalerthr").prop('checked', msgObj.options.hr);
        $("#rhalertpr").prop('checked', msgObj.options.pr);
        $("#rhalerthrs").prop('checked', msgObj.options.hrs);

        document.getElementById('rhaclose').scrollIntoView();

    }
});

/**
 * Return the configured sound filename for a given alert type.
 *
 * @param {Object} sounds
 * @param {string} type
 * @returns {*}
 */
function s_getsound(sounds, type) {
    index = sounds.findIndex(x => x.type == type);
    if (index == -1) {
    }
    else {
        if (sounds[index].active == "")
            return sounds[index].default;
        else if (sounds[index].active != "NONE" && sounds[index].active.indexOf(".mp3") == -1)
            return 'custom';
        else
            return sounds[index].active;
    }
}
/**
 * Build the pay-period date selector for US locale.
 *
 * @param {*} today
 * @param {Object} set
 * @returns {*}
 */
function buildperiodSelectUS(today, set) {
    let periodArray = buildperiod(today, "US");
    if (set) {
        $("#when").empty();
    }

    for (let i = 0; i < 2; i++) {
        if (set)
            $('#when').append('<option value="' + i + '">' + periodArray[i].desc + '</option>');
    }

    return periodArray;
}
//invoice shares this code in invoice_getStartofPeriod. if you change I code here - change it there too
/**
 * Build the pay-period date selector for international locale.
 *
 * @param {*} today
 * @param {Object} set
 * @returns {*}
 */
function buildperiodSelectI(today, set) {
    periodArray = buildperiod(today, "I");
    if (set) {
        $("#wheni").empty();
    }

    for (let i = 0; i < 2; i++) {
        if (set)
            $('#wheni').append('<option value="' + i + '">' + periodArray[i].monthDesc + '</option>');
    }

    return periodArray;
}

let inProcessFilterStr = "InProcess";
/**
 * Return the numeric filter constant for a given filter label string.
 *
 * @param {Object} filterVal
 * @returns {*}
 */
function getFilterConstant(filterVal) {
    let filterConstant = filterVal;
    if (filterVal == 'r')
        filterConstant = getReleasedConstant();
    else if (filterVal == "nc")
        filterConstant = getncConstant();
    else if (filterVal == 'ip')
        filterConstant = inProcessFilterStr;

    return filterConstant;
}

/**
 * Reset the tracker date filter to its default (all records).
 */
function resetFilter() {
    selStr = '#filterDetail option[value="none"]';
    $(selStr).prop('selected', true);
}

//zone is L or P
//invoice means only show data that matches period selected on the screen
//filter options are Released, notComplete,  ip = in progress or none = null which means no filter 
/**
 * Build and render the productivity tracker table from stored data.
 *
 * @param {Date} data
 * @param {boolean} zone
 * @param {Object} invoice
 * @param {Object} filter
 * @returns {boolean}
 */
function buildTable(data, zone, invoice, filter) {
    let totalAET = 0;
    let totaltrueaet = 0;
    let totalTime = 0;
    let totalTaskCount = 0;
    //tasks by week
    //tasks by week
    let week1Totalr = 0;
    let week2Totalr = 0;
    let monthTotalr = 0
    //work by week
    let week1Totalw = 0;
    let week2Totalw = 0;
    let monthTotalw = 0;
    //aet by week
    let week1Totala = 0;
    let week2Totala = 0;
    let monthTotala = 0;
    //real aet by week
    let week1Totaltrueaet = 0;
    let week2Totaltrueaet = 0;
    let monthTotaltrueaet = 0;

    let aetrange = $('input[name="aetrange"]:checked').val();
    let international = $("#iInvoice").is(":checked");

    let noTotal = false;

    let d = new Date();

    let periodIndex = 0; //default period is current
    // get period index if invoicing
    if (invoice) {
        if (international)
            periodIndex = parseInt($("#wheni").val());
        else
            periodIndex = parseInt($("#when").val());
    }

    if (international)
        periodArray = buildperiodSelectI(d, false);
    else
        periodArray = buildperiodSelectUS(d, false);

    let perioda = periodArray[periodIndex];

    if (invoice) {
        if (data != null) {
            let anyinomp = anyIncomplete(data, periodArray[periodIndex].startDate, periodArray[periodIndex].endDate);
            if (international) {
                anyinomp = anyIncomplete(data, periodArray[periodIndex].smonth, periodArray[periodIndex].emonth);
            }
            if (anyinomp != null) {
                if (confirm("You have incomplete tasks in this pay period. Press OK to continue, Cancel to stop (so you can adjust them)") == false)
                    return;
            }
        }
    }

    if (zone == "P") {
        setTrackHeaderMsg('Date and Time of the Tasks are in Pacific Timezone', "black");
        d = convert2Pacific(d, "TDATE");
    }
    else
        setTrackHeaderMsg('Date and Time of the Tasks are in your local Timezone', "black");

    let lastDate = (d.getMonth() + 1) + '/' + d.getDate() + '/' + d.getFullYear();
    curDate = lastDate;

    table = $('#trackerTable');
    $('#trackerTable > tbody').children().remove();
    $('#trackerTable > thead').children().remove();
    $("#closeInvoice").remove();
    $('#closeTotalsBut').remove();
    $("#normalTableHeader").show();
    if (invoice) {
        //add close button
        $("#trackertablediv").prepend('<button class="Submit" type="button" id="closeInvoice"><img src="close.png" width="12" height="12" /></button>');
        $("#closeInvoice").click(function (ev) {
            $("#ViewTracker").trigger("click");  //refresh table
            $("#closeInvoice").remove();
            $("#when").unbind('change');
            $("#wheni").unbind('change');
        });
        //hide pacific and filter
        $("#normalTableHeader").hide();
    }
    table.find('thead').append('<tr><th>Date</th><th class="det-time-col">Time</th><th>Task(s)</th><th title="AET for released tasks is set to time worked on the task.">AET(*)</th><th>WorkTime</th><th>Surplus</th>' +
        '<th title="(AET/Time worked)*100)" id="detdesc">Productivity %</th></tr>');
    $(".blueTitle").off("hover");
    $(".blueTitle td").off("click");

    let current = false;


    //only giving total for current period atm (this doesn't change if invoice == true)
    let periodTotal = 0;
    let week = { desc: "", startDate: getStartofThisWeek(d), endDate: getStartofThisWeek(d), total: 0 };
    week.endDate = new Date(week.startDate.addDays(6));
    week.desc = week.startDate.justDate() + '-' + week.endDate.justDate();

    let objRec = { taskId: "", dateofTask: null, taskDesc: "", taskAET: "", extras: "", workTime: 0 };
    table = document.getElementById("trackerTable");
    //if (invoice) {
    //    $("#invoiceHeaderMsg").text('Invoice data for the period of ' + perioda.desc);
    //}

    let reportData = new Array();
    if (data != null) {
        if (invoice)
            reportData = reverseSort(data, "dateofTask", zone); //this is where we convert to pacific
        else
            reportData = localSort(data, "dateofTask", zone); //this is where we convert to pacific
    }
    else {
        // we will display one row which says - no data
        $("#trackerTable").find('tbody').append('<tr><td colspan="6" class="blabel">No Data to Display<td><tr>');
        //set totals to all be null
        let overallT = {
            week1aetdesc: "00:00:00", week1aet: "00:00:00", week1time: "00:00:00",
            week2aetdesc: "00:00:00", week2aet: "00:00:00", week2time: "00:00:00",
            overallaet: "00:00:00", overalltime: "00:00:00",
            week1trueaet: "00:00:00", week2trueaet: "00:00:00", overalltrueaet: "00:00:00"
        };
        setTrackTotals(overallT);
    }

    if (filter != "none") {
        //select only records that match the filter
        let filtered = reportData.filter(function (element) {
            if (filter == inProcessFilterStr) {
                if (element.workTime == 0 && element.taskDesc != getSubmittedConstant())
                    return true;
            }
            else if (filter == getncConstant() && element.taskDesc == filter) {
                if (element.workTime == 0)
                    return false;
                else
                    return true;
            }
            else return (element.taskDesc == filter);
        });
        reportData = filtered;
    }

    for (let i = 0; i < reportData.length; i++) {
        objRec = reportData[i];
        let thisDate = new Date(objRec.dateofTask); //this variable will be used later too.
        curDate = thisDate.justDate();
        //Task Date AET WorkTime surplus Type
        if ((curDate != lastDate) && totalTaskCount > 0) {
            //add to week, period total if applicable
            let cDate = new Date(lastDate);
            current = false;
            if (cDate >= periodArray[periodIndex].startDate) {
                periodTotal = periodTotal + totalTime;
                current = true;
            }
            if (cDate >= week.startDate)
                week.total = week.total + totalTime;
            let trt = processTotalLine(totalAET, totalTime, lastDate, totalTaskCount, current, false, totaltrueaet);
            // if this total  is within our period 
            if (invoice) {
                if (international) {
                    if (justDate4Compare(cDate) >= perioda.smonth && justDate4Compare(cDate) <= perioda.emonth)
                        $("#trackerTable").find('tbody').append(trt);
                }
                else {
                    if (justDate4Compare(cDate) >= perioda.startDate && justDate4Compare(cDate) <= perioda.endDate)
                        $("#trackerTable").find('tbody').append(trt);
                }
            }
            else
                $("#trackerTable").find('tbody').append(trt);
            if (invoice && international) {
                if (cDate >= periodArray[periodIndex].smonth && cDate <= periodArray[periodIndex].emonth) {
                    monthTotalr += totalTaskCount;
                    monthTotalw += totalTime;
                    monthTotala += totalAET;
                    monthTotaltrueaet += totaltrueaet;
                }
            }
            if (cDate >= periodArray[periodIndex].startDate && cDate < periodArray[periodIndex].start2week) {
                week1Totalr += totalTaskCount;
                week1Totalw += totalTime;
                week1Totala += totalAET;
                week1Totaltrueaet += totaltrueaet;
            }
            if (cDate >= periodArray[periodIndex].start2week &&
                cDate <= periodArray[periodIndex].endDate) {
                week2Totalr += totalTaskCount;
                week2Totalw += totalTime;
                week2Totala += totalAET;
                week2Totaltrueaet += totaltrueaet;
            }
            totalAET = 0;
            totalTime = 0;
            totalTaskCount = 0;
            totaltrueaet = 0;
        }
        totalTaskCount++;

        lastDate = curDate;
        totalTime += objRec.workTime;
        //if (objRec.workTime > 0 && objRec.taskDesc != "Released") // if no work time yet, or you relesed this one, don't add to total AET. "Released" must equal what is in dbclick.js for released
        if (objRec.workTime > 0 && objRec.taskId != "") {
            if (objRec.taskAET == "")
                objRec.taskAET = "0.0";
            if (objRec.taskDesc == getSubmittedConstant() || objRec.taskDesc == "") {
                let thisAET = processAET(objRec.taskAET, aetrange);
                totalAET = totalAET + thisAET;
                totaltrueaet = totaltrueaet + thisAET;
                //let compDate = new Date(thisDate.getFullYear(), thisDate.getMonth(), thisDate.getDate(), 0, 0, 0);
                //if (compDate >= periodArray[periodIndex].startDate && compDate < periodArray[periodIndex].start2week) {
                //    week1Totaltrueaet = week1Totaltrueaet + parseFloat(objRec.taskAET);
                //}
                //else if (compDate >= periodArray[periodIndex].start2week && compDate <= periodArray[periodIndex].endDate) {
                //    week2Totaltrueaet = week2Totaltrueaet + parseFloat(objRec.taskAET);
                //}
            }
            else if (objRec.taskDesc == getReleasedConstant()) {
                thisAET = processAET(objRec.taskAET, aetrange);
                totalAET = totalAET + millisToMinSecFraction(objRec.workTime);  //swapped these
                totaltrueaet = totaltrueaet + thisAET;
            }
        }
    }

    if (data == null || reportData.length == 0) {
        $("#trackerTable").find('tbody').append('<tr><td colspan="6" class="blabel">No Data to Display<td><tr>');
    }
    else {
        //process last date
        //add to week, period total if applicable
        let cDate = new Date(lastDate);
        current = false;
        if (cDate >= periodArray[periodIndex].startDate) {
            periodTotal = periodTotal + totalTime;
            current = true;
        }
        if (cDate >= week.startDate)
            week.total = week.total + totalTime;
        if (invoice == false) {
            let trt = processTotalLine(totalAET, totalTime, lastDate, totalTaskCount, current, false, totaltrueaet);
            if (justDate4Compare(cDate) >= perioda.startDate && justDate4Compare(cDate) <= perioda.endDate) {
                let trt = processTotalLine(totalAET, totalTime, lastDate, totalTaskCount, current, false, totaltrueaet);
                $("#trackerTable").find('tbody').append(trt);
            }
        }

        let tempd = new Date(periodArray[periodIndex].startDate.addDays(6));
        let tempStr = tempd.justshortDate();

        //week totaltrueaet is captured above when we check if the task was released. Have to keep it on a task by task basis
        // since we check if the task was released
        if (invoice && international) {
            if (cDate >= periodArray[periodIndex].smonth && cDate <= periodArray[periodIndex].emonth) {
                monthTotalr += totalTaskCount;
                monthTotalw += totalTime;
                monthTotala += totalAET;
                monthTotaltrueaet += totaltrueaet;
            }
        }
        if (cDate >= periodArray[periodIndex].startDate &&
            cDate < periodArray[periodIndex].start2week) {
            week1Totalr += totalTaskCount;
            week1Totalw += totalTime;
            week1Totala += totalAET;
            week1Totaltrueaet += totaltrueaet;
        }
        if (cDate >= periodArray[periodIndex].start2week &&
            cDate <= periodArray[periodIndex].endDate) {
            week2Totalr += totalTaskCount;
            week2Totalw += totalTime;
            week2Totala += totalAET;
            week2Totaltrueaet += totaltrueaet;
        }
        //write totalines fopr invoice
        if (invoice == true) {
            if (international) {
                tempd = new Date(periodArray[periodIndex].emonth);
                tempStr = tempd.justshortDate();
                let trt = processTotalLine(monthTotala, monthTotalw, "Month Ending " + tempStr, monthTotalr, false, true, monthTotaltrueaet);
                $("#trackerTable").find('tbody').append(trt);

            } else {
                tempd = new Date(periodArray[periodIndex].startDate.addDays(6));
                tempStr = tempd.justshortDate();
                let trt = processTotalLine(week1Totala, week1Totalw, "Week Ending " + tempStr, week1Totalr, false, true, week1Totaltrueaet);
                $("#trackerTable").find('tbody').append(trt);
                trt = processTotalLine(week2Totala, week2Totalw, "Week Ending " + periodArray[periodIndex].endDate.justshortDate(), week2Totalr, false, true, week2Totaltrueaet);
                $("#trackerTable").find('tbody').append(trt);
                trt = processTotalLine(week1Totala + week2Totala, week1Totalw + week2Totalw, "Total for the period", week1Totalr + week2Totalr, false, true, week2Totaltrueaet + week1Totaltrueaet);
                $("#trackerTable").find('tbody').append(trt);
            }
        }

        //let tty = "Time worked:  Week <b> " + week.desc + " (" + millisToHoursMinutesAndSeconds(week.total) + ") </b> Period <b>" +
        //    periodArray[periodIndex].desc + " (" + millisToHoursMinutesAndSeconds(periodTotal) + ")</b>";
        //setTrackTotals(tty, "green");
        if (invoice == false) {
            let overallT = {
                week1aetdesc: "", week1aet: "", week1time: "",
                week2aetdesc: "", week2aet: "", week2time: "",
                overallaet: "", overalltime: "", week1trueaet: "", week2trueaet: "", overalltrueaet: "",
            };
            overallT.week1time = millisToHoursMinutesAndSeconds(week1Totalw);
            overallT.week2time = millisToHoursMinutesAndSeconds(week2Totalw);
            overallT.overalltime = millisToHoursMinutesAndSeconds(periodTotal);
            overallT.overallaet = millisToHoursMinutesAndSeconds((week1Totala * 60000) + (week2Totala * 60000));
            overallT.overalltrueaet = millisToHoursMinutesAndSeconds((week1Totaltrueaet * 60000) + (week2Totaltrueaet * 60000));
            overallT.week1aetdesc = "Week Ending " + tempStr + " AET(*)";
            overallT.week1aet = millisToHoursMinutesAndSeconds(week1Totala * 60000);
            overallT.week1trueaet = millisToHoursMinutesAndSeconds(week1Totaltrueaet * 60000);
            overallT.week2trueaet = millisToHoursMinutesAndSeconds(week2Totaltrueaet * 60000);
            overallT.week2aetdesc = "Week Ending " + periodArray[periodIndex].endDate.justshortDate() + " AET(*)";
            overallT.week2aet = millisToHoursMinutesAndSeconds(week2Totala * 60000);
            setTrackTotals(overallT);
        }
    }
    $('.aethover').hover(displayTrueAET);
    $(".blueTitle").hover(shadowLine);
    $(".blueTitle td").click(detLine);
    $("#trackersubMenu").show();
    $('body').addClass('tracker-open');
    //$('#ConfTrack').hide();
    if ($('#before').length > 0)
        $('.beforeClass').remove();
    let strbefore = '<label for="before" class="beforeClass">  Before</label><input type="date" id="before" name="before" class="beforeClass"' +
        ' value = "' + chgYear(new Date(), -1) + '" min="' + chgYear(new Date(), -1) +
        '" max="' + chgYear(new Date(), 1) + '" />';
    $("#clearTrack").after(strbefore);

    //$('#aftertasks').show();
    var trackerTable = document.getElementById("trackerTable");
    trackerTable.scrollTop = 0;
    trackerTable.scrollLeft = 0;
    // scrollIntoView() was scrolling the popup window itself to mid-page — removed.
    initTrackerColResize();
}


/**
 * Calculate and return the AET for a detail record row.
 *
 * @param {Object} taskAET
 * @returns {*}
 */
function processdetrecAET(taskAET) {
    let newAET = taskAET;
    if (taskAET.indexOf(" - ") != -1) {
        let aetrange = $('input[name="aetrange"]:checked').val();
        let newTime = taskAET.split(" - ");
        if (aetrange == "HIGH")
            newAET = newTime[1];
        else if (aetrange == "LOW")
            newAET = newTime[0];
        else if (aetrange == "MID") {
            let numl = parseFloat(newTime[0]);
            let numh = parseFloat(newTime[1]);
            let diff = numh - numl;
            let num = numl + (diff / 2);
            newAET = num.toString();
            //end check for mid point
        }
    }
    return (parseFloat(newAET)) * 60000;
}

//for totallines
/**
 * Display the calculated true AET value in a tracker row cell.
 *
 * @param {Object} ev
 */
function displayTrueAET(ev) {
    if (ev.type == "mouseenter") {
        let trueAET = $(ev.target.parentElement).find('input#trueaetstr').val();
        $(ev.target).prop('title', trueAET);
    }
}

//for detail lines
/**
 * Display the calculated true AET value in a detail record cell.
 *
 * @param {Object} ev
 */
function displaydetTrueAET(ev) {
    if (ev.type == "mouseenter") {
        trueAET = $(ev.target.parentElement).find('input#tasktrueaet').val();
        $(ev.target).prop('title', trueAET);
    }
}


/**
 * Apply alternating shading to a tracker table row.
 *
 * @param {Object} ev
 */
function shadowLine(ev) {
    // ev.target
    //ev.type
    if (ev.type == "mouseenter")
        $(ev.target.parentElement).addClass("shadowRow");
    else if (ev.type == "mouseleave")
        $(ev.target.parentElement).removeClass("shadowRow");

}


/**
 * Build and return the HTML for the tracker period-total row.
 *
 * @param {Object} totalAET
 * @param {number} totalTime
 * @param {Date} lastDate
 * @param {number} totalTaskCount
 * @param {Object} current
 * @param {Object} totalLine
 * @param {Object} totaltrueaet
 * @returns {*}
 */
function processTotalLine(totalAET, totalTime, lastDate, totalTaskCount, current, totalLine, totaltrueaet) {
    let aetStr = millisToHoursMinutesAndSeconds(totalAET * 60000); //adjusted aet
    let trueaetstr = millisToHoursMinutesAndSeconds(totaltrueaet * 60000); //unadjusted/real aet

    let diff = (totalAET * 60000) - totalTime;
    let diffStr = millisToMinutesAndSeconds(diff);
    //let suggestStr = "";
    let diffClass = 'greennogrey';
    if (diff < 0) {
        if (diffStr != "0:0:00") {
            diffClass = 'rednogrey';
            diffStr = "-" + diffStr;
        }
    }
    else
        diffStr = " " + diffStr;
    let calc = 0;
    if (totalAET > 0)
        calc = ((totalAET * 60000) / totalTime) * 100;
    //if date is in this period - green for date/time. If before, purple
    let workClass = (current == true ? "greentitle" : "dateWork");
    //'<input id="work" name="work" type="hidden" value="' + totalTime + '">';
    //date taskcount aet work surplus productivity
    let rowClass = "blueTitle";
    if (totalLine) {
        rowClass = "totalline";
        workClass = "totalline";
        //    suggestStr = "(3% is " + millisToHoursMinutesAndSeconds(totalTime * .03) + ")";
    }

    let trt = '<tr title="Click on a row to view detail. Click again to collapse detail." class="' +
        rowClass + '"><td id="date" class="' + workClass + '">' + lastDate + '</td><td class="det-time-col"></td><td>' + totalTaskCount + '</td><td id="curaetstr" class="aethover">' + aetStr + '<input id="trueaetstr" type="hidden" value="' + trueaetstr + '">' +
        '</td><td class="' + workClass + '">' + '<input id="work" name="work" type="hidden" value="' + totalTime + '">'
        + millisToHoursMinutesAndSeconds(totalTime) + '</td><td id="surplus" class="' + diffClass + '">' + diffStr + '</td><td>' +
        //    calc.toFixed(2) + ' % ' + suggestStr + '</td ></tr > ';
        calc.toFixed(2) + ' %</td></tr> ';
    return trt;
}

/**
 * Enable drag-to-resize on tracker table column headers.
 * Attaches a mousedown listener to each <th>; dragging the right edge
 * of a header resizes that column. No CSS resize property is used
 * (avoids the browser diagonal-handle artefact).
 */
function initTrackerColResize() {
    let table = document.getElementById('trackerTable');
    if (!table) return;
    let ths = Array.from(table.querySelectorAll('thead th'));

    ths.forEach(function (th, colIdx) {
        // Remove any previously attached resize handle to avoid duplicates
        let existing = th.querySelector('.col-resize-handle');
        if (existing) th.removeChild(existing);

        let handle = document.createElement('div');
        handle.className = 'col-resize-handle';
        th.appendChild(handle);

        handle.addEventListener('mousedown', function (e) {
            e.preventDefault();
            let startX = e.pageX;
            let startW = th.offsetWidth;

            function onMove(e) {
                let newW = Math.max(40, startW + (e.pageX - startX));

                // Set width on the <th> itself
                th.style.width = newW + 'px';

                // thead and tbody are separate display:table contexts so
                // setting th.style.width alone does not resize body cells.
                // Explicitly sync every td in this column position as well.
                let nth = colIdx + 1;
                let tds = table.querySelectorAll('tbody tr td:nth-child(' + nth + ')');
                tds.forEach(function (td) { td.style.width = newW + 'px'; });
            }

            function onUp() {
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
            }

            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        });
    });
}

/**
 * Expand or collapse the detail rows for a clicked tracker summary row.
 *
 * @param {Object} ev
 * @returns {boolean}
 */
function detLine(ev) {
    let curRow = ev.target.parentElement; // set to current tr
    let d = $(curRow).find('td#date').text();
    let aetrange = $('input[name="aetrange"]:checked').val();
    let surplus = "00:00";

    let curDate = new Date(d);
    //if we already have detRecs in the table - we are just closing this series of details
    let x = $(curRow).find(".detrec");
    let dets = $(".detRec");
    if (dets.length > 0) {
        $("#detdesc").text("Productivity %");
        let oldDate = new Date(dets[0].children[0].textContent);
        if (justDateEqual(oldDate, curDate)) {
            $(".detRec").remove();
            $("#trackerTable").removeClass("det-expanded");
            $("body").removeClass("det-expanded-wide");
            return;
        }
        else
            $(".detRec").remove();
    }

    let filterConstant = $("#filterDetail option:selected").val();
    if (filterConstant == "none")
        filterConstant = null;
    filterConstant = getFilterConstant(filterConstant);

    chrome.storage.local.get('trackData', function (data) { //ok
        let dataA;
        try {
            dataA = JSON.parse(data.trackData);
        } catch (e) {
            alert('Your local task tracking data file is corrupted. Until this is fixed, MDE is NOT tracking your time. "Totals All Devices" on detail screen will however have an accurate daily totals. Contact MDE support for additional help.  Error:' + e); // error in the above string (in this case, yes)!
        }
        if (dataA.length == 0) {
            setTrackMsg("Error getting tracking detail", "red");
            return;
        }

        let objRecs = localSort(dataA, "dateofTask", s_timezone);

        //only get this day and matching filterconstant if there is one 
        let detObjs = objRecs.filter(function (obj) {
            let thisDate = new Date(obj.dateofTask);
            if (filterConstant != null) {
                if (filterConstant == inProcessFilterStr) {
                    if (obj.workTime == 0 && obj.taskDesc != getSubmittedConstant())
                        return justDateEqual(thisDate, curDate);
                }
                else if (filterConstant == getncConstant() && obj.taskDesc == filterConstant) {
                    if (obj.workTime == 0)
                        return false;
                    else
                        return justDateEqual(thisDate, curDate);
                }
                else if (obj.taskDesc == filterConstant)
                    return justDateEqual(thisDate, curDate);
            }
            else
                return justDateEqual(thisDate, curDate);
        });

        if (detObjs.length == 0) {
            setTrackMsg("Error getting tracking detail (2)", "red");
            return;
        }

        for (let i = 0; i < detObjs.length; i++) {
            let objRec = detObjs[i];
            let workClass = "greentdnogrey";
            let rowClass = "detRec";
            let surplus;
            if (objRec.taskAET == "")
                objRec.taskAET = "0.0";
            let aettime = processdetrecAET(objRec.taskAET); //input is string, output is mils
            let displayAET = convertAET(objRec.taskAET, aetrange); //in and out are string
            let displaytrueAET = convertAET(objRec.taskAET, aetrange); //in and out are string
            let tempWork = millisToMinutesAndSeconds(objRec.workTime);


            if (objRec.taskDesc == getReleasedConstant()) {
                //make it a different color 
                if (objRec.workTime > 0) {
                    //    displayAET = mills2AETfromWork(objRec.workTime); //input is mils, output is string
                    displayAET = tempWork;
                }
                rowClass += " releasedC";
                surplus = "00:00";
            }
            else {
                surplus = millisToMinutesAndSeconds(objRec.workTime - aettime);
                if (objRec.workTime == 0 && objRec.taskDesc != getSubmittedConstant()) {
                    tempWork = "";
                }
                else
                    if (objRec.workTime > (aettime + 500)) { // .5 sec tolerance
                        workClass = "redtdnogrey";
                        surplus = '(' + surplus + ')';
                    }
            }
            if (objRec.taskDesc == getncConstant() && objRec.workTime > 0) { // this one hasn't been submitted)yet.
                //make it a different color 
                rowClass += " incompleteC";
            }

            let displayId = objRec.taskId;
            let addStar = " ";
            if (displayId.length > 10) {
                addStar = "*";
                displayId = displayId.substr(0, 10);
            }

            // Split "M/D/YYYY H:MM:SS AM/PM" into date and time parts
            let dateofTaskStr = String(objRec.dateofTask);
            let dateofTaskParts = dateofTaskStr.split(' ');
            let datePart = dateofTaskParts[0] || dateofTaskStr;
            let timePart = dateofTaskParts.slice(1).join(' ') || '';

            let newStr = '<tr class="' + rowClass + '">' +
                '<td id="datestr" class="det-date">' + datePart + '</td>' +
                '<td class="det-time">' + timePart + '</td>' +
                '<td class="task" title="' + objRec.taskId + '">' + displayId + addStar +
                '<input id="realtaskId" name="realtaskId" type="hidden" value="' + objRec.taskId + '">' +
                '</td>' +
                '<td id="taskAET" class="taskaetclass">' + displayAET + '<input id="tasktrueaet" type="hidden" value="' + displaytrueAET + '"></td>' +
                '<td input type="text" id="workTime" class="' + workClass + '"><div contenteditable>' + tempWork + '</div></td>' +
                '<td id="surplus">' + surplus + '</td>' +
                '<td>' + objRec.extras + '</td>' +
                '</tr>';
            $(curRow).after(newStr);
        }

        $('.detRec').each(function () {
            let workTime = $(this).find('[id="workTime"]').text();
            if (workTime == "")
                $(this).addClass("notimeRow");
        });
        $('.taskaetclass').hover(displaydetTrueAET);
        $(".redtdnogrey").click(dataclick);
        $(".greentdnogrey").click(dataclick);
        $("#detdesc").text("Task Description");
        $("#trackerTable").addClass("det-expanded");
        $("body").addClass("det-expanded-wide");
        initTrackerColResize(); // re-attach handles now that Time column is visible
    });
}
//here - add graphic that shows it's running (because its really slow)
/**
 * Prompt the user and, if confirmed, delete all tracking data.
 *
 * @param {Object} before
 * @returns {*}
 */
function eraseData(before) {

    compDate = dateFromHTML(before); // format is a javascript date
    //display working graphic
    SendSafeRuntimeMessage({ text: "CLEARTRACK", compDate: compDate }, function (response) {
        //close anything open
        $("#closeTracker").trigger("click");
        setStatus("Task History Erased before " + compDate, "black");
    });

    //chrome.storage.local.get('trackData', function (data) { //ok
    //    if (chrome.runtime.lastError) {
    //        setTrackMsg("Error while getting data: " + chrome.runtime.lastError.message, "red");
    //    }
    //    else {
    //        if (data.trackData == null) {
    //            setTrackMsg("Unexpected situation during delete, No Data Found", "red");
    //            return;
    //        }
    //        dataA = JSON.parse(data.trackData);
    //        //let dataB = mergeData(dataA);
    //        //saveData(dataB);
    //        // sort them to be by date
    //        reportData = localSort(dataA, "dateofTask", "none");
    //        compDate = dateFromHTML(local_before);

    //        for (let i = 0, l = reportData.length; i < l; i++) {
    //            let obj = reportData[i];
    //            let checkDate = new Date(obj.dateofTask);
    //            let cmills = checkDate.getTime();
    //            if (checkDate < compDate) {
    //                //slice it
    //                let newArray = reportData.filter(function (element) {
    //                    thisDate = new Date(element.dateofTask);
    //                    tmills = thisDate.getTime();
    //                    return tmills != cmills;
    //                });
    //                reportData = newArray;
    //                l = reportData.length;
    //                i--;
    //            }
    //        }
    //        // re-write array
    //        SendSafeRuntimeMessage({ text: "SAVEDATAA", data: reportData, datein: null }, function (response) {
    //            $("#closeTracker").trigger("click");
    //            setStatus("Task History Erased before " + local_before, "black");
    //        });
    //    }
    //});
}

/**
 * Load synthetic test tracking records into storage for development.
 */
function loadTrackTestData() {
    //chrome.storage.local.remove('trackData', function (data) { });

    let data = { taskId: "", dateofTask: null, taskDesc: "", taskAET: "", extras: "", workTime: 0 };
    let d = new Date();
    let dataArray = [];
    for (let i = 0; i < 30; i++) {
        let baseTask = 7269087651 + (i * 30);
        let taskStr = baseTask.toString();
        let dStart = d.subDays(365 - i);
        let dstr = (dStart.getMonth() + 1) + '/' + dStart.getDate() + '/' + dStart.getFullYear() + ' ' + dStart.toLocaleTimeString();
        dataArray.push({ taskId: taskStr, dateofTask: dstr, taskAET: "4.8", workTime: 240000, extras: "Test Record" });
    }
    SendSafeRuntimeMessage({ text: "SAVEDATAA", data: dataArray, datein: null });
}

let testDates = [
    "11/04/18 1:59:38 AM",
    "11/04/18 1:01:38 AM",
    "11/04/18 2:01:38 AM",
    "11/04/18 3:01:38 AM",
    "9/14/2018 12:57:38 AM",
    "9/14/2018 1:57:38 AM",
    "9/14/2018 2:57:38 AM",
    "9/14/2018 3:57:38 AM",
    "9/14/2018 12:57:38 PM",
    "9/14/2018 1:57:38 PM",
    "9/14/2018 2:57:38 PM",
    "9/14/2018 3:57:38 PM",
    "9/14/2018 10:57:38 PM",
    "9/14/2018 11:57:38 PM",
    "9/15/2018 12:57:38 AM",
    "9/15/2018 1:57:38 AM",
    "9/15/2018 2:57:38 AM",
    "9/15/2018 3:57:38 AM",
    "2/14/2018 12:57:38 AM",
    "2/14/2018 1:57:38 AM",
    "2/14/2018 2:57:38 AM",
    "2/14/2018 3:57:38 AM",
    "2/14/2018 12:57:38 PM",
    "2/14/2018 1:57:38 PM",
    "2/14/2018 2:57:38 PM",
    "2/14/2018 3:57:38 PM",
    "2/14/2018 10:57:38 PM",
    "2/14/2018 11:57:38 PM",
    "2/15/2018 12:57:38 AM",
    "2/15/2018 1:57:38 AM",
    "2/15/2018 2:57:38 AM",
    "2/15/2018 3:57:38 AM",
    "3/11/2018 3:01:38 AM",
    "11/04/18 2:01:38 AM"
];
// TDATE or STRING is output type


//texas - summer is -2, winter is -2
//hawaii - summer is +3, winter is +2
//arizona - summer is same, winter is -1
let testData = [{ taskId: "9979312857", dateofTask: "01/02/17 7:50:04 AM", taskDesc: "", taskAET: "8.0", extras: "day same", workTime: 480000 },
{ taskId: "9979312841", dateofTask: "01/02/17 1:59:00 AM", taskDesc: "", taskAET: "9.0", extras: "tx - day-1", workTime: 540000 }, //tx should be prior
{ taskId: "9979312842", dateofTask: "01/02/17 2:00:00 AM", taskDesc: "", taskAET: "9.0", extras: "tx - daysame", workTime: 540000 }, //tx should be same
{ taskId: "9979312843", dateofTask: "01/02/17 12:59:00 AM", taskDesc: "", taskAET: "9.0", extras: "tx/ar day-1", workTime: 540000 }, // ar - should be prior
{ taskId: "9979312844", dateofTask: "01/02/17 1:00:04 AM", taskDesc: "", taskAET: "9.0", extras: "ar daysame", workTime: 540000 },
{ taskId: "9979312845", dateofTask: "01/02/17 10:00:04 PM", taskDesc: "", taskAET: "9.0", extras: "hw day+1", workTime: 540000 },
{ taskId: "9979312846", dateofTask: "01/02/17 9:59:04 PM", taskDesc: "", taskAET: "9.0", extras: "hw daysame", workTime: 540000 },
{ taskId: "9979312847", dateofTask: "06/02/17 1:59:00 AM", taskDesc: "", taskAET: "9.0", extras: "tx - day-1", workTime: 540000 }, //tx should be prior
{ taskId: "9979312848", dateofTask: "06/02/17 2:00:00 AM", taskDesc: "", taskAET: "9.0", extras: "tx - daysame", workTime: 540000 }, //tx should be same
{ taskId: "9979312849", dateofTask: "06/02/17 12:59:00 AM", taskDesc: "", taskAET: "9.0", extras: "ar same", workTime: 540000 }, // ar - should be prior
{ taskId: "9979312831", dateofTask: "06/02/17 1:00:04 AM", taskDesc: "", taskAET: "9.0", extras: "ar same", workTime: 540000 },
{ taskId: "9979312832", dateofTask: "06/02/17 10:00:04 PM", taskDesc: "", taskAET: "9.0", extras: "hw day+1", workTime: 540000 },
{ taskId: "9979312833", dateofTask: "06/02/17 9:59:04 PM", taskDesc: "", taskAET: "9.0", extras: "hw day+1", workTime: 540000 }
];
//functions to be able to edit entries in the data detail

/**
 * Save edited tracker row data back to chrome.storage.
 *
 * @param {Date} data
 * @param {Date} dateIn
 * @param {Function} optFunc
 */
function saveData(data, dateIn, optFunc) {
    let sendDate;
    if (dateIn == undefined)
        sendDate = null;
    else
        sendDate = dateIn;
    if (optFunc != undefined)
        SendSafeRuntimeMessage({ text: "SAVEDATAA", data: data, datein: sendDate }, optFunc);
    else
        SendSafeRuntimeMessage({ text: "SAVEDATAA", data: data, datein: sendDate });
}

/**
 * Load and return the tracking data array from chrome.storage.
 *
 * @param {Function} func2call
 */
function getData(func2call) {
    let local_func2call = func2call;
    chrome.storage.local.get('trackData', function getCurDataCallBack(data) { //ok
        if (chrome.runtime.lastError) {
        }
        else {
            dataA = null;
            if (data.trackData != null)
                try {
                    dataA = JSON.parse(data.trackData);
                } catch (e) {
                    alert('Your local task tracking data file is corrupted. Until this is fixed, MDE is NOT tracking your time. "Totals All Devices" on detail screen will however have an accurate daily totals. Contact MDE support for additional help.  Error:' + e); // error in the above string (in this case, yes)!
                }

            local_func2call(dataA)
        }
    });
    return;
}

/**
 * Update a task record's date to today.
 *
 * @param {Array} dataArray
 * @param {Object} taskRec
 * @param {Object} tempObj
 */
function updateRec2Day(dataArray, taskRec, tempObj) {
    let start = new Date(tempObj.dateofTask);
    if (start != "Invalid Date" && tempObj.workTime > 0) {
        //workClass = "redwork";
        let cur = taskRec;
        //update total for the day/week
        do {
            cur = $(cur).prev();
        } while ($(cur).prop('class').indexOf('detRec') != -1);
        //found the title rec that I need to update the time on
        let optDate = $(taskRec).find('td#datestr');
        let total = getTotalsToday(dataArray, $(optDate).text(), $('input[name="aetrange"]:checked').val());
        //convert total.work to 
        let workTotal = $(cur).find('input#work');
        $(workTotal).val(total.work);
        //update display value
        let ptd = workTotal[0].parentElement;
        let working = ptd.outerHTML;
        working = working.substring(0, working.length - 13);
        working = working + millisToHoursMinutesAndSeconds(total.work) + '</td>';
        ptd.innerHTML = working;
        let surplus = $(cur).find('td#surplus');
        let diff = (total.raet * 60000) - total.work;
        surplus[0].className = 'greennogrey';
        let ss = millisToMinutesAndSeconds(diff);
        if (diff < 0) {
            surplus[0].className = 'rednogrey';
            ss = "-" + ss;
        }
        $(surplus).text(ss);
        let curAET = $(cur).find('td#curaetstr');
        $(curAET).text(millisToHoursMinutesAndSeconds(total.raet * 60000));
        setTrackMsg("Record Updated - Refresh to update weekly totals", "light red");
    }
}

/**
 * Update a task record field from an edited table cell value.
 *
 * @param {string} taskIdin
 * @param {*} mrkSub
 * @param {number} newTimein
 * @param {Object} mrkRel
 * @param {Object} taskRec
 * @returns {*}
 */
function updatefromtd(taskIdin, mrkSub, newTimein, mrkRel, taskRec) {
    let taskId = taskIdin;
    let newTime = newTimein;
    let newMrkSub = mrkSub;
    let newMrkRel = mrkRel;

    getData(function (dataA) {
        let dataArray = [];
        let start = new Date();
        let workClass = "greenwork";
        if (dataA != null) {
            dataArray = mergeData(dataA);
            let tempObj = dataArray.find(function (element) {
                return element.taskId == taskId;
                //return findTaskInTaskStr(taskId, element.taskId);
            });
            if (tempObj != undefined) {
                if (newMrkSub) {
                    tempObj.taskDesc = getSubmittedConstant();
                    $(taskRec).removeClass("releasedC");
                    $(taskRec).removeClass("incompleteC");
                    //reset AET in display table
                    let aettd = $(taskRec).find('td#taskAET');
                    $(aettd).text(convertAET(tempObj.taskAET, $('input[name="aetrange"]:checked').val()));
                    updateRec2Day(dataArray, taskRec, tempObj);
                    start = new Date(tempObj.dateofTask);
                }
                else if (newMrkRel) {
                    tempObj.taskDesc = getReleasedConstant();
                    $(taskRec).removeClass("releasedC");
                    $(taskRec).removeClass("incompleteC");
                    $(taskRec).addClass("releasedC");
                    let aettd = $(taskRec).find('td#taskAET');
                    $(aettd).text(str);
                    updateRec2Day(dataArray, taskRec, tempObj);
                    start = new Date(tempObj.dateofTask);
                }
                else {
                    //convert newwork to a time
                    tempObj.workTime = newTime;
                    if (tempObj.taskDesc == getReleasedConstant()) {
                        let strWorktime = $(taskRec).find('td#workTime');
                        let ttime = $(strWorktime).text();
                        let strWorktimeAET = $(taskRec).find('td#taskAET');
                        $(strWorktimeAET).text(ttime);
                    }
                    // do I need to change the color?
                    //update surplus on taskRec
                    let aettime = processAETnFloat(tempObj.taskAET, $('input[name="aetrange"]:checked').val());
                    let surplus = $(taskRec).find('td#surplus');
                    let diff = aettime - tempObj.workTime;
                    $(surplus).text(millisToMinutesAndSeconds(diff));
                    updateRec2Day(dataArray, taskRec, tempObj);
                    start = new Date(tempObj.dateofTask);
                }
            }
        }
        else { //why would I be here?
        }
        saveData(dataArray, start);
        //$("#ViewTracker").trigger("click");  //refresh table
        return;
    });
}

/**
 * Delete a task record from the tracking data array and save.
 *
 * @param {Date} dataIn
 * @param {Object} field
 * @param {Date} taskDate
 * @returns {*}
 */
function deleteRec(dataIn, field, taskDate) {
    let local_dataIn = dataIn;
    let local_field = field;
    let local_taskDate = taskDate;

    getData(function (dataA) {
        if (dataA != null) {
            let dday = new Date(local_taskDate);
            let newarray = dataA.filter(function (element) {
                if (local_field == "taskId")
                    //return (findTaskInTaskStr(local_dataIn, element.taskId) == false);
                    return (element.taskId != local_dataIn);
                else
                    return (element.dateofTask != local_dataIn);
            });
            //saveData(newarray, dday, function () {
            //    $("#ViewTracker").trigger("click");
            //});
            saveData(newarray, dday);
            $("#ViewTracker").trigger("click");
        }
    });
    return;
}

//function SetAudioFile(type) {
//    fileSelector = document.createElement('input');
//    let local_type = type;
//    fileSelector.setAttribute('type', 'file');
//    selectDialogueLink = document.createElement('a');
//    selectDialogueLink.setAttribute('href', '');
//    selectDialogueLink.innerText = "Select File";
//    $(fileSelector).change("change", function () {
//        if (fileSelector.files[0].type.indexOf('audio/') !== 0) {
//            alert('not an audio file');
//            return;
//        }
//        if (fileSelector.files.length == 1) {
//            reader = new FileReader();
//            reader.onload = function () {
//                data = reader.result;
//                SendSafeRuntimeMessage({ request: "READSETAUDIO", type: local_type, audioStr: data });
//            };
//            reader.readAsDataURL(fileSelector.files[0]);
//        }
//    });
//    $(fileSelector).trigger("click");
//}

/**
 * Set a test audio file reference for sound-preview testing.
 *
 * @param {string} fileName
 * @returns {*}
 */
function Test_SetAudioFile(fileName) {
    $.ajax({
        url: "https://raterlabs.appen.com/qrp/core/vendors/social_file/1065488/" + fileName,
        method: 'get',
        //async: false,
        crossDomain: true,
        success: function (data, status, xhr) {
            return data;
        }, //end of sucess
        error: function (xhr, status, text) {
            alert("unable to load sound " + xhr.status);
        }
    }); // end of ajax
}

/**
 * Revert an edited time cell back to its original stored value.
 *
 * @param {*} tr
 * @returns {*}
 */
function revertTime(tr) {
    let task = $(tr).find('td.task');
    if (task.length == 1) {
        taskId = $(task[0]).text();
        taskId = taskId.trim();
        getData(function (dataA) {
            if (dataA != null) {
                newarray = dataA.filter(function (element) {
                    return (element.taskId == taskId);
                });
                if (newarray.length == 1) {
                    tempObj = newarray[0];
                    let newWork = millisToMinutesAndSeconds(tempObj.workTime);
                    let workId = $(tr).find('td#workTime');
                    if (workId.length == 1) {
                        $(workId).text(newWork);
                    }
                }
            }
        });
    }
}

/**
 * Remove all inline edit/save buttons from the tracker table.
 */
function removeEditButtons() {
    $('#cancel').remove();
    $('#insert').remove();
    $("#newStatus").remove();

    //    $('#delete').remove();
    //    $('#set2aet').remove();
    //    $("#mrksub").remove();
    //    $("#mrkrel").remove();
}

/**
 * Handle a click on a tracker data cell to open inline editing.
 *
 * @param {Object} ev
 * @returns {*}
 */
function dataclick(ev) {
    // they want to change the data
    // is there a save button anywhere else in the table, delete it first
    //if this isn't a detrec - just return - clicking in this field should expand for title rows.

    removeEditButtons();
    let tStr = $("#status").text();
    if (tStr.indexOf("No Active task") == -1) {
        setTrackMsg("Unable to modify data when there is an active task.", "red");
        removeEditButtons();
        window.getSelection().removeAllRanges();
        return;
    }

    if ($(ev.currentTarget.parentElement).find('.save').length == 0) {
        let appendTo = $(ev.currentTarget);
        $(appendTo).after('<button class="cancel" type="button" id="cancel" title="Cancel - no changes, and remove these buttons">Cancel</button>');
        $(appendTo).after('<button class="save" type="button" id="insert" title="Save change to work time" disabled>Save</button>');

        let selStatement = '<select name="newStatus" id="newStatus">' +
            '<option value="none" selected>Select action... </option>' +
            '<option value="x">Save worktime</option>' +
            '<option value="r">Set to Released</option>' +
            '<option value="s">Set to Submitted</option>' +
            '<option value="a">Set worktime to be AET</option>' +
            '<option value="d">Delete Entry</option>' +
            '</select>';
        $(appendTo).after(selStatement);

        document.getElementById('cancel').scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
        $("select#newStatus").change(function (ev) {
            let statusChange = $("#newStatus option:selected").val();
            if (statusChange != "none") {
                $("#insert").prop("disabled", false);
                $("#insert").css("background-color", "green");
            }
            else {
                $("#insert").prop("disabled", true);
                $("#insert").css("background-color", "white");
            }
        });

        $(".save").click(function (ev) {
            //check to see if thy selected something from the drop down first
            let statusChange = $("#newStatus option:selected").val();
            let pTask = null;
            let task = null;
            let taskId;
            let newTime;
            let newVal;
            let workId;
            if (statusChange == "none") {
            }
            else {
                //process it
                if (statusChange == 'r') {
                    //task = $(ev.currentTarget.parentElement).find('td#realtaskId');
                    pTask = $(ev.currentTarget).closest("tr");
                    task = $(pTask).find('#realtaskId');
                    if (task.length == 1) {
                        taskId = $(task).val();
                        //taskId = taskId.substring(0, 10);
                        removeEditButtons();
                        updatefromtd(taskId, false, 0, true, pTask);
                    }
                } else if (statusChange == 's') {
                    //task = $(ev.currentTarget.parentElement).find('td#realtaskId');
                    pTask = $(ev.currentTarget).closest("tr");
                    task = $(pTask).find('#realtaskId');
                    if (task.length == 1) {
                        taskId = $(task).val();
                        //taskId = taskId.substring(0, 10);
                        removeEditButtons();
                        updatefromtd(taskId, true, 0, false, pTask);
                    }

                } else if (statusChange == 'a') {
                    pTask = $(ev.currentTarget).closest("tr");
                    task = $(pTask).find('#realtaskId');
                    if (task.length == 1) {
                        taskId = $(task).val();
                        workId = $(ev.currentTarget.parentElement).find('td#taskAET');
                        if (workId.length == 1) {
                            newVal = $(workId).text();
                            newTime = convertdisplayAETtomils(newVal, $('input[name="aetrange"]:checked').val());
                            if (newTime == 0) {
                                setTrackMsg("Error while setting to AET", "red");
                            }
                            else {
                                let timeEl = $(ev.currentTarget.parentElement).find('td#workTime');
                                if (timeEl.length == 1) {
                                    timeEl[0].textContent = millisToMinutesAndSeconds(newTime);
                                    timeEl[0].className = "greentdnogrey";
                                }
                                removeEditButtons();
                                updatefromtd(taskId, false, newTime, false, pTask);
                            }
                        }
                    }

                } else if (statusChange == 'd') {
                    //find record by task id or aqtime
                    //delete it from data array and table
                    // rebuild total line
                    pTask = $(ev.currentTarget).closest("tr");
                    task = $(pTask).find('#realtaskId');
                    taskId = $(task).val();
                    let field = "taskId";
                    let aqtime = $(ev.currentTarget.parentElement).find('td#datestr');
                    let taskDate = $(aqtime).text();
                    if (taskId == "") {
                        taskId = taskDate;
                        field = "dateofTask";
                    }
                    //else 
                    //    taskId = taskId.substring(0, 10); 
                    deleteRec(taskId, field, taskDate); //after delete table will be refreshed 
                }
                else if (statusChange == 'x') {
                    pTask = $(ev.currentTarget).closest("tr");
                    task = $(pTask).find('#realtaskId');
                    if (task.length == 1) {
                        taskId = $(task).val();
                        workId = $(ev.currentTarget.parentElement).find('td#workTime');
                        if (workId.length == 1) {
                            newVal = $(workId).text();
                            newTime = MMSStimeStrToMills(newVal);
                            if (newTime == 0) {
                                setTrackMsg("Error in data entry. Time format is MM:SS", "red");
                            }
                            else {
                                removeEditButtons();
                                updatefromtd(taskId, false, newTime, false, pTask);
                            }
                        }
                    }
                }
            }
            removeEditButtons();
        });



        $("#cancel").click(function (ev) {
            revertTime(ev.currentTarget.parentElement);
            removeEditButtons();
        });


    }
}

/**
 * Load the spell-correction list from storage into the popup.
 *
 * @param {*} argsIn
 * @param {Function} func2CallIn
 */
function s_readSpell(argsIn, func2CallIn) {
    let args = argsIn;
    let func2Call = func2CallIn;
    chrome.storage.local.get('MDESPcustom', function getCurDataCallBack(data) { //ok
        if (chrome.runtime.lastError) {
            setMsg("No AC Table to display", "red");
        }
        else {
            let datacustom = null;
            if (data.MDESPcustom != null)
                datacustom = JSON.parse(data.MDESPcustom);
            else {
                datacustom = [{ old: "reslut", new: "result" }]; //default table
                s_saveSpell(datacustom, true);
            }

            if (func2Call != null)
                func2Call(args, datacustom);
            //}
            //else
            //    setMsg("No AC Table to display", "red");
        }
    });
}

/**
 * Save the current spell-correction list from the popup to storage.
 *
 * @param {Date} dataIn
 * @param {Object} saveData
 */
function s_saveSpell(dataIn, saveData) {
    let data = dataIn;
    if (saveData) {
        chrome.storage.local.set({ 'MDESPcustom': JSON.stringify(data) }, function () {
            if (chrome.runtime.lastError) {
            }
            //tell background to update spell
            SendSafeRuntimeMessage({ text: "UPDATESPELL", data: data });
        });
    }
}

/**
 * Parse and import a spell-correction file from disk.
 *
 * @param {Date} data
 */
function processSPFile(data) { // use for restore track data from backup
    let thisObj = { old: "", new: "" };
    let lspells = new Array();
    let nlchar = "\n".charCodeAt(0);
    let tabchar = "\t".charCodeAt(0);
    let tab = String.fromCharCode(tabchar);
    let nl = String.fromCharCode(nlchar);
    let lines = data.split(nl);
    lines.forEach(function (thisLine) {
        if (thisLine.length > 0) {
            let thisRec = thisLine.split(tab);
            if (thisRec.length != 2) {
                return;
            }
            lspells.push({ old: thisRec[0], new: thisRec[1] });
        }
    });

    SendSafeRuntimeMessage({ request: "MERGESPELL", data: lspells }, function (response) {
        setStatus(response, "black");
    });
}

/**
 * Handle a click on a tracker list row for selection and editing.
 *
 * @param {Object} ev
 */
function popup_liClick(ev) {
    if (ev.target.parentElement.className == "greenRow")
        ev.target.parentElement.className = "normalRow";
    else {
        ev.target.parentElement.className = "greenRow";
        $("#pacTableD").addClass("changed");
    }
    //if no rows selected - delete button is white
    let rowsRemove = $("#wordtable").find(".greenRow");
    if (rowsRemove.length == 0)
        $("#pacTableD").removeClass("changed");
}

/**
 * Build and render the consolidated (multi-device) tracker view.
 *
 * @param {Date} dataA
 * @param {Array} periodArray
 */
function buildConsolidated(dataA, periodArray) {
    let lastRec;
    let train;
    let totalCRec = { date: "", aetMils: 0, workMils: 0, deviceCount: 0 };
    let overallT = 0;
    let rwork = 0;
    let rtotaet = 0;
    //work by week
    let week1Totalw = 0;
    let week2Totalw = 0;
    let week1Totalra = 0;
    let week2Totalra = 0;
    let international = $("#iInvoice").is(":checked");

    setStatus("");

    let table = $('#trackerTable');
    //erase all the records in the body
    $('#trackerTable > tbody').children().remove();
    $('#trackerTable > thead').children().remove();
    $('#closeTotalsBut').remove();
    $("#closeInvoice").remove();
    $("#trackertablediv").prepend('<button class="Submit" type="button" id="closeTotalsBut"><img src="close.png" width="12" height="12" /></button>');
    table.find('thead').append('<tr><th>Date</th><th>Device Count</th><th  title="For released tasks, AET is set to work time">AET(*)</th><th>Hours Worked</th><th>Surplus</th><th title="(AET/Time worked)*100)" id="detdesc">Productivity %</th></tr>');


    //add handler for close button and position it on the right
    $("#closeTotalsBut").click(function (ev) {
        $("#closeTotalsBut").remove();
        $("#normalTableHeader").show();
        $("#consolidatedTableHeader").hide();
        $("#totals").show();
        $("#ViewTracker").trigger("click");  //refresh table
        $("#when").unbind('change');
        $("#wheni").unbind('change');

    });

    if (international) {
        let index = parseInt($("#wheni").val());
        if (isNaN(index))
            index = 0;
        let period = periodArray[index];
    }
    else {
        index = parseInt($("#when").val());
        if (isNaN(index))
            index = 0;
        period = periodArray[index];
    }
    //sort it by date
    /*let reportData = localSort(dataA, "date", "none");*/
    reportData = reverseSort(dataA, "date", "none");
    //write detail if there is more than one and include a total rec if there is more than one)
    reportData.forEach(function (rec) {
        if (totalCRec.date == "") { //this is the first record
            totalCRec.date = rec.date;
            totalCRec.aetMils = rec.raetMils;
            totalCRec.workMils = rec.workMils;
            totalCRec.deviceCount = 1;
        }
        else if (rec.date == totalCRec.date) {
            //add this record to day totals
            totalCRec.aetMils += rec.raetMils;
            totalCRec.workMils += rec.workMils;
            totalCRec.deviceCount++;
        }
        else {
            let cDate = new Date(totalCRec.date);
            if (cDate >= period.startDate && cDate <= period.endDate) {
                let current = false;
                if (cDate >= period.startDate) {
                    current = true;
                }
                if (totalCRec.workMils > 0) {
                    //we have a new date to look at - so write rec for the one we were working with
                    let trt = buildTotalCLine(totalCRec.aetMils, totalCRec.workMils, totalCRec.deviceCount, totalCRec.date, current);
                    table.find('tbody').append(trt);
                    overallT += totalCRec.workMils;
                }
                if (cDate < period.start2week) {
                    week1Totalw += totalCRec.workMils;
                    week1Totalra += totalCRec.aetMils;
                }
                else {
                    week2Totalw += totalCRec.workMils;
                    week2Totalra += totalCRec.aetMils;
                }
            }
            //add this data to totalCRec
            totalCRec.date = rec.date;
            totalCRec.aetMils = rec.raetMils;
            totalCRec.workMils = rec.workMils;
            totalCRec.deviceCount = 1;
        }
        lastRec = rec;
    });
    //process that last date we were working with
    if (totalCRec.date != "") {
        let cDate = new Date(totalCRec.date);
        if (cDate >= period.startDate && cDate <= period.endDate) {
            current = false;
            if (cDate >= period.startDate) {
                current = true;
            }
            if (totalCRec.workMils > 0) {
                //we have a new date to look at - so write rec for the one we were working with
                let trt = buildTotalCLine(totalCRec.aetMils, totalCRec.workMils, totalCRec.deviceCount, totalCRec.date, current);
                table.find('tbody').append(trt);
                overallT += totalCRec.workMils;
            }
            if (cDate < period.start2week) {
                week1Totalw += totalCRec.workMils;
                week1Totalra += totalCRec.aetMils;
            }
            else {
                week2Totalw += totalCRec.workMils;
                week1Totalra += totalCRec.aetMils;
            }
        }
    }
    //go thru trs and if there is more than one record, change color to purple and add click handler for that row
    //let trs = $(".tableClass").find("tbody tr");
    let trs = $(table).find("tbody tr");
    $(trs).each(function (tr) {
        // is there more than one - 
        let count = parseInt(this.children[1].textContent);
        // if (count > 1) { do it for all
        //this.children[0].style.color = "purple";
        this.children[0].style.cursor = "pointer";
        $(this.children[0]).on('click', function (el) {
            processConslidateDetail(el);
        });
        // }
    });

    //totals the totals for invoice
    // Declared at outer scope so week1, week2, and period-total rows all share them
    let calc = 0;
    let diff = 0;
    let diffStr = "0:0:00";
    let diffClass = 'greentd';

    if (week1Totalw > 0) {
        let week1end = new Date(period.start2week.subDays(1));
        if (week1Totalra > 0) {
            calc = ((week1Totalra * 60000) / week1Totalw) * 100;
            diff = (week1Totalra * 60000) - week1Totalw;
            diffStr = millisToHoursMinutesAndSeconds(diff);
            diffClass = 'greentd';
            if (diff < 0) {
                if (diffStr != "0:0:00") {
                    diffClass = 'redtdd';
                    diffStr = "-" + diffStr;
                }
            }
        }

        table.find('tbody').append('<tr><td class="totaltd">Week ending ' + date2mmddyy(week1end) + '</td><td class="totaltd"></td>' +
            '<td class="totaltd">' + millisToHoursMinutesAndSeconds(week1Totalra * 60000) + '</td>' +
            '<td class="totaltd">' + millisToHoursMinutesAndSeconds(week1Totalw) + '</td>' +
            '<td class="' + diffClass + '">Diff is ' + diffStr + '</td><td class="bluecalc">' + calc.toFixed(2) + ' % </td></tr>');
    }

    if (week2Totalw > 0) {
        if (week2Totalra > 0)
            calc = ((week2Totalra * 60000) / week2Totalw) * 100;
        train = ""
        table.find('tbody').append('<tr><td class="totaltd">Week ending ' + date2mmddyy(period.endDate) + '</td><td class="totaltd"></td>' +
            '<td class="totaltd">' + millisToHoursMinutesAndSeconds(week2Totalra * 60000) + '</td>' +
            '<td class="totaltd">' + millisToHoursMinutesAndSeconds(week2Totalw) + '</td>' +
            '<td class="totaltd">' + train + '</td><td class="bluecalc">' + calc.toFixed(2) + ' % </td></tr>');
    }

    let periodDateStr = date2mmddyy(period.endDate);
    rwork = week1Totalw + week2Totalw;
    rtotaet = week1Totalra + week2Totalra;

    diff = (rtotaet * 60000) - rwork;
    diffStr = millisToHoursMinutesAndSeconds(diff);

    diffClass = 'greentd';
    if (diff < 0) {
        if (diffStr != "0:0:00") {
            diffClass = 'redtdd';
            diffStr = "-" + diffStr;
        }
    }

    table.find('tbody').append('<tr><td class="totaltd">Total for the period</td><td class="totaltd"></td>' +
        '<td class="totaltd">' + millisToHoursMinutesAndSeconds(rtotaet * 60000) + '</td>' +
        '<td class="totaltd">' + millisToHoursMinutesAndSeconds(rwork) + '<input id="worktot" name="worktot" type="hidden" value="' + rwork.toString() + '">' +
        '<input id="endDate" name="endDate" type="hidden" value="' + periodDateStr + '">' +
        '</td> <td class="' + diffClass + '">' +
        "Diff is " + diffStr + '</td><tr>');
    // make sure we added at least one det rec - if not remove table and show status message here
    if (overallT > 0)
        $(".tablearea").append(table);
    else
        return false;

    //$('.tableClass').height(600);
    //$('.tableClass').width(600);
    //show fill invoice section
    $("#invoiceC").show();
    $("#totals").hide();
    $("#ctasks").hide();
    $("#alignthis").hide();
    $("#normalTableHeader").hide();
    $("#consolidatedTableHeader").show();
    document.getElementById('fillinvoiceC').scrollIntoView(); // force whole invoice paragraph into view

    return true;
}

/**
 * Expand detail rows within the consolidated tracker view.
 *
 * @param {Object} el
 */
function processConslidateDetail(el) {
    let curRow = el.target.parentElement; // set to current tr
    let tStr = $(curRow).find('input#date').val();
    let curDate = new Date(tStr);
    let thisDate = tStr;

    //if we already have detRecs in the table - we are just closing this series of details
    let dets = $(".detRec");
    if (dets.length > 0) {
        let oldDate = new Date(dets[0].children[0].textContent);
        if (justDateEqual(oldDate, curDate)) {
            $(".detRec").remove();
            return;
        }
        else
            $(".detRec").remove();
    }


    getCData(function (dataA) {
        if (dataA != null && dataA.recs != null && dataA.recs.length > 0) {
            dataA.recs.forEach(function (rec) {
                if (rec.date == thisDate) {
                    let aettime = (parseFloat(rec.raetMils)) * 60000;
                    let displayAET = millisToHoursMinutesAndSeconds(aettime);
                    let tempWork = millisToHoursMinutesAndSeconds(rec.workMils);
                    let surplus = millisToMinutesAndSeconds(rec.workMils - aettime);
                    let thisComputer = platform2thisComputer(rec.platform);
                    let workClass = "greentdnogrey";
                    if (rec.workMils > (aettime + 1000)) { // 1 sec tolerance
                        workClass = "redtdnogrey";
                        surplus = '(' + surplus + ')';
                    }
                    let rowClass = "detRec";
                    let platformNumDet = '<input id="platformNum" name="platformNum" type="hidden" value="' + thisComputer.number + '">';
                    let platformDescDet = '<input id="platformDesc" name="platformDesc" type="hidden" value="' + thisComputer.desc + '">';
                    //only if this is my computer, can I edit this.. todo - add handler/save button 

                    //if (detMatchComputer(thisComputer,true) )
                    //    platformDesc = '</td><td input type="text" id="computerDesc" class="' + workClass + '"><div contenteditable>';
                    let newStr = '<tr class="' + rowClass + '"><td>' + platformNumDet + rec.date +
                        platformDesc + thisComputer.desc + '</td><td>' + platformDescDet + displayAET +
                        '</td><td>' + tempWork +
                        '</td><td id="surplus" class="' + workClass + '">' + surplus +
                        '</td></tr>';
                    $(curRow).after(newStr);
                }
            });
            //$("#computerDesc").on('click', dataclick);
        }
    });
}

/**
 * Return the platform identifier string for the current device.
 *
 * @param {string} inStr
 * @returns {*}
 */
function platform2thisComputer(inStr) {
    let thisComputer = { number: 0, desc: "" };
    let pieces = inStr.split(" "); //format will always be num space desc
    thisComputer.number = parseInt(pieces[0]);
    //strip num from string, remove trailing blank
    let str2Strip = pieces[0] + ' ';
    thisComputer.desc = inStr.substring(str2Strip.length);
    return thisComputer;
}

/**
 * Truncate a computer name string to a compact display form.
 *
 * @param {string} inStr
 * @returns {*}
 */
function makeComputerNameShort(inStr) {
    if (inStr != null)
        return inStr.substring(0, 10);
    else
        return inStr;
}

/**
 * Return true if a detail record belongs to the current computer.
 *
 * @param {boolean} thisComputer
 * @param {*} short
 */
function detMatchComputer(thisComputer, short) {
    let locDesc = s_myComputer.desc;
    if (short)
        locDesc = makeComputerNameShort(s_myComputer.desc);
    if (s_myComputer.number == thisComputer.number && locDesc == thisComputer.desc)
        return true;
    else
        return false;
}

/**
 * Handle a device-name change submitted from the settings form.
 *
 * @param {string} strddesc
 */
function processNameChange(strddesc) {
    s_myComputer.desc = strddesc;
    //loop thru data and change det recs
    getCData(function (dataA) {
        if (dataA != null && dataA.recs != null && dataA.recs.length > 0) {
            dataA.recs.forEach(function (rec) {
                let thisComputer = platform2thisComputer(rec.platform);
                if (thisComputer.number == s_myComputer.number)
                    rec.platform = s_myComputer.number + " " + strddesc;
            });
            S_SaveCData(dataA);
        }
        $(".detRec").remove();
    });
}

/**
 * Build the HTML for a consolidated total row in the tracker.
 *
 * @param {Object} totalAET
 * @param {number} totalTime
 * @param {number} totalTaskCount
 * @param {string} d
 * @param {Object} current
 * @returns {*}
 */
function buildTotalCLine(totalAET, totalTime, totalTaskCount, d, current) {

    // add a total line
    // make minutes out of 
    // convert totalAET to milliseconds and then compare it to totalTime
    let rowClass = "";
    //let tLocal = totalAET.toFixed(1);
    let diff = (totalAET * 60000) - totalTime;
    let diffStr = millisToHoursMinutesAndSeconds(diff);
    let workClass = (current == true ? "greentd" : "dateWork");


    let diffClass = 'greentd';
    if (diff < 0) {
        if (diffStr != "0:0:00") {
            diffClass = 'redtdd';
            diffStr = "-" + diffStr;
        }
    }

    // <td><input id="prodId" name="prodId" type="hidden" value="xm234jq">
    let calc = 0;
    if (totalAET > 0)
        calc = ((totalAET * 60000) / totalTime) * 100;

    let aetStr = millisToHoursMinutesAndSeconds(totalAET * 60000);
    let indateStr = '<input id="date" name="date" type="hidden" value="' + d + '">';
    let inaetStr = '<input id="aet" name="aet" type="hidden" value="' + (totalAET * 60000) + '">';
    let indiffStr = '<input id="diff" name="diff" type="hidden" value="' + diff + '">';
    let inworkStr = '<input id="work" name="work" type="hidden" value="' + totalTime + '">';

    //date taskcount aet work surplus blank
    //if week is not this week, make it another color

    let trs = '<tr title="Click on a row to view detail. Click again to collapse detail." class="blueTitle">' +
        '<td class="' + workClass + '" id="sdate" >' + indateStr + "Total for " + d + '(' + dayofwktoStr(d) + ')</td>' +
        '<td class="det-time-col"></td>' +
        '<td class="greentd">' + totalTaskCount + '</td>' +
        '<td class="greentd">' + inaetStr + aetStr + '</td>' +
        '<td class="greentd">' + inworkStr + millisToHoursMinutesAndSeconds(totalTime) + '</td>' +
        '<td class="' + diffClass + '">' + indiffStr + "Diff is " + diffStr + '</td>' +
        '<td>' + calc.toFixed(2) + ' % </td>' +
        '</tr>';
    return trs;
}

/**
 * Generate invoice data from the current tracker table contents.
 *
 * @param {Date} updateallowed
 * @param {boolean} international
 * @returns {Array}
 */
function invoiceFromTable(updateallowed, international) {
    let rows = [];
    $('#trackerTable > tbody  > tr.blueTitle').each(function () {  //total lines have a different class
        let wStr = parseInt($(this).find('[name="work"]').val());
        let tstr = $(this).find('[id="date"]').text();
        // is it a hidden value instead (consolidated totals) 
        if (tstr.length == 0) {
            tstr = $(this).find('[id="date"]').val();
            //wStr = parseInt($(this).find('[name="work"]').value());
            // need to get date and hours.
        }
        if (tstr != null && tstr != "") {
            rows.push({ date: tstr, hours: wStr });
            //set return message here
        }
    });
    if (rows.length > 0) {
        //reverse order of rows
        rows.sort(function compare(a, b) {
            let dateA = new Date(a.date);
            let dateB = new Date(b.date);
            return dateB - dateA;
        });
        let periodStr = $("#when option:selected").text();
        if (international)
            periodStr = $("#wheni option:selected").text();
        SendSafeRuntimeMessage({ text: "INVOICE", period: periodStr, count: rows.length, rows: rows, updateA: updateallowed, international: international });
    }
}

/**
 * Save the consolidated tracking data object to chrome.storage.
 *
 * @param {Date} data
 */
function S_SaveCData(data) {
    saveCData(data);
}
/**
 * Trigger a full data backup download to the user's filesystem.
 *
 * @param {Object} restore
 * @param {Object} headers
 */
function runBackup(restore, headers) {
    if (restore) {
        let alertStr = "You have requested that your task data be restored from a file backup. Any task data stored currently by the tracker will be overwritten. If this is what you want to do, press OK and you will be given a file dialog where you will select the backup file to restore from. If you got here by accident, press cancel. Proceed wisely! "
        if (confirm(alertStr)) {
            SendSafeRuntimeMessage({ request: "GETACTIVET" }, function (response) {
                if (response != "") {
                    setStatus("Active Task: ", response.taskId);
                    setTrackMsg("Unable to restore data when there is an active task.", "red");
                    return;
                }

                let fileSelector = document.createElement('input');
                fileSelector.setAttribute('type', 'file');
                let selectDialogueLink = document.createElement('a');
                selectDialogueLink.setAttribute('href', '');
                selectDialogueLink.innerText = "Select File";
                $(fileSelector).change("change", function () {
                    if (fileSelector.files.length == 1) {
                        let reader = new FileReader();
                        reader.onload = function (data) {
                            data = reader.result;
                            processFile(reader.result);
                        };
                        reader.readAsText(fileSelector.files[0]);
                    }
                });
                $(fileSelector).trigger("click");
            });
        }
    }
    else {
        chrome.storage.local.getBytesInUse('trackData', function (bytesInUse) {
            if (bytesInUse == 0) {
                $("#msgTextpop").css("color", "red");
                $("#msgTextpop").text("No tracker info to backup");
            }
            else {
                chrome.storage.local.get('trackData', function (data) { //ok
                    if (chrome.runtime.lastError) {
                        $("#msgTextpop").css("color", "red");
                        $("#msgTextpop").text("No data to back up " + chrome.runtime.lastError.message);
                    }
                    else {
                        let dataArray = [];
                        try {
                            dataArray = JSON.parse(data.trackData);
                        } catch (e) {
                            $("#msgTextpop").css("color", "red");
                            $("#msgTextpop").text('Your local task tracking data file is corrupted. Until this is fixed, MDE is NOT tracking your time. "Totals All Devices" on detail screen will however have an accurate daily totals. Contact MDE support for additional help.  Error:' + e, sender.tab.id);
                        }
                        let opt = "data";
                        if (headers == true)
                            opt = "report";
                        if (dataArray.length > 0) {
                            let aetrange = $('input[name="aetrange"]:checked').val();
                            backupTrack(dataArray, opt, aetrange);
                        }
                    }
                });
            }
        });
    }
}

/**
 * Apply text-alert option settings to the UI controls.
 *
 * @param {Object} ev
 */
function setTextOptions(ev) {

    if ($(ev.target).attr('type') == "checkbox") {
        //enhancements[indexMsgOpts][indexData] is a MSGOBJ
        enhancements[indexMsgOpts][indexData].options.uo = $("#rhalertuo").is(":checked");
        enhancements[indexMsgOpts][indexData].options.hm = $("#rhalerthm").is(":checked");
        enhancements[indexMsgOpts][indexData].options.ac = $("#rhalertac").is(":checked");
        enhancements[indexMsgOpts][indexData].options.hr = $("#rhalerthr").is(":checked");
        enhancements[indexMsgOpts][indexData].options.pr = $("#rhalertpr").is(":checked");
        enhancements[indexMsgOpts][indexData].options.hrs = $("#rhalerthrs").is(":checked");
        enhancements[indexMsgOpts][indexData].options.sapr = $("#rhalertsapr").is(":checked");
        enhancements[indexMsgOpts][indexData].options.nrtstart = $("#rhalertnrtstart").is(":checked");
        enhancements[indexMsgOpts][indexData].options.nrtstop = $("#rhalertnrtstop").is(":checked");
    }
    else {
        enhancements[indexMsgOpts][indexData].name = $("#username").val();
        //validate number
        let numError = false;
        let tempNum = $("#usernumber").val();
        tempNum = tempNum.replace(/-/g, "");
        tempNum = tempNum.replace(/ /g, "");
        if (tempNum.length == 10) {
            //check for numeric\
            for (let t = 0; t < tempNum.length; t++) {
                let tNum = parseInt(tempNum[t]);
                if (isNaN(tNum)) {
                    numError = true;
                    break;
                }
            }
        }
        else
            numError = true;
        if (numError)
            setError("#usernumber", "Phone Number must be 10 digits. No spaces, no alpha - just numbers");
        else {
            $("#usernumber").css('background-color', 'white');
            $("#txtmsgerrors").text("");
            $("#txtmsgerrors").hide();
            enhancements[indexMsgOpts][indexData].number = tempNum;
        }
    }
    enhancements[indexMsgOpts][indexData].chatTextAlerts = $("#chatTextAlerts").val();
    enhancements[indexMsgOpts][indexData].chatTextLimit = $("#chatTextLimit").val();
    enhancements[indexMsgOpts][indexData].chatRedAlert = $("#chatRedAlert").is(":checked");

    enhancements[indexMsgOpts][indexData].options.textafter = $("#textafter").val();
    enhancements[indexMsgOpts][indexData].carrier = $("#carrier").val();
    enhancements[indexMsgOpts][indexData].snoozestart = $("#rhalertsnoozestart").val();
    if (enhancements[indexMsgOpts][indexData].snoozestart.length == 0)
        enhancements[indexMsgOpts][indexData].snoozestart = "none";
    enhancements[indexMsgOpts][indexData].snoozestop = $("#rhalertsnoozestop").val();
    if (enhancements[indexMsgOpts][indexData].snoozestop.length == 0)
        enhancements[indexMsgOpts][indexData].snoozestop = "none";

    //send updated enhancements
    SendSafeRuntimeMessage({ text: "RHALERTCONTROLSAVE", msgObj: enhancements[indexMsgOpts][indexData], chatTextAlerts: enhancements[indexMsgOpts][indexData].chatTextAlerts });
}

/**
 * Apply all stored options to the popup settings UI.
 *
 * @param {string} msg2display
 */
function setOptions(msg2display) {
    // State has changed to checked/unchecked.
    let local_msg2display = (msg2display == undefined) ? null : msg2display;
    let testPhrase = $("#chatname").val();
    testPhrase = testPhrase.trim();
    if (testPhrase == "21200") {
        openTestArea();
        return;
    }

    for (let i = 0; i < enhancements.length; i++) {
        // chat is handled differently
        if (enhancements[i][0] == "SOCIALO") {
            enhancements[i][indexState] = $("#imageh").is(":checked");
            continue;
        }
        if (enhancements[i][0] == "RHRELOAD") {
            enhancements[i][indexData].opts = $("#RHRELOADA").is(":checked");
            //enhancements[i][indexData].text = $("#RHRELOADT").is(":checked");
            if ($("#RHRELOAD").is(":checked")) {
                $("#ViewLog").show();
                $(".rhAClass").show();
                $(".rhrefreshDisplay").show();
                if ($("#rhrefreshsecs").val() == "") {
                    $("#rhrefreshsecs").val("120");
                }
                enhancements[i][indexData].refreshsecs = $("#rhrefreshsecs").val();
            }
            else {
                $("#ViewLog").hide();
                $(".rhAClass").hide();
                $(".rhrefreshDisplay").hide();
            }
        }

        if (enhancements[i][0] == "CHATM") {
            chatcriteria.image = $("#imageh").is(":checked");
            //chatcriteria.colorp = $("#colorp").is(":checked"); //niy
            chatcriteria.phraseTable = $("#phrases").is(":checked"); //table of prhases checked
            chatcriteria.names = $("#chatname").val(); //filter for posters in chat ti alert on
            chatcriteria.phrases = $("#phrase").val();//filter for phrases in chat ti alert on
            chatcriteria.names = chatcriteria.names.trim();
            chatcriteria.phrases = chatcriteria.phrases.trim();
            chatcriteria.reda = $("#reda").is(":checked"); //filter for red posting in chat
            chatcriteria.phsent = $("#phsent").is(":checked"); //insert prhases at the sentence level
            chatcriteria.autocorrect = $("#spell").is(":checked"); //auto correct enabled
            if (chatcriteria.autocorrect)
                $("#actable").show();
            else
                $("#actable").hide();

            enhancements[i][indexData] = chatcriteria;

            if (chatcriteria.phrases != "" ||
                chatcriteria.names != "" ||
                chatcriteria.reda == true ||
                chatcriteria.phraseTable == true ||
                chatcriteria.autocorrect == true ||
                chatcriteria.image == true) {
                enhancements[i][indexState] = true;
            }
            else {
                if ((enhancements[indexMsgOpts][indexData] != null &&
                    enhancements[indexMsgOpts][indexData].chatTextAlerts != null &&
                    enhancements[indexMsgOpts][indexData].chatTextAlerts.length > 0) ||
                    enhancements[indexMsgOpts][indexData].chatRedAlert) {
                    enhancements[i][indexState] = true;
                }
                else
                    enhancements[i][indexState] = false;
            }

        }

        else if (enhancements[i][0] != "MSGOPTS") {
            let uStr = "#" + enhancements[i][0];
            if ($(uStr).is(":checked"))
                enhancements[i][indexState] = true;
            else
                enhancements[i][indexState] = false;

            //if (enhancements[i][0] == "IDLEC") {

            //    if (enhancements[i][indexState] == true)
            //        enhancements[i][indexData] = $("#idlet").val();
            //    else
            //        enhancements[i][indexData] = null;
            //}
            if (enhancements[i][0] == "TRACKER") {
                if (enhancements[i][indexState] == true)
                    $('#ViewTracker').show();
                else
                    $('#ViewTracker').hide();
            }
        }
    }
    document.activeElement.blur();
    //call wakeup? 
    SendSafeRuntimeMessage({ text: "POPUPOPTSCHANGED", enhancements: enhancements }, function (response) {
        //enhancements = response;
        if (local_msg2display == null)
            setMsg("Options saved", "black");
        else
            setMsg(local_msg2display, "red");
    });
}
//$("#saveCName").prop("disabled", false);

/**
 * Initialize popup data by loading all required storage keys.
 *
 * @param {Object} state
 */
function datasetup(state) { //on == false, off == true
    let setTo = true; //disable by default
    if (state == "on")
        setTo = false;
    //$("#rptheaders").prop("disabled", setTo);
    //$("#backupTracker").prop("disabled", setTo);
    $("#totals").prop("disabled", setTo);
    $("#when").prop("disabled", setTo);
    $("#consolidated").prop("disabled", setTo);
    $("#rebuildConsolidated").prop("disabled", setTo);
    $("#clearTrack").prop("disabled", setTo);
    $("#before").prop("disabled", setTo);
}

/**
 * Load and apply the phrase list to the popup phrases editor.
 *
 * @param {Date} data
 */
function s_setPhrases(data) {
    //send updated phrases to background
    SendSafeRuntimeMessage({ request: "SAVEPHRASEARRAY", data: data });
}

/**
 * Export all extension data (tracking, phrases, spell) as a backup file.
 *
 * @param {Object} tempObj
 */
function extractAll(tempObj) {
    // I should have access to most of this data w/o having to read it
    // enhancements
    let bigLine = "MDELocData";
    let nl = "\n";
    bigLine += nl;
    bigLine += JSON.stringify(tempObj.enhancements);
    bigLine += nl;
    //MDESPCustom - autocorrect
    bigLine += "MDESPcustom";
    bigLine += nl;
    if (tempObj.spellArray.length == 0)
        bigLine += "NONE";
    else
        bigLine += JSON.stringify(tempObj.spellArray);
    bigLine += nl;
    //MDEPHCustom - phrases
    bigLine += "MDEPHcustom";
    bigLine += nl;
    let phraseArray = tempObj.phraseArray;
    if (phraseArray.length == 0)
        bigLine += "NONE";
    else
        bigLine += JSON.stringify(phraseArray);
    bigLine += nl;
    //trackdata header
    bigLine += "trackData";
    bigLine += nl;
    //set up to write the file
    let d = new Date();
    let fileName = "MDEBACKUPEVERYTHING" + (d.getMonth() + 1) + d.getDate() + d.getFullYear() + ".txt";
    //trackdata 
    chrome.storage.local.getBytesInUse('trackData', function (bytesInUse) { //ok
        if (bytesInUse == 0) {
            // we are done
            bigLine += "NONE";
            writeLine(bigLine, fileName);
        }
        else {
            chrome.storage.local.get('trackData', function (data) {
                if (chrome.runtime.lastError) {
                    writeLine(bigLine, fileName); // have to write this file regardless
                }
                else {
                    bigLine += data.trackData;
                    writeLine(bigLine, fileName);
                }
            });
        }
    });
}

/**
 * Set an informational message in the popup status area.
 *
 * @param {string} msg
 */
function setMessage(msg) {
    $("#msgTextpop").css("color", "black");
    $("#msgTextpop").text(msg);
}

/**
 * Export the current phrase list as a downloadable file.
 */
function extractPhrases() {
    let retStr = "No data found to extract";
    chrome.storage.local.get('MDEPHcustom', function (data) { //ok
        if (chrome.runtime.lastError)
            retStr = "Error getting custom phrases" + chrome.runtime.lastError.message;
        let datacustom = null;
        if (data.MDEPHcustom) {
            datacustom = JSON.parse(data.MDEPHcustom);
            //strip array of object name
            let array2write = new Array();
            for (let i = 0; i < datacustom.length; i++) {
                array2write.push(datacustom[i].Phrase);
            }
            //write data to file
            let fileName = writeArray(array2write, "MDEPH");
            if (fileName == null)
                retStr = "No records to write from phrase table extract";
            else
                retStr = "MDE created " + fileName + " in your downloads folder.";
        }
        setMessage(retStr);
    });
}

/**
 * Export the spell-correction list as a downloadable file.
 */
function extractSpell() {
    let retStr = "No data found to extract";
    chrome.storage.local.get('MDESPcustom', function (data) { //ok
        if (chrome.runtime.lastError)
            retStr = "Error getting custom autocorrect" + chrome.runtime.lastError.message;
        let datacustom = null;
        if (data.MDESPcustom) {
            datacustom = JSON.parse(data.MDESPcustom);
            //strip array of object name
            let array2write = new Array();
            for (let i = 0; i < datacustom.length; i++) {
                array2write.push(datacustom[i].old + '\t' + datacustom[i].new);
            }
            //write data to file
            let fileName = writeArray(array2write, "MDESP");
            if (fileName == null)
                retStr = "No records to write from spell table extract";
            else
                retStr = "MDE created " + fileName + " in your downloads folder.";
        }
        setMessage(retStr);
    });
}

// rest of the file should be related only to the test commands

let localStorageNames = [
    { code: "21256", name: "MDELocData" },
    { code: "21259", name: "MDEPHcustom" },
    { code: "21260", name: "trackData" },
    { code: "21261", name: "MDESPcustom" },
    { code: "21262", name: "MDENRTLOG" },
    { code: "21263", name: "MDELocDataS" }

];

let commandNames = [
    { name: "OPENQ", func: testQuery },
    { name: "LOGT", func: addupdTask }, //add new task record
    { name: "newonunload", func: addupdTask }, //send unload msg - finish task record
    { name: "modifyRec", func: modifyRec },
    { name: "TOGGLELOG", func: togglelog }, // turn log on/off
    { name: "TESTCLEANUP", func: testcleanup },
    { name: "TOGGLEMONITOR", func: togglemonitor },// turn monitor on/off
    { name: "PLAYSND", func: playsound },// turn monitor on/off
    { name: "LOADSND", func: loadsound },// turn monitor on/off
    { name: "TOGGLERHTEST", func: toggleRHTest },// turn RH test on/off
    { name: "SENDTEXTMSG", func: sendTextTest }, //send a text message
    { name: "SENDNOTIFICATION", func: sendNotifyTest },// send a notification
    { name: "BROWSEDATA", func: browseData },      // browse & edit all records
    { name: "GENDATA", func: genTestData },         // generate configurable test dataset
    { name: "CLEARDATA", func: clearTrackData }    // wipe all tracker records
];

//if command is for a task record, need a new area to enter the dataobj to send  
let testArea =
    '<div id="testArea">' +
    '<p id="testmsgarea">Select a command or Storage area to delete</p>' +
    '<select name="testCommand" id="testCommand" class="testCommand"></select>' +
    '<button type="button" id="testSend" class="rightAlign">SendMessage</button>' +
    '<div id="parmArea" hidden></div>' +
    '<p>' +
    '<select name="testLSName" id="testLSName"></select>' +
    '</p>' +
    '<button type = "button" id = "testDel" > Delete LS</button >' +
    '<p>' +
    '<button type="button" id="testClose">Close</button>' +
    '</p>' +
    '</div > ';

let s_commandValue = "none";
let s_timer = 0;

/**
 * Toggle the developer test panel visibility in the popup.
 */
function openTestArea() {
    //add testArea
    if ($("#testArea").length != 0)
        $("#testArea").remove();
    $("body").append(testArea);
    $("#parmArea").hide();
    //buildstorage name select
    $('#testLSName').append('<option value="none" selected>Select Storage Name</option>');
    localStorageNames.forEach(function (thisName) {
        $('#testLSName').append('<option value="' + thisName.code + '">' + thisName.name + '</option>');
    });
    //build command name
    $('#testCommand').append('<option value="none" selected>Select Command to Send</option>');
    commandNames.forEach(function (thisName) {
        $('#testCommand').append('<option value="' + thisName.name + '">' + thisName.name + '</option>');
    });

    SendSafeRuntimeMessage({ request: "SENDLOG", who: "test Pop", messageLog: "test area accessed" });

    $("#testSend").click(function () {
        //get command to send 
        let valCommand = $("#testCommand option:selected").val();
        if (valCommand.length > 0) {
            //add for each command
            let valindex = commandNames.findIndex(x => x.name == valCommand);
            if (valindex != -1)
                commandNames[valindex].func();
        }
    });

    $('#testDel').click(function () {
        let valStor = $("#testLSName option:selected").val();
        if (valStor.length > 0) {
            locStorageDel(valStor);
            return;
        }
    });

    $('#testClose').click(function () {
        if (s_timer != 0)
            clearInterval(s_timer);
        s_timer = 0;
        $("#testArea").remove();
        $('body').removeClass('tracker-open det-expanded-wide');
        $("#trackerTable").removeClass("det-expanded");
        $("#notTracker").show();
        $("#restoreallarea").show();
        $("#chatname").val("");
    });
    s_timer = setInterval(checkCommand, 1000);
    $("#notTracker").hide();
    $("#restoreallarea").hide();
}

/**
 * Delete a specific key from chrome.storage.local.
 *
 * @param {Object} code
 * @returns {*}
 */
function locStorageDel(code) {
    let storageName = localStorageNames.find(function (el) {
        if (el.code == code)
            return el.name;
    });
    let msg = "Storage delete request Cancelled by user";
    if (storageName != null) {
        if (storageName.name == "MDELocDataS") {
            if (confirm("You have requested that MDE delete the sync storage item called:" + "MDELocData" + ". Please cancel if you don't know what you are asking.")) {
                chrome.storage.sync.remove("MDELocData");
                msg = "sync storage " + storageName.name + " deleted by request of user";
            }
        }
        else {
            if (confirm("You have requested that MDE delete the local storage item called:" + storageName.name + ". Please cancel if you don't know what you are asking.")) {
                chrome.storage.local.remove(storageName.name);
                msg = "Local storage " + storageName.name + " deleted by request of user";
                if (storageName.name == "MDEPHcustom")
                    // need to force read 
                    SendSafeRuntimeMessage({ request: "REFRESHPHRASES" });
            }
        }
        SendSafeRuntimeMessage({ request: "SENDLOG", who: "test Pop", messageLog: msg });
    }
    else
        $("#testmsgarea").text("Unknown storage name:" + code);
}

/**
 * Run a test search query from the popup test panel.
 */
function testQuery() {
    //one parm and it is query
    let qObj = { request: "OPENQ", location: "", query: "", localS: false };
    let tStr = $("#testQuery").val();
    if (tStr.length > 0) {
        qObj.query = tStr;
        SendSafeRuntimeMessage(qObj);
        $("#testmsgarea").text("Command Sent");
    }
    else
        $("#testmsgarea").text("Enter query to send");
}

/**
 * Clean up state after a popup test run.
 */
function testcleanup() {
    SendSafeRuntimeMessage({ request: "TESTCLEANUP" });
}

/**
 * Toggle debug logging on or off from the popup.
 */
function togglelog() {
    //one parm and it is true or false
    let qObj = { request: "TOGGLELOG", logstatus: false };
    let tStr = $("input:radio[name ='togglelogstatus']:checked").val();
    if (tStr == null)
        $("#testmsgarea").text("Select either Log on or log off.");
    else {
        qObj.logstatus = tStr == "on" ? true : false;
        SendSafeRuntimeMessage(qObj);
        $("#testmsgarea").text("Log Status set to:" + tStr);
    }
}

/**
 * Toggle the task monitor on or off.
 */
function togglemonitor() {
    //one parm and it is true or false
    let qObj = { request: "TOGGLEMONITOR" };
    SendSafeRuntimeMessage(qObj, function (response) {
        $("#testmsgarea").text("Monitor status set to: " + response);
    });
}

/**
 * Toggle RaterHub test mode on or off.
 */
function toggleRHTest() {
    //one parm and it is true or false
    let qObj = { request: "TOGGLERHTEST" };
    SendSafeRuntimeMessage(qObj, function (response) {
        $("#testmsgarea").text("Rh test status set to: " + response);
    });
}

/**
 * Preview an alert sound from the popup sound settings.
 */
function playsound() {
    //one parm and it is a url
    let qObj = {
        text: "PLAYITTEST", soundF: "", soundType: "noneyet"
    };

    let bad_qObj = {
        text: "PLAYITTEST", soundF: ""
    };

    let obj_2send = qObj;

    let tStr = $("#testQuery").val();
    if (tStr.length > 0) {
        qObj.soundType = tStr;
    }
    else
        obj_2send = bad_qObj;

    SendSafeRuntimeMessage(obj_2send, function (response) {
        $("#testmsgarea").text(response);
    });
}

/**
 * Load a custom sound file selected by the user.
 */
function loadsound() {
    //one parm and it is a url
    let qObj = {
        text: "LOADSOUNDTEST", soundF: "", soundType: "noneyet"
    };

    let bad_qObj = {
        text: "LOADSOUNDTEST", soundF: ""
    };

    let obj_2send = qObj;

    let tStr = $("#testQuery").val();
    if (tStr.length > 0) {
        qObj.soundType = tStr;
    }
    else
        obj_2send = bad_qObj;

    let sound = Test_SetAudioFile(tStr);
    if (sound == null)
        alert('well that sound load failed');
    let snd = new Audio();
    snd.src = sound;
    let promise1 = snd.play();
    promise1.then(_ => {
    }).catch(error => {
    });
}

/**
 * Send a test notification to verify notification settings.
 */
function sendNotifyTest() {
    //one parm and it is the message
    let cDate = new Date();
    let qObj = {
        text: "TESTNOTIFICATION", msg: "None entered"
    };

    let tStr = $("#testQuery").val();
    if (tStr.length > 0) {
        qObj.msg = tStr;
    }
    SendSafeRuntimeMessage(qObj);
}

/**
 * Send a test text alert to verify messaging settings.
 */
function sendTextTest() {
    //one parm and it is the message
    let cDate = new Date();
    let qObj = {
        text: "SENDMESSAGE", message: "None entered", filter: "fromtest", poster: "popupTest", time: cDate
    };

    let tStr = $("#testQuery").val();
    if (tStr.length > 0) {
        qObj.message = tStr;
    }

    SendSafeRuntimeMessage(qObj);
}

//SendSafeRuntimeMessage({ text: "onunload", dataobj: trackObj });

/**
 * Add or update a task record from the popup manual-entry form.
 */
function addupdTask() {
    let command = $("#testCommand option:selected").val();

    if (validDataObj(testdataobj)) {
        let qObj = { text: command, dataobj: testdataobj };
        SendSafeRuntimeMessage(qObj);
        $("#testmsgarea").text("Command Sent");
    }
    else
        $("#testmsgarea").text("One of the parms wasn't valid, check console.log");
}



/**
 * Validate and parse a command string entered in the debug console.
 */
function checkCommand() {
    let newCommand = $("#testCommand option:selected").val();
    if (newCommand != s_commandValue) {
        s_commandValue = newCommand;
        processCommand(s_commandValue);
    }
}


let testdataobj = { taskId: "0001575166", dateofTask: null, taskDesc: "", taskAET: "3.5", extras: "Test Web Exp", workTime: 0 };//definition of dataObj

/**
 * Execute a validated command from the debug console.
 *
 * @param {*} valCommand
 */
function processCommand(valCommand) {
    //get selected command
    $(".testParm").remove();
    $("#parmArea").html("");
    $("#parmArea").hide();


    // command changes to dataobj - open up area to input data for this command (listener on valcommand)
    if (valCommand == "OPENQ") {
        let parms =
            '<label for="testQuery" class="testParm testareaLabel">Query</label>' +
            '<input class="testParm" type="text" id="testQuery" name="testQuery" size = "20" value = ""/><br>';
        $("#parmArea").html(parms);
        $("#parmArea").show();
        $("#testmsgarea").text("");
    }

    if (valCommand == "PLAYSND") {
        parms =
            '<label for="testQuery" class="testParm testareaLabel">CHAT,NRT,RHINDEX,TRACKER,UNDEFINED</label>' +
            '<input class="testParm" type="text" id="testQuery" name="testQuery" size = "20" value = ""/><br>';
        $("#parmArea").html(parms);
        $("#parmArea").show();
        $("#testmsgarea").text("");
    }

    if (valCommand == "LOADSND") {
        parms =
            '<label for="testQuery" class="testParm testareaLabel">Filename to load</label>' +
            '<input class="testParm" type="text" id="testQuery" name="testQuery" size = "20" value = ""/><br>';
        $("#parmArea").html(parms);
        $("#parmArea").show();
        $("#testmsgarea").text("");
    }

    if (valCommand == "SENDTEXTMSG") {
        parms =
            '<label for="testQuery" class="testParm testareaLabel">Message</label>' +
            '<input class="testParm" type="text" id="testQuery" name="testQuery" size = "20" value = ""/><br>';
        $("#parmArea").html(parms);
        $("#parmArea").show();
        $("#testmsgarea").text("");
    }
    if (valCommand == "SENDNOTIFICATION") {
        parms =
            '<label for="testQuery" class="testParm testareaLabel">Message</label>' +
            '<input class="testParm" type="text" id="testQuery" name="testQuery" size = "20" value = ""/><br>';
        $("#parmArea").html(parms);
        $("#parmArea").show();
        $("#testmsgarea").text("");
    }


    if (valCommand == "TOGGLELOG") {
        parms =
            '<input type="radio" name="togglelogstatus" value="on">Log On<br><input type="radio" name="togglelogstatus" value="off">Log Off<br>';
        $("#parmArea").html(parms);
        $("#parmArea").show();
        $("#testmsgarea").text("");
    }

    if (valCommand == "LOGT" || valCommand == "newonunload") {
        let dStart = new Date();
        testdataobj.dateofTask = (dStart.getMonth() + 1) + '/' + dStart.getDate() + '/' + dStart.getFullYear() + ' ' + dStart.toLocaleTimeString();
        let toAppend =
            '<label for="testDate" class="testParm testareaLabel">DateofTask</label>' +
            '<input class="testParm" type="text" id="testDate" name="testDate" size = "20" value = ""/><br>' +
            '<label for="testTaskId" class="testParm testareaLabel">TaskId</label>' +
            '<input class="testParm" type="text" id="testTaskId" name="testTaskId" size = "20" value = ""/><br>' +
            '<label for="testAET" class="testParm testareaLabel">AET</label>' +
            '<input class="testParm" type="text" id="testAET" name="testAET" size = "20" value = ""/><br>' +
            '<label for="testDesc" class="testParm testareaLabel">Status</label>' +
            '<select class="testParm" name="testDesc" id="testDesc"><option value="blank" selected>Blank</option>' +
            '<option value="Submitted">Submitted</option><option value="Released">Released</option><option value="Not Complete">Not Complete</option></select><br>' +
            '<label for="testExtras" class="testParm testareaLabel">Extras</label>' +
            '<input class="testParm" type="text" id="testExtras" name="testExtras" size = "20" value = ""/><br>' +
            '<label for="testworkTime" class="testParm testareaLabel">WorkTime</label>' +
            '<input class="testParm" type="number" id="testworkTime" name="testExtras"   value = "0"/><br>';
        ;

        $("#parmArea").html(toAppend);
        $("#parmArea").show();
        if (valCommand == "newonunload")
            testdataobj.taskDesc = getSubmittedConstant();
        else
            testdataobj.taskDesc = "";

        //set fields
        $('#testDate').val(testdataobj.dateofTask);
        $('#testTaskId').val(testdataobj.taskId);
        $('#testAET').val(testdataobj.taskAET);
        $('#testExtras').val(testdataobj.extras);
        $("#testmsgarea").text("");
    }

    if (valCommand == "modifyRec") {
        //one parm - taskid to modify
        $("#parmArea").html('<label for="testTaskId" class="testParm testareaLabel">TaskId</label>' +
            '<input class="testParm" type="text" id="testTaskId" name="testTaskId" size = "10" value = ""/><button id="retreiveRec" class="rightAlign">Get Record</button>');
        $('#retreiveRec').click(modifyRec);
        $("#parmArea").show();
    }

    if (valCommand == "BROWSEDATA") {
        browseData();
    }

    if (valCommand == "GENDATA") {
        genTestData();
    }

    if (valCommand == "CLEARDATA") {
        clearTrackData();
    }
}
/**
 * Display an error message in the popup error area.
 *
 * @param {Object} element
 * @param {Object} message
 */
function setError(element, message) {
    $(element).css('background-color', 'yellow');
    $("#txtmsgerrors").text(message);
    $("#txtmsgerrors").show();
}

//let testdataobj = { taskId: "7531575166", dateofTask: null, taskDesc: "", taskAET: "3.5", extras: "Test Web Exp", workTime: 0 };//definition of dataObj
/**
 * Return true if a task data object has all required fields.
 *
 * @param {Object} testdataobj
 */
function validDataObj(testdataobj) {
    //get fields
    testdataobj.dateofTask = $('#testDate').val();
    let tempTaskId = "taskIds=" + $('#testTaskId').val();
    testdataobj.taskId = buildTaskId(tempTaskId);
    //testdataobj.taskId = $('#testTaskId').val();
    testdataobj.taskAET = $('#testAET').val();
    testdataobj.taskDesc = $('#testDesc').val();
    if (testdataobj.taskDesc == "blank")
        testdataobj.taskDesc = getInrocessStrConstant();
    testdataobj.extras = $('#testExtras').val();
    testdataobj.workTime = parseInt($('#testworkTime').val());
    //check date
    let f = new Date(testdataobj.dateofTask);
    if (f == "Invalid Date") { return false; }
    else if (testdataobj.taskId == null || testdataobj.taskId.length == 0) { return false; }
    else if (isNaN(testdataobj.taskAET)) { return false; }
    else
        return true;

    return false;
}

/**
 * Apply an edit to a specific field of a task record.
 * @returns {*}
 */

/**
 * Show all tracker records in a scrollable table; click any row to edit it inline.
 */
function browseData() {
    getData(function (dataA) {
        if (dataA == null || dataA.length === 0) {
            $("#testmsgarea").text("No tracker data found.");
            return;
        }
        let dataArray = mergeData(dataA);
        // Sort newest-first for convenience
        dataArray.sort(function (a, b) { return new Date(b.dateofTask) - new Date(a.dateofTask); });

        let html =
            '<div class="testParm" style="max-height:260px;overflow-y:auto;margin-bottom:6px;">' +
            '<table style="width:100%;font-size:11px;border-collapse:collapse;" id="browseTable">' +
            '<thead><tr style="position:sticky;top:0;background:#ddd;">' +
            '<th style="padding:2px 4px;">Date</th>' +
            '<th style="padding:2px 4px;">Task&nbsp;ID</th>' +
            '<th style="padding:2px 4px;">AET</th>' +
            '<th style="padding:2px 4px;">Work(ms)</th>' +
            '<th style="padding:2px 4px;">Status</th>' +
            '</tr></thead><tbody id="browseBody"></tbody></table></div>' +
            '<div id="browseEditArea" class="testParm" style="display:none;border-top:1px solid #aaa;padding-top:6px;">' +
            '<b>Edit Record</b><br>' +
            '<label class="testareaLabel">Date</label>' +
            '<input type="text" id="beDate" size="22"/><br>' +
            '<label class="testareaLabel">Task&nbsp;ID</label>' +
            '<input type="text" id="beTaskId" size="16"/><br>' +
            '<label class="testareaLabel">AET</label>' +
            '<input type="text" id="beAET" size="6"/>' +
            '<label class="testareaLabel" style="margin-left:8px;">Work&nbsp;(ms)</label>' +
            '<input type="number" id="beWork" size="10"/><br>' +
            '<label class="testareaLabel">Status</label>' +
            '<select id="beDesc">' +
            '<option value="">Blank</option>' +
            '<option value="Submitted">Submitted</option>' +
            '<option value="Released">Released</option>' +
            '<option value="Not Complete">Not Complete</option>' +
            '</select><br>' +
            '<label class="testareaLabel">Extras</label>' +
            '<input type="text" id="beExtras" size="22"/><br>' +
            '<button id="beSave" style="margin-top:4px;">Save</button>' +
            '<button id="beDelete" style="margin-top:4px;margin-left:6px;color:red;">Delete</button>' +
            '<button id="beCancel" style="margin-top:4px;margin-left:6px;">Cancel</button>' +
            '</div>';

        $(".testParm").remove();
        $("#parmArea").html(html);
        $("#parmArea").show();
        $("#testmsgarea").text(dataArray.length + " records. Click a row to edit.");

        // Populate table rows
        let tbody = $("#browseBody");
        dataArray.forEach(function (rec, idx) {
            let statusLabel = rec.taskDesc || "(blank)";
            let tr =
                '<tr data-idx="' + idx + '" style="cursor:pointer;border-bottom:1px solid #eee;" ' +
                'class="browseRow">' +
                '<td style="padding:2px 4px;">' + (rec.dateofTask || "") + '</td>' +
                '<td style="padding:2px 4px;">' + (rec.taskId || "") + '</td>' +
                '<td style="padding:2px 4px;">' + (rec.taskAET || "") + '</td>' +
                '<td style="padding:2px 4px;">' + (rec.workTime || 0) + '</td>' +
                '<td style="padding:2px 4px;">' + statusLabel + '</td>' +
                '</tr>';
            tbody.append(tr);
        });

        // Row click → populate edit form
        $(document).off("click.browse").on("click.browse", ".browseRow", function () {
            let idx = parseInt($(this).data("idx"));
            let rec = dataArray[idx];
            $("#browseEditArea").show();
            $("#beDate").val(rec.dateofTask || "");
            $("#beTaskId").val(rec.taskId || "");
            $("#beAET").val(rec.taskAET || "");
            $("#beWork").val(rec.workTime || 0);
            $("#beDesc").val(rec.taskDesc || "");
            $("#beExtras").val(rec.extras || "");
            $("#beSave").off("click").on("click", function () {
                rec.dateofTask = $("#beDate").val();
                rec.taskId = $("#beTaskId").val();
                rec.taskAET = $("#beAET").val();
                rec.workTime = parseInt($("#beWork").val()) || 0;
                rec.taskDesc = $("#beDesc").val();
                rec.extras = $("#beExtras").val();
                let dday = new Date(rec.dateofTask);
                saveData(dataArray, dday);
                $("#browseEditArea").hide();
                // Refresh that row in the table
                let cells = $(".browseRow[data-idx='" + idx + "'] td");
                cells.eq(0).text(rec.dateofTask || "");
                cells.eq(1).text(rec.taskId || "");
                cells.eq(2).text(rec.taskAET || "");
                cells.eq(3).text(rec.workTime || 0);
                cells.eq(4).text(rec.taskDesc || "(blank)");
                $("#testmsgarea").text("Record saved.");
            });
            $("#beDelete").off("click").on("click", function () {
                if (!confirm("Delete this record?")) return;
                dataArray.splice(idx, 1);
                let dday = new Date();
                saveData(dataArray, dday);
                $(".browseRow[data-idx='" + idx + "']").remove();
                $("#browseEditArea").hide();
                $("#testmsgarea").text("Record deleted. " + dataArray.length + " records remain.");
            });
            $("#beCancel").off("click").on("click", function () {
                $("#browseEditArea").hide();
            });
        });
    });
}

/**
 * Render configurable controls to generate a synthetic test dataset and write it to storage.
 */
function genTestData() {
    let html =
        '<b class="testParm">Generate Test Dataset</b><br class="testParm">' +
        '<label class="testParm testareaLabel">Records</label>' +
        '<input class="testParm" type="number" id="genCount" value="30" min="1" max="500" style="width:60px;"/><br>' +
        '<label class="testParm testareaLabel">Days&nbsp;back&nbsp;(start)</label>' +
        '<input class="testParm" type="number" id="genDaysBack" value="60" min="1" max="730" style="width:60px;"/><br>' +
        '<label class="testParm testareaLabel">AET&nbsp;min</label>' +
        '<input class="testParm" type="number" id="genAETMin" value="2.0" min="0.1" max="24" step="0.1" style="width:55px;"/>' +
        '<label class="testParm testareaLabel" style="margin-left:6px;">AET&nbsp;max</label>' +
        '<input class="testParm" type="number" id="genAETMax" value="8.0" min="0.1" max="24" step="0.1" style="width:55px;"/><br>' +
        '<label class="testParm testareaLabel">Work&nbsp;%&nbsp;of&nbsp;AET</label>' +
        '<input class="testParm" type="number" id="genWorkPct" value="85" min="0" max="200" style="width:55px;"/><br>' +
        '<label class="testParm testareaLabel">Statuses</label>' +
        '<span class="testParm" style="font-size:11px;">' +
        '<input type="checkbox" id="genStatBlank" checked/> Blank&nbsp;' +
        '<input type="checkbox" id="genStatSub" checked/> Submitted&nbsp;' +
        '<input type="checkbox" id="genStatRel" checked/> Released&nbsp;' +
        '<input type="checkbox" id="genStatNC"/> Not&nbsp;Complete' +
        '</span><br>' +
        '<label class="testParm testareaLabel">Tasks/day&nbsp;(avg)</label>' +
        '<input class="testParm" type="number" id="genPerDay" value="3" min="1" max="20" style="width:55px;"/><br>' +
        '<button class="testParm" id="genBuild" style="margin-top:4px;">Build &amp; Save</button>';

    $(".testParm").remove();
    $("#parmArea").html(html);
    $("#parmArea").show();
    $("#testmsgarea").text("Configure and click Build & Save.");

    $("#genBuild").off("click").on("click", function () {
        let count = parseInt($("#genCount").val()) || 30;
        let daysBack = parseInt($("#genDaysBack").val()) || 60;
        let aetMin = parseFloat($("#genAETMin").val()) || 2.0;
        let aetMax = parseFloat($("#genAETMax").val()) || 8.0;
        let workPct = parseInt($("#genWorkPct").val()) / 100 || 0.85;
        let perDay = parseInt($("#genPerDay").val()) || 3;
        if (aetMax < aetMin) aetMax = aetMin;

        let statuses = [];
        if ($("#genStatBlank").is(":checked")) statuses.push("");
        if ($("#genStatSub").is(":checked"))   statuses.push("Submitted");
        if ($("#genStatRel").is(":checked"))   statuses.push("Released");
        if ($("#genStatNC").is(":checked"))    statuses.push("Not Complete");
        if (statuses.length === 0) statuses = [""];

        let dataArray = [];
        let d = new Date();
        let baseId = 7269000000 + Math.floor(Math.random() * 100000);
        let totalDays = daysBack;
        let generated = 0;

        for (let dayOffset = totalDays; dayOffset >= 0 && generated < count; dayOffset--) {
            let dayDate = new Date(d);
            dayDate.setDate(d.getDate() - dayOffset);
            // Vary tasks per day slightly around perDay
            let tasksThisDay = Math.max(1, perDay + Math.floor(Math.random() * 3) - 1);
            for (let t = 0; t < tasksThisDay && generated < count; t++) {
                let taskDate = new Date(dayDate);
                taskDate.setHours(7 + Math.floor(Math.random() * 10));
                taskDate.setMinutes(Math.floor(Math.random() * 60));
                taskDate.setSeconds(Math.floor(Math.random() * 60));
                let dstr = (taskDate.getMonth() + 1) + '/' + taskDate.getDate() + '/' +
                    taskDate.getFullYear() + ' ' + taskDate.toLocaleTimeString();
                let aet = (aetMin + Math.random() * (aetMax - aetMin)).toFixed(1);
                let workMs = Math.round(parseFloat(aet) * 60000 * workPct * (0.9 + Math.random() * 0.2));
                let status = statuses[Math.floor(Math.random() * statuses.length)];
                let taskId = (baseId + generated * 37).toString();
                dataArray.push({
                    taskId: taskId,
                    dateofTask: dstr,
                    taskDesc: status,
                    taskAET: aet,
                    extras: "GenTest-" + generated,
                    workTime: workMs
                });
                generated++;
            }
        }

        SendSafeRuntimeMessage({ text: "SAVEDATAA", data: dataArray, datein: null });
        $("#testmsgarea").text(generated + " records generated and saved.");
    });
}

/**
 * Wipe all task tracker records from storage after confirmation.
 */
function clearTrackData() {
    $(".testParm").remove();
    $("#parmArea").html(
        '<p class="testParm" style="color:red;font-weight:bold;">This will delete ALL tracker records.</p>' +
        '<button class="testParm" id="clearConfirm">Yes, delete everything</button>'
    );
    $("#parmArea").show();
    $("#testmsgarea").text("Confirm deletion below.");

    $("#clearConfirm").off("click").on("click", function () {
        SendSafeRuntimeMessage({ text: "SAVEDATAA", data: [], datein: null });
        $("#testmsgarea").text("Tracker data cleared.");
        $("#parmArea").hide();
        $(".testParm").remove();
    });
}

/**
 * Apply an edit to a specific field of a task record.
 * @returns {*}
 */
function modifyRec() {
    let taskId = $("#testTaskId").val();
    taskId = taskId.trim();
    //get data
    getData(function (dataA) {
        let dataArray = [];
        if (dataA != null) {
            dataArray = mergeData(dataA);
            let tempObj = dataArray.find(function (element) {
                return element.taskId == taskId;
            });
            if (tempObj != undefined) {
                $(".testParm").remove();
                $("#parmArea").html("");

                let toAppend =
                    '<label for="testDate" class="testParm testareaLabel">DateofTask</label>' +
                    '<input class="testParm" type="text" id="testDate" name="testDate" size = "20" value = ""/><br>' +
                    '<label for="testTaskId" class="testParm testareaLabel">TaskId</label>' +
                    '<input class="testParm" type="text" id="testTaskId" name="testTaskId" size = "20" value = ""/><br>' +
                    '<label for="testAET" class="testParm testareaLabel">AET</label>' +
                    '<input class="testParm" type="text" id="testAET" name="testAET" size = "20" value = ""/><br>' +
                    '<label for="testWorktime" class="testParm testareaLabel">Worktime</label>' +
                    '<input class="testParm" type="text" id="testWorktime" name="testWorktime" size = "20" value = ""/><br>' +
                    '<label for="testDesc" class="testParm testareaLabel">Status</label>' +
                    '<select class="testParm" name="testDesc" id="testDesc"><option value="blank" selected>Blank</option>' +
                    '<option value="Submitted">Submitted</option><option value="Released">Released</option><option value="Not Complete">Not Complete</option></select><br>' +
                    '<label for="testExtras" class="testParm testareaLabel">Extras</label>' +
                    '<input class="testParm" type="text" id="testExtras" name="testExtras" size = "20" value = ""/><br>' +
                    '<p class="testParm"><button id="testsaverec">Save Changes</button></p>';
                $("#parmArea").html(toAppend);
                $("#parmArea").show();
                $("#testmsgarea").text("");

                //assign data to the fields
                //data = { taskId: "", dateofTask: null, taskDesc: "", taskAET: "", extras: "", workTime: 0 };//definition of dataObj
                $("#testDate").val(tempObj.dateofTask);
                $("#testTaskId").val(taskId);
                $("#testAET").val(tempObj.taskAET);
                $("#testWorktime").val(tempObj.workTime);
                $("#testDesc").val(tempObj.taskDesc);
                $("#testExtras").val(tempObj.extras);
                //add click handler for save data
                $('#testsaverec').click(function () {
                    //get data from the screen
                    tempObj.dateofTask = $("#testDate").val();
                    tempObj.taskAET = $("#testAET").val();
                    tempObj.workTime = $("#testWorktime").val();
                    tempObj.taskDesc = $("#testDesc").val();
                    tempObj.extras = $("#testExtras").val();
                    let dday = new Date(tempObj.dateofTask); //dday is to tell background to update consolidated totals
                    saveData(dataArray, dday);
                });
            }
            else
                $("#testmsgarea").text("Task id not found: " + taskId);
        }
        else
            $("#testmsgarea").text("No tracker data");
    });
}

let rhAlertHTML =
    '           <button type="button" class="tinybut" id="rhaclose" title="Close Setup" hidden><img src="close.png" width="12" height="12" /></button>' +
    '           <label for="username">Name</label>' +
    '            <input type="text" id="username" name="username" size="15" value="" class="textmsgcheck"  /><br>' +
    '            <label for="usernumber">Phone Number (10 digits)</label>' +
    '            <input type="text" id="usernumber" name="usernumber" size="10" value="" class="textmsgcheck" /><br>' +
    '            <select name="carrier" id="carrier" class="textmsgcheck"></select>' +
    '<table><thead><td title="A text message will be sent if one of these words is posted in an open chat tab. Enter one or more words separated by a comma. To filter on an exact phrase, enclose it in double quotes." >Chat Filter(s)</td><td title="Limit frequency of alerts on the same word or phrase. Enter time in minutes.">Limit(mins)</td></thead>' +
    '  <tbody><tr><td><input type="text" id="chatTextAlerts" name="chatTextAlerts" size="10" value="" class="textmsgcheck"></td>' +
    '  <td><input type="number" id="chatTextLimit" name="chatTextLimit" size="2" value="0" min="0" class="textmsgcheck"></td></tr></tbody></table>' +
    '           <input type="checkbox" name="chatRedAlert" id="chatRedAlert" class="textmsgcheck"/>Red Post Alert<br>' +
    '            <p><span class="taskheader" >NRT Alerts</span> <br>' +
    '                <input type="checkbox" name="rhalertnrtstart" id="rhalertnrtstart" class="textmsgcheck"/>NRT start<br>' +
    '                <input type="checkbox" name="rhalertnrtstop" id="rhalertnrtstop" class="textmsgcheck"/>NRT stop<br>' +
    '            <label for="textafter" title="default is 2">Number of refreshes before sending Text message</label>' +
    '            <input type="number" id="textafter" name="textafter" size="1" value="" min="0" class="textmsgcheck" /><br>' +
    '</p><p>' +
    '<span class="taskheader">Task Type Alerts</span><br>' +
    '                <input type="checkbox" name="rhalertuo" id="rhalertuo" class="textmsgcheck" />May contain upsetting-offensive content<br>' +
    '                <input type="checkbox" name="rhalertac" id="rhalertac" class="textmsgcheck"/>Adult Content<br>' +
    '                <input type="checkbox" name="rhalerthm" id="rhalerthm" class="textmsgcheck"/>Special device or app required<br>' +
    '                <input type="checkbox" name="rhalertsapr" id="rhalertsapr" class="textmsgcheck" />Speaking aloud required<br>' +
    '                <input type="checkbox" name="rhalerthr" id="rhalerthr" class="textmsgcheck" />Headphones Required<br>' +
    '                <input type="checkbox" name="rhalertpr" id="rhalertpr" class="textmsgcheck"/>Personalized<br>' +
    '                <input type="checkbox" name="rhalerthrs" id="rhalerthrs" class="textmsgcheck"/>Headphones or speakers required<br>' +
    '            </p>' +
    '            <p>' +
    //'                <button id="rhasave" type="button" class="smallbut">Save Options</button>' +
    '                <button id="rhachange" type="button" class="smallbut" hidden >Change Email address</button></p>' +
    '<p>' +
    ' <label for="thiscomputerMsgOpts" style="font-weight:bold">Device Name</label>' +
    ' <input type="text" id="thiscomputerMsgOpts"  name="thiscomputerMsgOpts" maxlength="10" value="" title="Text messages sent will include the name of this device in the message."/><br>' +
    '</p>' +
    '<p id="snoozeP"><span><b>SNOOZE</b></span><button id="rhasnoozeclear" type="button" class="smallbut">Reset</button><br><br>' +
    '<label for="rhalertsnoozestart" title="Enter daily time to stop texts." >Start</label>' +
    '<input type="time" id="rhalertsnoozestart" name="rhalertsnoozestart" size="20" value="" class="textmsgcheck" /><br>' +
    '<label for="rhalertsnoozestop" title="Enter daily time to restart texts.">Stop</label>' +
    '<input type="time" id="rhalertsnoozestop" name="rhalertsnoozestop" size="20" value="" class="textmsgcheck" /></p>' +
    '                <button class="Submit" type="button" id="rhalertstatus">Pause Alerts</button>';

/**
 * Build the HTML for the service-provider selection dropdown.
 *
 * @param {boolean} list
 * @param {string} msgObj
 */
function buildProvidersSelect(list, msgObj) {
    if (list == null) {
        $("#phalertstatus").text("No providers to choose from");
    }
    else {
        $('#carrier').empty();
        list.forEach(function (el) {
            let elThis = el.replace("%s", "");
            $('#carrier').append('<option value="' + elThis + '">' + elThis + '</option>');
        });
        let selStr = '#carrier option[value="' + msgObj.carrier + '"]';
        $(selStr).prop('selected', true);
    }
}

/**
 * Update the RaterHub status button color and label.
 *
 * @param {Object} state
 */
function setRHstatusBut(state) {
    if (state == false) { // status if off
        $("#rhalertstatus").text(turnOnTexts);
        $("#rhalertstatus").css('color', 'white');
        $("#rhalertstatus").css('background-color', 'green');
    }
    else {
        SendSafeRuntimeMessage({ text: "RHALERTCONTROLSTATUSSET", set: true });
        $("#rhalertstatus").text(turnOffTexts);
        $("#rhalertstatus").css('color', 'white');
        $("#rhalertstatus").css('background-color', 'red');
        //red
    }
}
//                myAlert("Unable to access PQ data file. " + "xhr status code:" + xhr.status, false, 1);


/**
 * Expand a collapsed tracker section to show additional rows.
 *
 * @param {string} str
 * @param {Object} close
 * @param {number} count
 */
function showMore(str, close, count) {
    $("#openModal").css("opacity", 1);
    $("#openModal").css("pointer-events", "auto");


    $('.close').click(function (ev) {
        $("#openModal").css("opacity", 0);
        $("#openModal").css("pointer-events", "none");
    });
}

/**
 * Play an alert beep from within the popup context.
 *
 * @param {string} srcin
 */
function beep_pop(srcin) {
    let snd = new Audio();
    if (s_log) {
        console.trace();
    }
    if (srcin == null) {
        console.trace();
        return;
    }
    let src2use = srcin;
    if (srcin.indexOf(".mp3") > -1)
        src2use = chrome.runtime.getURL(srcin);
    snd.src = src2use;
    let promise1 = snd.play();
    promise1.then(_ => {
        //worked
    }).catch(error => {
    });
}
//function getPhrases(tabid, message, phsent) {
//    if (phraseArray == null)
//        readPhrases(tabid, message, phsent);
//    else if (tabid != null)
//        SendSafeTabMessage(tabid, { text: message, phsent: phsent, phrases: phraseArray });
//    return phraseArray;
//}


//function readPhrases(tabid, message, phsent) {
//    chrome.storage.local.get('MDEPHcustom', function getCurDataCallBack(data) { //ok
//        if (chrome.runtime.lastError) {
//        }
//        else {
//            let datacustom = null;
//            if (data.MDEPHcustom != null) {
//                datacustom = JSON.parse(data.MDEPHcustom);
//                if (tabid != null)
//                    SendSafeTabMessage(tabid, { text: message, phsent: phsent, phrases: datacustom });
//                setPhrases(datacustom, false);
//            }
//            else {
//                /* get system default phrases */
//                if (tabid != null)
//                    SendSafeTabMessage(tabid, { text: message, phsent: phsent, phrases: basephraseArray });
//                setPhrases(basephraseArray, false);
//            }
//        }
//    });
//}


/**
 * Read and apply an audio file setting from storage.
 *
 * @param {Object} soundRec
 */
function readSetAudioFile(soundRec) {
    let fileSelector = document.createElement('input');
    let local_soundsRec = soundRec;
    fileSelector.setAttribute('type', 'file');
    let selectDialogueLink = document.createElement('a');
    selectDialogueLink.setAttribute('href', '');
    selectDialogueLink.innerText = "Select File";
    $(fileSelector).change("change", function () {
        if (fileSelector.files[0].type.indexOf('audio/') !== 0) {
            alert('not an audio file');
            local_soundsRec.sound = "error";
            return;
        }
        if (fileSelector.files.length == 1) {
            let reader = new FileReader();
            reader.onload = function () {
                let data = reader.result;
                local_soundsRec.sound = data;
                chrome.runtime.sendMessage({ request: "READSETAUDIO", type: local_soundsRec.type, audioStr: data });
            };
            reader.readAsDataURL(fileSelector.files[0]);
        }
    });
    $(fileSelector).trigger("click");
}
