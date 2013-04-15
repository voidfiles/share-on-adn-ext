console.log('sharepopup.js');

/**
 * Create an optionsview and bind it to the dom with the config and accounts
 */
shareonadnview = new SharePopupView({
  el: '#share_on_adn'
});

chrome.runtime.onMessage.addListener(shareonadnview.onMessage);