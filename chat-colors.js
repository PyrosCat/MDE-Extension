/*
 * window.addEventListener("load", function() {
 *   let elements = document.getElementsByClassName("rainbowText");
 *   for (let i = 0; i < elements.length; i++) {
 *     generateRainbowText(elements[i]);
 *   }
 * });
 *
 * function generateRainbowText(element) {
 *   let text = element.innerText;
 *   element.innerHTML = "";
 *   for (let i = 0; i < text.length; i++) {
 *     let charElem = document.createElement("span");
 *     charElem.style.color = "hsl(" + (360 * i / text.length) + ",80%,50%)";
 *     charElem.innerHTML = text[i];
 *     element.appendChild(charElem);
 *   }
 * }
 */

let colorOption = { id: "", normal: "", custom: "" };
let myAlias = "none";

let colorOptions = [ //defined in background
    //{ id: "bColor", normal: "white", custom: null }, //page background
    //{ id: "fColor", normal: "black", custom: null }, //page foreground
    //{ id: "hbColor", normal: "orange", custom: null }, //MDE Alerts
    //{ id: "hfColor", normal: "blue", custom: null }, //hyperlinks foreground
    //{ id: "fbColor", normal: "#adc0d6", custom: null }, //footer background
    //{ id: "ffColor", normal: "black", custom: null }, //footer foreground
    //{ id: "paColor", normal: "#537c2e", custom: null }, //PA font color
    //{ id: "aaColor", normal: "#c40707", custom: null }, //admin font color
    //{ id: "oaColor", normal: "#6e6e6e", custom: null }, //grey font color (actually - all others)
    //{ id: "ibColor", normal: "white", custom: null }, //input background
    //{ id: "ifColor", normal: "black", custom: null }, //input foreground
    //{ id: "pafColor", normal: "#adc0d6", custom: null }, //posts alt background
    //{ id: "pabColor", normal: "black", custom: null }, //posts alt foreground not in use
    //{ id: "pfColor", normal: "black", custom: null }, //posts foreground
    //{ id: "pbColor", normal: "#eaf3fd", custom: null }, //posts background
    //{ id: "ubColor", normal: "white", custom: null }, //user table background
    //{ id: "ufColor", normal: "black", custom: null }, //user table foreground
    //{ id: "clbColor", normal: "white", custom: null }, //channel list background
    //{ id: "clfColor", normal: "black", custom: null }, //channel list foreground
    //{ id: "filbColor", normal: "white", custom: null }, //filter background
    //{ id: "filfColor", normal: "black", custom: null }, //filter foreground
    //{ id: "mColor", normal: "", custom: null } //my Name Color
];


/**
 * Return the highlight color for a keyword-alert chat message.
 * @returns {*}
 */
function getAlertColor() {
    let one2change = colorOptions.findIndex(x => x.id == "hbColor");
    if (one2change > -1) {
        return colorOptions[one2change].custom != null ? colorOptions[one2change].custom : colorOptions[one2change].normal;
    }
    console.log("this is odd");
    return "orange";
}

let somethingChanged = false;
let revert2Default = false;

/**
 * Return the color value for a given color option key.
 *
 * @param {string} optId
 * @param {Object} element
 * @param {*} fb
 */
function getColorbyOption(optId, element, fb) {
    colorOption = colorOptions.find(function (el) {
        if (el.id == optId) {
            if (el.custom != null) {
                if (element != null) {
                    if (fb == 'b')
                        element.style.backgroundColor = el.custom;
                    else if (fb == 'f')
                        element.style.color = el.custom;
                    else if (fb == 'B')
                        element.style.background = el.custom;
                    else if (fb == 'c')
                        element.style.caretColor = el.custom;
                    else if (fb == 'ab') {
                        //let colorsA = getRGB(el.custom);
                        //if (colorsA) {
                        //    if (parseInt(colorsA.red) < 235)
                        //        colorsA.red = parseInt(colorsA.red) + 20;
                        //    else
                        //        colorsA.red = parseInt(colorsA.red) - 20;
                        //    if (parseInt(colorsA.green) < 235)
                        //        colorsA.green = parseInt(colorsA.green) + 20;
                        //    else
                        //        colorsA.green = parseInt(colorsA.green) - 20;
                        //    if (parseInt(colorsA.blue) < 235)
                        //        colorsA.blue = parseInt(colorsA.blue) + 20;
                        //    else
                        //        colorsA.blue = parseInt(colorsA.blue) - 20;
                        element.style.background = lighten(el.custom, 20);
                    }
                    somethingChanged = true;
                    return;
                }
            }
        }
    });
}


/**
 * Apply the configured color scheme to a single chat message row.
 */
function apply() {

    // get all the elements
    //let allElements = $("*");
    somethingChanged = false;

    //set background of page
    getColorbyOption("bColor", document.body, 'b');

    //set headers
    getColorbyOption("bColor", $("#header")[0], "b");
    getColorbyOption("fColor", $("#header")[0], "f");
    //t[0].children[2].style.color = "green" //link

    //set channel-list
    getColorbyOption("bColor", $("#channel-list")[0], "b");
    getColorbyOption("fColor", $("#channel-list")[0], "f");

    //set filter
    getColorbyOption("bColor", $("#filter")[0], "b");
    getColorbyOption("fColor", $("#filter")[0], "f");
    getColorbyOption("fColor", $("#relates-filter")[0], "f");
    //set body foreground to filter color
    let one2change = colorOptions.findIndex(x => x.id == "fColor");
    if (one2change > -1 && colorOptions[one2change].custom != null) {
        $('#channels')[0].style.color = colorOptions[one2change].custom;
        $("#filters")[0].style.color = colorOptions[one2change].custom;
    }

    //set background of footer
    tId = $(".input-container");
    getColorbyOption("fbColor", tId[0], 'b');
    getColorbyOption("fColor", tId[0], 'f');


    //getColorbyOption("bColor", document.body, "b");
    getColorbyOption("ibColor", $("#input")[0], "b");
    getColorbyOption("ifColor", $("#input")[0], "f");
    getColorbyOption("ifColor", $("#input")[0], 'c');

    //getColorbyOption("fbColor", $(".input-container")[0], "b");
    //getColorbyOption("ffColor", $(".input-container")[0], "f");

    allElements = document.getElementsByClassName("message left");
    for(let i = 0; i < allElements.length; i++) {
        getColorbyOption("pfColor", allElements[i], 'f');
    }

    //posts background
    allElements = document.getElementsByClassName("message left");
    for(let i = 0; i < allElements.length; i++) {
        if ($(allElements[i].parentElement.parentElement).hasClass("alt")) //postr text alt
            getColorbyOption("pbColor", allElements[i].parentElement, "ab");
        else
            getColorbyOption("pbColor", allElements[i].parentElement, "b");
        if (allElements[i].children != undefined && allElements[i].children.length > 0) {
            $(allElements[i]).unbind('mouseenter mouseleave');
            $(allElements[i]).hover(messageHover);
        }

    }

    //upvotes
    allElements = document.getElementsByClassName("upvote-count");
    for(let i = 0; i < allElements.length; i++)
        getColorbyOption("pfColor", allElements[i], "f");

    //time stamp
    allElements = document.getElementsByClassName("m-time");
    for(let i = 0; i < allElements.length; i++)
        getColorbyOption("pfColor", allElements[i], "f");

    //ignore
    allElements = document.getElementsByClassName("m-time");
    for(let i = 0; i < allElements.length; i++)
        getColorbyOption("pfColor", allElements[i], "f");

    

    //names
    allElements = document.getElementsByClassName("inner-name");
    for(let i = 0; i < allElements.length; i++) {
        //if (allElements[i].style != undefined && allElements[i].style.color != undefined && allElements[i].style.color != "") {
        let thisName = allElements[i].children[0].title;
        let examineStr = thisName.split("Click to reply to ");
        if (examineStr.length == 2)
            thisName = examineStr[1].substring(0, examineStr[1].length - 1); //remove trailing "."
        else
            thisName = "";

        if ($(allElements[i].children[0]).hasClass("senior"))
            getColorbyOption("paColor", allElements[i].children[0], "f");
        else if ($(allElements[i].children[0]).hasClass("staff"))
            getColorbyOption("aaColor", allElements[i].children[0], "f");
        else
            getColorbyOption("oaColor", allElements[i].children[0], "f");
        if (thisName == myAlias)
            getColorbyOption("mColor", allElements[i].children[0], "f");

    }

    //users table
    tId = $(".ui-widget-header");
    getColorbyOption("ubColor", tId[0], "B");

    tId = $(".user-count");
    getColorbyOption("fColor", tId[0], "f");
    //add a check box here to hide everyone except this room
    g = $("#MDEHideUsers");
    if (g.length == 0) {
        //add a check box here to hide everyone except this room
        $(tId).before('<input type="checkbox" name="MDEHideUsers" id="MDEHideUsers"><span id="MDEHideUsersC">Show Yukon Users Only</span>');
        //set the inintal value
        $("#MDEHideUsers").prop('checked', s_yukonOnly);
        tId = $("#MDEHideUsersC");
        getColorbyOption("fColor", tId[0], "f");
        //if it changes - save the option
        $("#MDEHideUsers").change(function () {
            s_yukonOnly = $("#MDEHideUsers").is(":checked");
            SendSafeRuntimeMessage({ text: "UPDYUKONLY", yukonOnly: s_yukonOnly });
            if (s_yukonOnly)
                $(".MDEMyRoomHide").hide();
            else
                $(".MDEMyRoomHide").show();
        });
    }
    else {
        tId = $("#MDEHideUsersC");
        getColorbyOption("fColor", tId[0], "f");
    }


    tId = $("#users");

    getColorbyOption("ubColor", tId[0], "b");
    getColorbyOption("fColor", tId[0], "f");

    //user table tab headers
    getColorbyOption("fColor", tId[0].children[0].children[0].children[0], "f");
    getColorbyOption("fColor", tId[0].children[0].children[1].children[0], "f");
    getColorbyOption("ubColor", tId[0].children[0].children[1].children[0], "b"); //online
    getColorbyOption("ubColor", tId[0].children[0].children[0].children[0], "ab"); //active



    let table = tId[0].children[1].children[0]; // table active users
    let tds = $(table).find("THEAD > TR > Th");
    $(tds).each(function (el) {
        getColorbyOption("fColor", this, "f");
        getColorbyOption("ubColor", this, "ab");
    });

    table = tId[0].children[2].children[0]; // table online users
    tds = $(table).find("THEAD > TR > Th");
    $(tds).each(function (el) {
        getColorbyOption("fColor", this, "f");
        getColorbyOption("ubColor", this, "b");
    });

    processTableC();
    if (somethingChanged) {
        uninstallObserversC();
        installObserversC();
    //    let x = $("#channel-list option:selected").val();
    //    let divName = "channel_" + x;
    //    let div = document.getElementById(divName);
    //    div.addEventListener("DOMNodeInserted", colorMonitor, false);
    }

    //hyperlinks
    allElements = $(".message.left").find('a');
    $(allElements).each(function (el) {
        getColorbyOption("hfColor", this, "f");
    });

    if (revert2Default)
        if (isValidChromeRuntime())
            SendSafeRuntimeMessage({ text: "RELOADME" });
}

/**
 * Process all visible chat rows and apply color formatting.
 */
function processTableC() {
    let tId = $("#users");
    let table = tId[0].children[1].children[0]; // table active users
    getColorbyOption("ubColor", table, "ab");

    //let trs = $(table).find("Tbody > TR");
    //$(trs).each(function (el) {
    //    getColorbyOption("ubColor", this, "ab"); //active users
    //});


    let tds = $(table).find("Tbody > TR > Td");
    $(tds).each(function (el) {
        if ($(this).hasClass("u-channel")) {
            getColorbyOption("fColor", this, "f");
            //if the channel is social add class to parent tr
            if (this.textContent == "Social" || this.textContent == "Yukon") {
                //life is good
            }
            else
                $(this).parent().addClass("MDEMyRoomHide");
        }
        else if ($(this).hasClass("u-name")) {
            if ($(this).hasClass("senior")) {
                if (this.children.length == 0) {
                    if (this.textContent.length > 0) {
                        let newName = externalNamelookup(this.textContent);
                        if (newName != this.textContent)
                            this.textContent = newName;
                    }
                    getColorbyOption("paColor", this, "f");
                }
                else {
                    let newName = externalNamelookup(this.children[0].textContent);
                    if (newName != this.children[0].textContent)
                        this.children[0].textContent = newName;
                    getColorbyOption("paColor", this.children[0], "f");
                }
            }
            else {
                if (this.children.length == 0) {
                    if (this.textContent.length > 0) {
                        let newName = externalNamelookup(this.textContent);
                        if (newName != this.textContent)
                            this.textContent = newName;
                    }
                    getColorbyOption("oaColor", this, "f");
                }
                else {
                    getColorbyOption("oaColor", this.children[0], "f");
                    //get nickname if available
                    let newName = externalNamelookup(this.children[0].textContent);
                    if (newName != this.children[0].textContent)
                        this.children[0].textContent = newName;
                }
            }
        }

        if (this.classList.length == 0) { //loc and silence(HAS ONE CHILD/IMAGE)
            if (this.children.length == 0)
                getColorbyOption("fColor", this, "f");
        }
    });

    // 
    table = tId[0].children[2].children[0]; // table online users
    //trs = $(table).find("Tbody > TR");
    //$(trs).each(function (el) {
    //    getColorbyOption("ubColor", this, "b"); //online users
    //});

    tds = $(table).find("Tbody > TR > Td");
    $(tds).each(function (el) {
        if ($(this).hasClass("u-channel")) {
            getColorbyOption("fColor", this, "f");
            //if the channel is social add class to parent tr
            if (this.textContent == "Social" || this.textContent == "Yukon") {
                //life is good
            }
            else
                $(this).parent().addClass("MDEMyRoomHide");

        }
        else if ($(this).hasClass("u-name")) {
            if ($(this).hasClass("senior")) {
                if (this.children.length == 0) {
                    if (this.textContent.length > 0) {
                        let newName = externalNamelookup(this.textContent);
                        if (newName != this.textContent)
                            this.textContent = newName;
                    }
                    getColorbyOption("paColor", this, "f");
                }
                else {
                    getColorbyOption("paColor", this.children[0], "f");
                    //get nickname if available
                    let newName = externalNamelookup(this.children[0].textContent);
                    if (newName != this.children[0].textContent)
                        this.children[0].textContent = newName;
                }
            }
            else {
                if (this.children.length == 0)
                    getColorbyOption("oaColor", this, "f");
                else {
                    getColorbyOption("oaColor", this.children[0], "f");
                    //get nickname if available
                    let newName = externalNamelookup(this.children[0].textContent);
                    if (newName != this.children[0].textContent)
                        this.children[0].textContent = newName;
                }
            }
        }

        if (this.classList.length == 0) { //loc and silence(HAS ONE CHILD/IMAGE)
            if (this.children.length == 0)
                getColorbyOption("fColor", this, "f");
        }
    });
    //get selected of MDEHideUsers
    if ($("#MDEHideUsers").is(":checked"))
        $(".MDEMyRoomHide").hide();
}



/**
 * MutationObserver callback that recolors new chat messages as they appear.
 *
 * @param {Object} td
 */
function colorMonitor(td) {

    //set to pfColor
    if (x.className == "upvote-count") {
        getColorbyOption("pfColor", x, 'f');
        return; // not for us - it's an upvote
    }

    //if ($(x).hasClass("user-count")) {
    //	processTable(true);
    //	return;
    //}

    // inner-name
    let tr = td.parentElement;
    x = $(tr).find(".m-time");
    if (x == null || x.length < 1)
        return null; // this TR - doesn't fit the expect format
    getColorbyOption("pfColor", x[0], "f");

    //Click to reply to Philip.F.037
    //x[0].children[0].title

    x = $(tr).find(".inner-name");

    let thisName = x[0].children[0].title;
    let examineStr = thisName.split("Click to reply to ");
    if (examineStr.length == 2)
        thisName = examineStr[1].substring(0, examineStr[1].length - 1); //remove trailing "."
    else
        thisName = "";


    if ($(x[0].children[0]).hasClass("senior"))
        getColorbyOption("paColor", x[0].children[0], "f");
    else if ($(x[0].children[0]).hasClass("staff"))
        getColorbyOption("aaColor", x[0].children[0], "f");
    else
        getColorbyOption("oaColor", x[0].children[0], "f");
    if (thisName == myAlias)
        getColorbyOption("mColor", x[0].children[0], "f");

    x = tr.getElementsByClassName("message left");
    if (x == null || x.length < 1)
        return null; // this TR - doesn't fit the expect format

    getColorbyOption("pfColor", x[0], 'f');
    //posts
    if ($(x[0].parentElement.parentElement).hasClass("alt"))
        getColorbyOption("pbColor", x[0].parentElement, 'ab');
    else
        getColorbyOption("pbColor", x[0].parentElement, 'b');

    //do this!
    if (x[0].children != undefined && x[0].children.length > 0) {
        //console.log(x[0].children[0].textContent);
        $(x[0]).hover(messageHover);
    }
    //}
    //do hyperlinks
    let aels = $(x).find('a');
    $(aels).each(function (el) {
        getColorbyOption("hfColor", this, "f");
    });

}




/**
 * Apply color settings to the full chat table on load.
 */
function colors() {
    //apply();
    turnDark(true);
}

/**
 * Initialize and display the color-picker UI for a color slot.
 */
function colorpicker() {
    //display colorpicker
    apply();
}

//main line code

let s_useOS = true;
let s_yukonOnly = false;

/**
 * Load saved color settings from storage and apply them to the chat.
 *
 * @param {Date} data
 * @param {Object} useOS
 * @param {boolean} yukonOnly
 */
function initColors(data, useOS, yukonOnly) {
    s_yukonOnly = yukonOnly;
    addColorPickerbutton();
    myAlias = getMyAlias();
    colorOptions = data;
    s_useOS = useOS;
    if (chatLoaded() == false) {
        //let div = document.getElementById("online-users");  // I don't want to monitor until page is loaded - this is done last
        installObserversColors();
    }
    else
        apply();
    return;
}

/**
 * Apply upvote highlight styling to a specific chat message.
 *
 * @param {Object} el
 */
function applyUpVote(el) {
    //upvote color
    getColorbyOption("pfColor", el, "f");
}

// 
/**
 * Install MutationObservers that trigger color processing on chat updates.
 */
function installObserversColors() {
    // select the target node
    //  configuration of the observer:
    let config = { subtree: true, characterData: true, childList: true };
    let target = document.querySelector('#online-users');

    // create an observer instance
    let observer = new MutationObserver(function (mutations) {
        apply();
        observer.disconnect();
    });


    // pass in the target node, as well as the observer options
    observer.observe(target, config);
}

let s_observerC = null;

/**
 * Install content-script MutationObservers for chat color monitoring.
 */
function installObserversC() {
    // select the target node
    let target = document.querySelector('.user-count');

    // create an observer instance
    let s_observerC = new MutationObserver(function (mutations) {
        // We need only first event and only new value of the title
        //console.log(mutations[0].target.nodeValue);
        //mutations[0].target.text = "Gina.R.204 on RaterLabs Chat"
        //console.log("changed");
        processTableC();
    });

    //  configuration of the observer:
    let config = { subtree: true, characterData: true, childList: true };

    // pass in the target node, as well as the observer options
    s_observerC.observe(target, config);

}

/**
 * Disconnect all chat color MutationObservers.
 */
function uninstallObserversC() {
    if (s_observerC != null) {
        s_observerC.disconnect();
        s_observerC = null;
    }
}


let colorButHTML = '<button id="mdecolorW" title="Change chat colors" type="button"><img src="https://raterlabs.appen.com/qrp/core/vendors/social_file/1065488/colorwheel.png" style = "width:20px;height:20px;"></button>';

//add color picker to chat
/**
 * Inject the color-picker toggle button into the chat toolbar.
 */
function addColorPickerbutton() {
    // does it exist..

    let imgBut = document.getElementById("mdecolorW");
    if (imgBut == null) {
        let f = $('#header');

        if (f == null) {
            console.log("cant find place to put color picker");
            return;
        }
        let x = f.children();
        if (x.length < 2) {
            console.log("not as many children as expected:" + x.length);
            return;
        }
        
        $(x[1]).prepend(colorButHTML);
        
        $("#mdecolorW").click(showColorChoices);

    }
}

//let noHighlight = "";
//let noHighlightalt = '';

/**
 * Navigate back to the previous page context.
 *
 * @param {Object} el
 * @returns {*}
 */
function referBack(el) {
    // find all the spans
    let children = el.children;
    for(let i = 0; i < children.length; i++) {
        if (children[i].nodeName == "SPAN") {
            if (children[i].textContent.length > 0) {
                let ans = children[i].textContent;
                ans = ans.replace("[", "");
                ans = ans.replace("]", "");
                if (isNaN(ans))
                    return null;
                let trId = $("#m_" + ans);
                if (trId.length != 1)
                    return null;
                else
                    return trId;
            }
        }
    }
    return null;
}

/**
 * Show a hover tooltip with message metadata on mouseover.
 *
 * @param {Object} el
 */
function messageHover(el) {
    if (el.type == "mouseenter" || el.type == "mouseleave") {
        // highlight/unhighlight
        // what type of node --  - only look at spans
        let node = referBack(el.target);
        if (node == null) //node is probably a tr
            return;
        if (el.type == "mouseenter") {
            //if ($(trId).hasClass("alt"))
            //    noHighlightalt = node[0].children[1].style.backgroundColor;
            //else
            //    noHighlight = node[0].children[1].style.backgroundColor;
            //node[0].children[1].style.backgroundColor = "red";
            //sometimes this is not the right one - children[1];
            if (node.length == 0)
                console.log("whats up");
            if (node[0].children.length < 2)
                console.log("whats up 1");
            //node[0].children[1].style.fontStyle = "italic";
            //node[0].children[1].style.fontWeight = "bold";
            if (node[0].children[1].style.backgroundColor != "")
                node[0].children[1].style.backgroundColor = lighten(node[0].children[1].style.backgroundColor, 50);
        }
        else {
            if (node[0].children[1].style.backgroundColor != "")
                getCorrectColor(node);
            //node[0] has class alt
            //node[0].children[1].style.fontStyle = "";
            //node[0].children[1].style.fontWeight = "";

            //if ($(trId).hasClass("alt")) {
            //    node[0].children[1].style.backgroundColor = noHighlightalt;
            //}
            //else {
            //    node[0].children[1].style.backgroundColor = noHighlight;
            //}
        }
    }
}

let buttons = [
    { button: "fColor", cpicker: "#cfColor", style: "f", changed: false, f: "fColor", b: "bColor", value: null },
    { button: "bColor", cpicker: "#cbColor", style: "b", changed: false, f: "fColor", b: "bColor", value: null },
    { button: "paColor", cpicker: "#cpaColor", style: "f", changed: false, f: "paColor", b: "bColor", value: null },
    { button: "oaColor", cpicker: "#coaColor", style: "f", changed: false, f: "oaColor", b: "bColor", value: null },
    { button: "aaColor", cpicker: "#caaColor", style: "f", changed: false, f: "aaColor", b: "bColor", value: null },
    { button: "pbColor", cpicker: "#cpbColor", style: "b", changed: false, f: "pfColor", b: "pbColor", value: null },
    { button: "pfColor", cpicker: "#cpfColor", style: "f", changed: false, f: "pfColor", b: "pbColor", value: null },
    { button: "ubColor", cpicker: "#cubColor", style: "b", changed: false, f: "fColor", b: "ubColor", value: null },
    { button: "fbColor", cpicker: "#cfbColor", style: "b", changed: false, f: "fColor", b: "fbColor", value: null },
    { button: "ibColor", cpicker: "#cibColor", style: "b", changed: false, f: "ifColor", b: "ibColor", value: null },
    { button: "ifColor", cpicker: "#cifColor", style: "f", changed: false, f: "ifColor", b: "ibColor", value: null },
    { button: "mColor", cpicker: "#cmColor", style: "f", changed: false, f: "mColor", b: "bColor", value: null },
    { button: "hfColor", cpicker: "#chfColor", style: "f", changed: false, f: "hfColor", b: "pbColor", value: null },
    { button: "hbColor", cpicker: "#chbColor", style: "b", changed: false, f: "pfColor", b: "hbColor", value: null }
];
//set to true at the moment in the controlObj
/**
 * Display the color-choice panel for standard color slots.
 */
function showColorChoices() {
    if (s_useOS)
        showColorChoicesOS();
    else
        bootshowColorChoices();
}

/**
 * Display the color-choice panel in one-shot (single-select) mode.
 * @returns {Array}
 */
function showColorChoicesOS() {
    let where2paste;
    //for positioning
    let imgBut = document.getElementById("mdecolorW");
    where2paste = imgBut.parentElement;

    //init
    //get rid of an old one
    let div = document.getElementById("colorwheel");
    if (div != null) {
        div.parentElement.removeChild(div);
        console.log("colors already showing - why push button again - mistake most likely, starting over");
    }
    //where to insert - want to be sure its on top - make it last
    $('body').append(colorWheelHTML);
    //$(where2paste.parentElement).append(colorWheelHTML);

    div = document.getElementById("colorwheel");
    if (div == null) {
        console.log("problem");
        return;
    }

    let rect = where2paste.getBoundingClientRect();
    let newLeft = rect.left - div.offsetWidth;
    if (newLeft < 0) {
        newLeft = window.pageXOffset;
    }
    div.style.left = newLeft.toString() + "px";
    div.style.top = "1px";

    buttons.forEach(function (el) {
        el.changed = false;
        let butName = "#" + el.button;
        $(butName).click(function () {
            $(el.cpicker).trigger('click');
        });
        $(el.cpicker).change(function () {
            let colorNow = $(el.cpicker).val();
            if (colorNow != null && colorNow != '') {
                el.value = colorNow;
                el.changed = true;
                setColorsfromButtons(false, null);
            }
        });
    });

    setColorsfromButtons(true, null);

    $("#cancelColors").click(function (el) {
        let div = document.getElementById("colorwheel");
        if (div != null)
            div.parentElement.removeChild(div);
        $('#selectAll2revert').hide();
        $(this).prop("disabled", false);
        $('.revertSelect').hide();
    });

    //here - test this
    $("#saveColors").click(function (el) {
        //if revert is disabled then we are just processing the revert colors
        if ($("#revertColors").is(":disabled")) {
            $('.revertSelect').each(function () {
                if ($(this).prop("checked") == true) {
                    //all boxes are preceeded by a element with the name of the field
                    //test this code out - here 8/24/23 
                    let prevEl = $(this).prev();
                    let prevInput = $(prevEl).find('input');
                    let thisName = prevInput[0].id;
                    if (prevEl.length == 0 || prevInput == undefined || thisName == undefined || thisName == "") {
                        alert("something went wrong with logic in colorOpts");
                        return;
                    }
                    let co_name = findColorOptionKeyByButton(thisName);
                    let one2change = colorOptions.findIndex(x => x.id == co_name);
                    if (one2change > -1) {
                        colorOptions[one2change].custom = null;
                        let newColor = colorOptions[one2change].normal;
                        if (newColor == "")
                            newColor = "black";
                        //set button color  
                        let but = document.getElementById(co_name);
                        if (but != undefined) {
                            let butEl = buttons.findIndex(x => x.button == co_name);
                            if (butEl > -1) {
                                if (buttons[butEl].style == "f")
                                    but.style.color = newColor;
                                else
                                    but.style.backgroundColor = newColor;
                                buttons[butEl].value = null;
                                buttons[butEl].changed = true;
                            }
                        }
                        revert2Default = true;
                    }
                }

            });
        }
        else {
            revert2Default = false;
            buttons.forEach(function (el) {
                if (el.changed) {
                    let butName = "#" + el.button;
                    let one2change = colorOptions.findIndex(x => x.id == el.button);
                    if (one2change > -1) {
                        if (el.style == 'f')
                            colorOptions[one2change].custom = $(butName)[0].style.color;
                        else
                            colorOptions[one2change].custom = $(butName)[0].style.backgroundColor;
                    }
                }
            });
        }
        //send coloroptions to background to save it
        if (isValidChromeRuntime())
            SendSafeRuntimeMessage({ text: "SAVECOLORS", data: colorOptions });
        let div = document.getElementById("colorwheel");
        if (div != null) {
            div.parentElement.removeChild(div);
        }
        $('#selectAll2revert').hide();
        $('#revertColors').prop("disabled", false);
        $('.revertSelect').hide();
        apply();
    });

    $("#selectAll2revert").click(function () {
        $('.revertSelect').prop("checked", true);
    });

    $("#revertColors").click(function () {
        //add some buttons to get this done
        $('#selectAll2revert').show();
        $('.revertSelect').show();
        //disable revertcolors button
        $(this).prop("disabled", true);
        //make popup wider
        $("#chatScreen")[0].style.width = "320px";
        $("#colorwheel")[0].style.width = "320px";

        //div.style.width = widths.toString() + "px";
        //old revertcolors code
        //colorOptions.forEach(function (el) {
        //    el.custom = null;
        //});
        ////reload reset coloropts in background
        //if (isValidChromeRuntime())
        //    SendSafeRuntimeMessage({ text: "REVERTCOLORS" });
    });



    $("#exportColors").click(function (el) {
        //set all custom colors to default
        let div = document.getElementById("colorwheel");
        if (div != null)
            div.parentElement.removeChild(div);
        if (isValidChromeRuntime()) {
            //SendSafeRuntimeMessage({ text: "EXPCOLORS" });
            let bigLine = "";
            colorOptions.forEach(function (el) {
                bigLine += el.id + '\t' + el.normal + '\t' + el.custom + '\n';
            });

            if (bigLine.length > 0) {
                let d = new Date();
                let fileName = "colors" + (d.getMonth() + 1) + d.getDate() + d.getFullYear() + ".txt";
                writeLine(bigLine, fileName, true);
                return fileName;
            }
            return false;
        }
    });

    $("#importColorsF").click(function (el) {
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
                    processColorFile(reader.result);
                };
                reader.readAsText(fileSelector.files[0]);
            }
        });
        $(fileSelector).trigger("click");
    });

    //$("#importColorsU").click(function (el) {
    //    //get the url - or put text input area on screen
    //    processColorFile(data);
    //});
}
//inName is a cpicker Id
/**
 * Return the color-option key associated with a picker button element.
 *
 * @param {string} inName
 * @returns {*}
 */
function findColorOptionKeyByButton(inName) {
    let index = buttons.findIndex(x => x.cpicker == "#" + inName);
    if (index > -1)
        return buttons[index].button;
}

//get rid of an old one
//let iframe = document.getElementById("coloriframe");
//if (iframe != null)
//    iframe.parentElement.removeChild(iframe);

//iframe = document.createElement('iframe');
//iframe.setAttribute('id', 'coloriframe');
//iframe.src = chrome.runtime.getURL('colorwheel.html');
//document.body.appendChild(iframe);

// this works - because I'm in here! 


/**
 * Read button color values and apply them to the color settings object.
 *
 * @param {boolean} initButtons
 * @param {Object} optData
 */
function setColorsfromButtons(initButtons, optData) {
    let array2use = optData == null ? colorOptions : optData;

    if (initButtons) { // init buttons from colorOptions first
        buttons.forEach(function (el) {
            el.changed = false;
            let one2change = array2use.findIndex(x => x.id == el.button);
            if (one2change > -1 && array2use[one2change].custom != null) {
                el.changed = true;
                el.value = array2use[one2change].custom;
            }
        });
    }


    //set colors from buttons array
    buttons.forEach(function (el) {
        let butName = "#" + el.button;
        let fColor = buttons.findIndex(x => x.button == el.f);
        if (fColor > -1 && buttons[fColor].value != null)
            $(butName)[0].style.color = buttons[fColor].value;
        let bColor = buttons.findIndex(x => x.button == el.b);
        if (bColor > -1 && buttons[bColor].value != null)
            $(butName)[0].style.backgroundColor = buttons[bColor].value;
    });


    let trbs = document.getElementsByClassName("trb");
    //set foreground trb if applicable
    let one2change = buttons.findIndex(x => x.button == "fColor");
    if (one2change > -1 && buttons[one2change].value != null) {
        for(let i = 0; i < trbs.length; i++)
            trbs[i].style.color = buttons[one2change].value;
    }
    //set background trb if applicable
    one2change = buttons.findIndex(x => x.button == "bColor");
    if (one2change > -1 && buttons[one2change].value != null) {
        for(let i = 0; i < trbs.length; i++)
            trbs[i].style.backgroundColor = buttons[one2change].value;
    }
    //set area around input box
    one2change = buttons.findIndex(x => x.button == "fbColor");
    if (one2change > -1 && buttons[one2change].value != null) {
        trbs = document.getElementById("tbColor");
        trbs.style.backgroundColor = buttons[one2change].value;
    }
}

/**
 * Parse and import a color settings file from disk.
 *
 * @param {Date} data
 */
function processColorFile(data) { // use for restore track data from backup
    let nlchar = "\n".charCodeAt(0);
    let tabchar = "\t".charCodeAt(0);
    let tab = String.fromCharCode(tabchar);
    let nl = String.fromCharCode(nlchar);
    let lines = data.split(nl);
    //console.log("processfile");
    let tempData = [];
    for(let i = 0; i < lines.length; i++) {
        if (lines[i].length < 1)
            continue;
        let thisData = lines[i].split('\t');
        tempData.push({ id: thisData[0], normal: thisData[1], custom: thisData[2] });
    }

    if (s_useOS) 
        setColorsfromButtons(true, tempData);
    else
        setColorsfromBoot(true, tempData);
}

/**
 * Return the RGB components of a CSS color string as an object.
 *
 * @param {string} str
 * @returns {*}
 */
function getRGB(str) {
    let match = str.match(/rgba?\((\d{1,3}), ?(\d{1,3}), ?(\d{1,3})\)?(?:, ?(\d(?:\.\d?))\))?/);
    return match ? {
        red: match[1],
        green: match[2],
        blue: match[3]
    } : {};
}

/**
 * Return a lightened version of an RGB color by a given factor.
 *
 * @param {string} str
 * @param {number} number
 * @returns {*}
 */
function lighten(str, number) {
    let colorsA = getRGB(str);
    if (colorsA) {
        if (parseInt(colorsA.red) <= (235 + number))
            colorsA.red = parseInt(colorsA.red) + number;
        else
            colorsA.red = parseInt(colorsA.red) - number;
        if (parseInt(colorsA.green) <= (235 + number))
            colorsA.green = parseInt(colorsA.green) + number;
        else
            colorsA.green = parseInt(colorsA.green) - number;
        if (parseInt(colorsA.blue) <= (235 + number))
            colorsA.blue = parseInt(colorsA.blue) + number;
        else
            colorsA.blue = parseInt(colorsA.blue) - number;
        return ("rgb(" + colorsA.red + "," + colorsA.green + ',' + colorsA.blue + ')');
    }
}

/**
 * Return the effective color for a chat message based on its sender.
 *
 * @param {Object} node
 */
function getCorrectColor(node) {
    //get the class - if it's alt or not - get coloroptions  to get what it should be
    if ($(node).hasClass("alt"))
        getColorbyOption("pbColor", node[0].children[1], "ab");
    else
        getColorbyOption("pbColor", node[0].children[1], "b");
}

let colorWheelHTML = '<div id="colorwheel">' +
    '<div class="colorButtons">' +
    '<button class="Submit" type="button" id="saveColors">Apply</button>' +
    '<button class="Submit" type="button" id="revertColors">Revert to default</button>' +
    '<button class="Submit" type="button" id="cancelColors">Cancel</button>' +
    '<button class="Submit" type="button" id="selectAll2revert" hidden>Select All</button>' +
    '<p> </p></div>' + '<div id="chatScreen">' +
    '<table>' +
    '<tbody>' +
    '<tr>' +
    '<td colspan="3">' +
    '<span>' +
    '<div class="colorButdiv">' +
    '<button type="button" id="fColor" class="trb">Foreground</button>' +
    '<input type="color" id="cfColor" class="tranparentBut"/>' +
    '</div><input type="checkbox" name="fSel" id="fSel" class="revertSelect" hidden>' +
    '<div class="colorButdiv">' +
    '<button type="button" id="bColor" class="trb">Background</button>' +
    '<input type="color" id="cbColor" class="tranparentBut"/>' +
    '</div><input type="checkbox" name="bSel" id="bSel" class="revertSelect" hidden>' +
    '<div class="colorButdiv">' +
    '<button type="button" id="mColor" class="trbx">My Color</button>' +
    '<input type="color" id="cmColor" class="tranparentBut"/>' +
    '</div><input type="checkbox" name="mySel" id="mSel" class="revertSelect" hidden>' +
    '</span>' +
    '</td>' +
    '</tr>' +
    '<tr class="trb">' +
    '<td colspan="2">' +
    '<img src="https://raterlabs.appen.com/qrp/images/raterlabs/raterlabs_header_logo.png?2" border="0" style="width:80px;height:40px;">' +
    '</td>' +
    '<td>' +
    '<div class="colorButdiv">' +
    '<button type="button" id="hbColor" class="trbx">MDE Alerts</button>' +
    '<input type="color" id="chbColor" class="tranparentBut"/>' +
    '</div><input type="checkbox" name="hbSel" id="hbSel" class="revertSelect" hidden>' +
    '</td>' +
    '</tr>' +
    '<tr class="trb">' +
    '<td id="postsNames">' +
    '<div class="colorButdiv">' +
    '<button type="button" id="paColor">Senior</button>' +
    '<input type="color" id="cpaColor" class="tranparentBut"/>' +
    '</div><input type="checkbox" name="paSel" id="paSel" class="revertSelect" hidden>' +
    '<br>' +
    '<span> </span><br>' +
    '<div class="colorButdiv">' +
    '<button type="button" id="oaColor">Grey</button>' +
    '<input type="color" id="coaColor" class="tranparentBut"/>' +
    '</div><input type="checkbox" name="oaSel" id="oaSel" class="revertSelect" hidden><br>' +
    '<span> </span><br>' +
    '<div class="colorButdiv">' +
    '<button type="button" id="aaColor">Admin</button>' +
    '<input type="color" id="caaColor" class="tranparentBut"/>' +
    '</div><input type="checkbox" name="aaSel" id="aaSel" class="revertSelect" hidden><br>' +
    '</td>' +
    '<td id="posts">' +
    '<div class="colorButdiv">' +
    '<button type="button" id="pfColor">Text</button>' +
    '<input type="color" id="cpfColor" class="tranparentBut"/>' +
    '</div><input type="checkbox" name="pfSel" id="pfSel" class="revertSelect" hidden><br>' +
    '<span> </span><br>' +
    '<div class="colorButdiv">' +
    '<button type="button" id="pbColor">Background</button>' +
    '<input type="color" id="cpbColor" class="tranparentBut"/>' +
    '</div><input type="checkbox" name="pbSel" id="pbSel" class="revertSelect" hidden><br>' +
    '<span> </span> <br>' +
    '<div class="colorButdiv">' +
    '<button type="button" id="hfColor">HyperLinks</button>' +
    '<input type="color" id="chfColor" class="tranparentBut"/>' +
    '</div><input type="checkbox" name="hfSel" id="hfSel" class="revertSelect" hidden>' +
    '</td>' +
    '<td id="userTable">' +
    '<div class="colorButdiv">' +
    '<button type="button" id="ubColor">User Table</button>' +
    '<input type="color" id="cubColor" class="tranparentBut"/>' +
    '</div><input type="checkbox" name="ubSel" id="ubSel" class="revertSelect" hidden><br>' +
    '</td>' +
    '</tr>' +
    '<tr>' +
    '<td id="tbColor" colspan="3" align="center" height="100">' +
    '<div class="colorButdiv">' +
    '<button type="button" id="ifColor">Text</button>' +
    '<input type="color" id="cifColor" class="tranparentBut"/>' +
    '</div><input type="checkbox" name="ifSel" id="ifSel" class="revertSelect" hidden>' +
    '<div class="colorButdiv">' +
    '<button type="button" id="ibColor">Background</button>' +
    '<input type="color" id="cibColor" class="tranparentBut"/>' +
    '</div><input type="checkbox" name="ibSel" id="ibSel" class="revertSelect" hidden>' +
    '<div class="colorButdiv">' +
    '<button type="button" id="fbColor">Outside Box</button>' +
    '<input type="color" id="cfbColor" class="tranparentBut"/>' +
    '</div><input type="checkbox" name="fbSel" id="fbSel" class="revertSelect" hidden>' +
    '</td>' +
    '</tr>' +
    '</tbody>' +
    '</table>' +
    '</div>' +
    '<div class="colorButtons">' +
    '<button type="button" id="exportColors">Export</button>' +
    '<button type="button" id="importColorsF">Import File</button>' +
    '<button onclick="window.open(' + "'https://raterlabs.appen.com/qrp/core/vendors/social_file/1065488/colorhelp.png', '_blank'" + ');">Help</button>' +
    '</div>';

/**
 * Return the current rater's alias name from the chat user list.
 * @returns {*}
 */
function getMyAlias() {
    let bigboy = document.scripts;
    for(let i = 0; i < bigboy.length; i++) {
        let b = false;
        let tStr = bigboy[i];
        // console.log(i, tStr.text.length);
        if (tStr.text.length > 0) {
            let w = tStr.text.indexOf("let myAlias = '");
            //console.log(i, tStr.text);
            if (w > -1) {
                let n = tStr.text.split("let myAlias = '");
                // now n[1] has the location as the first string
                // find term of the string
                if (n.length == 2) {
                    w = n[1].indexOf("'");
                    if (w > 0) {
                        myAlias = n[1].substr(0, w);
                        return (myAlias);
                    }
                }
                break;
            }
        }
    }
    return null;
}

//function bootshowColorChoices(el) {

//    for positioning
//    let imgBut = document.getElementById("mdecolorW");
//    where2paste = imgBut.parentElement;

//    init
//    get rid of an old one
//    let div = document.getElementById("colorwheel");
//    if (div != null) {
//        div.parentElement.removeChild(div);
//        console.log("colors already showing - why push button again - mistake most likely, starting over");
//    }
//    where to insert - want to be sure its on top - make it last
//    $('body').append(bootcolorWheelHTML);
//    $(where2paste.parentElement).append(colorWheelHTML);

//    div = document.getElementById("colorwheel");
//    if (div == null) {
//        console.log("problem");
//        return;
//    }

//    let rect = where2paste.getBoundingClientRect();
//    let newLeft = newLeft = rect.left - div.offsetWidth;
//    if (newLeft < 0) {
//        newLeft = window.pageXOffset;
//    }
//    div.style.left = newLeft.toString() + "px";
//    div.style.top = "1px";

//    $('#fColor').colorpicker({ align: "left", template: template });
//    $('#fColor').on('hidePicker', function (el) {
//        $("#fColor")[0].style.color = $("#fColor").val();
//        $("#fColor")[0].style.backgroundColor = $("#fColor").val();
//    });


//    buttons.forEach(function (el) {
//        el.changed = false;
//        let butName = "#" + el.button;
//        $(butName).colorpicker({ align: "left", template: template });
//        $(butName).on('hidePicker', function (ev) {
//            let colorNow = $(butName).val();
//            $("#fColor")[0].style.color = $("#fColor").val();
//            $("#fColor")[0].style.backgroundColor = $("#fColor").val();
//            if (colorNow != null && colorNow != '') {
//                el.value = colorNow;
//                el.changed = true;
//                setColorsfromBoot(false, null);
//            }
//        });
//    });

//    setColorsfromBoot(true, null);

//    $("#cancelColors").click(function (el) {
//        let div = document.getElementById("colorwheel");
//        if (div != null)
//            div.parentElement.removeChild(div);
//    });

//    here - test this
//    $("#saveColors").click(function (el) {
//        buttons.forEach(function (el) {
//            if (el.changed) {
//                let butName = "#" + el.button;
//                let one2change = colorOptions.findIndex(x => x.id == el.button);
//                if (one2change > -1) {
//                    if (el.style == 'f')
//                        colorOptions[one2change].custom = $(butName)[0].style.color;
//                    else
//                        colorOptions[one2change].custom = $(butName)[0].style.backgroundColor;
//                }
//            }
//        });
//        apply();
//        send coloroptions to background to save it
//        if (isValidChromeRuntime())
//            SendSafeRuntimeMessage({ text: "SAVECOLORS", data: colorOptions });
//        let div = document.getElementById("colorwheel");
//        if (div != null) {
//            div.parentElement.removeChild(div);
//        }
//    });

//    $("#revertColors").click(function (el) {
//        set all custom colors to default
//        colorOptions.forEach(function (el) {
//            el.custom = null;
//        });
//        //reload reset coloropts in background
//        if (isValidChromeRuntime())
//            SendSafeRuntimeMessage({ text: "REVERTCOLORS" });
//    });

//    $("#exportColors").click(function (el) {
//        set all custom colors to default
//        let div = document.getElementById("colorwheel");
//        if (div != null)
//            div.parentElement.removeChild(div);
//        if (isValidChromeRuntime())
//            SendSafeRuntimeMessage({ text: "EXPCOLORS" });
//    });

//    $("#importColorsF").click(function (el) {
//        let fileSelector = document.createElement('input');
//        fileSelector.setAttribute('type', 'file');
//        let selectDialogueLink = document.createElement('a');
//        selectDialogueLink.setAttribute('href', '');
//        selectDialogueLink.innerText = "Select File";
//        $(fileSelector).change("change", function () {
//            if (fileSelector.files.length == 1) {
//                let reader = new FileReader();
//                let data;
//                reader.onload = function (data) {
//                    data = reader.result;
//                    processColorFile(reader.result);
//                };
//                reader.readAsText(fileSelector.files[0]);
//            }
//        });
//        $(fileSelector).trigger("click");
//    });

//    $("#importColorsU").click(function (el) {
//        get the url - or put text input area on screen
//        processColorFile(data);
//    });

//}
//not in use at the moment
//function setColorsfromBoot(initButtons, optData) {

//    let array2use = optData == null ? colorOptions : optData;

//    if (initButtons) { // init buttons from colorOptions first
//        buttons.forEach(function (el) {
//            el.changed = false;
//            let one2change = array2use.findIndex(x => x.id == el.button);
//            if (one2change > -1 && array2use[one2change].custom != null) {
//                el.changed = true;
//                el.value = array2use[one2change].custom;
//            }
//        });
//    }


//    set colors from buttons array
//    buttons.forEach(function (el) {
//        let butName = "#" + el.button;
//        if (el.value != null) {
//            $(butName)[0].style.color = el.value;
//            $(butName)[0].style.backgroundColor = el.value;
//        }
//        let fColor = buttons.findIndex(x => x.button == el.f);
//        if (fColor > -1 && buttons[fColor].value != null)
//            $(butName)[0].style.color = buttons[fColor].value;
//        let bColor = buttons.findIndex(x => x.button == el.b);
//        if (bColor > -1 && buttons[bColor].value != null)
//            $(butName)[0].style.backgroundColor = buttons[bColor].value;
//    });

//    let trbs = document.getElementsByClassName("trb");
//    set foreground trb if applicable
//    let one2change = buttons.findIndex(x => x.button == "fColor");
//    if (one2change > -1 && buttons[one2change].value != null) {
//        for(let i = 0; i < trbs.length; i++)
//            trbs[i].style.color = buttons[one2change].value;
//    }
//    set background trb if applicable
//    one2change = buttons.findIndex(x => x.button == "bColor");
//    if (one2change > -1 && buttons[one2change].value != null) {
//        for(let i = 0; i < trbs.length; i++)
//            trbs[i].style.backgroundColor = buttons[one2change].value;
//    }

//}

//let bootcolorWheelHTML = '<div id="colorwheel">' +
//    '   <div class="colorButtons">' +
//    '      <button class="Submit" type="button" id="saveColors">Apply</button>' +
//    '     <button class="Submit" type="button" id="revertColors">Revert to default</button>' +
//    '    <button class="Submit" type="button" id="cancelColors">Cancel</button>' +
//    '</div>' +
//    '<p>' +
//    '</p>' +
//    '<div id="chatScreen">' +
//    '   <table>' +
//    '      <tbody>' +
//    '         <tr>' +
//    '            <td>' +
//    '               <label class="colorLabel" for="fColor">Foreground</label>' +
//    '              <input id="fColor" type="button" class="form-control pickColorClass" value="rgb(255, 128, 0)" />' +
//    '         </td>' +
//    '        <td>' +
//    '           <label class="colorLabel" for="bColor">Background</label>' +
//    '          <input id="bColor" type="button" class="form-control pickColorClass" value="rgb(255, 128, 0)" />' +
//    '     </td>' +
//    '    <td>' +
//    '       <label class="colorLabel" for="mColor">My Color</label>' +
//    '      <input id="mColor" type="button" class="form-control pickColorClass" value="rgb(255, 128, 0)" />' +
//    ' </td>' +
//    '          </tr>' +
//    '         <tr class="trb">' +
//    '            <td colspan="3">' +
//    '               <img src="https://raterlabs.appen.com/qrp/images/raterlabs/raterlabs_header_logo.png?2" border="0" style="        width: 80px;' +
//    '       height: 40px;">' +
//    '                      </td>' +
//    '                 </tr>' +
//    '                <tr class="trb">' +
//    '                   <td id="postsNames">' +
//    '                      <label class="colorLabel" for="paColor">Senior</label>' +
//    '                     <input id="paColor" type="button" class="form-control pickColorClass" value="rgb(255, 128, 0)" />' +
//    '                    <br>' +
//    '                   <label class="colorLabel" for="oaColor">Grey</label>' +
//    '                  <input id="oaColor" type="button" class="form-control pickColorClass" value="rgb(255, 128, 0)" />' +
//    '                 <br>' +
//    '                <label class="colorLabel" for="aaColor">Admin</label>' +
//    '               <input id="aaColor" type="button" class="form-control pickColorClass" value="rgb(255, 128, 0)" />' +
//    '          </td>' +
//    '         <td id="posts">' +
//    '            <label class="colorLabel" for="pfColor">Text</label>' +
//    '           <input id="pfColor" type="button" class="form-control pickColorClass" value="rgb(255, 128, 0)" />' +
//    '          <br>' +
//    '         <label class="colorLabel" for="pbColor">Background</label>' +
//    '        <input id="pbColor" type="button" class="form-control pickColorClass" value="rgb(255, 128, 0)" />' +
//    '   </td>' +
//    '  <td id="userTable">' +
//    '     <label class="colorLabel" for="ubColor">User Table</label>' +
//    '    <input id="ubColor" type="button" class="form-control pickColorClass" value="rgb(255, 128, 0)" />' +
//    '                  </td>' +
//    '             </tr>' +
//    '            <tr id="fbColor" height="100px">' +
//    '               <td>Input Area:</td><td>' +
//    '                  <label class="colorLabel" for="ifColor">Text</label>' +
//    '                 <input id="ifColor" type="button" class="form-control pickColorClass" value="rgb(255, 128, 0)" />' +
//    '            </td>' +
//    '           <td>' +
//    '              <label class="colorLabel" for="ibColor">Background</label>' +
//    '             <input id="ibColor" type="button" class="form-control pickColorClass" value="rgb(255, 128, 0)" />' +
//    '        </td>' +
//    '   </tr>' +
//    '            </tbody>' +
//    '       </table>' +
//    '  </div>' +
//    ' <div class="colorButtons">' +
//    '    <button type="button" id="exportColors">Export</button>' +
//    '   <button type="button" id="importColorsf">Import Local File</button>' +
//    '   </div>' +
//    '  </div>';

//let template = '<div class="colorpicker dropdown-menu" style="z-index: 2147483647">' +
//    '<div class="colorpicker-saturation"><i><b></b></i></div>' +
//    '<div class="colorpicker-hue"><i></i></div>' +
//    '<div class="colorpicker-color"><div /></div>' +
//    '<div class="colorpicker-selectors"></div>' +
//    '<div class="colorpicker-bar"><button type="button" class="button" id="close">Save</button></div>' +
//    '</div>';

//'<div id="colorbutton" hidden>' +
    //'<input type="color" id="cpaColor">' +
    //'<input type="color" id="coaColor">' +
    //'<input type="color" id="caaColor">' +
    //'<input type="color" id="cpbColor">' +
    //'<input type="color" id="cubColor">' +
    //'<input type="color" id="cibColor">' +
    //'<input type="color" id="cifColor">' +
    //'<input type="color" id="cbColor">' +
    //'<input type="color" id="cfColor">' +
    //'<input type="color" id="cfbColor">' +
    //'<input type="color" id="cpfColor">' +
    //'<input type="color" id="cmColor">' +
    //'<input type="color" id="chfColor">' +
    //'<input type="color" id="chbColor">' +
//    '</div>' +

// ---------------------------------------------------------------------------
// Stub implementations for the legacy "bootstrap color picker" path.
// These are called when s_useOS is false (non-OS-native color picker mode).
// The full implementations were removed with the bootstrap dependency.
// TODO: re-implement or permanently gate on s_useOS = true.
// ---------------------------------------------------------------------------

/**
 * Apply dark-mode styling to the chat table.
 * Stub — legacy bootstrap path. Full implementation removed with bootstrap.
 *
 * @param {boolean} on
 */
function turnDark(on) {
    // no-op until reimplemented
}

/**
 * Display the color-choice panel using the legacy bootstrap picker.
 * Stub — legacy bootstrap path. Full implementation removed with bootstrap.
 */
function bootshowColorChoices() {
    // no-op until reimplemented
}

/**
 * Apply color settings from the legacy bootstrap color picker controls.
 * Stub — legacy bootstrap path. Full implementation removed with bootstrap.
 *
 * @param {boolean} initButtons
 * @param {Object|null} optData
 */
function setColorsfromBoot(initButtons, optData) {
    // no-op until reimplemented
}
