

let nameFile = null;
let newURL = "https://raterlabs.appen.com/qrp/core/vendors/social_file/1065488/names.txt";

let alertStatus = false;

/**
 * Read a plain-text document node and return its trimmed content.
 *
 * @param {Function} func2call
 */
function loadFile(func2call) {
    if (nameFile == null) {
        //console.log("before load file", Date());
        $.ajax({
            url: newURL,
            method: 'get',
            //async: false,
            crossDomain: true,
            success: function (data, status, xhr) {
                //console.log("After Load", Date());
                if (data.length > 0) {
                    nameFile = readTextDocument(data);
                    //console.log("After read", Date());
                    func2call();
                }
                else {
                    if (!alertStatus) {
                        alertStatus = true;
                        alert("MDE: Problem accessing names file. If this problem persists, let me know, please.");
                    }
                    else
                        console.log("MDE: Problem accessing names file. If this problem persists, let me know, please.");
                }
                // console.log("After transform", Date());
            }, //end of sucess
            error: function (xhr) {
                let errorStr = "MDE: Unable to access names data file. " + "status code:" + xhr.status;
                if (!alertStatus) {
                    alertStatus = true;
                    alert(errorStr);
                }
                else
                    console.log(errorStr);

                }
        }); // end of ajax
    }
    else
        func2call();
}

/**
 * Decode an encoded rater name string to its display form.
 *
 * @param {string} oldName
 * @returns {*}
 */
function decodeName(oldName) {
    for(let i = 0; i < nameFile.rows.length; i++) {
        if (nameFile.rows[i].RaterLabs === oldName) {
            return nameFile.rows[i].MDEHandle;
        }
    }
    return oldName;
}


/**
 * Look up a rater name in the substitution list and return the match.
 *
 * @param {string} oldName
 * @returns {*}
 */
function lookUp(oldName) {
    //read data if needed
    if (nameFile == null) {
        //console.log("reading data file");
        $.ajax({
            url: newURL,
            method: 'get',
            //async: false,
            crossDomain: true,
            success: function (data, status, xhr) {
                nameFile = readTextDocument(data);
                return decodeName(oldName);

            }, //end of sucess
            error: function (xhr) {
                let errorStr = "MDE: Unable to access names data file. " + "xhr status code:" + xhr.status;
                if (!alertStatus) {
                    alertStatus = true;
                    alert(erorrStr);
                }
                else
                    console.log(errorStr);
                return oldName;
            }
        }); // end of ajax
    }
    else {
        return decodeName(oldName);
    }
    return oldName;
}


// below this should go into it's own file
/**
 * Read a plain-text document node and return its trimmed content.
 *
 * @param {Date} data
 * @returns {Array}
 */
function readTextDocument(data) {
    let lines = data.split('\n');
    let headers = [];
    let rowNo = 0, count = lines.length;


    rowNo++;
    headers = ["MDEHandle", "RaterLabs"];

    let document = { count: count - rowNo, rows: [], headers: headers };

    for(let i = rowNo; i < count; i++) {
        let row = {};
        if (lines[i] == "")
            continue;
        let rowData = lines[i].split('\t');

        for(let k in headers) {
            row[headers[k]] = rowData[k];
        }
        document.rows.push(row);
    }
    return document;
}
