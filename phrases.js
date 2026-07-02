let s_phraseArray = "";
let where2paste = "";
let longestStr = "";
let blankLinePad = " ";
let saveEl = null;
let s_optSentence = false;

//let cursorLoc = 0;



//just have to convert positioning
//
//keydwn handlers for input text areas
//keyPhraseDwn is always active and listening
//     processes alt - A to edit phrase table, alt-C to copy string and add it to the table
//     check all keys - brings up phrase able if string is matched
//once phrase table has been opened 
//phrasesTab  listen only for tab - because we are simulating moving to the table, and then remove ourself
//phrasesDownEnterTab
//     listens for down arrow or tab in the phrase table (move to next entry in the table) 
//     listens for an enter in the phrase table (select that phrase)

let tDate = new Date();

/**
 * Create and return the phrase menu container div and inner table.
 */
function doIt() {
    let thisTime = new Date();
    let timediff = thisTime - tDate;
    if (timediff > 800) {
        tDate = thisTime;
        return true;
    }
    else
        return false;
}

//main line
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.text == 'OPENPHRASE') {
        showMenu(request.phrases);
    }
    if (request.text == 'PHRASES') {
        s_phraseArray = request.phrases;
        s_optSentence = request.phsent;
        document.removeEventListener("keyup", keyPhraseDwn);
        document.addEventListener("keyup", keyPhraseDwn);
    }
    return false;
});


/**
 * Return the currently selected text in the active input element.
 * @returns {*}
 */
function phrase_getSelectionText() {
    let text = "";
    let activeEl = document.activeElement;
    let activeElTagName = activeEl ? activeEl.tagName.toLowerCase() : null;
    if (
        (activeElTagName == "textarea") || (activeElTagName == "input" &&
            /^(?:text|search|password|tel|url)$/i.test(activeEl.type)) &&
        (typeof activeEl.selectionStart == "number")
    ) {
        text = activeEl.value.slice(activeEl.selectionStart, activeEl.selectionEnd);
    } else if (window.getSelection) {
        text = window.getSelection().toString();
    }
    return text;
}

// this is the one that is always listening
/**
 * Keydown handler for phrase-menu navigation (arrows, enter, escape).
 *
 * @param {Object} zEvent
 */
function keyPhraseDwn(zEvent) {
    let retCode = 0;
    //console.log("basic keypress got", zEvent.code,zEvent);
    if (zEvent.altKey && zEvent.code === "KeyP") {
        let selected = phrase_getSelectionText();
        if (isValidChromeRuntime())
            SendSafeRuntimeMessage({ text: "SAVEPHRASE", data: selected }); //save selected data in phrase table
    }

    //commented out 10/12/23 because sometimes this thing just happens when it shouldn't
    //if (zEvent.altKey && zEvent.code === "KeyA") {
    //    let activeElTagName = document.activeElement ? document.activeElement.tagName.toLowerCase() : null;
    //    //console.log(activeElTagName);
    //    if (activeElTagName != "textarea") // only looks at types we know about (chat input, task comment areas)
    //        return;
    //    if (isValidChromeRuntime())
    //        SendSafeRuntimeMessage({ text: "SHOWMENUP" }); //send message to get phrases again
    //}
    else if (zEvent.ctrlKey == false && zEvent.altKey == false && zEvent.code != "AltLeft" && zEvent.code != "AltRight") { // all else - do we have a matching phrase
        if (s_phraseArray.length == 1 && s_phraseArray[0].Phrase == "no data yet")
            return;
        if (s_optSentence || doIt()) { //800 mills has past since the last time we did
            if (zEvent.key == " ")
                cleanUp();
            let activeElTagName = document.activeElement ? document.activeElement.tagName.toLowerCase() : null;
            //console.log(activeElTagName);
            if (activeElTagName == "textarea"/* || activeElTagName == "input"*/) { // only looks at types we know about (chat input, task comment areas)
                //cursorLoc = document.activeElement.selectionStart;
                let newp = findStr(document.activeElement.value);
                 if (newp.length > 0)
                     showCMenu(newp, document.activeElement);
                else {
                    // console.log("removing before nothing to show in C");
                    cleanUp();
                }
            }
        }
    }
    //else
    //    cleanUp();
}

//this one just waits for the tab then removes itself

/**
 * Return the first data row in the phrases table.
 *
 * @param {Object} tbl
 * @returns {*}
 */
function getFirstRow(tbl) {
    if (tbl.rows.length > 0) {
        return tbl.rows[0];
    }
    else
        return null;
}

/**
 * Handle Tab key press inside the phrase input to trigger autocomplete.
 *
 * @param {Object} zEvent
 */
function phrasesTab(zEvent) {
    //console.log("phrases tab key down called", zEvent.keyCode);

    if (zEvent.keyCode == 9) {
        event.preventDefault(); // prevent other handlers from being called
        //tab over to top of phrases table
        let tbl = document.getElementById("phrasestbl");
        if (tbl != null) {
            //get first child
            let row = getFirstRow(tbl);
            if (row != null)
                row.classList.add("green");
            row.focus();
            //remove myself
            document.removeEventListener("keydown", phrasesTab);
            //install other one
            document.addEventListener("keydown", phrasesDownEnterTab);
        }
    }
}

//process down arrow and enter in phrases table

/**
 * Handle Down/Enter/Tab navigation within the phrase suggestion menu.
 *
 * @param {Object} zEvent
 */
function phrasesDownEnterTab(zEvent) {
    //let thisone = document.activeElement;
    //console.log("phrases key down called", zEvent.keyCode);
    if (zEvent.keyCode == 40 || zEvent.keyCode == 9) {
        event.preventDefault(); // prevent other handlers from being called
        //console.log("down arrow or tab detected");
        let tbl = document.getElementById("phrasestbl");
        if (tbl != null) {
            //get first child
            let row = document.getElementsByClassName("green");
            if (row.length == 1) {
                let saveIt = row[0];
                let nextOne = saveIt.nextSibling;
                //console.log("0", saveIt, nextOne);
                saveIt.classList.remove("green");
                if (nextOne != null) {
                    //console.log("1", saveIt, nextOne)
                    nextOne.classList.add("green");
                    //console.log("2", saveIt, nextOne);
                    nextOne.focus();
                }
                else {
                    let row = getFirstRow(tbl);
                    if (row != null)
                        row.classList.add("green");
                    //row = $("#phrasestbl tr:first"); //fixed this
                    //if (row.length > 0)
                    //    row[0].classList.add("green");
                }
            }
        }
    }
    //up key
    if (zEvent.keyCode == 38) {
        event.preventDefault(); // prevent other handlers from being called
        //console.log("down arrow or tab detected");
        let tbl = document.getElementById("phrasestbl");
        if (tbl != null) {
            //get first child
            let row = document.getElementsByClassName("green");
            if (row.length == 1) {
                let saveIt = row[0];
                let nextOne = saveIt.previousSibling;
                if (nextOne != null) {
                    //console.log("0", saveIt, nextOne);
                    saveIt.classList.remove("green");
                    //console.log("1", saveIt, nextOne)
                    nextOne.classList.add("green");
                    //console.log("2", saveIt, nextOne);
                    nextOne.focus();
                }
            }
        }
    }
    if (zEvent.keyCode == 13) {
        //console.log("enter detected");
        event.preventDefault(); // prevent other handlers from being called
        //select this one
        let tbl = document.getElementById("phrasestbl");
        if (tbl != null) {
            //get first child
            let row = document.getElementsByClassName("green");
            if (row.length == 1) {
                let child = row[0].childNodes;
                for(let i = 0; i < child.length; i++) {
                    if (child[i].className == "phtd") {
                        processcliClick(child[i].textContent);
                    }
                }
            }
        }
    }
}

/**
 * Remove the phrase suggestion menu from the DOM.
 */
function cleanUp() {
    document.removeEventListener("keydown", phrasesDownEnterTab);
    document.removeEventListener("keydown", phrasesTab);
    //console.log("clean up called");
    //$("#phrases-menu").remove(); // fixed this
    let div = document.getElementById("phrases-menu");
    if (div != null)
        div.parentElement.removeChild(div);
}



/**
 * Build and render the phrase table rows from the phrase data array.
 *
 * @param {Object} phar
 * @returns {*}
 */
function buildPhrases(phar) {
    let phraseStr = "";
    for(let i = 0; i < phar.length; i++) {
        let classxx = '<tr tabindex="' + (i + 1) + '"><input type="hidden" class="placehold"/><td class="phtd">';
        if (phar[i].Phrase == blankLinePad) {
            classxx = '<tr><td>';
        }
        let next = classxx + phar[i].Phrase + "</td></tr>";
        phraseStr += next;
        let tStr = phar[i].Phrase;
        if (tStr.length > longestStr.length)
            longestStr = phar[i].Phrase;
    }
    return phraseStr;
}


//function hoverCallback(ev) {
//    if (ev.type == "mouseenter") {
//        $(ev.target).addClass("green");  
//    }        //console.log("removing class green");
//    $(ev.target).removeClass("green");  
//}


/**
 * Return the pixel width of the phrase menu panel.
 * @returns {*}
 */
function getWidth() {
    let calWidth = 300;
    //$("#phrases-menu").append('<p id="myp">' + longestStr + '</p>');
    //calWidth = $("#myp").width();
    //$("myp").remove();
    return calWidth + 20;
}

/**
 * Handle a click on a phrase table row to select or expand it.
 *
 * @param {Object} ev
 */
function phrases_liClick(ev) {
    if (ev.target.parentElement.className == "green")
        ev.target.parentElement.className = null;
    else
        ev.target.parentElement.className = "green";
}

/**
 * Delete the selected phrase entry and refresh the phrase list.
 *
 * @param {Object} ev
 */
function deletePhrase(ev) {
    let row = document.getElementsByClassName("green");
    for(let i = 0; i < row.length; i++) {
        let child = row[i].childNodes;
        if (child.length == 1 && isValidChromeRuntime())
            SendSafeRuntimeMessage({ text: "DELETEPHRASE", data: child[0].textContent });
    }
    cleanUp();
}

/**
 * Process a CLI shortcut click event.
 *
 * @param {string} selectedText
 */
function processcliClick(selectedText) {
    let baseStr = where2paste.value;
    let strings = baseStr.split(" ");
    let strings2Match = buildMatches(strings);
    let selectedTextc = selectedText.toUpperCase();

    //these matches are built starting at the end of the string. (cursor pos)
    //find first one that matches when we are inserting
    for(let x = 0; x < strings2Match.length; x++) {
        let thisUpper = strings2Match[strings2Match.length - (x + 1)].toUpperCase();
        let where = selectedTextc.indexOf(thisUpper);
        if (where != -1) {
            //we found a match
            let tbComp = baseStr.toUpperCase();
            let w = tbComp.lastIndexOf(thisUpper);
            if (w > -1) {
                let s = baseStr.substring(0, w);
                baseStr = s + selectedText;
            }
            break;
        }
    }


    //strings = baseStr.split(".");
    //strings[strings.length - 1] = selectedText;
    ////put it back together
    //let newStr = "";
    //for(let i = 0; i < strings.length; i++) {
    //    if (i > 0)
    //        newStr = newStr + '. ';
    //    newStr = newStr + strings[i];
    //}
    where2paste.value = baseStr;
    //console.log("removing before paste C");
    cleanUp();
    //$(where2paste).focus(); //fixed this
    where2paste.focus();
    //$(document.activeElement).trigger("change");
    let event = new Event('change', { bubbles: true });
    where2paste.dispatchEvent(event);
    if (isValidChromeRuntime())
        SendSafeRuntimeMessage({ text: "MOVEPH2TOP", data: selectedText });
}

/**
 * Handle a click on a CLI shortcut button.
 *
 * @param {Object} ev
 */
function cliClick(ev) {
    let selectedText = ev.target.innerText;
    processcliClick(selectedText);
}

/**
 * Build and display the right-click context menu for the phrase list.
 *
 * @param {Object} ev
 */
function myContext(ev) {
    let nodeName = ev.target.nodeName.toLowerCase();
    let message = JSON.stringify(ev);
    if (isValidChromeRuntime())
        SendSafeRuntimeMessage({ text: "SENDLOG", who: "Phrases", messageLog: message });
    if (ev.target.nodeType == 1 && (nodeName == "textarea" ||
        (nodeName == "input" && /^(?:text|email|number|search|tel|url|password)$/i.test(ev.type)))) {
        saveEl = ev.target;
    }
}

//document.addEventListener("contextmenu", myContext);
//request.phraseobj - where they clicked
//request.phrases - array of suggested  phrases

/**
 * Build the list of phrase suggestions matching the current input text.
 *
 * @param {string} inStrings
 * @returns {Array}
 */
function buildMatches(inStrings) {
    let newStrings = new Array();
    let ts = "";
    for(let i = 0; i < inStrings.length; i++) {
        ts = inStrings[inStrings.length - (1 + i)] + " " + ts;
        ts = ts.trim();
        newStrings.push(ts);
    }
    return newStrings;
}

/**
 * Return the portion of the input string relevant for phrase matching.
 *
 * @param {string} inStr
 * @returns {Array}
 */
function wordfindStr(inStr) {
    let strings = inStr.split(" ");
    let newMatches = new Array();
    let strings2Match = buildMatches(strings);

    for(let x = 0; x < strings2Match.length; x++) {
        let str2examine = strings2Match[x].toUpperCase();
        if (str2examine.length > 0) {
            for(let i = 0; i < s_phraseArray.length; i++) {
                let tS = s_phraseArray[i].Phrase.toUpperCase();
                let tStr = tS.trim();
                if (tStr.indexOf(str2examine) == 0 && tStr != str2examine) {
                    newMatches.push({ Phrase: s_phraseArray[i].Phrase });
                }
            }
        }
    }

    //remove dups from newMatches
    return newMatches;
}

/**
 * Return the last word or token from an input string.
 *
 * @param {string} inStr
 * @returns {*}
 */
function findLastPiece(inStr) {
    // find the last occerance of "," or "." or "-"
    let lastPiece = inStr;
    let c = inStr.lastIndexOf(",");
    let d = inStr.lastIndexOf("-");
    let p = inStr.lastIndexOf(".");
    let o = inStr.lastIndexOf(":");
    let q = inStr.lastIndexOf(";");


    if (c == -1 && d == -1 && p == -1 && o == -1 && q == -1)
        return inStr;

    let max = Math.max(c, d, p, o, q);
    lastPiece = inStr.substring(max + 1);
    return lastPiece;
}



/**
 * Search for a phrase match starting at a given string offset.
 *
 * @param {string} inStr
 * @returns {Array}
 */
function findStr(inStr) {
    if (s_optSentence == false)
        return wordfindStr(inStr); //testing

    let strings = inStr.split(".");
    let newMatches = new Array();
    //let str2examineN = strings[strings.length - 1].toUpperCase();
    str2examineN = findLastPiece(inStr).toUpperCase();
    //now skip to first non " " character
    let testiT = str2examineN.trim();
    if (testiT == "")
        return newMatches; //which is empty
    let z = 0;
    for(; z < str2examineN.length; z++) {
        if (str2examineN[z] != " ")
            break;
    }

    str2examine = str2examineN.substr(z);

    //str2examine = str2examine.trim();
    if (str2examine.length > 0) {
        //console.log("going to look at", str2examine);
        for(let i = 0; i < s_phraseArray.length; i++) {
            if (s_phraseArray[i].Phrase.length > 0) {
                let tS = s_phraseArray[i].Phrase.toUpperCase();
                let tStr = tS.trim();
                if (tStr.indexOf(str2examine) == 0 && tStr != str2examine) {
                    newMatches.push({ Phrase: s_phraseArray[i].Phrase });
                }
            }
        }
    }
    return newMatches;
}


/**
 * Construct the full phrases popup table and inject it into the page.
 *
 * @param {Object} phrases
 * @param {Object} edit
 */
function buildPhrasesTable(phrases, edit) {

    let phraseStr = buildPhrases(phrases);

    if (saveEl == null)
        //create element
        where2paste = document.activeElement;
    else {
        where2paste = saveEl;
    }
    saveEl = null;
    let div = document.getElementById("phrases-menu");
    if (div != null)
        div.parentElement.removeChild(div);
    createDivAndTable("phrases-menu", phrases, edit);
    //$('body').append(divStr); //fix this
    let close = document.getElementById("closephrase");
    close.addEventListener("click", function () { cleanUp() });


    let tbl = document.getElementById("phrasestbl");
    let newHeight = tbl.offsetHeight > 250 ? 350 : tbl.offsetHeight + 100; //fixed this
    if (!edit) //don't need room for title 
        newHeight -= 50;  
    div = document.getElementById("phrases-menu");
    div.style.height = newHeight.toString() + "px";
    //console.log(div.style.top);
    //div.offsetHeight = newHeight; //fixed this
    //position left
    //Element.getBoundingClientRect() - use this? 
    // rect is a DOMRect object with eight properties: left, top, right, bottom, x, y, width, height
    let rect = where2paste.getBoundingClientRect();
    let tposLeft = rect.left + window.pageXOffset;
    let tposTop = rect.top + window.pageYOffset;


    //let position = $(where2paste).offset(); //fix this
    let widths = where2paste.clientWidth
    //widths = $(where2paste).width(); //fix this
    //let winWidth = $(window).width(); //fix this
    winWidth = window.innerWidth;
    let newLeft = tposLeft + (widths / 2);
    if (newLeft > (winWidth - 350))
        newLeft = winWidth - 350;
    //position.left += (widths / 2);
    //if (position.left > (winWidth - 350))
    //    position.left = winWidth - 350;
    // get the smaller number boundrect top or position top.
    let newPos = where2paste.getBoundingClientRect();
    let rounded = Math.round(newPos.top);
    //console.log("where2paste top " + rounded); // this is in relation to the viewport
    let offset = tposTop - (div.offsetHeight + 20);
    if ((rounded - (div.offsetHeight + 20)) < 0) //it needs to go below
        offset = tposTop + ((where2paste.offsetHeight / 2) > 0 ? (where2paste.offsetHeight / 2) : where2paste.offsetHeight);
    // console.log("top is " + tposTop + " making it " + offset);
    //console.log(newPos);
    //let num2lookat = position.top < rounded ? position.top : rounded;
    //num2lookat = tposTop < rounded ? tposTop : rounded;
    //offset = num2lookat < div.offsetHeight ? tposTop + div.offsetHeight : div.offsetHeight + 20;
    //offset = num2lookat < $("#phrases-menu").outerHeight() ? position.top + $("#phrases-menu").outerHeight() : position.top - $("#phrases-menu").outerHeight(); //fix this

    //position.top = offset;
    //position.left = newLeft;
    tposTop = offset;
    offset += 10; //added 9/20/23
    div.style.position = "absolute";
    div.style.top = offset.toString() + "px";
    div.style.left = newLeft.toString() + "px";
  //  console.log(div.style, offset, tposTop);
    //$("#phrases-menu").offset(position); //fix this

    //get a width that makes sense
    widths = getWidth(); // min is 300
    div.style.width = widths.toString() + "px";

    //$("#phrases-menu").width(widths < 300 ? 300 : widths); //fix this
    //$(".phtd").hover(hoverCallback); //fixed this by commenting out this line - I don't really need this

}
/**
 * Return the current mouse cursor position as {x, y}.
 * @returns {*}
 */
function getMousePos() {
    let nodes = document.querySelectorAll(":hover");
    //console.log("nodes", nodes);
    if (nodes.length > 0)
        return nodes[nodes.length - 1];
    else
        return null;
}

let curDisplay = null;

/**
 * Handle mouseout events to hide the phrase hover tooltip.
 *
 * @param {Object} el
 */
function mouseOut(el) {
    //wait a sec and see where they are
    //if they are either back here or in the phrases menu,ok, if not hide it
    setTimeout(function () {
        let mousePos = getMousePos();
        //console.log("target", el.target);
        //console.log("mousePos", mousePos);

        //add 20% slop
        let phraseDiv = document.getElementById("phrases-menu");
        let phraseTbl = document.getElementById("phrasetbl");
        if (mousePos != phraseTbl && mousePos != phraseDiv && mousePos != el.target) {
            //console.log(mousePos.closest("#phrases-menu"));
            //let eLeft = (el.target.getBoundingClientRect().left) + 20;
            //let eRight = (el.target.getBoundingClientRect().right) + 20;
            //let mouseLeft = mousePos.getBoundingClientRect().left;
            //let mouseRight = mousePos.getBoundingClientRect().right;
            //let eTop = (el.target.getBoundingClientRect().top) + 20;
            //let eBot = (el.target.getBoundingClientRect().bottom) + 20;
            //let mouseTop = (mousePos.getBoundingClientRect().top) + 20;
            //let mouseBot = (mousePos.getBoundingClientRect().bottom) + 20;

            //console.log("target", el.target);
            //console.log("targetleft", eLeft);
            //console.log("targetright", eRight);
            //console.log("targettop", eTop);
            //console.log("targetbot", eBot);
            //console.log("mouseTop", mouseTop);
            //console.log("mouseBotbot", mouseBot);

            //console.log("mouseleft", mouseLeft);
            //console.log("mouseright", mouseRight);
            //if (mouseLeft > eLeft && mouseRight > eRight)
            if (mousePos.closest("#phrases-menu") == null)
                $("#phrases-menu").hide();
        }
    }, 6000);
}
//this is the one for input area typing
/**
 * Show the context menu at the current mouse position.
 *
 * @param {Object} phrases
 * @param {boolean} activeEl
 */
function showCMenu(phrases,activeEl) {
    if (phrases == curDisplay)
        return;
    curDisplay = phrases;
    //console.log("activeEl", activeEl);

    buildPhrasesTable(phrases, false);
    document.addEventListener("keydown", phrasesTab);
    let curEl = document.activeElement;
    let phraseDiv = document.getElementById("phrases-menu");

    curEl.addEventListener("mouseout", mouseOut, false);
    phraseDiv.addEventListener("mouseout", mouseOut, false);

    //$(".phtd").click(cliClick); //fixed this
    let phtdClass = document.getElementsByClassName("phtd");
    if (phtdClass != null) {
        for(let i = 0; i < phtdClass.length; i++) {
            phtdClass[i].addEventListener('click', cliClick, false);
        }
    }

}

/**
 * Show the phrase suggestion menu positioned near the input caret.
 *
 * @param {Object} phrases
 */
function showMenu(phrases) {
    buildPhrasesTable(phrases, true);
    //$(".phtd").click(liClick); //fixed this
    let phtdClass = document.getElementsByClassName("phtd");
    if (phtdClass != null) {
        for(let i = 0; i < phtdClass.length; i++) {
            phtdClass[i].addEventListener('click', liClick, false);
        }
    }

    //$("#deleteph").click(deletePhrase); //fixed this
    let deleteBut = document.getElementById("deleteph");
    deleteBut.addEventListener('click', deletePhrase, false);
}

/**
 * Create and return the phrase menu container div and inner table.
 *
 * @param {string} divStr
 * @param {string} rowStrs
 * @param {Object} edit
 * @returns {number}
 */
function createDivAndTable(divStr, rowStrs, edit) {
    let numStr;
    //create DIV
    let div = document.createElement('div');
    div.setAttribute("id", divStr);
    document.body.appendChild(div);
    //div.addEventListener("mouseout", cleanUp, false);

    //Add close box
    let btn = document.createElement("BUTTON");
    btn.setAttribute("id", "closephrase");
    btn.setAttribute("class", "Submit");
    let tNode = document.createTextNode("X");
    btn.appendChild(tNode);
    div.appendChild(btn);
    //Add title P if edit
    if (edit) {
        tNode = document.createTextNode("Click on Phrase to Toggle Selection");
        let para = document.createElement("P");
        para.appendChild(tNode);
        div.appendChild(para);
        para.style["font-weight"] = "bold";
    }
    //create table
    let tbl = document.createElement("TABLE");
    tbl.setAttribute("id", "phrasestbl");
    let tblBody = document.createElement("tbody");
    tbl.appendChild(tblBody);
    div.appendChild(tbl);
    //Add delete but if edit
    if (edit) {
        let para = document.createElement("P");
        btn = document.createElement("BUTTON");
        btn.setAttribute("id", "deleteph");
        btn.setAttribute("class", "Submit");
        let tNode = document.createTextNode("Delete Selected");
        btn.appendChild(tNode);
        para.appendChild(btn);
        div.appendChild(para);
        //sort rowStrs
        let rows = rowStrs.sort(function sortFunction(a, b) {
            let compa = a.Phrase.trim();
            let compb = b.Phrase.trim();
            if (compa.toLowerCase() == compb.toLowerCase())
                return 0;
            if (compa.toLowerCase() > compb.toLowerCase())
                return 1;
            if (compa.toLowerCase() < compb.toLowerCase())
                return -1;
        });
        rowStrs = rows;
    }
    else {
        let mode = s_optSentence == true ? "Sentence Mode Active" : "Word Mode Active";
        tNode = document.createTextNode("(Select text and alt-p to add to new phrases to this table) " + mode);
        let para = document.createElement("P");
        para.appendChild(tNode);
        div.appendChild(para);
        para.style["font-weight"] = "bold";
    }
    //Add rows to table
    //'<tr tabindex="' + (i + 1) + '"><input type="hidden" class="placehold"/><td class="phtd">';
    for(let i = 0; i < rowStrs.length; i++) {
        let num = i + 1;
        numStr = num.toString();
        let row = document.createElement("tr");
        row.setAttribute("tabindex", numStr);
        let cell = document.createElement("td");
        cell.setAttribute("class", "phtd");
        let cellText = document.createTextNode(rowStrs[i].Phrase);
        cell.appendChild(cellText);
        row.appendChild(cell);
        tblBody.appendChild(row);
    }
}



// these functions are not being used atm
    //let butStr = "";
    //if (edit) {
    //    phraseStr = '<p id="titlePhrases">Click on a phrase to toggle selection for delete<p>' + phraseStr;
    //    butStr = '<br><button class="Submit" type ="button" id ="deleteph">Delete Selected</button>';

    //}

    //let divStr = '<div id="phrases-menu"><button class="Submit" type="button" id="closephrase">X</button><table id="phrasestbl"><tbody>' +
    //    phraseStr + '</tbody></table>' + butStr + "</div>";

    //if ($("#phrases-menu").length == 0) { //fixed this
