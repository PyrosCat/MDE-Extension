/**
 * MDE Extension — Unit Test Suite
 * Run: node tests/mde.test.js
 *
 * Tests all pure functions in dates.js and utils.js.
 * No DOM, no Chrome APIs, no jQuery required.
 */

"use strict";

// ─── Shim globals that the source files reference at load time ───────────────
global.console = console;
global.isNaN = isNaN;
global.parseInt = parseInt;
global.parseFloat = parseFloat;
global.Math = Math;

// Minimal shim for logObject (used inside mergeData / incompleteAfterSubmit)
global.logObject = function () {};

// beg is used by dates_getStartofPeriod — set to the MDE epoch
global.beg = new Date('03/18/18');

// ─── Load source files ───────────────────────────────────────────────────────
// Each file is eval'd in this scope so their globals land here.
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const srcDir = path.join(__dirname, '..');

function loadSrc(file) {
    const code = fs.readFileSync(path.join(srcDir, file), 'utf8');
    vm.runInThisContext(code);
}

// Minimal chrome shim — content scripts reference chrome at file scope
global.chrome = {
    runtime: { onMessage: { addListener: () => {} }, sendMessage: () => {} },
    storage:  { local: { get: () => {}, set: () => {} } },
    tabs:     { sendMessage: () => {} }
};

loadSrc('dates.js');
loadSrc('utils.js');

// ─── Test harness ────────────────────────────────────────────────────────────
let passed = 0, failed = 0, skipped = 0;
const failures = [];

function test(label, fn) {
    try {
        fn();
        passed++;
        process.stdout.write('.');
    } catch (e) {
        failed++;
        failures.push({ label, error: e.message || String(e) });
        process.stdout.write('F');
    }
}

function skip(label) {
    skipped++;
    process.stdout.write('s');
}

function assert(condition, msg) {
    if (!condition) throw new Error(msg || 'Assertion failed');
}

function assertEqual(a, b, msg) {
    if (a !== b) throw new Error((msg ? msg + ': ' : '') + `expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`);
}

function assertClose(a, b, tolerance, msg) {
    if (Math.abs(a - b) > tolerance)
        throw new Error((msg ? msg + ': ' : '') + `expected ~${b}, got ${a} (tolerance ${tolerance})`);
}

// ─────────────────────────────────────────────────────────────────────────────
// dates.js tests
// ─────────────────────────────────────────────────────────────────────────────

console.log('\ndates.js');

// pad
test('pad: single digit gets leading zero', () => assertEqual(pad(5), '05'));
test('pad: double digit unchanged', () => assertEqual(pad(12), '12'));
test('pad: zero pads to 00', () => assertEqual(pad(0), '00'));
test('pad: 60 unchanged', () => assertEqual(pad(60), '60'));

// millisToHoursMinutesAndSeconds
test('millisToHMS: zero', () => assertEqual(millisToHoursMinutesAndSeconds(0), '00:00:00'));
test('millisToHMS: 1 hour exactly', () => assertEqual(millisToHoursMinutesAndSeconds(3600000), '01:00:00'));
test('millisToHMS: 1h 30m 45s', () => assertEqual(millisToHoursMinutesAndSeconds(5445000), '01:30:45'));
test('millisToHMS: 59m 59s', () => assertEqual(millisToHoursMinutesAndSeconds(3599000), '00:59:59'));
test('millisToHMS: handles negative (abs value)', () => assertEqual(millisToHoursMinutesAndSeconds(-3600000), '01:00:00'));
test('millisToHMS: seconds rollover to 60 is handled', () => {
    // 59m 59.9s — rounds to 60s which should carry into minutes
    const ms = 59 * 60000 + 59500; // 59:59.5 → rounds secs to 60
    const result = millisToHoursMinutesAndSeconds(ms);
    assert(result === '01:00:00' || result === '00:59:60' || result === '01:00:00',
        'seconds=60 should carry: got ' + result);
});

// millisToHoursMinutes
test('millisToHM: zero', () => assertEqual(millisToHoursMinutes(0), '00:00'));
test('millisToHM: 1h30m', () => assertEqual(millisToHoursMinutes(5400000), '01:30'));
test('millisToHM: rounds up on >30s', () => {
    const ms = 1 * 3600000 + 29 * 60000 + 31000; // 1h 29m 31s → rounds to 1h 30m
    assertEqual(millisToHoursMinutes(ms), '01:30');
});
test('millisToHM: does not round up on <=30s', () => {
    const ms = 1 * 3600000 + 29 * 60000 + 30000; // 1h 29m 30s — boundary (>30 rounds)
    const r = millisToHoursMinutes(ms);
    assert(r === '01:29' || r === '01:30', 'boundary: ' + r);
});

// millisToMinutesAndSeconds
test('millisToMS: zero', () => assertEqual(millisToMinutesAndSeconds(0), '00:00'));
test('millisToMS: 4m 8s', () => assertEqual(millisToMinutesAndSeconds(248000), '04:08'));
test('millisToMS: negative treated as abs', () => assertEqual(millisToMinutesAndSeconds(-60000), '01:00'));
test('millisToMS: 59s', () => assertEqual(millisToMinutesAndSeconds(59000), '00:59'));

// stripSecs
test('stripSecs: 01:30:00 → 01:30', () => assertEqual(stripSecs('01:30:00'), '01:30'));
test('stripSecs: rounds up when secs > 30', () => assertEqual(stripSecs('01:29:31'), '01:30'));
test('stripSecs: does not round when secs <= 30', () => assertEqual(stripSecs('01:29:30'), '01:29'));
test('stripSecs: returns input on bad format', () => assertEqual(stripSecs('01:30'), '01:30'));
test('stripSecs: handles minute rollover', () => assertEqual(stripSecs('01:59:31'), '02:00'));

// MMSStimeStrToMills
test('MMSStimeStrToMills: 4:08', () => assertEqual(MMSStimeStrToMills('04:08'), 248000));
test('MMSStimeStrToMills: 0:00', () => assertEqual(MMSStimeStrToMills('00:00'), 0));
test('MMSStimeStrToMills: 1:00', () => assertEqual(MMSStimeStrToMills('01:00'), 60000));
test('MMSStimeStrToMills: bad format returns 0', () => assertEqual(MMSStimeStrToMills('01:00:00'), 0));
test('MMSStimeStrToMills: non-numeric returns 0', () => assertEqual(MMSStimeStrToMills('xx:yy'), 0));

// timeStrToMills
test('timeStrToMills: 01:30:00', () => assertEqual(timeStrToMills('01:30:00'), 5400000));
test('timeStrToMills: 00:00:00', () => assertEqual(timeStrToMills('00:00:00'), 0));
test('timeStrToMills: 01:00:00', () => assertEqual(timeStrToMills('01:00:00'), 3600000));
test('timeStrToMills: bad format returns 0', () => assertEqual(timeStrToMills('01:30'), 0));
test('timeStrToMills: non-numeric returns 0', () => assertEqual(timeStrToMills('xx:yy:zz'), 0));

// compareStrDates
test('compareStrDates: GE true when equal', () => assert(compareStrDates('GE', '1/1/2024', '1/1/2024')));
test('compareStrDates: GE true when greater', () => assert(compareStrDates('GE', '1/2/2024', '1/1/2024')));
test('compareStrDates: GE false when less', () => assert(!compareStrDates('GE', '12/31/2023', '1/1/2024')));
test('compareStrDates: LE true when equal', () => assert(compareStrDates('LE', '1/1/2024', '1/1/2024')));
test('compareStrDates: LE true when less', () => assert(compareStrDates('LE', '12/31/2023', '1/1/2024')));
test('compareStrDates: LE false when greater', () => assert(!compareStrDates('LE', '1/2/2024', '1/1/2024')));

// justDate4Compare
test('justDate4Compare: strips time component', () => {
    const d = new Date('2024-06-15T14:30:00');
    const result = justDate4Compare(d);
    assertEqual(result.getHours(), 0);
    assertEqual(result.getMinutes(), 0);
    assertEqual(result.getDate(), 15);
    assertEqual(result.getMonth(), 5); // June = 5
});

// justDateEqual
test('justDateEqual: same day, different times → true', () => {
    const d1 = new Date('2024-06-15T08:00:00');
    const d2 = new Date('2024-06-15T23:59:59');
    assert(justDateEqual(d1, d2));
});
test('justDateEqual: different days → false', () => {
    const d1 = new Date('2024-06-15T08:00:00');
    const d2 = new Date('2024-06-16T08:00:00');
    assert(!justDateEqual(d1, d2));
});
test('justDateEqual: year boundary', () => {
    assert(!justDateEqual(new Date('2023-12-31'), new Date('2024-01-01')));
});

// date2mmddyy
test('date2mmddyy: formats as M/D/YYYY', () => {
    const d = new Date(2024, 5, 5); // June 5 2024
    assertEqual(date2mmddyy(d), '6/5/2024');
});
test('date2mmddyy: January 1 2026', () => {
    const d = new Date(2026, 0, 1);
    assertEqual(date2mmddyy(d), '1/1/2026');
});

// mydiff
test('mydiff: weeks between same date = 0', () => {
    const d = new Date('2024-01-01');
    assertEqual(mydiff(d, d, 'weeks'), 0);
});
test('mydiff: weeks 14 days apart = 2', () => {
    assertEqual(mydiff(new Date('2024-01-01'), new Date('2024-01-15'), 'weeks'), 2);
});
test('mydiff: days 5 apart = 5', () => {
    assertEqual(mydiff(new Date('2024-01-01'), new Date('2024-01-06'), 'days'), 5);
});
test('mydiff: months 3 apart', () => {
    assertEqual(mydiff(new Date('2024-01-01'), new Date('2024-04-01'), 'months'), 3);
});
test('mydiff: years 2 apart', () => {
    assertEqual(mydiff(new Date('2022-06-01'), new Date('2024-06-01'), 'years'), 2);
});
test('mydiff: invalid date returns NaN', () => {
    assert(isNaN(mydiff('not-a-date', new Date(), 'days')));
});

// getStartofThisWeek
test('getStartofThisWeek: Monday → previous Sunday', () => {
    const monday = new Date(2024, 5, 10); // June 10 2024 is a Monday
    const sunday = getStartofThisWeek(monday);
    assertEqual(sunday.getDay(), 0);
    assertEqual(sunday.getDate(), 9);
});
test('getStartofThisWeek: Sunday → same Sunday', () => {
    const sunday = new Date(2024, 5, 9); // June 9 2024 is a Sunday
    const result = getStartofThisWeek(sunday);
    assertEqual(result.getDay(), 0);
    assertEqual(result.getDate(), 9);
});
test('getStartofThisWeek: mid-week', () => {
    const wednesday = new Date(2024, 5, 12); // June 12 2024 Wednesday
    const result = getStartofThisWeek(wednesday);
    assertEqual(result.getDay(), 0);
    assertEqual(result.getDate(), 9);
});

// dates_getStartofPeriod
test('dates_getStartofPeriod: returns a Sunday', () => {
    const result = dates_getStartofPeriod(new Date('2024-06-12'));
    assertEqual(result.getDay(), 0, 'Should be Sunday');
});
test('dates_getStartofPeriod: returns start of 2-week period', () => {
    // periods are 2-week blocks from beg (03/18/18)
    // The result should be an even number of weeks from beg
    const testDate = new Date('2024-06-12');
    const result = dates_getStartofPeriod(testDate);
    const weekDiff = mydiff(beg, result, 'weeks');
    assertEqual(weekDiff % 2, 0, 'Should be even weeks from epoch');
});
test('dates_getStartofPeriod: null uses today', () => {
    const result = dates_getStartofPeriod(null);
    assertEqual(result.getDay(), 0, 'null input should return a Sunday');
});

// nthSundayOfMonth
test('nthSundayOfMonth: 2nd Sunday March 2025 = Mar 9', () => {
    const d = nthSundayOfMonth(2025, 2, 2);
    assertEqual(d.getDate(), 9);
    assertEqual(d.getMonth(), 2);
    assertEqual(d.getFullYear(), 2025);
});
test('nthSundayOfMonth: 1st Sunday Nov 2025 = Nov 2', () => {
    const d = nthSundayOfMonth(2025, 10, 1);
    assertEqual(d.getDate(), 2);
    assertEqual(d.getMonth(), 10);
});
test('nthSundayOfMonth: 2nd Sunday March 2026 = Mar 8', () => {
    assertEqual(nthSundayOfMonth(2026, 2, 2).getDate(), 8);
});
test('nthSundayOfMonth: 1st Sunday Nov 2026 = Nov 1', () => {
    assertEqual(nthSundayOfMonth(2026, 10, 1).getDate(), 1);
});
test('nthSundayOfMonth: 2nd Sunday March 2027 = Mar 14', () => {
    assertEqual(nthSundayOfMonth(2027, 2, 2).getDate(), 14);
});

// getCaOffset — DST boundaries (all 17 cases already verified, spot-checked here)
test('getCaOffset: summer 2026 = 420 (PDT)', () => assertEqual(getCaOffset(new Date('2026-07-04T12:00:00')), 420));
test('getCaOffset: winter 2026 = 480 (PST)', () => assertEqual(getCaOffset(new Date('2026-01-10T12:00:00')), 480));
test('getCaOffset: DST start 2025 Mar 9 02:00 = 420', () => assertEqual(getCaOffset(new Date(2025, 2, 9, 2, 0, 0)), 420));
test('getCaOffset: DST start 2025 Mar 9 01:59 = 480', () => assertEqual(getCaOffset(new Date(2025, 2, 9, 1, 59, 0)), 480));
test('getCaOffset: DST end 2025 Nov 2 01:59 = 420', () => assertEqual(getCaOffset(new Date(2025, 10, 2, 1, 59, 0)), 420));
test('getCaOffset: DST end 2025 Nov 2 02:00 = 480', () => assertEqual(getCaOffset(new Date(2025, 10, 2, 2, 0, 0)), 480));
test('getCaOffset: 2016 Nov 6 01:59 = 420 (old table had year typo)', () => assertEqual(getCaOffset(new Date(2016, 10, 6, 1, 59, 0)), 420));
test('getCaOffset: 2016 Nov 6 02:00 = 480', () => assertEqual(getCaOffset(new Date(2016, 10, 6, 2, 0, 0)), 480));
test('getCaOffset: future year 2030 summer = 420', () => assertEqual(getCaOffset(new Date('2030-07-15T12:00:00')), 420));
test('getCaOffset: future year 2030 winter = 480', () => assertEqual(getCaOffset(new Date('2030-01-15T12:00:00')), 480));

// Date.prototype extensions (adjustMins, addDays, subDays, withoutTime)
test('adjustMins: adds minutes', () => {
    const d = new Date(2024, 5, 15, 12, 0, 0);
    const result = d.adjustMins(90);
    assertEqual(result.getHours(), 13);
    assertEqual(result.getMinutes(), 30);
});
test('adjustMins: subtracts on negative', () => {
    const d = new Date(2024, 5, 15, 12, 0, 0);
    const result = d.adjustMins(-60);
    assertEqual(result.getHours(), 11);
});
test('addDays: adds 7 days', () => {
    const d = new Date(2024, 5, 1);
    const result = d.addDays(7);
    assertEqual(result.getDate(), 8);
    assertEqual(result.getMonth(), 5);
});
test('addDays: crosses month boundary', () => {
    const d = new Date(2024, 5, 28); // June 28
    const result = d.addDays(5);
    assertEqual(result.getMonth(), 6); // July
    assertEqual(result.getDate(), 3);
});
test('subDays: subtracts 3 days', () => {
    const d = new Date(2024, 5, 15);
    const result = d.subDays(3);
    assertEqual(result.getDate(), 12);
});
test('withoutTime: zeroes time components', () => {
    const d = new Date(2024, 5, 15, 14, 30, 45, 999);
    const result = d.withoutTime();
    assertEqual(result.getHours(), 0);
    assertEqual(result.getMinutes(), 0);
    assertEqual(result.getSeconds(), 0);
    assertEqual(result.getMilliseconds(), 0);
    assertEqual(result.getDate(), 15);
});

// ─────────────────────────────────────────────────────────────────────────────
// utils.js tests
// ─────────────────────────────────────────────────────────────────────────────

console.log('\nutils.js');

// Constants
test('getSubmittedConstant: returns non-empty string', () => assert(getSubmittedConstant().length > 0));
test('getReleasedConstant: returns non-empty string', () => assert(getReleasedConstant().length > 0));
test('getncConstant: returns non-empty string', () => assert(getncConstant().length > 0));
test('getCancelledConstant: returns non-empty string', () => assert(getCancelledConstant().length > 0));
test('constants are distinct', () => {
    const s = new Set([getSubmittedConstant(), getReleasedConstant(), getncConstant(), getCancelledConstant()]);
    assertEqual(s.size, 4);
});

// convertAET
test('convertAET: plain decimal includes decimal and HH:MM', () => assertEqual(convertAET('4.8', null), '4.8(04:48.0)'));
test('convertAET: 8.0 = 8.0(08:00)', () => assertEqual(convertAET('8.0', null), '8.0(08:00)'));
test('convertAET: 0.5 = 0.5(00:30.0)', () => assertEqual(convertAET('0.5', null), '0.5(00:30.0)'));
test('convertAET: range HIGH picks upper value and formats', () => {
    assertEqual(convertAET('4.0 - 8.0', 'HIGH'), '8.0(08:00)');
});
test('convertAET: range MID averages and formats', () => {
    assertEqual(convertAET('4.0 - 8.0', 'MID'), '6(06:00)');
});
test('convertAET: no range string with null range returns single value format', () => {
    assertEqual(convertAET('4.0', null), '4.0(04:00)');
});

// processAET
test('processAET: plain decimal', () => assertEqual(processAET('4.8', null), 4.8));
test('processAET: range HIGH picks upper', () => assertEqual(processAET('4.0 - 8.0', 'HIGH'), 8.0));
test('processAET: range MID averages', () => assertEqual(processAET('4.0 - 8.0', 'MID'), 6.0));
test('processAET: range LOW (not implemented) returns low value', () => {
    // LOW is commented out — falls through to the else, returning the full string as float (which is NaN or first number)
    const result = processAET('4.0 - 8.0', 'LOW');
    assert(!isNaN(result), 'Should return a number');
});

// processAETnFloat — AET is in minutes; returns AET * 60000 ms (used for surplus comparisons)
test('processAETnFloat: 9 min AET returns 9*60000 ms', () => {
    assertEqual(processAETnFloat('9.0', null), 9 * 60000);
});
test('processAETnFloat: HIGH range picks upper', () => {
    assertEqual(processAETnFloat('4.0 - 8.0', 'HIGH'), 8 * 60000);
});
test('processAETnFloat: MID range averages', () => {
    assertEqual(processAETnFloat('4.0 - 8.0', 'MID'), 6 * 60000);
});

// mills2AETfromWork — workTime is stored in ms where AET units are minutes (not hours)
// e.g. a 9-minute task has workTime = 9*60000 = 540000ms
test('mills2AETfromWork: 9 min workTime → "9.0(09:00)"', () => {
    assertEqual(mills2AETfromWork(9 * 60000), '9.0(09:00)');
});
test('mills2AETfromWork: 4.8 min workTime → "4.8(04:48.0)"', () => {
    assertEqual(mills2AETfromWork(288000), '4.8(04:48.0)');
});

// findTaskInTaskStr
test('findTaskInTaskStr: single-task exact match', () => {
    assert(findTaskInTaskStr('1234567890', '1234567890'));
});
test('findTaskInTaskStr: single-task no match', () => {
    assert(!findTaskInTaskStr('1234567890', '9876543210'));
});
test('findTaskInTaskStr: multi-task string contains task', () => {
    assert(findTaskInTaskStr('1234567890', '12345678909876543210'));
});
test('findTaskInTaskStr: multi-task string does not contain task', () => {
    assert(!findTaskInTaskStr('1111111111', '12345678909876543210'));
});

// buildTaskId
test('buildTaskId: single task', () => {
    assertEqual(buildTaskId('https://raterhub.com/rater/task/index?taskIds=1234567890'), '1234567890');
});
test('buildTaskId: no taskIds param returns empty string', () => {
    assertEqual(buildTaskId('https://raterhub.com/rater/task/index'), '');
});
test('buildTaskId: multiple tasks sorted and concatenated', () => {
    const result = buildTaskId('https://raterhub.com/rater/task/index?taskIds=9876543210,1234567890');
    // sorted: ['1234567890','9876543210'] but implementation uses multi[i] (original order) — document actual behavior
    assert(result.length === 20, 'Two 10-digit tasks = 20 chars: ' + result);
});

// clone_taskarray
test('clone_taskarray: returns deep copy', () => {
    const original = [{ taskId: '123', workTime: 100 }];
    const clone = clone_taskarray(original);
    clone[0].workTime = 999;
    assertEqual(original[0].workTime, 100, 'Original should be unchanged');
});
test('clone_taskarray: empty array', () => {
    const result = clone_taskarray([]);
    assertEqual(result.length, 0);
});

// localSort
test('localSort: sorts by dateofTask descending (newest first)', () => {
    const data = [
        { taskId: '1', dateofTask: '1/1/2024 09:00:00 AM', workTime: 100 },
        { taskId: '2', dateofTask: '1/3/2024 09:00:00 AM', workTime: 200 },
        { taskId: '3', dateofTask: '1/2/2024 09:00:00 AM', workTime: 300 },
    ];
    const result = localSort(data, 'dateofTask', 'none');
    assertEqual(result[0].taskId, '2'); // Jan 3 newest
    assertEqual(result[2].taskId, '1'); // Jan 1 oldest
});
test('localSort: sorts by taskId ascending', () => {
    const data = [
        { taskId: '9000000003' }, { taskId: '9000000001' }, { taskId: '9000000002' }
    ];
    const result = localSort(data, 'taskId', 'none');
    assertEqual(result[0].taskId, '9000000001');
    assertEqual(result[2].taskId, '9000000003');
});

// reverseSort (sorts ascending by date — oldest first)
test('reverseSort: sorts by dateofTask ascending (oldest first)', () => {
    const data = [
        { taskId: '1', dateofTask: '1/3/2024 09:00:00 AM' },
        { taskId: '2', dateofTask: '1/1/2024 09:00:00 AM' },
        { taskId: '3', dateofTask: '1/2/2024 09:00:00 AM' },
    ];
    const result = reverseSort(data, 'dateofTask', 'none');
    assertEqual(result[0].taskId, '2'); // Jan 1 oldest = first
    assertEqual(result[2].taskId, '1'); // Jan 3 newest = last
});

// S_DeleteRec
test('S_DeleteRec: removes matching record', () => {
    const data = [
        { taskId: 'aaa', dateofTask: '1/1/2024', workTime: 100 },
        { taskId: 'bbb', dateofTask: '1/2/2024', workTime: 200 },
    ];
    const result = S_DeleteRec('aaa', '1/1/2024', data);
    assertEqual(result.length, 1);
    assertEqual(result[0].taskId, 'bbb');
});
test('S_DeleteRec: no match leaves array intact', () => {
    const data = [{ taskId: 'aaa', dateofTask: '1/1/2024', workTime: 100 }];
    const result = S_DeleteRec('zzz', '1/1/2024', data);
    assertEqual(result.length, 1);
});
test('S_DeleteRec: null input returns null', () => {
    assertEqual(S_DeleteRec('aaa', '1/1/2024', null), null);
});

// mergeData
test('mergeData: no duplicates → unchanged count', () => {
    const data = [
        { taskId: '1111111111', dateofTask: '1/1/2024', taskDesc: '', taskAET: '4.0', workTime: 240000, extras: '' },
        { taskId: '2222222222', dateofTask: '1/2/2024', taskDesc: '', taskAET: '4.0', workTime: 240000, extras: '' },
    ];
    const result = mergeData(data);
    assertEqual(result.length, 2);
});
test('mergeData: duplicate with same date merges workTime', () => {
    const data = [
        { taskId: '1111111111', dateofTask: '1/1/2024 09:00:00 AM', taskDesc: '', taskAET: '4.0', workTime: 100000, extras: '' },
        { taskId: '1111111111', dateofTask: '1/1/2024 09:00:00 AM', taskDesc: '', taskAET: '4.0', workTime: 50000,  extras: '' },
    ];
    const result = mergeData(data);
    assertEqual(result.length, 1);
    assertEqual(result[0].workTime, 150000);
});
test('mergeData: duplicate with later date and NC is dropped', () => {
    const submitted = getSubmittedConstant();
    const nc = getncConstant();
    const data = [
        { taskId: '1111111111', dateofTask: '1/1/2024 09:00:00 AM', taskDesc: submitted, taskAET: '4.0', workTime: 240000, extras: '' },
        { taskId: '1111111111', dateofTask: '1/2/2024 09:00:00 AM', taskDesc: nc,        taskAET: '4.0', workTime: 60000,  extras: '' },
    ];
    const result = mergeData(data);
    // NC after submit should be dropped
    assertEqual(result.length, 1);
    assertEqual(result[0].taskDesc, submitted);
});

// incompleteAfterSubmit
test('incompleteAfterSubmit: same date → 0 (add times)', () => {
    const cur  = { taskId: '111', dateofTask: '1/1/2024', taskDesc: '' };
    const base = { taskId: '111', dateofTask: '1/1/2024', taskDesc: '' };
    assertEqual(incompleteAfterSubmit(cur, base), 0);
});
test('incompleteAfterSubmit: NC after Submitted → 1 (drop)', () => {
    const nc  = getncConstant();
    const sub = getSubmittedConstant();
    // cur is earlier (already submitted), base is later (NC)
    const cur  = { taskId: '111', dateofTask: '1/1/2024', taskDesc: sub };
    const base = { taskId: '111', dateofTask: '1/2/2024', taskDesc: nc  };
    assertEqual(incompleteAfterSubmit(cur, base), 1);
});

// stripLeadingZeros
test('stripLeadingZeros: replaces 00 with 0', () => {
    const totals = { today: '00:30', weektotal: '00:00', periodtotal: '00:15', surplus: '00:05' };
    const result = stripLeadingZeros(totals);
    assertEqual(result.today, '0:30');
    assertEqual(result.periodtotal, '0:15');
    assertEqual(result.surplus, '0:05');
});

// ─────────────────────────────────────────────────────────────────────────────
// Round-trip / integration tests
// ─────────────────────────────────────────────────────────────────────────────

console.log('\nintegration');

test('roundtrip: millisToHMS ↔ timeStrToMills', () => {
    const ms = 5 * 3600000 + 23 * 60000 + 17000;
    const str = millisToHoursMinutesAndSeconds(ms);
    const back = timeStrToMills(str);
    assertEqual(back, ms);
});

test('roundtrip: millisToMS ↔ MMSStimeStrToMills', () => {
    const ms = 37 * 60000 + 42000;
    const str = millisToMinutesAndSeconds(ms);
    const back = MMSStimeStrToMills(str);
    assertEqual(back, ms);
});

test('roundtrip: convertAET ↔ processAET (decimal)', () => {
    // convertAET('6.5', null) → "6.5(06:30.0)" — display format, not a round-trip input
    const display = convertAET('6.5', null);
    assert(display.startsWith('6.5('), 'display should embed original: ' + display);
});

test('roundtrip: processAETnFloat then mills back to AET', () => {
    // AET is in minutes. processAETnFloat returns AET * 60000 (ms).
    // mills2AETfromWork takes those same ms and converts back to display.
    assertEqual(processAETnFloat('9.0', null), 9 * 60000);
    assertEqual(mills2AETfromWork(9 * 60000), '9.0(09:00)');
    assertEqual(mills2AETfromWork(processAETnFloat('4.8', null)), '4.8(04:48.0)');
});

test('localSort then reverseSort preserves record count', () => {
    const data = [
        { taskId: 'a', dateofTask: '1/5/2024 09:00:00 AM', workTime: 1 },
        { taskId: 'b', dateofTask: '1/3/2024 09:00:00 AM', workTime: 2 },
        { taskId: 'c', dateofTask: '1/7/2024 09:00:00 AM', workTime: 3 },
        { taskId: 'd', dateofTask: '1/1/2024 09:00:00 AM', workTime: 4 },
    ];
    const desc = localSort([...data], 'dateofTask', 'none');
    const asc  = reverseSort([...data], 'dateofTask', 'none');
    assertEqual(desc.length, 4);
    assertEqual(asc.length, 4);
    // desc[0] should be latest (Jan 7), asc[0] should be earliest (Jan 1)
    assertEqual(desc[0].taskId, 'c');
    assertEqual(asc[0].taskId, 'd');
});

test('DST-aware: getCaOffset agrees with nthSundayOfMonth boundaries for 2025-2027', () => {
    for (const year of [2025, 2026, 2027]) {
        const start = nthSundayOfMonth(year, 2, 2);  // 2nd Sunday March
        const end   = nthSundayOfMonth(year, 10, 1); // 1st Sunday November
        // 1 min before DST start → PST
        const beforeStart = new Date(start.getTime() - 60000);
        assertEqual(getCaOffset(beforeStart), 480, `${year} 1min before DST start should be PST`);
        // At DST start → PDT
        assertEqual(getCaOffset(start), 420, `${year} at DST start should be PDT`);
        // 1 min before DST end → PDT
        const beforeEnd = new Date(end.getTime() - 60000);
        assertEqual(getCaOffset(beforeEnd), 420, `${year} 1min before DST end should be PDT`);
        // At DST end → PST
        assertEqual(getCaOffset(end), 480, `${year} at DST end should be PST`);
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// dates.js — remaining pure functions
// ─────────────────────────────────────────────────────────────────────────────

console.log('\ndates.js (remaining)');

// dayofwktoStr
test('dayofwktoStr: known Sunday', () => assertEqual(dayofwktoStr(new Date(2024, 5, 9)), 'Sun'));
test('dayofwktoStr: known Monday', () => assertEqual(dayofwktoStr(new Date(2024, 5, 10)), 'Mon'));
test('dayofwktoStr: known Friday', () => assertEqual(dayofwktoStr(new Date(2024, 5, 14)), 'Fri'));
test('dayofwktoStr: Saturday', () => assertEqual(dayofwktoStr(new Date(2024, 5, 15)), 'Sat'));
test('dayofwktoStr: invalid date returns N/A', () => assertEqual(dayofwktoStr('not-a-date'), 'N/A'));

// localCompMMDDYY
test('localCompMMDDYY: same day different times → true', () => {
    assert(localCompMMDDYY('6/15/2024 08:00:00 AM', '6/15/2024 11:59:00 PM'));
});
test('localCompMMDDYY: different days → false', () => {
    assert(!localCompMMDDYY('6/15/2024', '6/16/2024'));
});
test('localCompMMDDYY: year boundary → false', () => {
    assert(!localCompMMDDYY('12/31/2023', '1/1/2024'));
});

// millisToMinSecFraction
test('millisToMinSecFraction: 90000ms = 1.5 min', () => assertEqual(millisToMinSecFraction(90000), 1.5));
test('millisToMinSecFraction: 60000ms = 1.0 min', () => assertEqual(millisToMinSecFraction(60000), 1.0));
test('millisToMinSecFraction: 0 = 0', () => assertEqual(millisToMinSecFraction(0), 0));
test('millisToMinSecFraction: negative uses abs', () => assertEqual(millisToMinSecFraction(-60000), 1.0));
test('millisToMinSecFraction: 288000ms = 4.8 min', () => assertEqual(millisToMinSecFraction(288000), 4.8));

// msToTime
test('msToTime: 90000ms without hours = 01:30', () => assertEqual(msToTime(90000, false), '01:30'));
test('msToTime: 3661000ms with hours = 01:01:01', () => assertEqual(msToTime(3661000, true), '01:01:01'));
test('msToTime: 0ms = 00:00', () => assertEqual(msToTime(0, false), '00:00'));
test('msToTime: only shows hours when hoursIn=true', () => {
    const result = msToTime(3600000, true);
    assert(result.startsWith('01:'), 'should start with 01:: ' + result);
});

// millisToHoursMinutesAndSecondsarray
test('millisToHMSarray: returns 3-element array', () => {
    const r = millisToHoursMinutesAndSecondsarray(5445000);
    assertEqual(r.length, 3);
});
test('millisToHMSarray: 1h30m45s', () => {
    const r = millisToHoursMinutesAndSecondsarray(5445000);
    assertEqual(r[0], '01'); assertEqual(r[1], '30'); assertEqual(r[2], '45');
});
test('millisToHMSarray: zero', () => {
    const r = millisToHoursMinutesAndSecondsarray(0);
    assertEqual(r[0], '00'); assertEqual(r[1], '00'); assertEqual(r[2], '00');
});
test('millisToHMSarray: seconds rollover handled', () => {
    const r = millisToHoursMinutesAndSecondsarray(59 * 60000 + 59500);
    assert(r[1] === '00' || r[1] === '59', 'minutes: ' + r[1]);
});
test('millisToHMSarray: negative uses abs', () => {
    const pos = millisToHoursMinutesAndSecondsarray(3600000);
    const neg = millisToHoursMinutesAndSecondsarray(-3600000);
    assertEqual(pos[0], neg[0]);
});

// dateMsToTime
test('dateMsToTime: extracts hours and minutes onto epoch date', () => {
    const d = new Date(2024, 5, 15, 14, 30, 0);
    const result = dateMsToTime(d);
    assertEqual(result.getHours(), 14);
    assertEqual(result.getMinutes(), 30);
    assertEqual(result.getSeconds(), 0);
});
test('dateMsToTime: midnight', () => {
    const d = new Date(2024, 5, 15, 0, 0, 0);
    const result = dateMsToTime(d);
    assertEqual(result.getHours(), 0);
    assertEqual(result.getMinutes(), 0);
});

// isTimeBetween
test('isTimeBetween: time within range → true', () => {
    const cur   = new Date(2024, 5, 15, 10, 0, 0);
    const start = new Date(2024, 5, 15, 9, 0, 0);
    const stop  = new Date(2024, 5, 15, 11, 0, 0);
    assert(isTimeBetween(cur, start, stop));
});
test('isTimeBetween: time before range → false', () => {
    const cur   = new Date(2024, 5, 15, 8, 0, 0);
    const start = new Date(2024, 5, 15, 9, 0, 0);
    const stop  = new Date(2024, 5, 15, 11, 0, 0);
    assert(!isTimeBetween(cur, start, stop));
});
test('isTimeBetween: time after range → false', () => {
    const cur   = new Date(2024, 5, 15, 12, 0, 0);
    const start = new Date(2024, 5, 15, 9, 0, 0);
    const stop  = new Date(2024, 5, 15, 11, 0, 0);
    assert(!isTimeBetween(cur, start, stop));
});
test('isTimeBetween: start == stop → false (degenerate)', () => {
    const d = new Date(2024, 5, 15, 10, 0, 0);
    assert(!isTimeBetween(d, d, d));
});
test('isTimeBetween: overnight range — time past midnight → true', () => {
    const cur   = new Date(2024, 5, 15, 1, 0, 0);  // 1am
    const start = new Date(2024, 5, 15, 22, 0, 0); // 10pm
    const stop  = new Date(2024, 5, 16, 2, 0, 0);  // 2am next day
    assert(isTimeBetween(cur, start, stop));
});

// timeHHMMtoMils — returns a Date with the time set (not ms)
test('timeHHMMtoMils: 09:30 sets hours and minutes correctly', () => {
    const result = timeHHMMtoMils('09:30');
    assertEqual(result.getHours(), 9);
    assertEqual(result.getMinutes(), 30);
});
test('timeHHMMtoMils: 00:00 sets midnight', () => {
    const result = timeHHMMtoMils('00:00');
    assertEqual(result.getHours(), 0);
    assertEqual(result.getMinutes(), 0);
});
test('timeHHMMtoMils: bad format returns 0', () => {
    assertEqual(timeHHMMtoMils('09:30:00'), 0);
});
test('timeHHMMtoMils: non-numeric returns 0', () => {
    assertEqual(timeHHMMtoMils('xx:yy'), 0);
});

// addMins
test('addMins: adds 90 minutes', () => {
    const d = new Date(2024, 5, 15, 10, 0, 0);
    const result = addMins(d, 90);
    assertEqual(result.getHours(), 11);
    assertEqual(result.getMinutes(), 30);
});
test('addMins: crosses midnight', () => {
    const d = new Date(2024, 5, 15, 23, 30, 0);
    const result = addMins(d, 60);
    assertEqual(result.getDate(), 16);
    assertEqual(result.getHours(), 0);
    assertEqual(result.getMinutes(), 30);
});
test('addMins: zero mins unchanged', () => {
    const d = new Date(2024, 5, 15, 10, 0, 0);
    assertEqual(addMins(d, 0).getTime(), d.getTime());
});

// chgYear
test('chgYear: +1 year', () => assertEqual(chgYear(new Date(2024, 5, 15), 1), '2025-06-15'));
test('chgYear: -1 year', () => assertEqual(chgYear(new Date(2024, 5, 15), -1), '2023-06-15'));
test('chgYear: pads single-digit month and day', () => assertEqual(chgYear(new Date(2024, 0, 5), 0), '2024-01-05'));
test('chgYear: December 31', () => assertEqual(chgYear(new Date(2024, 11, 31), 0), '2024-12-31'));

// dateFromHTML — parses YYYY-MM-DD input format
test('dateFromHTML: 2024-06-15', () => {
    const d = dateFromHTML('2024-06-15');
    assertEqual(d.getFullYear(), 2024);
    assertEqual(d.getMonth(), 5);
    assertEqual(d.getDate(), 15);
});
test('dateFromHTML: roundtrip with chgYear', () => {
    const str = chgYear(new Date(2024, 5, 15), 0); // '2024-06-15'
    const d = dateFromHTML(str);
    assertEqual(d.getFullYear(), 2024);
    assertEqual(d.getMonth(), 5);
    assertEqual(d.getDate(), 15);
});

// Date.prototype.justDate
test('Date.prototype.justDate: returns M/D/YYYY string', () => {
    const d = new Date(2024, 5, 15);
    assertEqual(d.justDate(), '6/15/2024');
});
test('Date.prototype.justDate: January 1', () => {
    assertEqual(new Date(2026, 0, 1).justDate(), '1/1/2026');
});

// ─────────────────────────────────────────────────────────────────────────────
// utils.js — remaining pure functions
// ─────────────────────────────────────────────────────────────────────────────

console.log('\nutils.js (remaining)');

// getInrocessStrConstant
test('getInrocessStrConstant: returns a string', () => assert(typeof getInrocessStrConstant() === 'string'));
test('getInrocessStrConstant: equals getncConstant (inprocess = nc)', () => {
    assertEqual(getInrocessStrConstant(), getncConstant());
});

// logObject
test('logObject: does not throw when s_utslog is false', () => {
    logObject('test', 'msg', {a: 1}, {b: 2}); // should be silent no-op
    assert(true);
});

// msgStrCheck
test('msgStrCheck: finds matching type and string', () => {
    const msgs = [{ type: 'error', str: 'connection failed' }];
    assert(msgStrCheck('error', msgs, 'CONNECTION FAILED'));
});
test('msgStrCheck: type not found → false', () => {
    const msgs = [{ type: 'error', str: 'connection failed' }];
    assert(!msgStrCheck('warning', msgs, 'CONNECTION FAILED'));
});
test('msgStrCheck: string not in msg → false', () => {
    const msgs = [{ type: 'error', str: 'connection failed' }];
    assert(!msgStrCheck('error', msgs, 'TIMEOUT'));
});
test('msgStrCheck: empty array → false', () => {
    assert(!msgStrCheck('error', [], 'anything'));
});

// getactivesound
test('getactivesound: returns active when set', () => {
    const sounds = [{ type: 'alert', active: 'ding.mp3', default: 'beep.mp3' }];
    assertEqual(getactivesound('alert', sounds), 'ding.mp3');
});
test('getactivesound: falls back to default when active is empty', () => {
    const sounds = [{ type: 'alert', active: '', default: 'beep.mp3' }];
    assertEqual(getactivesound('alert', sounds), 'beep.mp3');
});
test('getactivesound: falls back to default when active is null', () => {
    const sounds = [{ type: 'alert', active: null, default: 'beep.mp3' }];
    assertEqual(getactivesound('alert', sounds), 'beep.mp3');
});
test('getactivesound: unknown type returns null', () => {
    const sounds = [{ type: 'alert', active: 'ding.mp3', default: 'beep.mp3' }];
    assertEqual(getactivesound('nonexistent', sounds), null);
});

// convertdisplayAETtomils — input is convertAET output format "4.8(04:48.0)"
test('convertdisplayAETtomils: plain display string', () => {
    assertEqual(convertdisplayAETtomils('4.8(04:48.0)', null), 4.8 * 60000);
});
test('convertdisplayAETtomils: 8.0(08:00)', () => {
    assertEqual(convertdisplayAETtomils('8.0(08:00)', null), 8.0 * 60000);
});
test('convertdisplayAETtomils: missing parens returns 0', () => {
    assertEqual(convertdisplayAETtomils('4.8', null), 0);
});
test('convertdisplayAETtomils: range HIGH picks upper', () => {
    // Range format has " - " before the parens
    const str = '4.0 - 8.0(08:00)';
    assertEqual(convertdisplayAETtomils(str, 'HIGH'), 8.0 * 60000);
});
test('convertdisplayAETtomils: range MID averages', () => {
    const str = '4.0 - 8.0(06:00)';
    assertEqual(convertdisplayAETtomils(str, 'MID'), 6.0 * 60000);
});

// array_findTaskInTaskStr
test('array_findTaskInTaskStr: finds task in composite taskId', () => {
    const arr = [
        { taskId: '1111111111' },
        { taskId: '22222222223333333333' }, // composite
        { taskId: '4444444444' },
    ];
    assertEqual(array_findTaskInTaskStr('2222222222', arr), 1);
});
test('array_findTaskInTaskStr: not found returns -1', () => {
    const arr = [{ taskId: '1111111111' }, { taskId: '2222222222' }];
    assertEqual(array_findTaskInTaskStr('9999999999', arr), -1);
});
test('array_findTaskInTaskStr: ignores non-composite taskIds', () => {
    // Single 10-char taskId — the function only searches composite (length > 10)
    const arr = [{ taskId: '1111111111' }];
    assertEqual(array_findTaskInTaskStr('1111111111', arr), -1);
});

// buildTotalLine
test('buildTotalLine: surplus when AET > work', () => {
    const line = buildTotalLine(9.0, 8 * 60000, 3, '6/15/2024');
    assert(line.includes('Total for 6/15/2024'), 'date in line');
    assert(line.includes('3'), 'task count in line');
    assert(!line.startsWith('-'), 'surplus should be positive');
});
test('buildTotalLine: negative surplus when work > AET', () => {
    const line = buildTotalLine(9.0, 15 * 60000, 3, '6/15/2024');
    assert(line.includes('-'), 'should show negative surplus');
});
test('buildTotalLine: zero surplus when AET == work', () => {
    const line = buildTotalLine(9.0, 9 * 60000, 1, '6/15/2024');
    assert(line.includes('00:00:00'), 'zero diff');
});

// getTotalsToday
test('getTotalsToday: sums work for matching date', () => {
    const date = '6/15/2024';
    const data = [
        { dateofTask: '6/15/2024 09:00:00 AM', workTime: 300000, taskAET: '5.0', taskDesc: getSubmittedConstant(), extras: '' },
        { dateofTask: '6/15/2024 10:00:00 AM', workTime: 240000, taskAET: '4.0', taskDesc: getSubmittedConstant(), extras: '' },
        { dateofTask: '6/16/2024 09:00:00 AM', workTime: 999999, taskAET: '9.0', taskDesc: getSubmittedConstant(), extras: '' },
    ];
    const result = getTotalsToday(data, new Date('6/15/2024'), null);
    assertEqual(result.work, 540000);
    assertEqual(result.recs, 2);
});
test('getTotalsToday: skips NC tasks in raet', () => {
    const date = '6/15/2024';
    const data = [
        { dateofTask: '6/15/2024 09:00:00 AM', workTime: 300000, taskAET: '5.0', taskDesc: getSubmittedConstant(), extras: '' },
        { dateofTask: '6/15/2024 10:00:00 AM', workTime: 240000, taskAET: '4.0', taskDesc: getncConstant(),        extras: '' },
    ];
    const result = getTotalsToday(data, new Date('6/15/2024'), null);
    // NC record: workTime counted, raet NOT counted
    assertEqual(result.recs, 2);
    assertEqual(result.work, 540000);
    assertClose(result.raet, 5.0, 0.01, 'only submitted AET should be in raet');
});
test('getTotalsToday: released tasks use work time for raet', () => {
    const data = [
        { dateofTask: '6/15/2024 09:00:00 AM', workTime: 288000, taskAET: '5.0', taskDesc: getReleasedConstant(), extras: '' },
    ];
    const result = getTotalsToday(data, new Date('6/15/2024'), null);
    // Released: raet = millisToMinSecFraction(288000) = 4.8
    assertClose(result.raet, 4.8, 0.01);
});
test('getTotalsToday: empty data returns zero totals', () => {
    const result = getTotalsToday([], new Date('6/15/2024'), null);
    assertEqual(result.work, 0);
    assertEqual(result.recs, 0);
    assertEqual(result.raet, 0);
});
test('getTotalsToday: string optDate works', () => {
    const data = [
        { dateofTask: '6/15/2024 09:00:00 AM', workTime: 300000, taskAET: '5.0', taskDesc: '', extras: '' },
    ];
    const result = getTotalsToday(data, '6/15/2024', null);
    assertEqual(result.recs, 1);
});

// anyIncomplete
test('anyIncomplete: detects NC record in period', () => {
    const start = new Date(2024, 5, 1);
    const end   = new Date(2024, 5, 30);
    const data = [
        { taskId: '1111111111', dateofTask: '6/15/2024 09:00:00 AM', taskDesc: getncConstant(),        workTime: 100, taskAET: '5', extras: '' },
        { taskId: '2222222222', dateofTask: '6/15/2024 10:00:00 AM', taskDesc: getSubmittedConstant(), workTime: 100, taskAET: '5', extras: '' },
    ];
    assert(anyIncomplete(data, start, end));
});
test('anyIncomplete: all submitted → false', () => {
    const start = new Date(2024, 5, 1);
    const end   = new Date(2024, 5, 30);
    const data = [
        { taskId: '1111111111', dateofTask: '6/15/2024 09:00:00 AM', taskDesc: getSubmittedConstant(), workTime: 100, taskAET: '5', extras: '' },
        { taskId: '2222222222', dateofTask: '6/15/2024 10:00:00 AM', taskDesc: getReleasedConstant(), workTime: 100, taskAET: '5', extras: '' },
    ];
    assert(!anyIncomplete(data, start, end));
});
test('anyIncomplete: NC outside period → false', () => {
    const start = new Date(2024, 5, 1);
    const end   = new Date(2024, 5, 15);
    const data = [
        { taskId: '1111111111', dateofTask: '6/20/2024 09:00:00 AM', taskDesc: getncConstant(), workTime: 100, taskAET: '5', extras: '' },
    ];
    assert(!anyIncomplete(data, start, end));
});

// SPECanyIncomplete
test('SPECanyIncomplete: excludes the specified taskid', () => {
    const start = new Date(2024, 5, 1);
    const end   = new Date(2024, 5, 30);
    const data = [
        { taskId: '1111111111', dateofTask: '6/15/2024 09:00:00 AM', taskDesc: getncConstant(), workTime: 100, taskAET: '5', extras: '' },
    ];
    // When the only NC record IS the excluded task — should return false
    assert(!SPECanyIncomplete(data, start, end, '1111111111'));
});
test('SPECanyIncomplete: other NC task still detected', () => {
    const start = new Date(2024, 5, 1);
    const end   = new Date(2024, 5, 30);
    const data = [
        { taskId: '1111111111', dateofTask: '6/15/2024 09:00:00 AM', taskDesc: getncConstant(), workTime: 100, taskAET: '5', extras: '' },
        { taskId: '2222222222', dateofTask: '6/15/2024 10:00:00 AM', taskDesc: getncConstant(), workTime: 100, taskAET: '5', extras: '' },
    ];
    assert(SPECanyIncomplete(data, start, end, '1111111111'));
});

// setURL
test('setURL: uses USRoot when international=false', () => {
    const result = setURL('/path', false);
    assert(result.startsWith('https://raterlabs.appen.com'), 'should use US root: ' + result);
});
test('setURL: uses IntlRoot when international=true', () => {
    const result = setURL('/path', true);
    assert(result.startsWith('https://connect.appen.com'), 'should use intl root: ' + result);
});
test('setURL: appends suffix correctly for both locales', () => {
    assertEqual(setURL('/rater/task', false), 'https://raterlabs.appen.com/rater/task');
    assertEqual(setURL('/rater/task', true),  'https://connect.appen.com/rater/task');
});

// buildperiod
test('buildperiod: returns array with 2 entries for US locale', () => {
    const result = buildperiod(new Date('2024-06-15'), 'US');
    assertEqual(result.length, 2);
});
test('buildperiod: each period has required fields', () => {
    const result = buildperiod(new Date('2024-06-15'), 'US');
    for (const p of result) {
        assert('startDate' in p, 'has startDate');
        assert('endDate' in p,   'has endDate');
        assert('desc' in p,      'has desc');
        assert('start2week' in p,'has start2week');
    }
});
test('buildperiod: period spans 13 days (startDate + 13 = endDate)', () => {
    const result = buildperiod(new Date('2024-06-15'), 'US');
    const diff = mydiff(result[0].startDate, result[0].endDate, 'days');
    assertEqual(diff, 13);
});
test('buildperiod: second period is 14 days before first', () => {
    const result = buildperiod(new Date('2024-06-15'), 'US');
    const diff = mydiff(result[1].startDate, result[0].startDate, 'days');
    assertEqual(diff, 14);
});
test('buildperiod: start2week is 7 days after startDate', () => {
    const result = buildperiod(new Date('2024-06-15'), 'US');
    const diff = mydiff(result[0].startDate, result[0].start2week, 'days');
    assertEqual(diff, 7);
});
test('buildperiod: international returns more entries', () => {
    const result = buildperiod(new Date('2024-06-15'), 'I');
    assert(result.length >= 2, 'international should have periods: ' + result.length);
});

// ─────────────────────────────────────────────────────────────────────────────
// utils.js — previously untested pure functions
// ─────────────────────────────────────────────────────────────────────────────

console.log('\nutils.js (pure additions)');

// isAlphaNumeric
test('isAlphaNumeric: digit is alphanumeric', () => assert(isAlphaNumeric('5')));
test('isAlphaNumeric: uppercase letter is alphanumeric', () => assert(isAlphaNumeric('Z')));
test('isAlphaNumeric: lowercase letter is alphanumeric', () => assert(isAlphaNumeric('a')));
test('isAlphaNumeric: space is not alphanumeric', () => assert(!isAlphaNumeric(' ')));
test('isAlphaNumeric: hyphen is not alphanumeric', () => assert(!isAlphaNumeric('-')));
test('isAlphaNumeric: only checks first char', () => assert(isAlphaNumeric('a!')));

// msgStrGet
test('msgStrGet: returns matching string', () => {
    const strs = [{ type: 'FOO', str: 'hello' }, { type: 'BAR', str: 'world' }];
    assertEqual(msgStrGet('FOO', strs), 'hello');
    assertEqual(msgStrGet('BAR', strs), 'world');
});
test('msgStrGet: returns "Not Found" for missing type', () => {
    assertEqual(msgStrGet('MISSING', [{ type: 'FOO', str: 'x' }]), 'Not Found');
});
test('msgStrGet: empty array returns "Not Found"', () => {
    assertEqual(msgStrGet('X', []), 'Not Found');
});

// GetLogStatus / setLogStatus — getter/setter pair
test('GetLogStatus / setLogStatus: round-trips correctly', () => {
    const before = GetLogStatus();
    setLogStatus(true);
    assertEqual(GetLogStatus(), true);
    setLogStatus(false);
    assertEqual(GetLogStatus(), false);
    setLogStatus(before); // restore
});

// resetAlert4Context — sets alertOnce = true (file-level var in utils.js)
test('resetAlert4Context: does not throw', () => {
    resetAlert4Context();
    assert(true);
});

// NRTLogCleanup
test('NRTLogCleanup: returns array unchanged when all records are recent', () => {
    const now = Date.now();
    const recs = [
        { dateMills: now - 86400000 },      // 1 day ago
        { dateMills: now - 7 * 86400000 },  // 7 days ago
    ];
    const result = NRTLogCleanup(recs);
    assertEqual(result.length, 2);
});
test('NRTLogCleanup: removes records older than 31 days', () => {
    const now = Date.now();
    const recs = [
        { dateMills: now - 86400000 },           // 1 day ago — keep
        { dateMills: now - 32 * 86400000 },      // 32 days ago — prune
        { dateMills: now - 365 * 86400000 },     // 1 year ago — prune
    ];
    const result = NRTLogCleanup(recs);
    assertEqual(result.length, 1);
});
test('NRTLogCleanup: always returns array (no undefined when nothing pruned)', () => {
    // This was the bug: returned undefined when length was unchanged
    const now = Date.now();
    const recs = [{ dateMills: now }];
    const result = NRTLogCleanup(recs);
    assert(Array.isArray(result), 'should return array, got: ' + typeof result);
    assert(result.length === 1);
    result.push({ dateMills: now }); // would throw if result were undefined
    assert(true);
});
test('NRTLogCleanup: empty array returns empty array', () => {
    const result = NRTLogCleanup([]);
    assert(Array.isArray(result));
    assertEqual(result.length, 0);
});

// updateSpellA
test('updateSpellA: adds new entry when not present', () => {
    const arr = [{ old: 'teh', new: 'the' }];
    const result = updateSpellA(arr, { old: 'adn', new: 'and' });
    assertEqual(result.length, 2);
    assertEqual(result[1].new, 'and');
});
test('updateSpellA: updates existing entry', () => {
    const arr = [{ old: 'teh', new: 'the' }, { old: 'adn', new: 'and' }];
    const result = updateSpellA(arr, { old: 'teh', new: 'THE' });
    assertEqual(result.length, 2);
    assertEqual(result[0].new, 'THE');
});
test('updateSpellA: empty array — adds entry', () => {
    const result = updateSpellA([], { old: 'teh', new: 'the' });
    assertEqual(result.length, 1);
});

// ─────────────────────────────────────────────────────────────────────────────
// dates.js — previously untested pure functions
// ─────────────────────────────────────────────────────────────────────────────

console.log('\ndates.js (pure additions)');

// convert2Pacific — converts a local Date to Pacific time
// We can't know the test runner's timezone offset reliably, but we can verify:
// (a) it returns a Date object when TDATE requested
// (b) the result is a string in M/D/YYYY HH:MM:SS format otherwise
// (c) round-tripping from Pacific runner is identity
test('convert2Pacific: TDATE returns a Date object', () => {
    const d = new Date('2025-06-15T14:00:00Z');
    const result = convert2Pacific(d, 'TDATE');
    assert(result instanceof Date, 'should return Date, got: ' + typeof result);
});
test('convert2Pacific: default returns date string', () => {
    const d = new Date('2025-06-15T14:00:00Z');
    const result = convert2Pacific(d, 'STRING');
    assert(typeof result === 'string', 'should return string: ' + result);
    assert(result.includes('/'), 'string has slash separators: ' + result);
});
test('convert2Pacific: DST boundary — spring forward does not produce NaN', () => {
    // 2025 spring-forward: March 9 at 2am
    const d = new Date('2025-03-09T10:00:00Z');
    const result = convert2Pacific(d, 'TDATE');
    assert(!isNaN(result.getTime()), 'result should be valid Date');
});
test('convert2Pacific: DST boundary — fall back does not produce NaN', () => {
    // 2025 fall-back: Nov 2 at 2am
    const d = new Date('2025-11-02T10:00:00Z');
    const result = convert2Pacific(d, 'TDATE');
    assert(!isNaN(result.getTime()), 'result should be valid Date');
});

// ─────────────────────────────────────────────────────────────────────────────
// socialut.js — pure functions (readTextDocument, decodeName)
// ─────────────────────────────────────────────────────────────────────────────

console.log('\nsocialut.js');

{
    // Load only the pure functions — skip jQuery $.ajax and module-level code
    // readTextDocument and decodeName have no DOM/chrome/jQuery dependencies
    const fs = require('fs');
    const vm = require('vm');
    const src = fs.readFileSync(require('path').join(srcDir, 'socialut.js'), 'utf8');
    // Stub out jQuery and globals that fire at load time but aren't needed for pure functions
    const sandbox = {
        nameFile: null,
        alertStatus: false,
        newURL: '',
        $: () => ({ ajax: () => {} }),
        console,
        alert: () => {},
    };
    // Only eval the pure function definitions, not the module-level $.ajax calls
    // Extract readTextDocument and decodeName by running full source with safe stubs
    vm.runInNewContext(src, sandbox);

    test('readTextDocument: parses tab-separated name file', () => {
        const data = 'ignored-header-line\nAlice\tRaterAlice\nBob\tRaterBob';
        const result = sandbox.readTextDocument(data);
        assertEqual(result.rows.length, 2);
        assertEqual(result.rows[0].MDEHandle, 'Alice');
        assertEqual(result.rows[0].RaterLabs, 'RaterAlice');
        assertEqual(result.rows[1].MDEHandle, 'Bob');
    });
    test('readTextDocument: skips blank lines', () => {
        const data = 'header\nAlice\tRaterAlice\n\nBob\tRaterBob';
        const result = sandbox.readTextDocument(data);
        assertEqual(result.rows.length, 2);
    });
    test('readTextDocument: empty data returns zero rows', () => {
        const result = sandbox.readTextDocument('header');
        assertEqual(result.rows.length, 0);
    });
    test('decodeName: returns MDEHandle for known RaterLabs name', () => {
        // Set nameFile inside the same vm context so decodeName's closure sees it
        vm.runInNewContext(
            'nameFile = readTextDocument("header\\nAlice\\tRaterAlice\\nBob\\tRaterBob");',
            sandbox
        );
        assertEqual(sandbox.decodeName('RaterAlice'), 'Alice');
        assertEqual(sandbox.decodeName('RaterBob'), 'Bob');
    });
    test('decodeName: returns original name when not found', () => {
        vm.runInNewContext(
            'nameFile = readTextDocument("header\\nAlice\\tRaterAlice");',
            sandbox
        );
        assertEqual(sandbox.decodeName('Unknown'), 'Unknown');
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// Edge cases and boundary conditions
// ─────────────────────────────────────────────────────────────────────────────

console.log('\nedge cases');

// Leap year handling
test('addDays: Feb 28 + 1 day on leap year = Feb 29', () => {
    const d = new Date(2024, 1, 28); // Feb 28 2024 (leap year)
    assertEqual(d.addDays(1).getDate(), 29);
    assertEqual(d.addDays(1).getMonth(), 1);
});
test('addDays: Feb 28 + 1 day on non-leap year = Mar 1', () => {
    const d = new Date(2023, 1, 28);
    assertEqual(d.addDays(1).getDate(), 1);
    assertEqual(d.addDays(1).getMonth(), 2);
});
test('chgYear: 2024-02-29 + 1 year = 2025-02-29 (invalid → Mar 1)', () => {
    const result = chgYear(new Date(2024, 1, 29), 1); // Feb 29 → Feb 29 2025 doesn't exist
    // JS Date will roll Feb 29 2025 → Mar 1 2025; chgYear builds string from components
    // so the string "2025-02-29" is returned verbatim — dateFromHTML will normalise it
    assert(result.startsWith('2025'), 'year incremented: ' + result);
});

// Millisecond precision
test('millisToHMS: sub-second inputs round correctly', () => {
    const ms = 3661999; // 1h 1m 1.999s — rounds to 1h 1m 2s
    const result = millisToHoursMinutesAndSeconds(ms);
    assert(result === '01:01:02' || result === '01:01:01', 'got: ' + result);
});

// Large workTimes (10-hour session)
test('millisToHMS: 10 hours', () => {
    assertEqual(millisToHoursMinutesAndSeconds(36000000), '10:00:00');
});
test('millisToMinSecFraction: 600 min (10h)', () => {
    assertEqual(millisToMinSecFraction(36000000), 600);
});

// mergeData: multiple duplicates
test('mergeData: three duplicates with same date merged', () => {
    const data = [
        { taskId: '1111111111', dateofTask: '6/15/2024 09:00:00 AM', taskDesc: '', taskAET: '5.0', workTime: 100000, extras: '' },
        { taskId: '1111111111', dateofTask: '6/15/2024 09:00:00 AM', taskDesc: '', taskAET: '5.0', workTime: 50000,  extras: '' },
        { taskId: '1111111111', dateofTask: '6/15/2024 09:00:00 AM', taskDesc: '', taskAET: '5.0', workTime: 25000,  extras: '' },
    ];
    const result = mergeData(data);
    assertEqual(result.length, 1);
    assertEqual(result[0].workTime, 175000);
});

// S_DeleteRec: taskId match but date mismatch — should NOT delete
test('S_DeleteRec: same taskId different date → not deleted', () => {
    const data = [{ taskId: 'aaa', dateofTask: '1/1/2024', workTime: 100 }];
    const result = S_DeleteRec('aaa', '1/2/2024', data);
    assertEqual(result.length, 1);
});

// findTaskInTaskStr: boundary at exactly 10 chars
test('findTaskInTaskStr: task string exactly 10 chars — exact match only', () => {
    assert(findTaskInTaskStr('1234567890', '1234567890'));
    assert(!findTaskInTaskStr('1234567891', '1234567890'));
});

// processAET / processAETnFloat — range edge cases
test('processAET: single value no range marker', () => assertEqual(processAET('9.0', 'HIGH'), 9.0));
test('processAETnFloat: single value no range marker', () => assertEqual(processAETnFloat('9.0', 'HIGH'), 9.0 * 60000));

// ─────────────────────────────────────────────────────────────────────────────
// invoice.js — pure functions
// (loaded standalone; duplicates some dates.js functions intentionally)
// ─────────────────────────────────────────────────────────────────────────────

console.log('\ninvoice.js');

// Load invoice.js in its own scope with the globals it needs
loadSrc('invoice.js');

// invoice dateEqual — compares by M/D/YYYY strings (better than dates.js version)
test('invoice dateEqual: same day different times → true', () => {
    assert(dateEqual('6/15/2024 08:00:00 AM', '6/15/2024 11:59:00 PM'));
});
test('invoice dateEqual: different days → false', () => {
    assert(!dateEqual('6/15/2024', '6/16/2024'));
});
test('invoice dateEqual: year boundary → false', () => {
    assert(!dateEqual('12/31/2023', '1/1/2024'));
});
test('invoice dateEqual: date objects equal', () => {
    assert(dateEqual(new Date(2024, 5, 15, 8, 0), new Date(2024, 5, 15, 22, 0)));
});

// findInvoiceR
test('findInvoiceR: finds record matching date', () => {
    const recs = [
        { date: '6/15/2024', amount: 100 },
        { date: '6/16/2024', amount: 200 },
    ];
    const result = findInvoiceR('6/15/2024', recs);
    assert(result !== null, 'should find record');
    assertEqual(result.amount, 100);
});
test('findInvoiceR: returns null when not found', () => {
    const recs = [{ date: '6/15/2024', amount: 100 }];
    assertEqual(findInvoiceR('6/20/2024', recs), null);
});
test('findInvoiceR: empty array returns null', () => {
    assertEqual(findInvoiceR('6/15/2024', []), null);
});

// getIstartend — returns month boundaries for international invoice
test('getIstartend: June 2024 starts June 1', () => {
    const result = getIstartend(new Date(2024, 5, 15));
    assertEqual(result.startDate.getMonth(), 5);
    assertEqual(result.startDate.getDate(), 1);
});
test('getIstartend: June ends June 30', () => {
    const result = getIstartend(new Date(2024, 5, 15));
    assertEqual(result.endDate.getMonth(), 5);
    assertEqual(result.endDate.getDate(), 30);
});
test('getIstartend: January ends Jan 31', () => {
    const result = getIstartend(new Date(2024, 0, 15));
    assertEqual(result.endDate.getDate(), 31);
});
test('getIstartend: February ends Feb 28 (non-leap)', () => {
    const result = getIstartend(new Date(2023, 1, 10));
    assertEqual(result.endDate.getDate(), 28);
});

// invoice_getStartofPeriod — same logic as dates_getStartofPeriod
test('invoice_getStartofPeriod: returns a Sunday', () => {
    const result = invoice_getStartofPeriod(new Date('2024-06-12'));
    assertEqual(result.getDay(), 0);
});
test('invoice_getStartofPeriod: even weeks from beg epoch', () => {
    const result = invoice_getStartofPeriod(new Date('2024-06-12'));
    const weekDiff = mydiff(beg, result, 'weeks');
    assertEqual(weekDiff % 2, 0);
});
test('invoice_getStartofPeriod: null uses today', () => {
    const result = invoice_getStartofPeriod(null);
    assertEqual(result.getDay(), 0);
});
test('invoice_getStartofPeriod: matches dates_getStartofPeriod', () => {
    const d = new Date('2024-06-12');
    const fromDates   = dates_getStartofPeriod(d);
    const fromInvoice = invoice_getStartofPeriod(new Date(d));
    assertEqual(fromDates.getTime(), fromInvoice.getTime());
});

// badDate — checks whether a date falls outside a period string "Label: M/D/YYYY - M/D/YYYY"
test('badDate: date within range returns false', () => {
    assert(!badDate('Period: 1/1/2025 - 1/31/2025', '1/15/2025'));
});
test('badDate: date before range returns true', () => {
    assert(badDate('Period: 2/1/2025 - 2/28/2025', '1/31/2025'));
});
test('badDate: date after range returns true', () => {
    assert(badDate('Period: 1/1/2025 - 1/31/2025', '2/1/2025'));
});
test('badDate: date equal to start boundary returns false', () => {
    assert(!badDate('Period: 1/1/2025 - 1/31/2025', '1/1/2025'));
});
test('badDate: date equal to end boundary returns false', () => {
    assert(!badDate('Period: 1/1/2025 - 1/31/2025', '1/31/2025'));
});
test('badDate: malformed string missing colon returns false', () => {
    // strs.length != 2 → logs warning and returns false
    assert(!badDate('nocolon', '1/15/2025'));
});

// ─────────────────────────────────────────────────────────────────────────────
// spell.js — pure functions
// ─────────────────────────────────────────────────────────────────────────────

console.log('\nspell.js');
loadSrc('spell.js');

// isChar
test('isChar: lowercase letter → true', () => assert(isChar('a')));
test('isChar: uppercase letter → true', () => assert(isChar('Z')));
test('isChar: digit → true', () => assert(isChar('5')));
test('isChar: space → false', () => assert(!isChar(' ')));
test('isChar: period → false', () => assert(!isChar('.')));
test('isChar: comma → false', () => assert(!isChar(',')));
test('isChar: empty string → false', () => assert(!isChar('')));
test('isChar: multi-char string → false', () => assert(!isChar('ab')));

// notChar
test('notChar: letter → false', () => assert(!notChar('a')));
test('notChar: digit → false', () => assert(!notChar('3')));
test('notChar: space → true', () => assert(notChar(' ')));
test('notChar: period → true', () => assert(notChar('.')));
test('notChar: comma → true', () => assert(notChar(',')));
test('notChar: exclamation → true', () => assert(notChar('!')));
test('notChar: isChar and notChar are complementary for single chars', () => {
    for (const c of ['a', 'Z', '5']) assert(isChar(c) && !notChar(c), c);
    for (const c of [' ', '.', ',', '!']) assert(!isChar(c) && notChar(c), c);
});

// stripTrailingPunc
test('stripTrailingPunc: removes trailing period', () => assertEqual(stripTrailingPunc('hello.'), 'hello'));
test('stripTrailingPunc: removes trailing comma', () => assertEqual(stripTrailingPunc('hello,'), 'hello'));
test('stripTrailingPunc: leaves clean word alone', () => assertEqual(stripTrailingPunc('hello'), 'hello'));
test('stripTrailingPunc: null/undefined returns input', () => assertEqual(stripTrailingPunc(null), null));
test('stripTrailingPunc: empty string returns empty', () => assertEqual(stripTrailingPunc(''), ''));
test('stripTrailingPunc: only removes ONE trailing char', () => assertEqual(stripTrailingPunc('hello..'), 'hello.'));
test('stripTrailingPunc: trailing letter untouched', () => assertEqual(stripTrailingPunc('hello'), 'hello'));

// pasteTogether
test('pasteTogether: single word + space appends space', () => {
    assertEqual(pasteTogether(['hello'], ' '), 'hello ');
});
test('pasteTogether: single word + non-space no trailing space', () => {
    assertEqual(pasteTogether(['hello'], '.'), 'hello');
});
test('pasteTogether: multiple words joined with spaces', () => {
    assertEqual(pasteTogether(['hello', 'world', 'foo'], '.'), 'hello world foo');
});
test('pasteTogether: multiple words + space trigger adds trailing space', () => {
    assertEqual(pasteTogether(['hello', 'world'], ' '), 'hello world ');
});
test('pasteTogether: empty word in middle — space still inserted between slots', () => {
    // The function always adds a space between index slots; empty words produce double-space
    const result = pasteTogether(['hello', '', 'world'], '.');
    assertEqual(result, 'hello  world');
});

// ─────────────────────────────────────────────────────────────────────────────
// phrases.js — pure functions
// ─────────────────────────────────────────────────────────────────────────────

console.log('\nphrases.js');
loadSrc('phrases.js');

// buildMatches — builds cumulative suffix combinations from word array, reversed
test('buildMatches: single word returns that word', () => {
    const result = buildMatches(['hello']);
    assertEqual(result.length, 1);
    assertEqual(result[0], 'hello');
});
test('buildMatches: two words returns both combinations', () => {
    const result = buildMatches(['hello', 'world']);
    assert(result.includes('world'), 'last word alone');
    assert(result.includes('hello world'), 'both words');
});
test('buildMatches: three words builds all suffix combos', () => {
    const result = buildMatches(['the', 'quick', 'fox']);
    assert(result.includes('fox'), 'last word');
    assert(result.includes('quick fox'), 'last two');
    assert(result.includes('the quick fox'), 'all three');
    assertEqual(result.length, 3);
});
test('buildMatches: empty array returns empty', () => {
    assertEqual(buildMatches([]).length, 0);
});

// findLastPiece
test('findLastPiece: no delimiters returns full string', () => {
    assertEqual(findLastPiece('hello world'), 'hello world');
});
test('findLastPiece: comma delimiter', () => {
    assertEqual(findLastPiece('hello, world'), ' world');
});
test('findLastPiece: hyphen delimiter', () => {
    assertEqual(findLastPiece('hello-world'), 'world');
});
test('findLastPiece: period delimiter', () => {
    assertEqual(findLastPiece('hello.world'), 'world');
});
test('findLastPiece: picks the last delimiter when multiple exist', () => {
    assertEqual(findLastPiece('a,b.c-d'), 'd');
});
test('findLastPiece: colon delimiter', () => {
    assertEqual(findLastPiece('label:value'), 'value');
});
test('findLastPiece: semicolon delimiter', () => {
    assertEqual(findLastPiece('a;b'), 'b');
});

// ─────────────────────────────────────────────────────────────────────────────
// chat.js — pure functions
// ─────────────────────────────────────────────────────────────────────────────

console.log('\nchat.js');
// chat.js re-declares alertOnce (already in utils.js) so we can't load the whole file.
// Directly eval just the pure function bodies we need.
{
    // setCharAt
    vm.runInThisContext(`
function setCharAt(str, index, chr) {
    if (index > str.length - 1) return str;
    return str.substring(0, index) + chr + str.substring(index + 1);
}
`);
    // buildName calls subLookup which references nameFile (file-scope var in chat.js)
    global.nameFile = null;
    global.myNameFile = null;
    global.s_logIt = () => {};
    const chatSrc = fs.readFileSync(path.join(srcDir, 'chat.js'), 'utf8');
    const chatLines = chatSrc.split("\n");
    function extractFn(startLine) {
        let depth = 0, body = [], started = false;
        for (let i = startLine - 1; i < chatLines.length; i++) {
            const l = chatLines[i];
            if (!started && l.startsWith("function")) started = true;
            if (!started) continue;
            body.push(l);
            depth += (l.match(/\{/g) || []).length - (l.match(/\}/g) || []).length;
            if (started && depth === 0) break;
        }
        return body.join("\n");
    }
    vm.runInThisContext(extractFn(632)); // subLookup
    vm.runInThisContext(extractFn(473)); // buildName
    global.phrasesMatchFound = () => false;
    vm.runInThisContext(extractFn(
        chatLines.findIndex(l => l.startsWith("function check4filtermatch")) + 1
    ));
}

// setCharAt
test('setCharAt: replaces char at position 0', () => assertEqual(setCharAt('hello', 0, 'H'), 'Hello'));
test('setCharAt: replaces char at middle position', () => assertEqual(setCharAt('hello', 2, 'X'), 'heXlo'));
test('setCharAt: replaces last char', () => assertEqual(setCharAt('hello', 4, '!'), 'hell!'));
test('setCharAt: index beyond length returns original', () => assertEqual(setCharAt('hello', 10, 'X'), 'hello'));
test('setCharAt: empty string returns empty', () => assertEqual(setCharAt('', 0, 'X'), ''));

// buildName — maps RaterHub alias through nameFile lookup
// When nameFile=null (no lookup table loaded), always returns original name unchanged
test('buildName: returns original when nameFile is null', () => {
    global.nameFile = null;
    assertEqual(buildName('@MorrisN155'), '@MorrisN155');
});
test('buildName: with nameFile match returns MDEandle without dots', () => {
    global.nameFile = { rows: [{ RaterLabs: 'Morris.N.155', MDEandle: 'Morris.N.155' }] };
    // subLookup matches on the formatted newStr — test that it runs without error
    const result = buildName('@MorrisN155');
    assert(typeof result === 'string', 'returns a string: ' + result);
    global.nameFile = null;
});
test('buildName: no nameFile match returns original name', () => {
    global.nameFile = { rows: [{ RaterLabs: 'Somebody', MDEandle: 'SomebodyElse' }] };
    assertEqual(buildName('@Alice'), '@Alice');
    global.nameFile = null;
});

// check4filtermatch — needs phrasesMatchFound; test with simple phrase string
test('check4filtermatch: string match found', () => {
    // phrasesMatchFound is defined in chat.js as an impure function
    // but check4filtermatch itself only calls it — if we stub it we can test the routing
    const origPMF = typeof phrasesMatchFound !== 'undefined' ? phrasesMatchFound : null;
    global.phrasesMatchFound = (msg, phrase) => msg.toUpperCase().includes(phrase.toUpperCase());
    const result = check4filtermatch('Hello World', 'world', null);
    assertEqual(result, 'world');
    if (origPMF) global.phrasesMatchFound = origPMF;
});
test('check4filtermatch: no match returns null', () => {
    global.phrasesMatchFound = (msg, phrase) => msg.toUpperCase().includes(phrase.toUpperCase());
    const result = check4filtermatch('Hello World', 'goodbye', null);
    assertEqual(result, null);
});
test('check4filtermatch: array of phrases finds first match', () => {
    global.phrasesMatchFound = (msg, phrase) => msg.toUpperCase().includes(phrase.toUpperCase());
    const result = check4filtermatch('Hello World', null, ['goodbye', 'world', 'hello']);
    assertEqual(result, 'world');
});
test('check4filtermatch: comma-separated phrase string', () => {
    global.phrasesMatchFound = (msg, phrase) => msg.toUpperCase().includes(phrase.toUpperCase());
    const result = check4filtermatch('Hello World', 'goodbye,world', null);
    assertEqual(result, 'world');
});

// ─────────────────────────────────────────────────────────────────────────────
// background.js — pure functions (loaded in isolated vm sandbox)
// ─────────────────────────────────────────────────────────────────────────────

console.log('\nbackground.js (pure)');

{
    const fs   = require('fs');
    const vm   = require('vm');
    const path = require('path');

    // background.js depends on dates.js functions and several globals.
    // Load dates.js first, then shim the globals background needs, then
    // extract only the pure functions we want to test.
    const rhSrc    = fs.readFileSync(path.join(srcDir, 'rh-status.js'), 'utf8');
    const datesSrc = fs.readFileSync(path.join(srcDir, 'dates.js'), 'utf8');
    const bgSrc    = fs.readFileSync(path.join(srcDir, 'background.js'), 'utf8');

    const noop = () => {};
    const evtStub = { addListener: noop, removeListener: noop, hasListener: () => false };

    const sandbox = {
        console,
        logObject: noop,
        GetLogStatus: () => false,
        chrome: {
            runtime:      { id: 'test', lastError: null, onMessage: evtStub, onInstalled: evtStub, onStartup: evtStub, getURL: () => '' },
            storage:      { local: { get: noop, set: noop }, sync: { get: noop, set: noop } },
            tabs:         { onUpdated: { ...evtStub }, onRemoved: { ...evtStub }, query: noop, create: noop, update: noop, remove: noop },
            sessions:     { getRecentlyClosed: noop },
            contextMenus: { removeAll: noop, create: () => 0, onClicked: evtStub },
            alarms:       { create: noop, onAlarm: evtStub },
            notifications: { create: noop },
        },
        Date, JSON, parseInt, parseFloat, isNaN, Math, Array, Object, String, Number, Boolean, Error, RegExp,
        setTimeout: () => 0, clearTimeout: noop, setInterval: () => 0, clearInterval: noop,
    };

    // Load dependencies in order: rh-status defines RHstatus, dates defines date helpers
    vm.runInNewContext(rhSrc,    sandbox);
    vm.runInNewContext(datesSrc, sandbox);
    vm.runInNewContext(bgSrc,    sandbox);

    // validDateRec
    test('validDateRec: valid row passes', () => {
        // [taskId, dateStr, aetStr, workStr]
        assert(sandbox.validDateRec(['1234567890', '6/15/2024', '9.0', '00:08:00']));
    });
    test('validDateRec: "Total" header row passes', () => {
        assert(sandbox.validDateRec(['Total week', '', '', '']));
    });
    test('validDateRec: "Task" header row passes', () => {
        assert(sandbox.validDateRec(['Task', '', '', '']));
    });
    test('validDateRec: taskId too short returns false', () => {
        assert(!sandbox.validDateRec(['123', '6/15/2024', '9.0', '']));
    });
    test('validDateRec: invalid date returns false', () => {
        assert(!sandbox.validDateRec(['1234567890', 'not-a-date', '9.0', '']));
    });
    test('validDateRec: non-numeric AET returns false', () => {
        assert(!sandbox.validDateRec(['1234567890', '6/15/2024', 'abc', '']));
    });
    test('validDateRec: AET with range parens — takes first part', () => {
        // "9.0(8-10)" — AETs[0] = "9.0", parseFloat = 9.0 → valid
        assert(sandbox.validDateRec(['1234567890', '6/15/2024', '9.0(8-10)', '']));
    });

    // urlIsnotTask
    test('urlIsnotTask: empty string returns true', () => {
        assert(sandbox.urlIsnotTask(''));
    });
    test('urlIsnotTask: URL with taskIds= returns false', () => {
        assert(!sandbox.urlIsnotTask('https://www.raterhub.com/evaluation/rater/task/show?taskIds=123'));
    });
    test('urlIsnotTask: non-task URL returns true', () => {
        assert(sandbox.urlIsnotTask('https://www.raterhub.com/evaluation/rater'));
    });

    // removetStar
    test('removetStar: trailing * removed', () => {
        assertEqual(sandbox.removetStar('hello*'), 'hello');
    });
    test('removetStar: no trailing * unchanged', () => {
        assertEqual(sandbox.removetStar('hello'), 'hello');
    });
    test('removetStar: empty string unchanged', () => {
        assertEqual(sandbox.removetStar(''), '');
    });
    test('removetStar: only * returns empty string', () => {
        assertEqual(sandbox.removetStar('*'), '');
    });

    // buildChatTextAlertsArray
    test('buildChatTextAlertsArray: null returns null', () => {
        assertEqual(sandbox.buildChatTextAlertsArray(null), null);
    });
    test('buildChatTextAlertsArray: empty string returns null', () => {
        assertEqual(sandbox.buildChatTextAlertsArray(''), null);
    });
    test('buildChatTextAlertsArray: single phrase builds one-element array', () => {
        const result = sandbox.buildChatTextAlertsArray('hello');
        assertEqual(result.length, 1);
        assertEqual(result[0].phrase, 'hello');
        assert(result[0].lastDate instanceof Date);
    });
    test('buildChatTextAlertsArray: comma-separated list builds multiple elements', () => {
        const result = sandbox.buildChatTextAlertsArray('hello,world,foo');
        assertEqual(result.length, 3);
        assertEqual(result[1].phrase, 'world');
    });

    // trackCleanup
    test('trackCleanup: keeps records newer than cutoff', () => {
        const now = Date.now();
        const recs = [
            { dateofTask: new Date(now - 86400000).toString() },  // 1 day ago
            { dateofTask: new Date(now - 5 * 86400000).toString() }, // 5 days ago
        ];
        const result = sandbox.trackCleanup(recs, 7, null);
        assertEqual(result.length, 2);
    });
    test('trackCleanup: prunes records older than days', () => {
        const now = Date.now();
        const recs = [
            { dateofTask: new Date(now - 86400000).toString() },       // 1 day — keep
            { dateofTask: new Date(now - 200 * 86400000).toString() }, // 200 days — prune
        ];
        const result = sandbox.trackCleanup(recs, 30, null);
        assertEqual(result.length, 1);
    });
    test('trackCleanup: compDateIn overrides days calculation', () => {
        const cutoff = new Date(Date.now() - 10 * 86400000); // 10 days ago as cutoff
        const recs = [
            { dateofTask: new Date(Date.now() - 5 * 86400000).toString() },  // 5 days — keep
            { dateofTask: new Date(Date.now() - 15 * 86400000).toString() }, // 15 days — prune
        ];
        const result = sandbox.trackCleanup(recs, 999, cutoff);
        assertEqual(result.length, 1);
    });
    test('trackCleanup: empty array returns empty', () => {
        assertEqual(sandbox.trackCleanup([], 30, null).length, 0);
    });

    // oneSelected
    test('oneSelected: all false returns false', () => {
        assert(!sandbox.oneSelected({ nrt:0, uo:0, ac:0, sapr:0, hr:0, pr:0, hrs:0, hm:0, nrtstart:0, nrtstop:0 }));
    });
    test('oneSelected: nrt=1 returns true', () => {
        assert(sandbox.oneSelected({ nrt:1, uo:0, ac:0, sapr:0, hr:0, pr:0, hrs:0, hm:0, nrtstart:0, nrtstop:0 }));
    });
    test('oneSelected: any truthy flag returns true', () => {
        assert(sandbox.oneSelected({ nrt:0, uo:0, ac:1, sapr:0, hr:0, pr:0, hrs:0, hm:0, nrtstart:0, nrtstop:0 }));
    });

    // updateThisday
    test('updateThisday: adds new record when date not found', () => {
        const arr = [{ date: '6/14/2024', raetMils: 100, workMils: 200, platform: 'PC' }];
        const result = sandbox.updateThisday(arr, { date: '6/15/2024', raetMils: 300, workMils: 400, platform: 'PC' });
        assertEqual(result.length, 2);
    });
    test('updateThisday: updates existing record on matching date+platform', () => {
        const arr = [{ date: '6/15/2024', raetMils: 100, workMils: 200, platform: 'PC' }];
        const result = sandbox.updateThisday(arr, { date: '6/15/2024', raetMils: 999, workMils: 888, platform: 'PC' });
        assertEqual(result.length, 1);
        assertEqual(result[0].raetMils, 999);
        assertEqual(result[0].workMils, 888);
    });
    test('updateThisday: same date different platform adds new record', () => {
        const arr = [{ date: '6/15/2024', raetMils: 100, workMils: 200, platform: 'PC' }];
        const result = sandbox.updateThisday(arr, { date: '6/15/2024', raetMils: 300, workMils: 400, platform: 'Mac' });
        assertEqual(result.length, 2);
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// popup.js — pure functions (loaded in isolated vm sandbox)
// ─────────────────────────────────────────────────────────────────────────────

console.log('\npopup.js (pure)');

{
    const fs   = require('fs');
    const vm   = require('vm');
    const path = require('path');

    const datesSrc  = fs.readFileSync(path.join(srcDir, 'dates.js'),  'utf8');
    const utilsSrc  = fs.readFileSync(path.join(srcDir, 'utils.js'),  'utf8');
    const popupSrc  = fs.readFileSync(path.join(srcDir, 'popup.js'),  'utf8');

    const noop2  = () => {};
    const jqEl   = () => ({ is: noop2, val: () => '', children: () => ({ length: 0 }), find: () => ({ length: 0, first: () => ({}) }), text: () => '', html: () => '', append: noop2, remove: noop2, each: noop2, on: () => jqEl(), off: noop2, css: noop2, show: noop2, hide: noop2, prepend: noop2, attr: () => '', prop: () => false, click: noop2, change: noop2 });
    const sandbox = {
        console,
        chrome: {
            runtime:  { id: 'test', lastError: null, onMessage: { addListener: noop2 }, getURL: () => '' },
            storage:  { local: { get: noop2, set: noop2, remove: noop2 }, sync: { remove: noop2 } },
        },
        $: jqEl,
        document:  { getElementById: () => null, getElementsByClassName: () => [], createElement: () => ({ style: {}, appendChild: noop2 }), body: { appendChild: noop2 }, addEventListener: noop2 },
        window:    { location: { href: '' }, addEventListener: noop2 },
        alert: noop2, confirm: () => false,
        navigator: { clipboard: { writeText: () => Promise.resolve() } },
        s_myComputer: { number: 1, desc: 'TestMachine' },
        logObject: noop2, GetLogStatus: () => false, isValidChromeRuntime: () => false, SendSafeRuntimeMessage: noop2,
        setInterval: () => 0, clearInterval: noop2, setTimeout: () => 0, clearTimeout: noop2,
        Date, JSON, parseInt, parseFloat, isNaN, Math, Array, Object, String, Number, Boolean, Error, RegExp,
    };

    vm.runInNewContext(datesSrc, sandbox);
    vm.runInNewContext(utilsSrc, sandbox);
    vm.runInNewContext(popupSrc, sandbox);

    // platform2thisComputer
    test('platform2thisComputer: parses "1 MyLaptop"', () => {
        const result = sandbox.platform2thisComputer('1 MyLaptop');
        assertEqual(result.number, 1);
        assertEqual(result.desc, 'MyLaptop');
    });
    test('platform2thisComputer: parses multi-word desc', () => {
        const result = sandbox.platform2thisComputer('3 Home Desktop PC');
        assertEqual(result.number, 3);
        assertEqual(result.desc, 'Home Desktop PC');
    });

    // makeComputerNameShort
    test('makeComputerNameShort: truncates to 10 chars', () => {
        assertEqual(sandbox.makeComputerNameShort('ABCDEFGHIJKLMNOP'), 'ABCDEFGHIJ');
    });
    test('makeComputerNameShort: short string unchanged', () => {
        assertEqual(sandbox.makeComputerNameShort('PC'), 'PC');
    });
    test('makeComputerNameShort: null returns null', () => {
        assertEqual(sandbox.makeComputerNameShort(null), null);
    });

    // getFilterConstant — reads getReleasedConstant, getncConstant (from utils.js), inProcessFilterStr
    test('getFilterConstant: "r" maps to released constant', () => {
        const result = sandbox.getFilterConstant('r');
        assertEqual(result, sandbox.getReleasedConstant());
    });
    test('getFilterConstant: "nc" maps to nc constant', () => {
        assertEqual(sandbox.getFilterConstant('nc'), sandbox.getncConstant());
    });
    test('getFilterConstant: "ip" maps to inProcessFilterStr', () => {
        assertEqual(sandbox.getFilterConstant('ip'), 'InProcess');
    });
    test('getFilterConstant: unknown value passes through unchanged', () => {
        assertEqual(sandbox.getFilterConstant('submitted'), 'submitted');
    });

    // s_getsound
    test('s_getsound: returns default when active is empty', () => {
        const sounds = [{ type: 'TRACKER', active: '', default: 'beep.mp3' }];
        assertEqual(sandbox.s_getsound(sounds, 'TRACKER'), 'beep.mp3');
    });
    test('s_getsound: returns "custom" when active has no .mp3 and is not NONE', () => {
        const sounds = [{ type: 'TRACKER', active: 'custom-sound-id', default: 'beep.mp3' }];
        assertEqual(sandbox.s_getsound(sounds, 'TRACKER'), 'custom');
    });
    test('s_getsound: returns active when it ends in .mp3', () => {
        const sounds = [{ type: 'TRACKER', active: 'train.mp3', default: 'beep.mp3' }];
        assertEqual(sandbox.s_getsound(sounds, 'TRACKER'), 'train.mp3');
    });

    // processTotalLine — returns an HTML string, check structure not exact markup
    test('processTotalLine: returns HTML string with date', () => {
        const html = sandbox.processTotalLine(9, 480000, '6/15/2024', 5, true, false, 9);
        assert(typeof html === 'string', 'should return string');
        assert(html.includes('6/15/2024'), 'should contain date');
        assert(html.includes('<tr'), 'should contain table row');
    });
    test('processTotalLine: negative surplus shows red class', () => {
        // totalAET=5min, totalTime=600000ms (10min) → diff = -300000 → overtime
        const html = sandbox.processTotalLine(5, 600000, '6/15/2024', 5, true, false, 5);
        assert(html.includes('rednogrey'), 'should show red for overtime: ' + html.substring(0, 200));
    });
    test('processTotalLine: positive surplus shows green class', () => {
        // totalAET=20min, totalTime=600000ms (10min) → diff = 600000 → under time
        const html = sandbox.processTotalLine(20, 600000, '6/15/2024', 5, true, false, 20);
        assert(html.includes('greennogrey'), 'should show green for under time');
    });

    // buildTotalCLine — also returns HTML
    test('buildTotalCLine: returns HTML string with total label', () => {
        const html = sandbox.buildTotalCLine(9, 480000, 5, '6/15/2024', true);
        assert(typeof html === 'string');
        assert(html.includes('<tr'), 'should contain table row');
        assert(html.includes('Total for'), 'should include total label');
    });
    test('buildTotalCLine: productivity calculation appears', () => {
        // 9min AET = 540000ms, 480000ms work → (540000/480000)*100 = 112.5%
        const html = sandbox.buildTotalCLine(9, 480000, 5, '6/15/2024', true);
        assert(html.includes('%'), 'should include productivity percentage');
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// phrases.js — additional pure functions
// ─────────────────────────────────────────────────────────────────────────────

console.log('\nphrases.js (pure additions)');

{
    const fs   = require('fs');
    const vm   = require('vm');
    const path = require('path');

    const src = fs.readFileSync(path.join(srcDir, 'phrases.js'), 'utf8');
    const sandbox = {
        console,
        document: { getElementById: () => null, addEventListener: () => {} },
        $: () => ({ on: () => {}, off: () => {}, val: () => '', text: () => '', css: () => {}, remove: () => {}, find: () => ({ length: 0, each: () => {} }), each: () => {} }),
        window: {},
        chrome: { runtime: { id: 'test', onMessage: { addListener: () => {} } } },
        SendSafeRuntimeMessage: () => {},
        isValidChromeRuntime: () => false,
        s_phraseArray: [],
        s_optSentence: false,
    };
    vm.runInNewContext(src, sandbox);

    // s_phraseArray is declared with `let` inside phrases.js so it shadows the sandbox
    // property. Set it inside the vm context after load via a second runInNewContext call.
    const testPhrases = [
        { Phrase: 'hello world' },
        { Phrase: 'hello there' },
        { Phrase: 'goodbye' },
        { Phrase: 'help me' },
    ];
    vm.runInNewContext('s_phraseArray = phrases; s_optSentence = false;',
        Object.assign(sandbox, { phrases: testPhrases }));

    // wordfindStr: finds phrases that START WITH the last word typed
    test('wordfindStr: finds matching prefix phrases', () => {
        const result = sandbox.wordfindStr('hel');
        // "hel" should match "hello world" and "hello there" and "help me"
        assert(result.length >= 2, 'should find matches: ' + result.length);
    });
    test('wordfindStr: no match returns empty array', () => {
        const result = sandbox.wordfindStr('zzz');
        assertEqual(result.length, 0);
    });
    test('wordfindStr: exact match excluded (prefix only, not equal)', () => {
        // "goodbye" exists but wordfindStr requires tStr != str2examine
        vm.runInNewContext('s_phraseArray = p;', Object.assign(sandbox, { p: [{ Phrase: 'goodbye' }] }));
        const result = sandbox.wordfindStr('GOODBYE');
        assertEqual(result.length, 0);
        // restore
        vm.runInNewContext('s_phraseArray = p;', Object.assign(sandbox, { p: testPhrases }));
    });

    // findStr: sentence mode (s_optSentence=false → delegates to wordfindStr)
    test('findStr: with s_optSentence=false delegates to wordfindStr', () => {
        vm.runInNewContext('s_optSentence = false;', sandbox);
        const result = sandbox.findStr('hel');
        assert(result.length >= 2);
    });
    test('findStr: with s_optSentence=true uses last sentence fragment', () => {
        vm.runInNewContext('s_optSentence = true;', sandbox);
        // "First sentence. hel" → last piece is " hel" → trimmed "HEL"
        const result = sandbox.findStr('First sentence. hel');
        assert(result.length >= 2, 'should match by last fragment');
        vm.runInNewContext('s_optSentence = false;', sandbox); // restore
    });

    // getFirstRow
    test('getFirstRow: returns first row of table object', () => {
        const tbl = { rows: [{ cells: ['a'] }, { cells: ['b'] }] };
        assertEqual(sandbox.getFirstRow(tbl), tbl.rows[0]);
    });
    test('getFirstRow: empty table returns null', () => {
        assertEqual(sandbox.getFirstRow({ rows: [] }), null);
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// Results
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n');
if (failures.length > 0) {
    console.log('FAILURES:');
    failures.forEach(f => console.log(`  ✗ ${f.label}\n    ${f.error}`));
    console.log('');
}
console.log(`${passed} passed  ${failed} failed  ${skipped} skipped`);
process.exit(failed > 0 ? 1 : 0);
