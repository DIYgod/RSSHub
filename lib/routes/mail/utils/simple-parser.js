'use strict';

const MailParser = require('./mail-parser.js');

module.exports = (input, options, callback) => {
    if (!callback && typeof options === 'function') {
        callback = options;
        options = false;
    }

    let promise;
    if (!callback) {
        promise = new Promise((resolve, reject) => {
            callback = callbackPromise(resolve, reject);
        });
    }

    options = options || {};
    const keepCidLinks = !!options.keepCidLinks;

    const mail = {
        attachments: [],
    };

    const parser = new MailParser(options);

    parser.on('error', (err) => {
        callback(err);
    });

    parser.on('headers', (headers) => {
        mail.headers = headers;
        mail.headerLines = parser.headerLines;
    });

    let reading = false;
    const reader = () => {
        reading = true;

        const data = parser.read();
        if (data === null) {
            reading = false;
            return;
        }

        if (data.type === 'text') {
            Object.keys(data).forEach((key) => {
                if (['text', 'html', 'textAsHtml'].includes(key)) {
                    mail[key] = data[key];
                }
            });
        }

        if (data.type === 'attachment') {
            mail.attachments.push(data);

            const chunks = [];
            let chunklen = 0;
            data.content.on('readable', () => {
                let chunk;
                while ((chunk = data.content.read()) !== null) {
                    chunks.push(chunk);
                    chunklen += chunk.length;
                }
            });

            data.content.on('end', () => {
                data.content = Buffer.concat(chunks, chunklen);
                data.release();
                reader();
            });
        } else {
            reader();
        }
    };

    parser.on('readable', () => {
        if (!reading) {
            reader();
        }
    });

    parser.on('end', () => {
        ['subject', 'references', 'date', 'to', 'from', 'to', 'cc', 'bcc', 'message-id', 'in-reply-to', 'reply-to'].forEach((key) => {
            if (mail.headers.has(key)) {
                mail[key.replace(/-([a-z])/g, (m, c) => c.toUpperCase())] = mail.headers.get(key);
            }
        });

        if (keepCidLinks) {
            return callback(null, mail);
        }
        parser.updateImageLinks(
            (attachment, done) => done(false, 'data:' + attachment.contentType + ';base64,' + attachment.content.toString('base64')),
            (err, html) => {
                if (err) {
                    return callback(err);
                }
                mail.html = html;

                callback(null, mail);
            }
        );
    });

    if (typeof input === 'string') {
        parser.end(Buffer.from(new Uint8Array(input.split('').map((char) => char.charCodeAt(0)))));
    } else if (Buffer.isBuffer(input)) {
        parser.end(input);
    } else {
        input
            .once('error', (err) => {
                input.destroy();
                parser.destroy();
                callback(err);
            })
            .pipe(parser);
    }

    return promise;
};

function callbackPromise(resolve, reject) {
    return function(...args) {
        const err = args.shift();
        if (err) {
            reject(err);
        } else {
            resolve(...args);
        }
    };
}
