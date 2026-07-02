// JavaScript source code
/*
let creating; // A global promise to avoid concurrency issues
async function background_sendOffscreen(sound) {
    console.log("background sound asked to play:" + sound);

    // create offscreen document
    if (creating) {
        await creating;
    } else {
        if (!(await hasDocument())) {
            console.log('ok to create doc for:' + sound);
            creating = chrome.offscreen.createDocument({
                url: 'audio.html',
                reasons: ['AUDIO_PLAYBACK'],
                justification: 'inactive tabs dont always play sound, so they send me a request to play the sound.',
            });
            await creating;
            creating = null;
            console.log('created offscreen doc ' + sound);
        }
    }
}

async function hasDocument() {
    // Check all windows controlled by the service worker if one of them is the offscreen document
    const offscreenUrl = chrome.runtime.getURL('audio.html');
    const matchedClients = await clients.matchAll();
    for (const client of matchedClients) {
        if (client.url == offscreenUrl) {
            return true;
        }
    }
    return false;
}
*/


async function setupOffscreen(sound) {
    let exist = false;
    let clientList = await clients.matchAll();

    for (const client of clientList) {
        if (client.url.endsWith("audio.html")) {
            exist = true;
            break;
        }
    }

    if (!exist) {
        // MV3: createDocument returns a Promise — must await it before
        // sending FORRHTEMP so the audio.html listener is ready to receive.
        // Using a callback instead of await silently drops the callback and
        // sends the message before the document exists, causing the
        // "message channel closed" error.
        await chrome.offscreen.createDocument({
            url: 'audio.html',
            reasons: ['CLIPBOARD'],
            justification: 'inactive tabs dont always play sound, so they send me a request to play the sound.'
        });
    }

    // Send after document is confirmed to exist (whether just created or
    // already running) so audio.js listener is ready to receive.
    SendSafeTabMessage(null, { text: "FORRHTEMP", src: sound });
}

async function background_sendOffscreen(sound) {
    await setupOffscreen(sound);
}

