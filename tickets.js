// JavaScript source code
window.addEventListener("load", function () {
    $(document).ready(function () {
        let tableList = document.getElementsByClassName("data-table");
        if (tableList) {
            let table = tableList[0];
            let rows = table.getElementsByTagName("tr");
            if (rows.length == 0) {
                setTimeout(function () {
                    btickets_wait4it(table);
                }, 1000);
            }
            else
                btickets_realCheck(table,rows);
        }
    });
});

/**
 * Scan the loaded tickets table and inject MDE status indicators.
 *
 * @param {Object} table
 */
function tickets_wait4it(table) {
    let rows = table.getElementsByTagName("tr");
    if (rows.length == 0) {
        setTimeout(function () {
            btickets_wait4it(table);
        }, 1000);
    }
    else
        btickets_realCheck(table,rows);
}

/**
 * Scan the loaded tickets table and inject MDE status indicators.
 *
 * @param {Object} table
 * @param {Array} rows
 */
function tickets_realCheck(table,rows) {
    let count = table.getElementsByClassName("dark");
    if (count.length != 0) {
        beep("gotmail.mp3");
    }
}