console.log('views/sharepopup.js');

function getQueryVariable (variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == variable) {
            return decodeURIComponent(pair[1]);
        }
    }
    console.log('Query variable %s not found', variable);
}

var parse = function(markdown) {
    // Markdown bracket regex based on http://stackoverflow.com/a/9268827
    var markdownLinkRegex = /\[([^\]]+)\]\((\S+(?=\)))\)/;

    var links = [];
    var text = markdown;

    function handleReplacement(_, anchor, url, pos) {
        links.push({
            pos: pos,
            len: anchor.length,
            url: url
        });

        return anchor;
    }

    var oldText;

    // Has to be called repeatedly, since if done globally, it will provide the original index (before earlier replacements)
    do {
        oldText = text;
        text = oldText.replace(markdownLinkRegex, handleReplacement);
    } while(text !== oldText);

    return {
        text: text,
        entities: {
            links: links
        }
    };
};

/**
* Handle the UI for options.html
*/
var SharePopupView = Backbone.View.extend({
    events: {
        "submit form": "post",
        "keyup textarea": "charCount"
    },

    initialize: function() {
        console.log('views/sharepopup.js:initialize');
        _.bindAll(this);

        this.textarea = $('textarea');
        this.char_counter = $('.js-char-count');
    },

    onMessage: function (request, sender, sendResponse) {
        console.log(request, sender);
        if (request.type === 'meta') {
            var title = request.message.title;
            var link = request.message.link;
            var initial_text = '[' + title + '](' + link + ')';
            this.textarea.text(initial_text);
            this.charCount();
            if (request.message.has_file) {
                this.has_file = true;
                $('input[type=button]').attr('disabled', 'disabled');
                $('.js-file-upload').text('Uploading file to App.net...');
            }
        }

        if (request.type === 'file') {
            this.file = request.message;
            $('input[type=button]').removeAttr('disabled');
            $('.js-file-upload').text('File Uploaded. Free to post.');
            console.log(this.file);
        }
        sendResponse();

    },


    charCount: function () {
        var val = this.textarea.val();
        var left = 256 - val.length;
        this.char_counter.text(left);
    },


    /**
    * Start rendering both options and accounts
    */
    post: function() {
        var text = $('textarea').val();
        var post = new Post();
        var post_ob = parse(text);

        if (this.file) {
            console.log(this.file);
            post_ob.annotations = [
                {
                    "type": "net.app.core.oembed",
                    "value": {
                        "+net.app.core.file": {
                            "file_id": this.file.id,
                            "file_token": this.file.file_token,
                            "format": "oembed"
                        }
                    }
                }
            ];
        }
        post.save(post_ob, {
            headers: {
                'Authorization': 'Bearer ' + accounts.at(0).get('access_token')
            },
            success: function (model, textStatus, jqXHR) {
                post.success(model, textStatus, jqXHR);
                window.close();
            },
            error: post.error
        });
        console.log("Should be creating a post");
        return false;
    }

});
