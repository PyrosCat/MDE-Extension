resizeTo(0, 0);
onload = () => {
    //const queryString = window.location.search;
    //const urlParams = new URLSearchParams(queryString);
    let audio = new Audio();

    //audio.addEventListener("loadedmetadata", function (el) {
    //    s_length = el.duration;
    //});

    //audio.onended = function () {
    //    self.close();
    //};
    //console.log('sending get sound in audio');
    
    //chrome.runtime.sendMessage({ text: 'GETSOUND' });

    chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
        if (msg.text == "FORRHTEMP") {
            let snd = new Audio();
             snd.volume = 0.5;
             snd.src = msg.src;
            let promise1 = snd.play();
            promise1.then(_ => {
                sendResponse({ ok: true });
            }).catch(error => {
                sendResponse({ ok: false, error: error.message });
            });

        //    console.log("length is:" + urlParams.get('length'));
        //    setTimeout(self.close, urlParams.get('length'));
            return true; // keep channel open while snd.play() resolves
        }
        // Any other message: return false so Chrome knows this listener
        // will not call sendResponse and can close the channel immediately.
        return false;
    });
}
