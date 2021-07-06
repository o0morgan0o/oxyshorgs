let mListener
let mListenerIframe
let tabId
const initialState = { isActive: false }
chrome.storage.sync.set({ state: initialState })

const defaultKeybindings = [
    {
        key: "p",
        id: "short-primary",
    },
    {
        key: "b",
        id: "short-background",
    },
    {
        key: "s",
        id: "short-size",
    },
    {
        key: "l",
        id: "short-layout",
    },
    {
        key: "t",
        id: "short-typo",
    },
    {
        key: "o",
        id: "short-borders",
    },
    {
        key: "e",
        id: "short-effects",
    },
    {
        key: "c",
        id: "short-customcss",
    },
    {
        key: "j",
        id: "short-customjs",
    },
    {
        key: "r",
        id: "short-domexpand",
    },
    {
        key: "R",
        id: "short-domcollapse",
    },
    {
        key: "g",
        id: "short-styles",
    },
    {
        key: "y",
        id: "short-cssStyles",
    },

]

loadDefaultKeybindingsIfNoLocalStorage()

setDefaultKeybindings()

chrome.runtime.onMessage.addListener(function (message) {
    switch (message.action) {
        case "startListeners":
            tabId = message.aimedTab
            console.log("recevied tab id", message, tabId)
            chrome.scripting.executeScript({
                target: { tabId: tabId },
                function: launchPageGlobalScript
            })
            return true

        case "stopListeners":
            chrome.scripting.executeScript({
                target: { tabId: tabId },
                function: reloadPage
            })
            return true
        case "getDefault":
            setDefaultKeybindings()
            return true
        default:
            console.log('unknown action ...')
            return true
    }

})

function loadDefaultKeybindingsIfNoLocalStorage() {
    chrome.storage.sync.get(['keybindings'], function (result) {
        if (Object.keys(result).length === 0) {
            // it means no keybindings is saved so we initialize with default keybindings
            setDefaultKeybindings()
        }
    })
}


function setDefaultKeybindings() {
    chrome.storage.sync.set({ keybindings: defaultKeybindings }, function () {
        console.log('default keybindings set')
        chrome.runtime.sendMessage({ action: "getDefaultKeybindings", payload: defaultKeybindings })
    })

}

function reloadPage() {
    // reload in order to remove all listeners
    // TODO try to find a way to remove event listeners without reloading the page
    document.location.reload()
}

async function launchPageGlobalScript() {

    let mState = await getCurrentState()
    let keyBindings = await getCurrentKeybindings()

    console.log('adding event listener...', mState, keyBindings)
    mListener = document.addEventListener('keydown', keyDetector)
    mListenerIframe = document.getElementById('ct-artificial-viewport').contentWindow.document.addEventListener('keydown', keyDetector)

    function keyDetector(key) {
        console.log('key detection ...', key.key)

        let notFocused = document.querySelectorAll("div :focus").length === 0
        if (notFocused) {
            console.log('not focused')
        }
        else {
            console.log('focused')
            return
        }
        let notFocusedIframe = document.getElementById('ct-artificial-viewport').contentWindow.document.querySelectorAll("div :focus").length === 0
        if (notFocusedIframe) {
            console.log('not focused iframe')
        } else {
            console.log('focused iframe')
            return
        }


        switch (key.key) {
            case keyBindings[0].key:
                document.getElementsByClassName("oxygen-sidebar-tabs-tab")[0].click()
                break;
            case keyBindings[1].key:
                console.log('trying to go Background')
                document.getElementsByClassName("oxygen-sidebar-tabs-tab")[1].click()
                document.querySelector(`[ng-click="switchTab('advanced', 'background')"]`).click()
                break;
            case keyBindings[2].key:
                document.getElementsByClassName("oxygen-sidebar-tabs-tab")[1].click()
                document.querySelector(`[ng-click="switchTab('advanced', 'position')"]`).click()
                break;
            case keyBindings[3].key:
                document.getElementsByClassName("oxygen-sidebar-tabs-tab")[1].click()
                document.querySelector(`[ng-click="switchTab('advanced', 'layout')"]`).click()
                break;
            case keyBindings[4].key:
                document.getElementsByClassName("oxygen-sidebar-tabs-tab")[1].click()
                document.querySelector(`[ng-click="switchTab('advanced', 'typography')"]`).click()
                break;
            case keyBindings[5].key:
                document.getElementsByClassName("oxygen-sidebar-tabs-tab")[1].click()
                document.querySelector(`[ng-click="switchTab('advanced', 'borders')"]`).click()
                break;
            case keyBindings[6].key:
                document.getElementsByClassName("oxygen-sidebar-tabs-tab")[1].click()
                document.querySelector(`[ng-click="switchTab('advanced', 'effects')"]`).click()
                break;
            case keyBindings[7].key:
                document.getElementsByClassName("oxygen-sidebar-tabs-tab")[1].click()
                document.querySelector(`[ng-click="switchTab('advanced', 'custom-css')"]`).click()
                break;
            case keyBindings[8].key:
                document.getElementsByClassName("oxygen-sidebar-tabs-tab")[1].click()
                document.querySelector(`[ng-click="switchTab('advanced', 'custom-js')"]`).click()
                break;
            case keyBindings[9].key:
                document.querySelector(`[ng-click="switchTab('sidePanel','DOMTree')"]`).click()
                document.querySelector(`[ng-click="iframeScope.expandAllNodes()"]`).click()
                break;
            case keyBindings[10].key:
                document.querySelector(`[ng-click="switchTab('sidePanel','DOMTree')"]`).click()
                document.querySelector(`[ng-click="iframeScope.collapseAllNodes()"]`).click()
                break;

            case keyBindings[11].key:
                document.querySelector(`[ng-click="toggleSettingsPanel()"]`).click()
                document.querySelector(`[ng-click="switchTab('settings','default-styles');"]`).click()
                break;
            case keyBindings[12].key:
                document.querySelector(`[ng-click="switchTab('sidePanel','styleSheets');"]`).click()
                break;
            default:
                console.log('no shortcut')
                break
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
}
