// JavaScript source code utilities background doesn't use - there is probably more but I don't feel like doing this now.
let s_log = false;

/**
 * Fetch and inject rating example content into the current task page.
 *
 * @param {string} srcin
 */
function beep(srcin) {
    if (isValidChromeRuntime()) {
        if (srcin == null) {
            return;
        }
        else if (srcin == "NONE")
            return;
        else if (srcin == "customize" || srcin == "custom") {
            return;
        }

        let src2use = srcin;
        if (srcin.indexOf(".mp3") > -1)
            src2use = chrome.runtime.getURL(srcin);

        if (s_log) {
            //    console.trace();
        }
        SendSafeRuntimeMessage({ text: "PLAYIT", soundF: srcin, soundType: "PLAYSOUNDF", final: false });
    }
}

/**
 * Copy a string to the system clipboard using a temporary textarea.
 *
 * @param {Date} data
 */
function putClipboard(data) {
    let saveFocus = document.activeElement;
    let text = document.createElement("textarea");
    text.textContent = data;
    text.setAttribute("id", "mdecopyfield")
    document.body.appendChild(text);
    let copyText = document.getElementById("mdecopyfield");
    /* Select the text field */
    copyText.select();
    copyText.setSelectionRange(0, 99999);
    /* Copy the text inside the text field */
    //navigator.clipboard.writeText(copyText.value);
    try {
        navigator.clipboard.writeText(copyText.value);
    } catch (err) {
        console.error('Failed to copy: ', err);
    }


    text.remove();
    $(saveFocus).focus();
}

/**
 * Fetch and inject rating example content into the current task page.
 *
 * @param {Function} func2Call
 */
function loadRatingExamples(func2Call) {
    //read saved ratings
    let local_func2call = func2Call;
    chrome.storage.local.get('PQData', function (data) { //ok
        let pqArray = [];
        if (chrome.runtime.lastError) {
        }
        else {
            if (data.PQData != null && data.PQData.length > 0) {
                try {
                    pqArray = JSON.parse(data.PQData);
                } catch (e) {
                }
            }
            //load pq data from RE
            $.ajax({
                url: "https://raterlabs.appen.com/qrp/core/vendors/social_file/1065488/pq.txt",
                method: 'get',
                //async: false,
                crossDomain: true,
                success: function (data, status, xhr) {
                    let npqArray = readTextDocument(data, pqArray);
                    //add local storage data
                    local_func2call(npqArray); //sets pqrecs in controlobj and saves it.
                    alert("MDE: Pq Data Loaded");
                }, //end of sucess
                error: function (xhr, status, text) {
                    alert("MDE: Unable to access pq data. " + "xhr status code: " + xhr.status);
                }
            }); // end of ajax
        }
    });
}

