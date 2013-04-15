console.log('views/contextmenu.js');

/**
 * Handle interactions with the Chrome omnibox
 */
window.ContextMenu = Backbone.View.extend({


    initialize: function() {
        _.bindAll(this);
    },
    // events: { },
    createShareWindow: function (info, tab, width, height) {
        var deferred = $.Deferred();
        var pop_up_width = width || 600;
        var pop_up_height = height || 246;
        chrome.windows.get(tab.windowId, {}, function (current_window) {
            var width = current_window.width;
            var height = current_window.height;
            var top = current_window.top;
            var left = current_window.left;

            var pop_up_left = (width + left) - (pop_up_width + 100);
            var pop_up_top = top + 100;
            var url = chrome.extension.getURL('/share_on_adn.html');

            new_window = chrome.windows.create({
                url: url,
                type: 'popup',
                focused: true,
                width: pop_up_width,
                height: pop_up_height,
                left: pop_up_left,
                top: pop_up_top
            }, deferred.resolve);
        });

        return deferred.promise();
    },

    annotationFromInfo: function (info) {
        var annotations = {
            pageUrl: info.pageUrl
        };

        if (info.srcUrl) {
            annotations.srcUrl = info.srcUrl;
        }

        if (info.linkUrl) {
            annotations.linkUrl = info.linkUrl;
        }

        return annotations;
    },


    /**
    * Gets called when the user selects menu item from the context menu
    */
    onSaveClick: function(info, tab) {
        if (!info.srcUrl) {
            messageUser({
                title: 'Nothing to save',
                body: 'Try right-clicking on an image.'
            });
            return;
        }

        var annotations = this.annotationFromInfo(info);

        messageUser({
            title: 'Saving File',
            body: 'saveing ' + info.srcUrl + ' to App.net file storage'
        });
        var _this = this;
        window.adn_files.createFileFromURL(info.srcUrl, annotations).done(function (file) {
            var derived_files = file.get('derived_files');
            var message = {
                title: "Success",
                body: "Saved file to App.net file storage"
            };

            if (derived_files) {
                message.image = derived_files.image_thumb_200s.url;
                message.url = derived_files.image_thumb_200s.url;
            }

            messageUser(message);
        });

    },
    onShareClick: function (info, tab) {
        var message = {
            title: tab.title,
            link: info.pageUrl
        };
        this.createShareWindow(info, tab).done(function (nw) {
            var tab = nw.tabs[0];
            chrome.tabs.sendMessage(tab.id, message);
        });
    },
    onSaveAndShareClick: function (info, tab) {
        if (!info.srcUrl) {
            messageUser({
                title: 'Nothing to save',
                body: 'Try right-clicking on an image.'
            });
            return;
        }

        var message = {
            title: tab.title,
            link: info.pageUrl,
            has_file: true
        };

        var share_window = this.createShareWindow(info, tab);

        share_window.done(function (nw) {
            var tab = nw.tabs[0];
            chrome.tabs.sendMessage(tab.id, {type: 'meta', message: message});
        });

        var annotations = this.annotationFromInfo(info);

        messageUser({
            title: 'Uploading File',
            body: 'Saveing ' + info.srcUrl + ' to App.net file storage'
        });

        window.adn_files.createFileFromURL(info.srcUrl, annotations).done(function (file) {
            var derived_files = file.get('derived_files');
            var message = {
                title: "Success",
                body: "Saved file to App.net file storage"
            };

            if (derived_files) {
                message.image = derived_files.image_thumb_200s.url;
                message.url = derived_files.image_thumb_200s.url;
            }

            messageUser(message);
            share_window.done(function (nw) {
                var tab = nw.tabs[0];
                chrome.tabs.sendMessage(tab.id, {type: 'file', message: file});
            });
        });

    }
});


contextmenu = new ContextMenu();
