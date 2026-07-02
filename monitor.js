// JavaScript source code
$(document).ready(function () {
    $("#enableBut").click(function () {
        $('#enableBut').text("RH Alerts Enabled");
        $('#enableBut').css("color", "black");
    });
});

let rhsounds = [
    { type: "NRT", sound: null },
    { type: "RHINDEX", sound: null }
];

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    //console.log(request.text, request);
    if (request.text == "NEWRHSOUND") {
        updateSound(request.type, request.beep);
        return true;
    }

    if (request.text == "NEWRHSOUND") {
        updateSound(request.type, request.beep);
        return true;
    }

    if (msg.text == "PLAYTHIS") {
        beep(msg.data);
        sendResponse(0);
        return true;
    }

    if (request.text == "MONITORPLAYSOUND") {
        let entry = rhsounds.findIndex(x => x.type == request.type);
        beep(rhsounds[entry].sound);
        sendResponse(0);
        return true;
    }
    return false;
});

/**
 * Apply updated sound settings received from the popup to the monitor..
 *
 * @param {string} type
 * @param {*} sound
 */
function updateSound(type, sound) {
    let entry = rhsounds.findIndex(x => x.type == type);
    rhsounds[entry].sound = sound;
}