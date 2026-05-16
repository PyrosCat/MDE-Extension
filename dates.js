
/**
 * Busy-wait (blocking spin-loop) for the given number of milliseconds.
 *
 * @param {number} ms
 */
function wait(ms) {
    let start = new Date().getTime();
    let end = start;
    while (end < start + ms) {
        end = new Date().getTime();
    }
}

let days = ["Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"];
/**
 * Convert a Date to its day-of-week name string (e.g. "Monday").
 *
 * @param {Date} dateIn
 * @returns {*}
 */
function dayofwktoStr(dateIn) {
    let newD = new Date(dateIn);
    if (!isNaN(newD))
        return days[newD.getDay()];
    else
        return "N/A";
}

/**
 * Compare two date strings using a relational operator (==, !=, <, >, <=, >=).
 *
 * @param {*} op
 * @param {string} strdate1
 * @param {string} strdate2
 * @returns {boolean}
 */
function compareStrDates(op, strdate1, strdate2) { // passed string dates, return true false depending on op
    let jDate1 = new Date(strdate1);
    let jDate2 = new Date(strdate2);
    if (op == 'GE') {
        if (jDate1 >= jDate2)
            return true;
        else
            return false;
    }
    if (op == 'LE') {
        if (jDate1 <= jDate2)
            return true;
        else
            return false;
    }
}

/**
 * Compare two date values, returning -1, 0, or 1.
 *
 * @param {Date} date1
 * @param {Date} date2
 * @returns {*}
 */
function localCompMMDDYY(date1, date2) { //passed date as a string
    let d1 = new Date(date1);
    let c1 = (d1.getMonth() + 1) + '/' + d1.getDate() + '/' + d1.getFullYear();
    let d2 = new Date(date2);
    let c2 = (d2.getMonth() + 1) + '/' + d2.getDate() + '/' + d2.getFullYear();
    return (c1 == c2);
}

/**
 * Strip the time component from a Date, returning midnight of the same day.
 *
 * @param {Date} d1
 * @returns {*}
 */
function justDate4Compare(d1) { //passed javascript date, return javascript date
    let newDate = new Date((d1.getMonth() + 1) + '/' + d1.getDate() + '/' + d1.getFullYear());
    return newDate;
}

/**
 * Check whether two Dates fall on the same calendar day.
 *
 * @param {Date} d1
 * @param {Date} d2
 * @returns {*}
 */
function justDateEqual(d1, d2) { // pass javascript date object
    let d1s = (d1.getMonth() + 1) + '/' + d1.getDate() + '/' + d1.getFullYear();
    let d2s = (d2.getMonth() + 1) + '/' + d2.getDate() + '/' + d2.getFullYear();
    return (d1s == d2s);
}


/**
 * Format a millisecond duration as an "H:MM:SS" string.
 *
 * @param {*} workT
 * @returns {*}
 */
function millisToHoursMinutesAndSeconds(workT) {
    let millis = Math.abs(workT);
    let hours = Math.floor(millis / (60 * 60 * 1000));
    let minless = millis - (hours * (60 * 60 * 1000));
    let minutes = Math.floor(minless / 60000);
    let seconds = ((minless % 60000) / 1000).toFixed(0);
    if (seconds == 60) {
        //console.log("moved seconds", workT, hours, minutes, seconds);
        minutes++
        seconds = 0;
        if (minutes >= 60) {
            hours++;
            minutes = minutes - 60;
        }
    }
    return pad(hours) + ":" + pad(minutes) + ":" + pad(seconds);
}

/**
 * Remove the seconds component from a "HH:MM:SS" time string, returning "HH:MM".
 *
 * @param {string} strIn
 * @returns {*}
 */
function stripSecs(strIn) { //format in is 00:00:00 - out is 00:00 with secs rounded up
    let pieces = strIn.split(":");
    if (pieces.length != 3)
        return strIn; //bad format
    let hours = parseInt(pieces[0]);
    let mins = parseInt(pieces[1]);
    let secs = parseInt(pieces[2]);
    if (isNaN(hours) || isNaN(mins) || isNaN(secs))
        return strIn; //invalid format
    if (secs > 30) {
        //console.log("moved seconds", workT, hours, minutes, seconds);
        mins++
        if (mins >=  60) {
            hours++;
            mins = 60 - mins;
        }
    }
    return pad(hours) + ":" + pad(mins); 
}

/**
 * Format a millisecond duration as an "H:MM" string.
 *
 * @param {*} workT
 * @returns {*}
 */
function millisToHoursMinutes(workT) {
    let millis = Math.abs(workT);
    let hours = Math.floor(millis / (60 * 60 * 1000));
    let minless = millis - (hours * (60 * 60 * 1000));
    let minutes = Math.floor(minless / 60000);
    let seconds = ((minless % 60000) / 1000).toFixed(0);
    if (seconds > 30 ) {
        //console.log("moved seconds", workT, hours, minutes, seconds);
        minutes++
        seconds = 0;
        if (minutes >= 60) {
            hours++;
            minutes = minutes - 60;
        }
    }
    return pad(hours) + ":" + pad(minutes);
}


/**
 * Format a millisecond duration as a "M:SS" string.
 *
 * @param {*} workT
 * @returns {*}
 */
function millisToMinutesAndSeconds(workT) {
    let millis = Math.abs(workT);
    let minutes = Math.floor(millis / 60000);
    let seconds = ((millis % 60000) / 1000).toFixed(0);
    if (seconds >= 60) {
        //console.log("moved seconds 2", workT,  minutes, seconds);
        minutes++
        seconds = 0;
    }
    return pad(minutes) + ":" + pad(seconds);
}

/**
 * Format a millisecond duration as "M:SS.f" with a fractional second.
 *
 * @param {*} workT
 * @returns {*}
 */
function millisToMinSecFraction(workT) {
    let millis = Math.abs(workT);
    let minutes = Math.floor(millis / 60000);
    let seconds = ((millis % 60000) / 1000).toFixed(0);
    return (minutes + (parseInt(seconds) / 60));
}

// slightly different - but not by much
/**
 * Format a millisecond duration as a "H:MM:SS" string (alias).
 *
 * @param {boolean} duration
 * @param {*} hoursIn
 * @returns {*}
 */
function msToTime(duration, hoursIn) {
    let retStr = "";
    let milliseconds = parseInt((duration % 1000) / 100)
        , seconds = parseInt((duration / 1000) % 60)
        , minutes = parseInt((duration / (1000 * 60)) % 60)
        , hours = parseInt((duration / (1000 * 60 * 60)) % 24);
    if (hoursIn == true) {
        hours = (hours < 10) ? "0" + hours : hours;
        retStr = hours + ":";
    }
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;
    retStr += minutes + ":" + seconds;
    return retStr;
}



/**
 * Return a millisecond duration as an [hours, minutes, seconds] array.
 *
 * @param {*} workT
 * @returns {*}
 */
function millisToHoursMinutesAndSecondsarray(workT) {
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
    timea[0] = pad(hours);
    timea[1] = pad(minutes);
    timea[2] = pad(seconds);
    return timea;
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

// pay period is 2 weeks - starts on a sunday - starting on april 1 2018.

let beg = new Date('03/18/18');


/**
 * Return the start date of the biweekly pay period containing a given date.
 *
 * @param {Date} passedDate
 * @returns {*}
 */
function dates_getStartofPeriod(passedDate) {
    let weeks;
    let weekstart;
    let today = new Date();
    if (passedDate != null) {
        today = passedDate;
    }

    let indate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    //console.log(indate);

    weekstart = getStartofThisWeek(indate);
    weeks = mydiff(beg, weekstart, 'weeks');
    if ((weeks % 2) == 1) {
        // go back 1 week
        weekstart.setDate(weekstart.getDate() - 7);
    }
    return weekstart;
}

/**
 * Format a Date as a "MM/DD/YY" string.
 *
 * @param {Date} d
 * @returns {*}
 */
function date2mmddyy(d) {
    let retStr = (d.getMonth() + 1) + '/' + d.getDate() + '/' + d.getFullYear();
    return retStr;
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
    return d1 == d2;
}

/**
 * Return the Sunday that begins the week containing the given date.
 *
 * @param {Date} inDate
 * @returns {*}
 */
function getStartofThisWeek(inDate) {
    //console.log(inDate);
    let d = new Date(inDate.getFullYear(), inDate.getMonth(), inDate.getDate(), 0, 0, 0);
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
        case "mills": return timediff;
        default: return undefined;
    }
}

/**
 * Parse a "MM:SS" time string into its millisecond value.
 *
 * @param {string} str
 * @returns {number}
 */
function MMSStimeStrToMills(str) {
    let pieces = str.split(":");
    if (pieces.length != 2) {
        return 0;
    }

    if (isNaN(pieces[0]) || isNaN(pieces[1]))
        return 0;

    let tm = parseInt(pieces[0]);
    let ts = parseInt(pieces[1]);

    let wt = tm * 60000;
    wt += ts * 1000;
    return wt;
}

Date.prototype.withoutTime = function () {
    let d = new Date(this);
    d.setHours(0, 0, 0, 0);
    return d;
};

/**
 * Format a Date's time portion as "H:MM:SS AM/PM".
 *
 * @param {Date} dateIn
 * @returns {*}
 */
function dateMsToTime(dateIn) {
    //set new Date with just time
    let newDate = new Date('01/01/1978');
    //set timeon new date to be time on dateIn
    newDate.setHours(dateIn.getHours(), dateIn.getMinutes(), 0);
    return newDate;
}
// results 
/**
 * Return true if a time string falls between two boundary time strings.
 *
 * @param {*} cur
 * @param {*} start
 * @param {*} stop
 */
function isTimeBetween(cur, start, stop) {
    let curJtime;
    let startJtime;
    let stopJtime;
    curJtime = dateMsToTime(cur);
    startJtime = dateMsToTime(start);
    stopJtime = dateMsToTime(stop);

    if (stopJtime == startJtime)
        return false;
    if (stopJtime >= startJtime) {
        if (curJtime > startJtime && curJtime <= stopJtime)
            return true;
        else
            return false;
    }
    //  they are on separate days
    if (curJtime <= stopJtime)
        return true;
    else if (curJtime >= startJtime)
        return true;

    return false;
}

/**
 * Parse an "HH:MM" time string into its millisecond value.
 *
 * @param {string} str
 * @returns {number}
 */
function timeHHMMtoMils(str) {
    //format in is HH:MM

    let pieces = str.split(":");
    if (pieces.length != 2) {
        return 0;
    }
    
    if (isNaN(pieces[0]) || isNaN(pieces[1]))
        return 0;

    let th = parseInt(pieces[0]);
    let tm = parseInt(pieces[1]);

    //let wt = th * 3600000;
    //wt += tm * 60000;
    let newDate = new Date();
    newDate.setHours(th,tm,0)
    return newDate;
}
//input is a date, output is a date + mins in secs
/**
 * Return a new Date offset forward by a given number of minutes.
 *
 * @param {Date} d
 * @param {number} mins
 * @returns {*}
 */
function addMins(d, mins) {
    let nd = new Date();
    nd.setTime(d.getTime() + (mins * 60000));
    return nd;
}


/**
 * Parse a time string in several formats into its millisecond value.
 *
 * @param {string} str
 * @returns {number}
 */
function timeStrToMills(str) {
    let pieces = str.split(":");
    if (pieces.length != 3) {
        return 0;
    }

    if (isNaN(pieces[0]) || isNaN(pieces[1]) || isNaN(pieces[2]))
        return 0;

    let th = parseInt(pieces[0]);
    let tm = parseInt(pieces[1]);
    let ts = parseInt(pieces[2]);

    let wt = th * 3600000;
    wt += tm * 60000;
    wt += ts * 1000;
    return wt;
}

//custom split

Date.prototype.addDays = function (days) {
    let dat = new Date(this.valueOf());
    dat.setDate(dat.getDate() + days);
    return dat;
}

Date.prototype.adjustMins = function (mins) {
    if (mins == 0)
        return this.valueOf();
    let dat = new Date(this.valueOf());
    if (mins < 0) {
        //let time2sub = Math.abs(mins) * 60000;
        //let time = dat.getTime();
        //let newTime = time - time2sub;
        //dat.setTime(newTime);
        dat.setTime(dat.getTime() - (Math.abs(mins) * 60000));
    }
    else
        dat.setTime(dat.getTime() + (mins * 60000));
    return dat;
}

Date.prototype.subMins = function (mins) {
    let dat = new Date(this.valueOf());
    dat.setDate(dat.getTime() - (mins * 60000));
    return dat;
}
 
Date.prototype.subDays = function (days) {
    let dat = new Date(this.valueOf());
    dat.setDate(dat.getDate() - days);
    return dat;
}

Date.prototype.justDate = function () {
    let d = new Date(this.valueOf());
    return (d.getMonth() + 1) + '/' + d.getDate() + '/' + d.getFullYear();
}

Date.prototype.justshortDate = function () {
    let d = new Date(this.valueOf());
    return (d.getMonth() + 1) + '/' + d.getDate() + '/' + d.getFullYear().toString().substr(-2);
}

/**
 * Return a copy of a Date with its year changed to the given value.
 *
 * @param {Date} indate
 * @param {number} num
 * @returns {*}
 */
function chgYear(indate, num) {
    let year = indate.getFullYear() + num;
    let month = indate.getMonth() + 1;
    let day = indate.getDate();
    let strMonth = (month < 10) ? '0' + month : month;
    let strDay = (day < 10) ? '0' + day : day;
    return year + '-' + strMonth + '-' + strDay;
}

/**
 * Parse a date string from an HTML input element into a Date.
 *
 * @param {string} str
 * @returns {*}
 */
function dateFromHTML(str) {
    let str1 = str.split("-");
    let t = new Date(str1[1] + "/" + str1[2] + "/" + str1[0]);
    return t;
}

let TDATE = "JDate";
let SDATE = "MM/DD/YY";

let dst =
    [{ y: "2015", s: "3/8/2015 02:00 AM", e: "11/1/2015  02:00 AM" },
        { y: "2016", s: "3/13/2016  02:00 AM", e: "11/6/2015  02:00 AM" },
        { y: "2017", s: "3/12/2017  02:00 AM", e: "11/5/2017  02:00 AM" },
        { y: "2018", s: "3/11/2018  02:00 AM", e: "11/4/2018  02:00 AM" },
        { y: "2019", s: "3/10/2019  02:00 AM", e: "11/3/2019  02:00 AM" },
        { y: "2020", s: "3/8/2020  02:00 AM", e: "11/1/2020  02:00 AM" },
        { y: "2021", s: "3/14/2021  02:00 AM", e: "11/7/2021  02:00 AM" },
        { y: "2022", s: "3/13/2022  02:00 AM", e: "11/6/2022  02:00 AM" },
        { y: "2023", s: "3/12/2023  02:00 AM", e: "11/5/2023  02:00 AM" },
        { y: "2024", s: "3/10/2024  02:00 AM", e: "11/3/2024  02:00 AM" }];
// does user have daylight savings time..

//ca is 7 hours if dst, 8 if not
/**
 * Return the UTC offset in hours for the US/Canada Pacific time zone.
 *
 * @param {*} input
 * @returns {*}
 */
function getCaOffset(input) {
    let i;
    let thisDate = new Date(input);
    for (i = 0; i < dst.length; i++) {
        if (dst[i].y == thisDate.getFullYear()) {
            let start = new Date(dst[i].s);
            let end = new Date(dst[i].e);
            if (input >= start && input <= end)
                return (7*60);
        }
    }
    return (8*60);
}

//input is always a javascript date. output type can be STRING or TDATE (javascript date)
/**
 * Convert a local Date to its US Pacific equivalent.
 *
 * @param {Date} datein
 * @param {string} dateOutType
 * @returns {*}
 */
function convert2Pacfic(datein, dateOutType) {
    let d = new Date(datein);
    let mills;
    let mins = d.getTimezoneOffset();
    // now mins is local offset from GMT. 
    let caMins = getCaOffset(datein);
    let mindiff = mins - caMins;
    let adjusted = new Date(datein.adjustMins(mindiff)); 
    // check once more in case the adjustment put ca back to pre/post daylight switch
    let caMins2 = getCaOffset(adjusted); 
    if (mins > caMins && caMins != caMins2) {// if my timezone is eligible for the switch (I am east of CA), maybe they haven't switched yet
        mindiff = mins - caMins2;
        adjusted = new Date(datein.adjustMins(mindiff));
    }
    //convert to output format
    if (dateOutType == "TDATE")
        return adjusted;
    else
        return (adjusted.getMonth() + 1) + '/' + adjusted.getDate() + '/' + adjusted.getFullYear() + ' ' + adjusted.toLocaleTimeString();
}

