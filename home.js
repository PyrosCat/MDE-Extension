// JavaScript source code
chk4messages();

/**
 * Scan the loaded home page table rows and inject MDE status indicators.
 */
function chk4messages() {
    let ifrm = document.createElement("iframe");
    ifrm.src = "/qrp/core/vendors/tickets/list";
    ifrm.style.border = "None";
    ifrm.id = "msgIframe";
    document.getElementsByTagName("body")[0].appendChild(ifrm);
    ifrm.addEventListener("load", function () {
        let x = document.getElementById("msgIframe");
        let tableList = x.contentDocument.getElementsByClassName("data-table");
        if (tableList) {
            let table = tableList[0];
            let rows = table.getElementsByTagName("tr");
            if (rows.length == 0) {
                setTimeout(function () {
                    bhome_wait4it(table, ifrm.src);
                }, 1000);
            }
            else
                bhome_realCheck(table, rows);
        }
    });
}

/**
 * Poll the DOM until the home page table is fully loaded, then process it.
 *
 * @param {Object} table
 * @param {string} url
 */
function home_wait4it(table,url) {
    let rows = table.getElementsByTagName("tr");
    if (rows.length == 0) {
        setTimeout(function () {
            bhome_wait4it(table);
        }, 1000);
    }
    else
        bhome_realCheck(table, rows, url);
}

/**
 * Scan the loaded home page table rows and inject MDE status indicators.
 *
 * @param {Object} table
 * @param {Array} rows
 * @param {string} url
 */
function home_realCheck(table, rows, url) {
    let count = table.getElementsByClassName("dark");
    if (count.length != 0) {
        let div = document.getElementById("navigation");
        if (div && div.childElementCount == 1) {
            let li = div.children[0].children;
            $(li).each(function () {
                if (this.childElementCount = 1) {
                    if (this.children[0].href && this.children[0].href == url) {
                        this.children[0].style.color = "red";
                    }
                }
            });
        }
    }
}