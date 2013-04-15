console.log('views/files.js');


/**
 * A single account the user has authorized
 */
window.ADNFile = Backbone.Model.extend({

    initialize: function() {
        _.bindAll(this);
    }

});

/**
 * Collection of all accounts the user has authorized
 */
window.ADNFiles = Backbone.Collection.extend({

    model: ADNFile,
    getBlobForURL: function (url) {
        var deferred = $.Deferred();

        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);

        // Response type arraybuffer - XMLHttpRequest 2
        xhr.responseType = 'blob';
        xhr.onload = function(e) {
            if (xhr.status == 200) {
                deferred.resolve(xhr.response, xhr, e);
            } else {
                deferred.reject(null, xhr, e);
            }
        };
        xhr.send();

        return deferred.promise();
    },

    uploadFile: function (file, filename, annotations) {
        var deferred = $.Deferred();
        annotations = $.extend({}, (annotations || {}), {type: 'share-on-adn.io.github.voidfiles'});
        var metadata = new Blob([JSON.stringify(annotations)], {type: 'application/json'});

        var xhr = new XMLHttpRequest();
        var fd = new FormData();
        fd.append('content', file, filename);
        fd.append('metadata', metadata, 'metadata.json');
        fd.append('include_annotations', '1');

        xhr.open('POST', 'https://alpha-api.app.net/stream/0/files', true);
        xhr.onload = function(e) {
            if (xhr.status == 200) {
                deferred.resolve(JSON.parse(xhr.response), xhr, e);
            } else {
                deferred.reject(JSON.parse(xhr.response), xhr, e);
            }
        };
        xhr.setRequestHeader('Authorization', 'Bearer ' + window.accounts.at(0).get('access_token'));
        // Transmit the form to the server
        xhr.send(fd);

        return deferred.promise();
    },

    createFileFromURL: function (url, annotations) {
        var deferred = $.Deferred();
        var _this = this;

        this.getBlobForURL(url).done(function (blob, xhr, e) {
            var extension;
            try {
                extension = blob.type.split('/')[1];
            } catch (b) {
                extension = '';
            }
            _this.uploadFile(blob, 'file.' + extension, annotations).done(function (resp) {
                var file = resp.data;
                file.blob = blob;
                file = new ADNFile(file, {collection: _this});
                deferred.resolve(file);
            });
        });

        return deferred.promise();
    },
    initialize: function() {
        _.bindAll(this);
    }
});

window.adn_files = new ADNFiles();

