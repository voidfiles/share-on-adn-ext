console.log('views/notifications.js');


/**
* Display a simple text desktop notification
*/
window.TextNotificationView = Backbone.View.extend({


    initialize: function(options) {
        _.bindAll(this);
    },

    render: function() {
        console.log('notification.render');
        title = this.options.title || '';
        body = this.options.body || '';
        this.notification = webkitNotifications.createNotification(
          this.image,
          title,
          body
        );

        if (!this.notification) {
            return false;
        }
        console.log('notificaiton shown');
        if (this.url) {
            this.notification.url = this.url;
        }
        // this.notification.type = this.options.type;
        this.setTimeout();
        this.notification.onclick = this.onClick;
        this.notification.show();
        // _gaq.push(['_trackEvent', 'Notifications', 'Show', this.options.type]);
        return this;
    },

    onClick: function() {
        if (this.url) {
            chrome.tabs.create({ url: this.url });
        }
        this.notification.close();
        // _gaq.push(['_trackEvent', 'Notifications', 'Click', this.type]);
    },

    setTimeout: function() {
        var that = this;
        if (!config.get('autoDismiss') || !that.notification) {
            return that;
        }
        setTimeout(function(){
            that.notification.close();
            // _gaq.push(['_trackEvent', 'Notifications', 'Timeout', this.type]);
        }, config.get('autoDismissDelay') * 1000);
    }

});

var default_message = {
    image: chrome.extension.getURL('/img/fleur-de-lis.png'),
    timeout: 2 * 1000,
    type: 'ShareOnAdnNotification'
};

window.messageUser = function (conf) {
    return new TextNotificationView($.extend({}, default_message, conf)).render();
};
