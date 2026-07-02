// 08/18/18
//test create with 2 payperiods and see if training is overridden. Everything else is done.
//changes to support changes to invoice page 5/29/19
//some functions in here are a dup from utils and dates because this script runs in its own context
let S_QuitStr = "quitnow"; //1/26

/**
 * Return the start of the biweekly pay period containing a given date (invoice copy).
 *
 * @param {Date} date2chk
 * @param {boolean} international
 */
function selectPeriodCreate(date2chk,international) {
    let dd = new Date(date2chk);
    if (international) {
        let bounds = getIstartend(dd);
        let periodDesc = bounds.startDate.justDate() + ' - ' + bounds.endDate.justDate();
        let c = $("#selected-period-start").children();
        for(let i = 0; i < c.length; i++) {
            console.log(c[i].textContent, periodDesc);
            if (c[i].textContent == periodDesc) {
                $("#selected-period-start").val(c[i].value);
                return true;
            }
        }
        console.log("match not found international: "+ periodDesc);
        return false;
    }
    else {
        let startDate = new Date(invoice_getStartofPeriod(dd));
        let endDate = new Date(startDate.addDays(13));
        let periodDesc = startDate.justDate() + ' - ' + endDate.justDate();
        //console.log("in createselect period");
        //console.log(periodDesc);
        //get the period it belongs to
        let c = $("#selected-period-start").children();
        for(let i = 0; i < c.length; i++) {
            console.log(c[i].textContent);
            if (c[i].textContent == periodDesc) {
                $("#selected-period-start").val(c[i].value);
                return true;
            }
        }
        console.log("match not found US:" + periodDesc);
        return false;
    }
}

/**
 * Return true if a date string cannot be parsed as a valid Date.
 *
 * @param {string} str
 * @param {Date} date2chk
 */
function badDate(str, date2chk) {
    let strs = str.split(":")
    if (strs.length != 2) {
        console.log("split to get period failed", strs);
        return false;
    }
    let x = strs[1].trim();
    let dates = x.split(" - ");
    let start = new Date(dates[0]);
    let end = new Date(dates[1]);
    let d = new Date(date2chk);
    if (d < start || d > end)
        return true;
    return false;
}

/**
 * Check whether two Date values represent the same calendar day.
 *
 * @param {Date} date1
 * @param {Date} date2
 * @returns {*}
 */
function dateEqual(date1, date2) {
    let d1 = new Date(date1);
    let d2 = new Date(date2);
    let comp1 = (d1.getMonth() + 1) + '/' + d1.getDate() + '/' + d1.getFullYear();
    let comp2 = (d2.getMonth() + 1) + '/' + d2.getDate() + '/' + d2.getFullYear();
    return comp1 == comp2;
}

/**
 * Return a millisecond duration as an [hours, minutes, seconds] array.
 *
 * @param {*} workT
 * @returns {*}
 */
function millisToHoursMinutesAndSecondsarray(workT) { // this is in here so I don't have to include dates.js when I load this script - they should be the same
    let millis = Math.abs(workT);
    let hours = Math.floor(millis / (60 * 60 * 1000));
    let minless = millis - (hours * (60 * 60 * 1000));
    let minutes = Math.floor(minless / 60000);
    let seconds = ((minless % 60000) / 1000).toFixed(0);
    if (seconds == 60) {
        minutes++;
        seconds = 0;
        if (minutes == 60) {
            hours++;
            minutes = 0;
        }
    }
    let timea = [3];
    timea[0] = hours;
    timea[1] = minutes;
    timea[2] = seconds;
    return timea;
}

let invoiceRec = { date: "", workMils: 0 };
//we are passed..
//let invoiceRecs = { count: 0, curRow: 0, updateA: false, recs: [], international: international};

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.text == "ALERTFROMBACKGROUND") {
        handleAlert(request.msg);
        return false;
    }
    if (request.text == 'INVOICER') {
        //console.log("got invoice msg");
        //Ive been sent a invoiceRec
        //check first date  in this payperiod
        // if they are modifying, check date - if they are creating,  the prefilled date may not be correct
        window.scrollTo(0, 0);
        let h2 = $('h2', '.push');
        invoiceRec.date = request.invoiceRecs.recs[0].date;
        let onCreateURL = setURL('/qrp/core/vendors/invoice/add#bottom', request.invoiceRecs.international);
        //is this a newly created invoice. If yes, set period if we can
        console.log(request, onCreateURL);
        if (document.URL == onCreateURL) {
            if (selectPeriodCreate(invoiceRec.date, request.invoiceRecs.international) == false) {
                sendResponse({ answer: "bad" });
                return true;
            }
        }
        else {
            if (badDate(h2[0].textContent, invoiceRec.date)) {
                sendResponse({ answer: "bad" });
                return true;
            }
        }

        let addBut = document.getElementsByName("addRow");
        if (addBut == null) {
            sendResponse({ answer: "noadd" });
            return true;
        }
        for(let i = request.invoiceRecs.curRow; i < request.invoiceRecs.count; i++) {
            invoiceRec.date = request.invoiceRecs.recs[i].date;
            invoiceRec.workMils = request.invoiceRecs.recs[i].hours;
            invoiceRec.recType = request.invoiceRecs.recs[i].recType;
            //console.log(invoiceRec);
            //console.log(request.invoiceRecs.recs[i]);
            //find the record (or a blank record to insert this rec) and update/add data
            let rec2Change;
            if (document.URL == onCreateURL) {
                rec2Change = findFirstRec();
            }
            else {
                rec2Change = findRec(invoiceRec.date);
            }

            // 1/26
            if (rec2Change == S_QuitStr) {
                sendResponse({ answer: "internalE" });
                return true;
            } //end 1/26

            if (rec2Change == null) {
                //if we didn't find a blank line and we didn't process our date
                sendResponse({ answer: "new", curRow: i });
                $(addBut).trigger("click");
                return true;
            }


            let children = $(rec2Change).children();
            thistd = children[0];
            thistdc = $(thistd).children();
            // 1/26
            let saveTheDate;
            let name;
            if (thistdc.length == 1) {
                saveTheDate = thistdc[0].value; // 1/26
            }
            else {
                saveTheDate = thistdc[1].value;

            }
            //end 1/26

            //if we found one and it has a record already and updateA is false - skip over this one
            if (saveTheDate != "" && request.invoiceRecs.updateA == true) {
                continue;
            }

            //start 1/26
            if (thistdc.length == 1) {
                thistdc[0].value = invoiceRec.date; // 1/26
                name = thistdc[0].name.replace(".date", ""); // 1/26
            }
            else {
                thistdc[1].value = invoiceRec.date;
                name = thistdc[1].name.replace(".date", ""); // 1/26

            }
            // end 1/26

            $('[name="' + name + '.type"]').val("PROJECT");
            //set to yukon 4/7/19
            $('[name="' + name + '.projectId"]').val("1");


            //$('[name="' + name + '.rateId"]').val("YUKON"); // not used atm
            let times = millisToHoursMinutesAndSecondsarray(invoiceRec.workMils); // was here (went back to check the format sent by popup)
            if (times[2] > 39) { //round up
                times[1] = times[1] + 1;
            }
            let hms = $(children[4]).children();
            $(hms[0]).val(times[0]);
            $(hms[1]).val(times[1]);
            //$('[name="' + name + '.hours"]').val(times[0]);
            //$('[name="' + name + '.minutes"]').val(times[1]);
            if (saveTheDate == "") {
                //if we added the data because we found a blank line 
                //    sendback row we need to process next
                //    trigger add but unless this is the last record
                if (i < request.invoiceRecs.count) {  // there are more to process
                    sendResponse({ answer: "new", curRow: i + 1 });
                    $(addBut).trigger("click");
                    return true;
                }
            }
            //process the next row - set currentRow
            request.invoiceRecs.curRow++;
        }
        //we still are here - we are done
        //now go through it one more time and add times again - but if this is an existing entry - we need to leave it alone. - if its not 0 - leave it! 
        $(".invoice-entry.alt").each(function () {
            let children = $(this).children();
            let thistd = children[0];
            let thistdc = $(thistd).children();
            let thisdateStr = thistdc[1].value;
            let thisname = thistdc[1].name.replace(".date", "");
            if ($('[name="' + thisname + '.type"]').val() == "PROJECT") {
                let thisRec = findInvoiceR(thisdateStr, request.invoiceRecs.recs);
                if (thisRec != null) {
                    let times = millisToHoursMinutesAndSecondsarray(thisRec.hours);
                    if (times[2] > 39) { //round up
                        times[1] = times[1] + 1;
                        if (times[1] == 60) {// min is 60 so add to hours and 0 mins out
                            times[1] = 0;
                            times[0] = times[0] + 1;
                        }
                    }

                    let hms = $(children[4]).children(); // 4/7  changed from 3 to 4
                    if ($(hms[0]).val() == 0 && $(hms[1]).val() == 0) {
                        $(hms[0]).val(times[0]);
                        $(hms[1]).val(times[1]);
                    }
                    else {
                        //it has a non zero value - which means it was here when we started are we updating existing times?
                        if (request.invoiceRecs.updateA == false) {
                            //override it 
                            $(hms[0]).val(times[0]);
                            $(hms[1]).val(times[1]);
                        }
                    }
                }
            }
        });
        sendResponse({ answer: "done", curRow: i });
        return true;
    }
    return false;
});

/**
 * Find the invoice record matching a given task ID in the tracking data.
 *
 * @param {string} dateStrIn
 * @param {Object} recs
 * @returns {*}
 */
function findInvoiceR(dateStrIn, recs) {
    for(let i = 0; i < recs.length; i++) {
        if (dateEqual(recs[i].date, dateStrIn))
            return recs[i];
    }
    return null;
}

// need to compare to 2018 and 18
/**
 * Find the first task record matching a given task ID.
 *
 * @param {Date} date
 * @returns {boolean}
 */
function findRec(date) {
    let saveIt = null;
    $('.invoice-entry').each(function () {
        let children = $(this).children();
        thistd = children[0];
        thistdc = $(thistd).children();
        //start 1/26
        let name = thistdc[1].name;
        if (name.indexOf(".date") < 0) {
            // looking at the wrong field - quit now
            saveIt = S_QuitStr;
            return;
        }
        let dateStr = thistdc[1].value;
        //end 1/26
        if (dateStr == "" || dateEqual(dateStr, date)) {
            let name = thistdc[1].name.replace(".date", "");
            if ($('[name="' + name + '.type"]').val() == "PROJECT") { // don't return if its a training rec
                saveIt = this;
                return false;
            }
        }
    });

    return saveIt;
}

// create page has a different class for open rec
/**
 * Return the earliest task record in the tracking data by date.
 *
 * @param {Date} date
 * @returns {*}
 */
function findFirstRec(date) {
    // there should only be one rec on this page and we need the TR it is associated with
    let rec = document.getElementsByClassName('date-picker');
    if (rec.length == 1) {
        let td = rec[0].parentElement;
        return td.parentElement;
    }
    return null;
}

// date functions this file needs 



// pay period is 2 weeks - starts on a sunday - starting on april 1 2018.

// beg is declared in dates.js but invoice.js is injected without dates.js.
// Guard: define beg here only if it is not already in scope.
try { beg; } catch(e) { beg = new Date('03/18/18'); }

Date.prototype.addDays = function (days) {
    let dat = new Date(this.valueOf());
    dat.setDate(dat.getDate() + days);
    return dat;
}

Date.prototype.subDays = function (days) {
    let dat = new Date(this.valueOf());
    dat.setDate(dat.getDate() - days);
    return dat;
}

/**
 * Left-pad a number with zeros to at least two digits.
 *
 * @param {*} t
 * @returns {*}
 */
function pad(t) {
    let st = "" + t;
    while (st.length < 2)
        st = "0" + st;
    return st;
}

Date.prototype.justDate = function () {
    let d = new Date(this.valueOf());
    return (pad(d.getMonth() + 1)) + '/' + pad(d.getDate()) + '/' + d.getFullYear();
}

/**
 * Check whether two Dates fall on the same calendar day.
 *
 * @param {Date} d1
 * @param {Date} d2
 * @returns {*}
 */
function justDateEqual(d1, d2) { // pass javascript dat object
    let d1s = (d1.getMonth() + 1) + '/' + d1.getDate() + '/' + d1.getFullYear();
    let d2s = (d2.getMonth() + 1) + '/' + d2.getDate() + '/' + d2.getFullYear();
    return (d1s == d2s);
}

// this is copied code from popup in buildperiod for I
/**
 * Return the start and end dates for the selected invoice pay period.
 *
 * @param {Date} dateIn
 * @returns {*}
 */
function getIstartend(dateIn) {
    let bounds = { startDate: 0, endDate: 0 }; //February 2023, January 2023, 01/01/23, 02/29/23 
    let days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let monthn = dateIn.getUTCMonth();
    let year = dateIn.getUTCFullYear();
    bounds.startDate = new Date((monthn + 1) + '/01/' + year);
    bounds.endDate = new Date((monthn + 1) + '/' + days[monthn].toString() + '/' + year);
    return bounds;
}

/**
 * Return the start of the biweekly pay period containing a given date.
 *
 * @param {Date} passedDate
 * @returns {*}
 */
function invoice_getStartofPeriod(passedDate) {
    let weeks;
    let weekstart;
    let indate = new Date();

    if (passedDate != null) {
        indate = passedDate;
    }
        weekstart = getStartofThisWeek(indate);
        weeks = mydiff(beg, weekstart, 'weeks');
        if ((weeks % 2) == 1) {
            // go back 1 week
            weekstart.setDate(weekstart.getDate() - 7);
        }
        return weekstart;
}

/**
 * Return the Sunday that begins the week containing the given date.
 *
 * @param {Date} inDate
 * @returns {*}
 */
function getStartofThisWeek(inDate) {
    d = new Date(inDate);
    d.setDate(d.getDate() - d.getDay());
    return d;
}

/**
 * Calculate the difference between two dates in the specified unit.
 *
 * @param {Date} date1
 * @param {Date} date2
 * @param {Object} interval
 * @returns {*}
 */
function mydiff(date1, date2, interval) {
    let second = 1000, minute = second * 60, hour = minute * 60, day = hour * 24, week = day * 7;
    date1 = new Date(date1);
    date2 = new Date(date2);
    let timediff = date2 - date1;
    if (isNaN(timediff)) return NaN;
    switch (interval) {
        case "years": return date2.getFullYear() - date1.getFullYear();
        case "months": return (
            (date2.getFullYear() * 12 + date2.getMonth())
            -
            (date1.getFullYear() * 12 + date1.getMonth())
        );
        case "weeks": return Math.floor(timediff / week);
        case "days": return Math.floor(timediff / day);
        case "hours": return Math.floor(timediff / hour);
        case "minutes": return Math.floor(timediff / minute);
        case "seconds": return Math.floor(timediff / second);
        default: return undefined;
    }
}
//    }
//            //SendSafeRuntimeMessage({ text: "BUTRIGGER", date: request.invoice.date });
//            if (dateEqual(dateStr, request.invoice.date)) {
//                //background will send us the next record
//                sendResponse({ answer: "continue" });
//                return;
//            } else {
//                if (confirm("need new")) {
//                    sendResponse({ answer: "new" });
//                    $(addBut).trigger("click");
//                    return; // not sure about this we do want to be able to send a response and still trigger the addbut
//                }
//            }

//            //if we updated a record
//            //continue to loop to the next row
//        }
//    }
//        //loop thru what we were passed and process records

//        //find rec in the table and if it doesn't exit trigger add
//        $('.invoice-entry').each(function () {
//            let children = $(this).children();
//            thistd = children[0];
//            thistdc = $(thistd).children();
//            let dateStr = thistdc[0].value;
//            if (dateStr == "" || dateEqual(dateStr, request.invoice.date)) {
//                // this is the rec I'm going to modify
//                thistdc[0].value = request.invoice.date;
//                // get name from above record
//                let name = thisdc[0].name;
//                $('[name="' + name + '.type"]').val("PROJECT");
//                $('[name="' + name + '.rateId"]').val("YUKON");
//                let times = millisToHoursMinutesAndSecondsarray(invoiceRec.workMils);
//                if (times[2] > 39) { //round up
//                    times[1] = times[1] + 1;
//                }
//                $('[name="' + name + '.hours"]').val(times[0]);
//                $('[name="' + name + '.minutes"]').val(times[1]);
//                //SendSafeRuntimeMessage({ text: "BUTRIGGER", date: request.invoice.date });
//                if (dateEqual(dateStr, request.invoice.date)) {
//                    //don't need to trigger add yet...
//                    //background will send us the next record
//                    sendResponse({ answer: "continue" });
//                    return;
//                } else {
//                    if (confirm("need new")) {
//                        sendResponse({ answer: "new" });
//                        $(addBut).trigger("click");
//                        return; // not sure about this we do want to be able to send a response and still trigger the addbut
//                    }
//                }
//            }
//            else {
//                if (confirm("need new")) {
//                    sendResponse({ answer: "new" });
//                    $(addBut).trigger("click");
//                    return;
//                }
//                //make this a sendresponse
//                //SendSafeRuntimeMessage({ text: "BUTRIGGER", date: "new" });
//            }
//        });
//    }
//});

//// test this - problem is background isn't gettting a response