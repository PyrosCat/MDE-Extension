let oldStringWord = "";
let insertedCorrection = "";
let spellArray = null;


/**
 * Create and return the spell-correction suggestion popup element.
 *
 * @param {string} inStr
 * @param {Object} el
 * @returns {*}
 */
function replaceCombos(inStr, el) {
    //if (testp == false)
    //	return inStr; //this one is broke for now (difficult becomes different blah blah)
    let place = 0;
    let newStr = inStr;
    if (inStr == null || inStr == "")
        return inStr;
    for(let i = 0; i < spellArray.length; i++) {
        if ((place = inStr.indexOf(spellArray[i].old)) != -1) {
            // check that spellArray[i].old is 2 words at least
            let t1 = spellArray[i].old.split(" ");
            if (t1.length > 1) {
                if ((place == 0 || notChar(inStr.charAt(place - 1)))) {
                    //passed test that we are the begining of a "word"
                    //now test if we are the end
                    let tStr = inStr.substring(place);
                    if (((place + spellArray[i].old.length) == inStr.length) || notChar(inStr.charAt(place + spellArray[i].old.length))) {
                        if (spellArray[i].new.length == 0)
                            break;
                        newStr = inStr.replace(spellArray[i].old, spellArray[i].new);
                        let newPlace = place + spellArray[i].new.length + 1;
                        el.value = newStr;
                        el.selectionStart = newPlace;
                        el.selectionEnd = newPlace;
                        break;
                    }
                }
            }
        }

    }
    return newStr;
}

//in input handler. Old string was dog hous0  New string is dog house  correction was the word house
/**
 * Input event listener that triggers spell-correction checking.
 *
 * @param {Object} e
 */
function inputListen(e) {
    let valStr = "";
    if (e.inputType == 'insertReplacementText') {
        processCorrection(oldStringWord, e.target.value, insertedCorrection);
    }
}

/**
 * beforeinput event listener that captures pre-edit text state.
 *
 * @param {Object} e
 */
function beforeInputListen(e) {
    let valStr = "";
    //console.log("beforeinput listen " + e.inputType);
    if (e.inputType == 'insertReplacementText') {
        //console.log("beforeinput. Changing" + e.target.value + " to " + e.data);
        oldStringWord = window.getSelection().toString();
        insertedCorrection = e.data;
    }
}

//compare 2 strings - we have the new word - so pick up the old word.
/**
 * Apply a spell correction to the current input value.
 *
 * @param {*} oldWord
 * @param {string} stringNew
 * @param {Object} newWord
 */
function processCorrection(oldWord, stringNew, newWord) {

    let strippedOld = stripTrailingPunc(oldWord);
    let strippedNew = stripTrailingPunc(newWord);

    let thisObj = { old: strippedOld, new: strippedNew };
    saveSpell(thisObj, true);

}

/**
 * Re-assemble text around a correction insertion point.
 *
 * @param {Array} wordArray
 * @param {Object} pasteChar
 * @returns {*}
 */
function pasteTogether(wordArray, pasteChar) {
    let newStr = "";
    if (wordArray.length == 1) {
        newStr = wordArray[0];
        if (pasteChar == " ")
            newStr += " ";
    }
    else {
        for(let i = 0; i < wordArray.length; i++) {
            if (wordArray[i].length > 0)
                newStr += wordArray[i];
            if (i < (wordArray.length - 1)) //we aren't on the last word in the string yet
                newStr += " ";
            else // we are on the last word
                if (pasteChar == " ")
                    //only add the space if its what kick off the check (because we trimmed it). If it was anything else - we don't need to add a space
                    newStr += " ";
        }
    }
    return newStr;
}

let lastWord = { el: null, where: 0, word: "" };

/**
 * Search the spell list for a match to the current input token.
 *
 * @param {Object} el
 * @param {string} inStr
 * @param {*} lw
 * @param {*} pos
 * @returns {*}
 */
function findinSpell(el, inStr, lw, pos) {
    let str = inStr.trim();
    let words = str.split(" ");
    if (words.length > 0 && spellArray != null) {
        let oldWord = words[words.length - 1];
        //strip any non characters (".", "-", ';', etc)
        let tc = oldWord.charAt(oldWord.length - 1);
        let pasteChar = " ";
        if (!isChar(tc)) {
            pasteChar = tc;
            oldWord = oldWord.substring(0, oldWord.length - 1);
        }

        //let cOldword = stripTrailingPunc(oldWord);
        if (oldWord == "")
            return inStr;
        cOldword = oldWord;
        for(let i = 0; i < spellArray.length; i++) {
            if (spellArray[i].old.length > 0 && cOldword == spellArray[i].old) {
                //found it replace it
                if (cOldword == lastWord.word) {
                    //console.log("before further check", lastWord, cOldword, pos);
                    if (pos == lastWord.where && lastWord.el == el)
                        break;
                }
                if (spellArray[i].new != null && spellArray[i].new.length > 0) {
                    let tWord = words[words.length - 1];
                    words[words.length - 1] = tWord.replace(cOldword, spellArray[i].new);
                    if (lw == true) {
                        lastWord.word = cOldword;
                        lastWord.where = pos;
                        lastWord.el = el;
                        //console.log("after substitute old word", lastWord);
                    }
                    let newStr = pasteTogether(words, pasteChar);
                    return newStr;
                }
            }
        }
    }
    return inStr;
}
/**
 * Return true if a keycode corresponds to a printable character.
 *
 * @param {string} str
 */
function isChar(str) {
    if (str.length == 1 && str.match(/[a-z]/i)) {
        return true;
    }

    if (str.length == 1 && str.match(/[0-9]/i))
        return true;

    return false;
}
/*
 *     background-color: white;
	color: red;
	height: 20px;
	width: 20px;
	font-weight: bold;
	padding: 0px !important;
	
 */


/**
 * Keydown handler that triggers spell correction on word-break keys.
 *
 * @param {Object} zEvent
 */
function keySpellDwn(zEvent) {
 //   let retCode = 0;
    //console.log("basic keypress got", zEvent.code,zEvent);
    if (zEvent.altKey && zEvent.code === "KeyN") {
        let useEl = zEvent.srcElement;
        let retObj = spell_getSelectionText();
        let selected = retObj.text;
        let addSpace = false;
        if (selected.length == 0) {
            alert("MDE:Select word to add to auto-correct, and then <alt>-n.")
            return;
        }
        let newSelected = selected.trim();
        if (newSelected.length != selected.length)
            addSpace = true;
        if (retObj.newEl != null) {
            useEl = retObj.newEl;
            let thisObj = { old: newSelected, new: "" };
            displayCorrection(thisObj, useEl, addSpace);
        }
    }

    if (zEvent.code == "Space" || notChar(zEvent.key)) {
        let place = getCaret(zEvent.target);
        let saveStr = zEvent.target.value;
        if (saveStr == null || saveStr == "")
            return;
        let newcStr = null;
        //if it is changed, new value is set in replacecombos because I also need to set cursor location
        //setting the value changes the cursor position.
        newcStr = replaceCombos(saveStr, zEvent.target);
        if (newcStr == saveStr) {
            if (place != saveStr.length) {
                let str1 = saveStr.substring(0, place);
                let str2 = saveStr.substring(place);
                let newStr = findinSpell(zEvent.target, str1, true, place);
                if (newStr != str1) {
                    let newPlace = newStr.length;
                    newStr += str2.trim();
                    if (saveStr.trim() != newStr) {
                        zEvent.target.value = newStr;
                        zEvent.target.selectionStart = newPlace;
                        zEvent.target.selectionEnd = newPlace;
                        //console.log("place before substitute " + place);
                        //console.log("newplace after substitute " + newPlace);
                    }
                }
                //set last word
            }
            else
                zEvent.target.value = findinSpell(zEvent.target, zEvent.target.value, true, place);
        }
    }
}

/**
 * Apply spell-correction activation options from stored settings.
 */
function internalactoptset() {
    document.removeEventListener("input", inputListen);
    document.removeEventListener("beforeinput", beforeInputListen);
    document.removeEventListener("keyup", keySpellDwn);
}

//main line
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    //console.log(request.text);
    if (request.text == 'ACOPTSET') {
        if (request.autocorrect == true) {
            //inp = document.getElementById("input");
            //if (inp != null) {
            document.addEventListener("input", inputListen);
            document.addEventListener("beforeinput", beforeInputListen);
            document.addEventListener("keyup", keySpellDwn);
        }
        else
            internalactoptset();
        return;
    }

    if (request.text == 'SPELLARRAY') {
        if (request.autocorrect == true) {
            spellArray = request.data;
        }
        return;
    }
});


/**
 * Save the current spell list to chrome.storage.
 *
 * @param {Object} obj
 * @param {Object} saveData
 */
function saveSpell(obj, saveData) {
    if (spellArray == null)
        spellArray = new Array();
    //if it's already in the DB - update it - dont save it
    spellArray = updateSpellA(spellArray, obj);
    if (saveData)
        if (isValidChromeRuntime())
            SendSafeRuntimeMessage({ text: "SAVESPELL", data: obj });
}

/**
 * Replace the selected text in an input element with a given string.
 *
 * @param {boolean} activeEl
 * @param {string} str
 */
function s_replaceSelectionText(activeEl,str) {
    let newStr = str;
    let activeElTagName = activeEl ? activeEl.tagName.toLowerCase() : null;
    if (
        (activeElTagName == "textarea") || (activeElTagName == "input" &&
            /^(?:text|search|password|tel|url)$/i.test(activeEl.type)) &&
        (typeof activeEl.selectionStart == "number")
    ) {
        let start = activeEl.selectionStart; // beg of what we are cutting out
        let len = activeEl.selectionEnd - activeEl.selectionStart; //how many chars are we cutting
        let work = activeEl.value;
        // cut it and put new one in
        let newStr = work.substring(0, start) + str + work.substring(start + len);
        activeEl.value = newStr;
    } 
    //else is do nothing, this isn't an element I can modify
}


/**
 * Return the currently selected text from the spell-target element.
 * @returns {Object}
 */
function spell_getSelectionText() {
    let text = "";
    let newEl = null;
    let activeEl = document.activeElement;
    let activeElTagName = activeEl ? activeEl.tagName.toLowerCase() : null;
    if (
        (activeElTagName == "textarea") || (activeElTagName == "input" &&
            /^(?:text|search|password|tel|url)$/i.test(activeEl.type)) &&
        (typeof activeEl.selectionStart == "number")
    ) {
        text = activeEl.value.slice(activeEl.selectionStart, activeEl.selectionEnd);
        //if (activeEl.parentElement != null)
        //    newEl = activeEl.parentElement; //4/6/23
        //else 
        newEl = activeEl;
        //} else if (window.getSelection()) {
    } else { 
        let r = window.getSelection();
        //console.log(r);
        if (r) {
            text = window.getSelection().toString();
            let selectEl = window.getSelection();
            newEl = selectEl.baseNode.parentElement;
        }
    }
    return {
        text: text, newEl: newEl
    };
}

let puncMarks = ['.', ',', '!', '?', '(', ')', ";", ":", "-", "="];

/**
 * Return true if a keycode is not a printable character.
 *
 * @param {*} c
 * @returns {boolean}
 */
function notChar(c) {

    if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9'))
        return false;
    else
        return true;

    //let t = puncMarks.find(function (cIn) {
    //    return cIn == c;
    //});
    //if (t != undefined)
    //    return true;
    //else
    //    return false;
}

/**
 * Strip trailing punctuation characters from a string.
 *
 * @param {Object} oldWord
 * @returns {*}
 */
function stripTrailingPunc(oldWord) {
    let newWord = oldWord;
    if (oldWord && oldWord.length > 0) {
        if (notChar(oldWord[oldWord.length - 1]))
            newWord = oldWord.substring(0, oldWord.length - 1);
    }
    return newWord;
}

//should return index into string of the word they just finished typing

/**
 * Return the caret position index in an input element.
 *
 * @param {Object} node
 * @returns {*}
 */
function getCaret(node) {
    if (node.selectionStart) {
        return node.selectionStart;
    } else if (!document.selection) {
        return 0;
    }

    let c = "\001",
        sel = document.selection.createRange(),
        dul = sel.duplicate(),
        len = 0;

    dul.moveToElementText(node);
    sel.text = c;
    len = dul.text.indexOf(c);
    sel.moveStart('character', -1);
    sel.text = "";
    return len;
}



/**
 * Show the spell-correction suggestion popup near the caret.
 *
 * @param {boolean} thisObj
 * @param {Object} el
 * @param {Object} addSpace
 */
function displayCorrection(thisObj,el, addSpace) {
    createPop();
    //let s_space = addSpace ? " " : "";
    let newD = document.getElementById("quickCorrect");
    if (newD) {
        positionQuickName(newD, el);
        let qnS = document.getElementById("quickName");
        if (qnS)
            qnS.textContent = thisObj.old;
        //$("#quickName").text(thisObj.old);
        let localEl = el;
        qnS = document.getElementById("quickNameS");
        qnS.addEventListener("click", function (event) {
            qnS = document.getElementById("quickNameNew");
            thisObj.new = qnS.value;
            //thisObj.new = $('#quickNameNew').val();
            if (thisObj.new.length > 0) {
                saveSpell(thisObj, true);
                //$(newD).remove();
                s_replaceSelectionText(localEl, thisObj.new + (addSpace ? " " : ""));
            }
            newD.parentElement.removeChild(newD);
        });
        qnS = document.getElementById("quickNameC");
        qnS.addEventListener("click", function (event) {
            //$(newD).remove();
            newD.parentElement.removeChild(newD);
        });
    }
    else
        console("error creating newword popup");
}

/**
 * Position the correction popup relative to the active input field.
 *
 * @param {Date} div
 * @param {Object} where2paste
 */
function positionQuickName(div, where2paste) {

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
    div.style.position = "absolute";
    div.style.top = offset.toString() + "px";
    div.style.left = newLeft.toString() + "px";
    //$("#phrases-menu").offset(position); //fix this

    //get a width that makes sense
    widths = getWidth(); // min is 300
    //div.style.width = widths.toString() + "px";
}
//let quickNameDivStr = '<div id="quickCorrect">' +
//    'Change: <strong><span id="quickName"></span ></strong><br>To : <input id="quickNameNew" type="text" size="25" title="Enter new spelling for this word."><br>' +
//    '<div><button class="smallbut" type="button" id="quickNameC" title="Cancel Add">Cancel</button>' +
//    '<button class="smallbut" type="button" id="quickNameS" title="Save">Save</button></div></div>';

let quickNameDivStrS =
    'Change: <strong><span id="quickName"></span ></strong><br>To : <input id="quickNameNew" type="text" size="15" title="Enter new spelling for this word."><br>' +
    '<div><button  type="button" id="quickNameS" title="Save">Save</button>' +
   '<button  type="button" id="quickNameC" title="Cancel Add">Cancel</button></div>';

/**
 * Create and return the spell-correction suggestion popup element.
 *
 * @param {string} oldName
 */
function createPop(oldName) {
    //$('body').append(quickNameDivStr);
    //create div
    let div = document.createElement('div');
    div.setAttribute("id", "quickCorrect");
    document.body.appendChild(div);
    div.innerHTML = quickNameDivStrS;
    div.style.zIndex = "2147483646";
    let save = document.getElementById("quickNameS");
    save.style.backgroundColor = "green";
    save.style.color = "white";

    ////set inital innerHTML
    //div.innerHTML = 'Change: <strong><span id="quickName"></span ></strong><br>';
    ////create text input area
    //let inp = document.createElement("INPUT");
    //inp.setAttribute("id", "quickNameNew");
    //inp.setAttribute("type", "text");
    //inp.setAttribute("size", "25");
    //inp.setAttribute("title", "Enter new spelling for this word.");
    //div.appendChild(inp);
    ////add br
    //let br2 = document.createElement("BR");
    //div.appendChild(br2);
    ////create cancel button
    //let btn = document.createElement("BUTTON");
    //btn.setAttribute("id", "quickNameC");
    //btn.setAttribute("class", "smallbut");
    //btn.setAttribute("title", "Cancel Add");
    //let tNode = document.createTextNode("Cancel");
    //btn.appendChild(tNode);
    //div.appendChild(btn);
    ////create Save button
    //btn = document.createElement("BUTTON");
    //btn.setAttribute("id", "quickNameS");
    //btn.setAttribute("class", "smallbut");
    //btn.setAttribute("title", "Save");
    //tNode = document.createTextNode("Save");
    //btn.appendChild(tNode);
    //div.appendChild(btn);
}

