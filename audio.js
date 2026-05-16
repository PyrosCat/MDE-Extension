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
    chrome.runtime.sendMessage({ text: 'CONSOLELOG', msg: 'audio loaded' });

    chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
        if (msg.text == "FORRHTEMP") {
            let snd = new Audio();
            chrome.runtime.sendMessage({ text: 'CONSOLELOG', msg: 'got FORRHTEMP in audio' });
             snd.volume = 0.5;
             snd.src = msg.src;
            let send = "in offscreen. asked to play:" + msg.src + " audio is:" + JSON.stringify(snd);
            chrome.runtime.sendMessage({ text: 'CONSOLELOG', msg: send });
            let promise1 = snd.play();
            promise1.then(_ => {
                chrome.runtime.sendMessage({ text: 'CONSOLELOG', msg: "promise in audio sucessful" });
            }).catch(error => {
                chrome.runtime.sendMessage({ text: 'CONSOLELOG', msg: "promise caught in audio" });
            });

        //    console.log("length is:" + urlParams.get('length'));
        //    setTimeout(self.close, urlParams.get('length'));
        }
    });
}
