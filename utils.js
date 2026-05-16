let s_utslog = false;
let alertOnce = true;
let mde_logit = false;
let mde_local = true;
//desc will always be one of these
let releasedStr = "Released";
let ncStr = "Not Complete";
let submittedStr = "Submitted";
let cancelledStr = "Cancelled";
let inprocessStr = ncStr;
let background_basephraseArray = [{ Phrase: "no data yet" }];
let background_basenewphraseArray = [{ Phrase: "MDESAYS NO no data yet" }];



/**
 * Set the monitored URL pattern for a content script.
 * @returns {*}
 */
function GetLogStatus() {
    return s_utslog;
}

/**
 * Check whether the chat user-list panel is present in the DOM.
 */
function chatLoaded() {
    let ff = $(".user-list").find('.u-name');
    if (ff.length > 2) {
        // lets assume its loaded
        return true;
    }
    else {
        return false;
    }
}


/**
 * Enable or disable debug logging.
 *
 * @param {*} status
 */
function setLogStatus(status) {
    s_utslog = status;
}

/**
 * Aggregate record count, work time, and RAET for tasks on a given date.
 *
 * @param {Object} reportData
 * @param {Date} optDate
 * @param {Object} range
 * @returns {*}
 */
function getTotalsToday(reportData, optDate, range) { //optDate is either a string or javascript date
    let total = { recs: 0, date: null, work: 0, raet: 0 };
    let dday = new Date(Date.now());

    if (optDate != null) {
        if (typeof optDate === "string")
            dday = new Date(optDate);
        else
            dday = optDate;
    }

    total.date = (dday.getMonth() + 1) + '/' + dday.getDate() + '/' + dday.getFullYear();

    for (let i = 0; i < reportData.length; i++) {
        let obj = reportData[i];
        // get date of this rec
        let curD = new Date(obj.dateofTask);
        let curDate = (curD.getMonth() + 1) + '/' + curD.getDate() + '/' + curD.getFullYear();
        if (curDate == total.date) {
            total.work += obj.workTime; // total in milliseconds
            total.recs++;
            if (obj.workTime > 0 && obj.taskDesc != getncConstant()) {
                //worktime not 0 and status not incomplete
                if (obj.taskDesc != getReleasedConstant())
                    total.raet += processAET(obj.taskAET, range);
                else
                    total.raet = total.raet + millisToMinSecFraction(obj.workTime);
            }
        }
    }

    return total;
}


/**
 * Show a browser alert dialog with the given message.
 *
 * @param {string} msg
 */
function handleAlert(msg) {
    alert(msg);
}

/**
 * Remove NRT log entries older than one month.
 *
 * @param {Object} logData
 * @returns {*}
 */
function NRTLogCleanup(logData) {
    //delete records older than 1 month
    let startlen = logData.length;
    let dday = new Date(Date.now());
    dday = dday.subDays(31);
    let newlogData = logData.filter(function (rec) {
        let compDate = new Date(rec.dateMills);
        return (compDate > dday);
    });
    if (newlogData.length != startlen)
    return newlogData;
}

/**
 * Append a near-real-time log entry to chrome.storage.
 *
 * @param {string} typeIn
 */
function saveNRT(typeIn) {
    let type = typeIn;
    let nrtRec = { type: "b", dateMills: 0 };

    // get current line
    logObject("saveNRT", "type is " + typeIn);
    chrome.storage.local.get('MDENRTLOG', function (data) { //ok
        if (chrome.runtime.lastError) {

        }

        let nrtRecs = [];
        nrtRec.type = type;
        nrtRec.dateMills = new Date().getTime();

        // need to make sure there is data here
        if (data.MDENRTLOG != null) {
            nrtRecs = JSON.parse(data.MDENRTLOG);
            nrtRecs = NRTLogCleanup(nrtRecs);
            nrtRecs.push(nrtRec);
        }
        else {
            nrtRecs = new Array();
            nrtRecs.push(nrtRec);
        }
        chrome.storage.local.set({ 'MDENRTLOG': JSON.stringify(nrtRecs) }, function () {
        });
    });
}

//format is M.FractionofMin(mm:ss)
/**
 * Parse a display AET string into its millisecond value.
 *
 * @param {string} str
 * @param {Object} range
 * @returns {number}
 */
function convertdisplayAETtomils(str, range) {
    let pieces = str.split("(");
    if (pieces.length != 2) {
        return 0;
    }

    let newAET = str;
    if (range != null && str.indexOf(" - ") > -1) {
        let ranges = str.split(" - ");
        if (range == "HIGH")
            newAET = ranges[1];
        //else if (range == "LOW")
        //    newAET = ranges[0];
        else if (range == "MID") {
            let numl = parseFloat(ranges[0]);
            let numh = parseFloat(ranges[1]);
            let diff = numh - numl;
            let num = numl + (diff / 2);
            newAET = num.toString();
        }
    }
    let tm = parseFloat(newAET);
    return tm * 60000;
}

/**
 * Calculate the AET value from a work-time millisecond total.
 *
 * @param {number} millsIn
 * @returns {*}
 */
function mills2AETfromWork(millsIn) { //in is mils out is string
    let workT = millisToHoursMinutesAndSecondsarray(millsIn); //output is timea array (hours,mins,second as string)
    //timea[0] = pad(hours);
    //timea[1] = pad(minutes);
    //timea[2] = pad(seconds);
    let mf = parseInt(workT[1]) + (parseInt(workT[2]) / 60);
    mf = mf.toFixed(1);
    return convertAET(mf.toString(), null);
}

/**
 * Convert an AET string between decimal and HH:MM formats.
 *
 * @param {Object} aet
 * @param {Object} range
 * @returns {*}
 */
function convertAET(aet, range) { //input is string, output is string
    // convert fraction string aet to mm:ss string
    //first see if there are ranges
    let newAET = aet;
    if (range != null && aet.indexOf(" - ") > -1) {
        let ranges = aet.split(" - ");
        if (range == "HIGH")
            newAET = ranges[1];
        //else if (range == "LOW")
        //    newAET = ranges[0];
        else if (range == "MID") {
            let numl = parseFloat(ranges[0]);
            let numh = parseFloat(ranges[1]);
            let diff = numh - numl;
            let num = numl + (diff / 2);
            newAET = num.toString();
            //end check for mid point
        }
    }
    else {
        let tAET = parseFloat(newAET).toFixed(1);
        newAET = tAET.toString();
        aetStr = newAET;
    }

    let pieces = newAET.split('.');
    let aetStr = aet;
    let fraction = 0
    if (pieces.length > 0) {
        //first minutes
        if (pieces[0] == ".") {
            aetStr += "(00:";
            fraction = parseInt(pieces[1]);
        }
        else if (pieces.length == 1) {
            aetStr += '(' + pad(pieces[0]) + ':';
            fraction = 0;
        }
        if (pieces.length == 2) {
            if (pieces[0] == '.')
                aetStr += "(00:";
            else {
                aetStr += '(' + pad(pieces[0]) + ':';
            }
            fraction = parseInt(pieces[1]);
        }
        if (parseInt(fraction) > 0) {
            let realSecs = ((parseInt(fraction) / 10) * 60);
            realSecs = realSecs.toFixed(1);
            aetStr += pad(realSecs) + ")";
        }
        else {
            aetStr += "00)";
        }
    }
    return aetStr;
}

/**
 * Search a task-ID array for a given task string and return the index.
 *
 * @param {string} taskId
 * @param {Array} baseArray
 * @returns {*}
 */
function array_findTaskInTaskStr(taskId, baseArray) {
    for (let i = 0; i < baseArray.length; i++) {
        if (baseArray[i].taskId.length > 10 && baseArray[i].taskId != taskId) {
            if (findTaskInTaskStr(taskId, baseArray[i].taskId))
                return i;
        }
    }
    return -1;
}
//taskIds =0795964707,0795964708,0795964709
/**
 * Find a task ID within a composite task string and return its position.
 *
 * @param {*} inTask
 * @param {string} inTaskStr
 * @returns {boolean}
 */
function findTaskInTaskStr(inTask, inTaskStr) {
    //return true if this task is in this task string false if not
    if (inTaskStr.length == 10) {
        if (inTask == inTaskStr)
            return true;
        else
            return false;
    }
    //break it up
    let taskArray = inTaskStr.match(/.{1,10}/g);
    //is it there
    for (let i = 0; i < taskArray.length; i++) {
        if (taskArray[i] == inTask)
            return true;
    }
    //nope
    return false;
}

/**
 * Build a normalized task-ID string from raw task data.
 *
 * @param {string} inUrl
 * @returns {*}
 */
function buildTaskId(inUrl) {
    let outTask = "";
    let startIds = inUrl.indexOf('taskIds=');
    if (startIds == -1)
        return outTask;
    let onlyTasks = inUrl.split('taskIds=');
    if (onlyTasks.length != 2)
        return outTask;
    let multi = onlyTasks[1].split(",");
    if (multi.length == 1) //only 1 taskid
        return multi[0];
    //more than one task id - sort them and put them back together
    let newIds = multi.sort();
    let newIdStr = "";
    for (let i = 0; i < newIds.length; i++)
        newIdStr = newIdStr + multi[i];
    return newIdStr;
}

// timezone is L, P, or none (which is L)
// convert2Pacfic(datein, dateOutType)  input is always a javascript date. output type can be STRING or TDATE (javascript date)

//this function is called from:
// popup.js - before displaying records in the table
//
// lftuts.js as part of taking a backup, and before the merge 

/**
 * Return a deep copy of the task tracking array.
 *
 * @param {Object} input
 * @returns {Array}
 */
function clone_taskarray(input) {
    //let data = { taskId: "", dateofTask: "", taskDesc: "", taskAET: "", extras: "", workTime: 0 }
    let output = new Array();
    for (i = 0; i < input.length; i++) {
        output.push({ taskId: input[i].taskId, dateofTask: input[i].dateofTask, taskDesc: input[i].taskDesc, taskAET: input[i].taskAET, extras: input[i].extras, workTime: input[i].workTime });
    }
    return output;
}

/**
 * Sort a task record array by a given field name.
 *
 * @param {Date} dataA
 * @param {*} who
 * @param {number} timezone
 * @returns {number}
 */
function localSort(dataA, who, timezone) {

    let dataB = dataA.sort(function sortFunction(a, b) {
        if (who == "dateofTask" || who == "date") {
            let datea = new Date(a[who]);
            let dateb = new Date(b[who]);
            if (datea === dateb) {
                return 0;
            }
            else {
                return (datea > dateb) ? -1 : 1;
            }
        }
        else {
            if (a[who] === b[who]) {
                return 0;
            }
            else {
                return (a[who] < b[who]) ? -1 : 1;
            }
        }
    });

    //adjust time is necessary
    if (timezone == "P")
        dataB.forEach(function (el) {
            let date = new Date(el.dateofTask);
            el.dateofTask = convert2Pacfic(date, "STRING");
        });

    return dataB;
}

/**
 * Sort a task record array in reverse chronological order.
 *
 * @param {Date} dataA
 * @param {*} who
 * @param {number} timezone
 * @returns {number}
 */
function reverseSort(dataA, who, timezone) {

    let dataB = dataA.sort(function sortFunction(a, b) {
        if (who == "dateofTask" || who == "date") {
            let datea = new Date(a[who]);
            let dateb = new Date(b[who]);
            if (datea === dateb) {
                return 0;
            }
            else {
                return (datea < dateb) ? -1 : 1;
            }
        }
        else {
            if (a[who] === b[who]) {
                return 0;
            }
            else {
                return (a[who] < b[who]) ? -1 : 1;
            }
        }
    });

    //adjust time is necessary
    if (timezone == "P")
        dataB.forEach(function (el) {
            let date = new Date(el.dateofTask);
            el.dateofTask = convert2Pacfic(date, "STRING");
        });

    return dataB;
}


/**
 * Merge two task record arrays, deduplicating by task ID.
 *
 * @param {Date} dataA
 * @returns {Array}
 */
function mergeData(dataA) {
    //first sort by taskid
    let newData = localSort(dataA, "taskId", "none");
    let newFinal = [];
    let lasttaskId = "0";
    for (let i = 0; i < newData.length; i++) {
        if (newData[i].taskId == lasttaskId) {
            if (newData[i].workTime > 0) {
                // update rec in newFinal
                for (x = 0; x < newFinal.length; x++) {
                    if (newFinal[x].taskId == newData[i].taskId) {
                        let action = incompleteAfterSubmit(newData[i], newFinal[x]);
                        //0 = means add times together
                        //1 = means drop not complete
                        if (action == 0) {
                            logObject("mergeData", "before times merged, newFinal, newData", newFinal[x], newData[i]);
                            newFinal[x].workTime += newData[i].workTime;
                            logObject("mergeData", "after times merged, newFinal", newFinal[x]);
                        }
                        else {
                            //drop the time on the not complete one.
                            if (newData[i].taskDesc == getncConstant())
                                logObject("mergeData", "Found this in merge and am discarding workTime", newData[i]);
                            else
                                if (newFinal[x].taskDesc == getncConstant()) {
                                    logObject("mergeData", "Found this in merge and am discarding workTime. second obj has worktime saved", newFinal[x], newData[i]);
                                    newFinal[x].workTime = newData[i].workTime;
                                }
                                else {
                                    logObject("mergeData", "Should not be here, this obj worktime is not being counted,second obj has worktime saved", newData[i], newFinal[x]);
                                }
                        }

                        //if  taskrec  has been submitted or released make sure the desc is correct
                        let dateCur = new Date(newData[i].dateofTask);
                        let dateBase = new Date(newFinal[x].dateofTask);
                        //keep the date when first acquired on rec
                        newFinal[x].dateofTask = (dateCur < dateBase) ? newData[i].dateofTask : newFinal[x].dateofTask;
                        if (newData[i].taskDesc == getSubmittedConstant() || newData[i].taskDesc == getReleasedConstant())
                            newFinal[x].taskDesc = newData[i].taskDesc; //once submitted/released, always submitted/released.
                        break;
                    }
                }
            }
            else
                logObject("mergeData", "Found this in  merge and am discarding it, worktime was 0", newData[i]); //worktime was 0
        }
        else {
            lasttaskId = newData[i].taskId;
            //let data = { taskId: "", dateofTask: null, taskDesc: "", taskAET: "", extras: "", workTime: 0 };//definition of dataObj
            newFinal.push({
                taskId: newData[i].taskId, dateofTask: newData[i].dateofTask,
                taskDesc: newData[i].taskDesc, taskAET: newData[i].taskAET, extras: newData[i].extras, workTime: newData[i].workTime
            });
        }
    }

    // so one last thing - if we have an incomplete and another task exists that has this number in a set of task ids - this is a task they looked at after it had been submitted 
    // and they didn't re-submit. So we need to just delete this record. 
    //select all incompletes
    let onlyIncomplete = newFinal.filter(function (element) {
        return (element.taskDesc == getncConstant());
    });
    //look at each one, find a matching rec in newFinal that is submitted or released and has this taskid
    let taskRecs2Delete = new Array();
    for (let newIndex = 0; newIndex < onlyIncomplete.length; newIndex++) {
        for (let oldIndex = 0; oldIndex < newFinal.length; oldIndex++) {
            if (findTaskInTaskStr(onlyIncomplete[newIndex].taskId, newFinal[oldIndex].taskId)) {
                if (newFinal[oldIndex].taskDesc == getSubmittedConstant() || newFinal[oldIndex].taskDesc == getReleasedConstant())
                    // this record in newFinal_1 needs to be deleted
                    taskRecs2Delete.push({ taskId: onlyIncomplete[newIndex].taskId, dateofTask: onlyIncomplete[newIndex].dateofTask });
            }
        }
    }
    //if (taskRecs2Delete.length > 0)
    //get rid of it. 
    for (let newIndex = 0; newIndex < taskRecs2Delete.length; newIndex++) {
        newFinal = S_DeleteRec(taskRecs2Delete[newIndex].taskId, taskRecs2Delete[newIndex].dateofTask, newFinal);
    }
    // go through the records one more time. 
    // if the task is complete and the task is in another task that is complete, set the AET on this task to 0. but keep everything else the same.
    for (let newIndex = 0; newIndex < newFinal.length; newIndex++) {
        let foundIt = array_findTaskInTaskStr(newFinal[newIndex].taskId, newFinal);
        if (foundIt > -1) {
            if (newFinal[foundIt].taskDesc == getSubmittedConstant() || newFinal[foundIt].taskDesc == getReleasedConstant()) {
                if (newFinal[newIndex].taskAET != '0.0') {
                    //set aet on this rec to 0
                    newFinal[newIndex].taskAET = '0.0';
                }
            }
        }
    }

    return newFinal;
}

/**
 * Delete a task record from the tracking array by task ID.
 *
 * @param {*} taskIn
 * @param {Date} taskDateIn
 * @param {Date} dataA
 * @returns {boolean}
 */
function S_DeleteRec(taskIn, taskDateIn, dataA) {
    if (dataA == null)
        return null;
    let newarray = dataA.filter(function (element) {
        if (taskIn == element.taskId && taskDateIn == element.dateofTask) {
            console.log("dropping incomplete for prior commit", element)
            return false;
        }
        else
            return true;
    });
    return newarray;
}

/**
 * Build the HTML string for a tracker period-total summary row.
 *
 * @param {Object} totalAET
 * @param {number} totalTime
 * @param {number} totalTaskCount
 * @param {string} d
 * @returns {*}
 */
function buildTotalLine(totalAET, totalTime, totalTaskCount, d) {
    // add a total line
    // make minutes out of 
    // convert totalAET to milliseconds and then compare it to totalTime
    let diff = (totalAET * 60000) - totalTime;
    let diffStr = millisToHoursMinutesAndSeconds(diff);
    if (diff < 0) {
        diffStr = "-" + diffStr;
    }

    let aetStr = millisToHoursMinutesAndSeconds(totalAET * 60000);
    let line = 'Total for ' + d + '\t' + totalTaskCount + '\t' + '\t\t' + aetStr + '\t' + millisToHoursMinutesAndSeconds(totalTime) + '\t' + diffStr;
    return line;
}

/**
 * Serialize the tracking data to a downloadable JSON backup string.
 *
 * @param {Date} dataIn
 * @param {Object} request
 * @param {Object} range
 */
function backupTrack(dataIn, request, range) {
    let d = new Date();
    let lastDate = (d.getMonth() + 1) + '/' + d.getDate() + '/' + d.getFullYear();
    let strFile = request == "report" ? "R" : "D";
    let fileName = "MDEBACKUP" + strFile + (d.getMonth() + 1) + d.getDate() + d.getFullYear() + ".txt";
    let curDate = null;
    let today = lastDate;
    let totalAET = 0;
    let totalTime = 0;
    let totalTaskCount = 0;
    let bigLine = "";
    if (request == "report")
        bigLine = "Task\tDate ACQ\tAET\tTimeWorked\tExtras\ttaskDesc";
    //merge records before I do anything
    let dataB = mergeData(dataIn);
    // sort them to be by date
    let reportData = localSort(dataB, "dateofTask", "none");
    //loop thru data and send it log messages
    for (let i = 0; i < reportData.length; i++) {
        let obj = reportData[i];
        // get date of this rec
        d = new Date(obj.dateofTask);
        curDate = (d.getMonth() + 1) + '/' + d.getDate() + '/' + d.getFullYear();
        if ((curDate != lastDate) && totalTaskCount > 0 && request == "report") {
            //call make a date row
            //insert date row at the right place
            let l = buildTotalLine(totalAET, totalTime, totalTaskCount, lastDate);
            //fix this postioning
            // if it's today - we are adding it to the top too
            if (bigLine == "")
                bigLine = l;
            else
                bigLine += '\n' + l;
            totalAET = 0;
            totalTime = 0;
            totalTaskCount = 0;
        }
        totalTaskCount++;
        lastDate = curDate;
        let start = new Date(obj.dateofTask);
        let end = obj.workTime;
        let subDesc = "";
        if (start != "Invalid Date" && end > 0) {
            totalTime += obj.workTime // total in milliseconds
            if (obj.taskAET == "")
                obj.taskAET = "0.0";
            totalAET = totalAET + parseFloat(obj.taskAET);
            subDesc = msToTime(obj.workTime, true);
        }
        aetStr = convertAET(obj.taskAET, range);
        let line = obj.taskId + "\t" + obj.dateofTask + "\t" + aetStr + "\t" + subDesc + "\t" + obj.extras + "\t" + obj.taskDesc;
        if (bigLine == "")
            bigLine = line;
        else
            bigLine += '\n' + line;
    }
    if (request == "report") {
        // do the last total line 
        l = buildTotalLine(totalAET, totalTime, totalTaskCount, lastDate);
        bigLine += '\n' + l;
    }

    writeLine(bigLine, fileName, true);
}

//, saveAs: true

/**
 * Trigger a browser file download with given filename and content.
 *
 * @param {string} url
 * @param {string} fileName
 * @returns {*}
 */
function p_download(url, fileName) {
    return new Promise(
        (resolve, reject) => {
            chrome.downloads.download({ url: url, filename: fileName }, function (id) {
                resolve(id);
                // fail
                reject(id);
            });
        }
    );
}


/**
 * Append a formatted line to the report output buffer.
 *
 * @param {Object} bigLine
 * @param {string} fileName
 * @param {*} tobackground
 */
function writeLine(bigLine, fileName, tobackground) {
    let blob = new Blob([bigLine], { type: 'text/plain' });
    let url = URL.createObjectURL(blob);
    if (tobackground) //ask backgrond to actually download this
        SendSafeRuntimeMessage({ text: "BACKTHISUP", url: url, fileName: fileName });
    else {
        p_download(url, fileName)
            .then(function (result) {
            })
            .catch(function (error) {
                // failed
            });
    }
}


/**
 * Clear the context-change alert state for a given task.
 */
function resetAlert4Context() {
    alertOnce = true;
}

/**
 * Return true if the Chrome extension runtime context is still active.
 *
 * @param {string} msg
 */
function isValidChromeRuntime(msg) {
    let newMsg = "MDE: chrome extension mismatch - please refresh this page to restore functionality.";
    if (msg != undefined)
        newMsg = msg;

    try {
        chrome.runtime.getManifest();
    }
    catch (err) {
        if (alertOnce) {
            alertOnce = false;
            alert(newMsg);
        }
        else
        return false;
    }
    return true;
}

/**
 * Remove leading zeros from a numeric string.
 *
 * @param {Object} totals
 * @returns {*}
 */
function stripLeadingZeros(totals) {
    let nTotals = { today: "", periodtotal: "", surplus: "" };

    nTotals.today = totals.today.replace(/00/g, "0");
    nTotals.weektotal = totals.weektotal.replace(/00/g, "0");
    nTotals.periodtotal = totals.periodtotal.replace(/00/g, "0");
    nTotals.surplus = totals.surplus.replace(/00/g, "0");
    return nTotals;
}


/**
 * Parse and normalize an AET value string for storage.
 *
 * @param {Object} taskAET
 * @param {Object} aetrange
 * @returns {*}
 */
function processAET(taskAET, aetrange) {  //input is string output is number
    let newAET = taskAET;
    if (taskAET.indexOf(" - ") != -1) {
        let newTime = taskAET.split(" - ");
        if (aetrange == "HIGH")
            newAET = newTime[1];
        //else if (aetrange == "LOW")
        //    newAET = newTime[0];
        else if (aetrange == "MID") {
            let numl = parseFloat(newTime[0]);
            let numh = parseFloat(newTime[1]);
            let diff = numh - numl;
            let num = numl + (diff / 2);
            newAET = num.toString();
            //end check for mid point
        }
    }
    return parseFloat(newAET);
}

/**
 * Parse an AET string and return its floating-point numeric value.
 *
 * @param {Object} taskAET
 * @param {Object} aetrange
 * @returns {*}
 */
function processAETnFloat(taskAET, aetrange) { //input = "8-9" return milliseconds
    let newAET = taskAET;
    if (taskAET.indexOf(" - ") != -1) {
        let newTime = taskAET.split(" - ");
        if (aetrange == "HIGH")
            newAET = newTime[1];
        //else if (aetrange == "LOW")
        //    newAET = newTime[0];
        else if (aetrange == "MID") {
            let numl = parseFloat(newTime[0]);
            let numh = parseFloat(newTime[1]);
            let diff = numh - numl;
            let num = numl + (diff / 2);
            newAET = num.toString();
            //end check for mid point
        }
    }
    return parseFloat(newAET) * 60000;
}
// only want to save custom ones - so I just need to get it, and unshift it

// below this should go into it's own file


//returns filename
/**
 * Serialize an array to a formatted string for file export.
 *
 * @param {Date} data
 * @param {Object} fileprefix
 * @returns {*}
 */
function writeArray(data, fileprefix) {
    let bigLine = "";
    if (data.length == 0)
        return null;
    for (let i = 0; i < data.length; i++) {
        data[i].trim();
        if (data[i] != "")
            bigLine += data[i] + '\n';
    }
    let d = new Date();
    let fileName = fileprefix + (d.getMonth() + 1) + d.getDate() + d.getFullYear() + ".txt";
    writeLine(bigLine, fileName);
    return fileName;
}


/**
 * Apply an incremental spell-list update to the stored spell array.
 *
 * @param {Array} inputArray
 * @param {Object} obj
 * @returns {Array}
 */
function updateSpellA(inputArray, obj) {
    let inSpell = inputArray;
    let changed = false;
    //find it in the array 
    for (let i = 0; i < inSpell.length; i++) {
        if (inSpell[i].old == obj.old) {
            changed = true;
            inSpell[i].new = obj.new
        }
    }
    if (changed == false)
        inSpell.push(obj);
    return inSpell;
}

//related to totals all devices
/**
 * Load the consolidated tracking data from chrome.storage.local.
 *
 * @param {Function} func2call
 */
function getCData(func2call) {
    let local_func2call = func2call;
    chrome.storage.sync.get('MDECData', function getCurDataCallBack(data) { //ok
        if (chrome.runtime.lastError) {
            local_func2call(null);
        }
        else {
            let cdata = null;
            if (data.MDECData != null)
                cdata = JSON.parse(data.MDECData);
            local_func2call(cdata);
        }
        return;
    });
}

/**
 * Save the consolidated tracking data to chrome.storage.local.
 *
 * @param {Date} data
 */
function saveCData(data) {
    chrome.storage.sync.set({ 'MDECData': JSON.stringify(data) }, function () {
        if (chrome.runtime.lastError) {
            let alertStr = "set Error for MDECData:" + chrome.runtime.lastError.message;
            alert(alertStr);
        }
    });
}

//let data = { taskId: "", dateofTask: null, taskDesc: "", taskAET: "", extras: "", workTime: 0 }; defined in dbclick.js
/**
 * Log an object's properties to the MDE debug log.
 *
 * @param {*} from
 * @param {string} msg
 * @param {*} d
 * @param {*} d1
 */
function logObject(from, msg, d, d1) {
    if (s_utslog) {
        if (d != undefined) { /* log removed */ }
        if (d1 != undefined) { /* log removed */ }
    }
}

//0 = means do nothing special - add times together
//1 = means drop NotComplete time

/**
 * Return true if there are incomplete tasks after the last submit.
 *
 * @param {Object} curObj
 * @param {Object} baseObj
 * @returns {*}
 */
function incompleteAfterSubmit(curObj, baseObj) {
    //is it really not complete after submit? return true if not return false
    //if so ask user if they want to save this
    //figure out which record says submitted. 
    let addWorkTime = 0;
    let dropNotComplete = 1;
    if (curObj.dateofTask == baseObj.dateofTask)
        return addWorkTime;
    else {
        let msg = "(MDE) You accessed the task: " + curObj.taskId + " after submitting it, and did not re-submit the task. Time spent looking at the task is being dropped.";
        if (curObj.dateofTask < baseObj.dateofTask) {
            //cur is less 
            if (curObj.taskDesc == getSubmittedConstant() || curObj.taskDesc == getReleasedConstant()) {
                // one before was submitted. Is the other one incomplete? 
                if (baseObj.taskDesc == getncConstant()) {
                    ////yes it is - now do we want to save this? 
                    //if (confirm(msg) == true) //count as worktime 
                    //    return addWorkTime;
                    //else
                    return dropNotComplete; //time will be disregarded
                }
            }
            return addWorkTime;
        }
        else {
            //base is less 
            if (baseObj.taskDesc == getSubmittedConstant() || baseObj.taskDesc == getReleasedConstant()) {
                // one before was submitted. Is the other one incomplete? 
                if (curObj.taskDesc == getncConstant()) {
                    //yes it is - now do we want to save this? 
                    return dropNotComplete; //time will be disregarded

                    //if (confirm(msg) == true) //count as worktime 
                    //    return addWorkTime;
                    //else
                    //    return dropNotComplete; //time will be disregarded
                }
            }
            return addWorkTime;
        }
    }
}

/**
 * Return true if a message string matches a known status constant.
 *
 * @param {string} type
 * @param {string} msgStrs
 * @param {string} string2check
 * @returns {boolean}
 */
function msgStrCheck(type, msgStrs, string2check) {
    //return true if it is in there, false if not
    //string should be uppered before this call
    let recIndex = msgStrs.findIndex(x => x.type == type);
    if (recIndex > -1) {
        if (string2check.indexOf(msgStrs[recIndex].str.toUpperCase()) > -1)
            return true;
    }
    return false;
}

/**
 * Return the display string for a given task status constant.
 *
 * @param {string} type
 * @param {string} msgStrs
 * @returns {*}
 */
function msgStrGet(type, msgStrs) {
    //return true if it is in there, false if not
    //string should be uppered before this call
    let recIndex = msgStrs.findIndex(x => x.type == type);
    if (recIndex > -1)
        return msgStrs[recIndex].str;
    else
        return "Not Found";
}

/**
 * Load a custom sound file path from chrome.storage.
 *
 * @param {string} type
 * @param {number} index
 * @param {Function} func2Call
 */
function loadSound(type, index, func2Call) {
    let local_func2Call = func2Call;
    let local_index = index;
    if (type == "TRACKER") {
        chrome.storage.local.get('MDESNDTRACKER', function (data) { //ok
            if (chrome.runtime.lastError) {
            }
            else {
                let cdata = null;
                if (data.MDESNDTRACKER != null)
                    cdata = JSON.parse(data.MDESNDTRACKER);
                local_func2Call(cdata, local_index);
            }
            return;
        });
    }
    else if (type == "CHAT") {
        chrome.storage.local.get('MDESNDCHAT', function (data) { //ok
            if (chrome.runtime.lastError) {
            }
            else {
                cdata = null;
                if (data.MDESNDCHAT != null)
                    cdata = JSON.parse(data.MDESNDCHAT);
                local_func2Call(cdata, local_index);
            }
            return;
        });
    }
    else if (type == "NRT") {
        chrome.storage.local.get('MDESNDNRT', function (data) { //ok
            if (chrome.runtime.lastError) {
            }
            else {
                cdata = null;
                if (data.MDESNDNRT != null)
                    cdata = JSON.parse(data.MDESNDNRT);
                local_func2Call(cdata, local_index);
            }
            return;
        });
    }
    else if (type == "RHINDEX") {
        chrome.storage.local.get('MDESNDRHINDEX', function (data) { //ok
            if (chrome.runtime.lastError) {
            }
            else {
                cdata = null;
                if (data.MDESNDRHINDEX != null)
                    cdata = JSON.parse(data.MDESNDRHINDEX);
                local_func2Call(cdata, local_index);
            }
            return;
        });
    }
    return;
}

/**
 * Save a custom sound file path to chrome.storage.
 *
 * @param {string} type
 * @param {Date} data
 * @param {Function} func2Call
 */
function saveSound(type, data, func2Call) {
    let local_func2Call = func2Call;
    if (type == "TRACKER") {
        chrome.storage.local.set({ 'MDESNDTRACKER': JSON.stringify(data) }, function () {
            let errStr = null;
            if (chrome.runtime.lastError)
                errStr = chrome.runtime.lastError.message;
            local_func2Call(errStr);
        });
    }
    else if (type == "CHAT") {
        chrome.storage.local.set({ 'MDESNDCHAT': JSON.stringify(data) }, function () {
            errStr = null;
            if (chrome.runtime.lastError)
                errStr = chrome.runtime.lastError.message;
            local_func2Call(errStr);
        });
    }
    else if (type == "NRT") {
        chrome.storage.local.set({ 'MDESNDNRT': JSON.stringify(data) }, function () {
            errStr = null;
            if (chrome.runtime.lastError)
                errStr = chrome.runtime.lastError.message;
            local_func2Call(errStr);
        });
    }
    else if (type == "RHINDEX") {
        chrome.storage.local.set({ 'MDESNDRHINDEX': JSON.stringify(data) }, function () {
            errStr = null;
            if (chrome.runtime.lastError)
                errStr = chrome.runtime.lastError.message;
            local_func2Call(errStr);
        });
    }
    return;
}

/**
 * Return the string constant for a cancelled task status.
 * @returns {*}
 */
function getCancelledConstant() {
    return cancelledStr;
}
/**
 * Return the string constant for an in-progress task status.
 * @returns {*}
 */
function getInrocessStrConstant() {
    return inprocessStr;
}

/**
 * Return the string constant for a released task status.
 * @returns {*}
 */
function getReleasedConstant() {
    return releasedStr;
}
/**
 * Return the string constant for a not-completed task status.
 * @returns {*}
 */
function getncConstant() {
    return ncStr;
}
/**
 * Return the string constant for a submitted task status.
 * @returns {*}
 */
function getSubmittedConstant() {
    return submittedStr;
}
//copied/modified from stackoverflow 12/07/19
/**
 * Return true if a string contains only alphanumeric characters.
 *
 * @param {string} str
 */
function isAlphaNumeric(str) {
    let code;
    code = str.charCodeAt(0);
    if (!(code > 47 && code < 58) && // numeric (0-9)
        !(code > 64 && code < 91) && // upper alpha (A-Z)
        !(code > 96 && code < 123))  // lower alpha (a-z)
        return false;
    return true;
}
/**
 * No-op Chrome callback that silently consumes chrome.runtime.lastError.
 *
 * @param {boolean} response
 */
function dummyResponse(response) {
    if (chrome.runtime.lastError != undefined) {
        let lerr = chrome.runtime.lastError;
    }

}

/**
 * Send a chrome.runtime message, ignoring invalidated-context errors.
 *
 * @param {Object} obj
 * @param {Function} retFunc
 */
function SendSafeRuntimeMessage(obj, retFunc) {
    let l_retFunc = (retFunc == undefined || retFunc == null) ? dummyResponse : retFunc;
    //mde_logwrite("Runtime Sending:" + JSON.stringify(obj));
    try {
        chrome.runtime.sendMessage(obj, l_retFunc);
    }
    catch (err) {
        if (chrome.runtime.lastError != undefined) {
            mde_logwrite("Runtime Mesage Failed" + chrome.runtime.lastError + JSON.stringify(obj));
        }
    }
}

/**
 * Send a message to a tab, ignoring tab-not-found errors.
 *
 * @param {string} tabid
 * @param {Object} obj
 * @param {Function} retFunc
 */
function SendSafeTabMessage(tabid, obj, retFunc) {
    //mde_logwrite("Tab Sending:" + JSON.stringify(obj));
    if (tabid == null) //use runtime send message instead
        SendSafeRuntimeMessage(obj, retFunc);
    else {
        let lerr = chrome.runtime.lastError;
        let l_retFunc = (retFunc == undefined || retFunc == null) ? dummyResponse : retFunc;

        try {
            chrome.tabs.sendMessage(tabid, obj, l_retFunc);
        }
        catch (err) {
            if (chrome.runtime.lastError) {
                mde_logwrite("Tab  Mesage Failed" + chrome.runtime.lastError + JSON.stringify(obj));
            }
        }
    }
}

/**
 * Send a message to a specific tab by ID.
 *
 * @param {string} url
 * @param {Object} request
 * @param {Function} retFunc
 */
function sendTabMessage(url, request, retFunc) {
    let local_request = request;
    let l_retFunc = retFunc;
    chrome.tabs.query({}, function (array_of_Tabs) {
        for (let ic = 0; ic < array_of_Tabs.length; ic++) {
            let tab = array_of_Tabs[ic];
            let str = tab.url;
            if (str && str.length > 0) {
                if (str.indexOf(url) > -1) {
                    SendSafeTabMessage(tab.id, local_request, l_retFunc);
                }
            }
        }
    });
    return null;
}

let mde_logit2 = false;
let mde_local2 = true;

/**
 * Write a message to the MDE extension log in chrome.storage.
 *
 * @param {string} str
 */
function mde_logwrite(str) {
    if (mde_logit2 == false)
        return;
    else if (mde_local2) {
        return;
    }

    if (s_isValidChromeRuntime())
        //get existing storge string
        chrome.storage.local.get('mdeLog', function (data) {
            if (chrome.runtime.error) {
            }
            else {
                let newstr = Date() + ": " + str;
                if (data.mdeLog != null) {
                    let bigLine = JSON.parse(data.mdeLog);
                    bigLine = bigLine + '\n' + newstr;
                }
                else bigLine = newstr;
                chrome.storage.local.set({ 'mdeLog': JSON.stringify(bigLine) }, function () {
                    if (chrome.runtime.error) {
                    }
                });
            }
        });
}

// notifications

/**
 * Send a Chrome desktop notification with a given title and message.
 *
 * @param {string} msg
 * @param {*} from
 */
function SendNotification(msg, from) {
    let sDate = new Date();
    let msgStr = sDate.toLocaleTimeString() + ":" + msg;
    chrome.notifications.create("mde", {
        type: "basic", iconUrl: "smiley.png", title: from, message: msgStr 
    }, function (obj) {
    });
}


/**
 * Return the filename of the currently active alert sound.
 *
 * @param {string} type
 * @param {Array} soundArray
 * @returns {*}
 */
function getactivesound(type, soundArray) {
    let index = soundArray.findIndex(x => x.type == type);
    if (index == -1) {
        return null;
    }
    logObject("getactivesound", "index:type" + index + ":" + type);
    if (soundArray[index].active != "" && soundArray[index].active != null)
        return soundArray[index].active;
    else return soundArray[index].default;
}

/**
 * Build a pay-period record object for a given date range.
 *
 * @param {Object} today
 * @param {Object} locale
 * @returns {Array}
 */
function buildperiod(today, locale) {
    let period = { desc: "", startDate: 0, endDate: 0, start2week: 0, monthDesc: "", smonth: 0, emonth: 0 };
    let periodArray = new Array();

    //let today = new Date();
    for (let i = 0; i < 2; i++) {
        period.startDate = new Date(dates_getStartofPeriod(today));
        period.endDate = new Date(period.startDate.addDays(13));
        period.desc = period.startDate.justDate() + '-' + period.endDate.justDate();
        period.start2week = period.startDate.addDays(7);
        periodArray.push({ desc: period.desc, startDate: period.startDate, endDate: period.endDate, start2week: period.start2week });
        today = today.subDays(14);
    }
    //invoice.js shares this code in invoice_getStartofPeriod. if you change the code here - change it there too
    if (locale == 'I') {
        //period = { month1D: "", month2D: "", startDate: 0, endDate: 0 }; //February 2023, January 2023, 01/01/23, 02/29/23 
        let days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

        today = new Date();
        let monthn = today.getUTCMonth();
        let year = today.getUTCFullYear();
        let s1Date = new Date((monthn + 1) + '/01/' + year);
        let e1Date = new Date((monthn + 1) + '/' + days[monthn].toString() + '/' + year);
        monthn--;
        if (monthn < 0) {
            monthn = 11;
            year--
        }
        let s2Date = new Date((monthn + 1) + '/01/' + year);
        let e2Date = new Date((monthn + 1) + '/' + days[monthn].toString() + '/' + year);
        //now modify each entry
        //{ desc: "", startDate: 0, endDate: 0, start2week: 0, monthDesc: "", smonth: 0, emonthe: 0};
        periodArray[0].monthDesc = s1Date.justDate() + '-' + e1Date.justDate();
        periodArray[0].smonth = s1Date;
        periodArray[0].emonth = e1Date;
        periodArray[1].monthDesc = s2Date.justDate() + '-' + e2Date.justDate();
        periodArray[1].smonth = s2Date;
        periodArray[1].emonth = e2Date;
    }
    return periodArray;
}

//period.startDate date object
//period.endDate dateobject 
/**
 * Return true if any SPEC-type task in the array is incomplete.
 *
 * @param {Array} dataArray
 * @param {Date} startDate
 * @param {Date} endDate
 * @param {string} taskid
 * @returns {boolean}
 */
function SPECanyIncomplete(dataArray, startDate, endDate, taskid) {
    let t1 = new Date();
    let today = t1.justDate();
    //get date of last work
    let newA = localSort(dataArray, "dateofTask", "none");
    //for (let i = 0; i < newA.length; i++) {
    //    date = new Date(newA[i].dateofTask).justDate();
    //    if (date != today)
    //        i = newA.length; //break
    //}
    //were there incompletes during this period
    let newB = newA.filter(function (element) {
        if ((element.taskDesc == getSubmittedConstant() || element.taskDesc == getReleasedConstant()))
            return false;
        else if (startDate != null) {
            let cDate = new Date(element.dateofTask).justDate(); //cDate is a string
            if (compareStrDates('GE', cDate, startDate.justDate()) && compareStrDates('LE', cDate, endDate.justDate()) && element.taskId != taskid)
                return true;
        }
        else
            return true;
    });
    if (newB.length > 0)
        return newB[0];
    else
        return null;
}

//period.startDate date object
//period.endDate dateobject 
/**
 * Return true if any task in the array has an incomplete status.
 *
 * @param {Array} dataArray
 * @param {Date} startDate
 * @param {Date} endDate
 * @returns {boolean}
 */
function anyIncomplete(dataArray, startDate, endDate) {
    let t1 = new Date();
    let today = t1.justDate();
    //get date of last work
    let newA = localSort(dataArray, "dateofTask", "none");
    //for (let i = 0; i < newA.length; i++) {
    //    date = new Date(newA[i].dateofTask).justDate();
    //    if (date != today)
    //        i = newA.length; //break
    //}
    //were there incompletes during this period
    let newB = newA.filter(function (element) {
        if (element.taskDesc == getSubmittedConstant() || element.taskDesc == getReleasedConstant())
            return false;
        else if (startDate != null) {
            let cDate = new Date(element.dateofTask).justDate();
            if (cDate >= startDate.justDate() && cDate <= endDate.justDate())
                return true;
        }
        else
            return true;
    });

    if (newB.length > 0)
        return newB[0];
    else
        return null;
}

 let USRoot = "https://raterlabs.appen.com";
 let IntlRoot = "https://connect.appen.com";

/**
 * Set the monitored URL pattern for a content script.
 *
 * @param {*} suffix
 * @param {boolean} international
 */
function setURL(suffix, international) {
    let prefix = USRoot;
    if (international) {
        prefix = IntlRoot;
    }
    prefix = USRoot;
    return prefix + suffix;
}