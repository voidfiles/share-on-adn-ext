console.log('background.js');


config.background = true;


/**
 * Create an app with the config and accounts
 */
app = new App({
    model: config,
    collection: accounts
});
app.ready();
promptAuth();


/**
 * context menu
 */
chrome.contextMenus.create({
    title: 'Save to ADN',
    contexts: ['link', 'image', 'audio', 'video'],
    onclick: window.contextmenu.onSaveClick
});

chrome.contextMenus.create({
    title: 'Save & Share on ADN',
    contexts: ['link', 'image', 'audio', 'video'],
    onclick: window.contextmenu.onSaveAndShareClick
});


chrome.contextMenus.create({
    title: 'Share on ADN',
    contexts: ['page'],
    onclick: window.contextmenu.onShareClick
});

/**
 * If there are no accounts, prompt for auth
 */
accounts.on('ready', function() {
    promptAuth();
});

function promptAuth() {
    if (accounts.length === 0) {
        var n = new TextNotificationView({
            url: accounts.buildAuthUrl(),
            title: 'Connect your App.net account',
            body: 'Click to connect your App.net account and get started with the awesomeness of Succynct.',
            image: chrome.extension.getURL('/img/angle.png')
        });
        n.render();
    }
}

