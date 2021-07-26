let keyoptions = ["short-primary", "short-background", "short-size", "short-layout", "short-typo", "short-borders", "short-effects", "short-customcss", "short-customjs", "short-domexpand", "short-domcollapse", "short-styles", "short-cssStyles", "short-selectors"]
getCurrentState().then(data => { applyStateToUI(data) })

// restore saved keybindings
getCurrentKeybindings().then(data => { populateShortcutsWithStorage(data) })


chrome.runtime.onMessage.addListener(function (message) {
    console.log(message)
    switch (message.action) {
        case "changeState":
            chrome.storage.sync.set({ state: message.payload })
            return true
        case "getDefaultKeybindings":
            console.log('retrieve keybindings ', message.payload)
            populateShortcutsWithStorage(message.payload)
            return true
    }
    return true
})

activateBtn.addEventListener("click", async () => {
    let state = await getCurrentState()
    let newState = { ...state }
    newState.isActive = !state.isActive
    changeState(newState)
})

resetDefault.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "getDefault" }, function (keybindings) {
        console.log('retrieve keybingins ... ', keybindings)
    })
    chrome.storage.sync.set({ keybindings: {} })
    info.innerHTML = "Keybindings restored to default"
})

applyChanges.addEventListener("click", () => {
    let newKeybindings = [
        {
            key: document.getElementById('short-primary').value,
            id: "short-primary",
        },
        {
            key: document.getElementById('short-background').value,
            id: "short-background",
        },
        {
            key: document.getElementById('short-size').value,
            id: "short-size",
        },
        {
            key: document.getElementById('short-layout').value,
            id: "short-layout",
        },
        {
            key: document.getElementById('short-typo').value,
            id: "short-typo",
        },
        {
            key: document.getElementById('short-borders').value,
            id: "short-borders",
        },
        {
            key: document.getElementById('short-effects').value,
            id: "short-effects",
        },
        {
            key: document.getElementById('short-customcss').value,
            id: "short-customcss",
        },
        {
            key: document.getElementById('short-customjs').value,
            id: "short-customjs",
        },
        {
            key: document.getElementById('short-domexpand').value,
            id: "short-domexpand",
        },
        {
            key: document.getElementById('short-domcollapse').value,
            id: "short-domcollapse",
        },
        {
            key: document.getElementById('short-styles').value,
            id: "short-styles",
        },
        {
            key: document.getElementById('short-cssStyles').value,
            id: "short-cssStyles",
        },
    ]
    console.log("new shortcuts", newKeybindings)
    chrome.storage.sync.set({ keybindings: newKeybindings }, function () {
        document.getElementById('info').innerText = "SAVED !"
    })
})


function changeState(newState) {
    chrome.storage.sync.set({ state: newState })
    sendNewStateToBackground(newState)
    applyStateToUI(newState)
}

async function sendNewStateToBackground(newState) {
    if (newState.isActive) {
        // Will launch the listeners
        let [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
        chrome.runtime.sendMessage({ action: "startListeners", aimedTab: tab.id })
    } else {
        // stop the listeners
        chrome.runtime.sendMessage({ action: "stopListeners" })
    }
}

function applyStateToUI(state) {
    if (state.isActive) {
        document.getElementById("info").innerHTML = "active !"
        document.getElementById("activateBtn").innerText = "Desactivate"
    } else {
        document.getElementById("info").innerHTML = "inactive !"
        document.getElementById("activateBtn").innerText = "Activate"
    }
}

async function getCurrentState() {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(['state'], function (result) {
            return resolve(result.state)
        })
    })
}
async function getCurrentKeybindings() {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(['keybindings'], function (result) {
            return resolve(result.keybindings)
        })
    })
}

function populateShortcutsWithStorage(keybindings) {
    console.log('populate...', keybindings)
    for (let i = 0; i < keybindings.length; i++) {
        let keyBinding = keybindings[i]
        for (let j = 0; j < keyoptions.length; j++) {
            if (keyBinding.id === keyoptions[j]) {
                document.getElementById(keyBinding.id).value = keyBinding.key
                break
            }
        }

    }

}