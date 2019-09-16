'use strict';

const mailsplit = require('mailsplit');
const libmime = require('libmime');
const addressparser = require('nodemailer/lib/addressparser');
const Transform = require('stream').Transform;
const Splitter = mailsplit.Splitter;
const punycode = require('punycode');
const FlowedDecoder = require('mailsplit/lib/flowed-decoder');
const StreamHash = require('./stream-hash');
const iconv = require('iconv-lite');
const htmlToText = require('html-to-text');
const he = require('he');
const linkify = require('linkify-it')();
const tlds = require('tlds');

linkify
    .tlds(tlds) // Reload with full tlds list
    .tlds('onion', true) // Add unofficial `.onion` domain
    .add('git:', 'http:') // Add `git:` ptotocol as "alias"
    .add('ftp:', null) // Disable `ftp:` ptotocol
    .set({ fuzzyIP: true, fuzzyLink: true, fuzzyEmail: true });

// twitter linkifier from
// https://github.com/markdown-it/linkify-it#example-2-add-twitter-mentions-handler
linkify.add('@', {
    validate(text, pos, self) {
        const tail = text.slice(pos);

        if (!self.re.twitter) {
            self.re.twitter = new RegExp('^([a-zA-Z0-9_]){1,15}(?!_)(?=$|' + self.re.src_ZPCc + ')');
        }
        if (self.re.twitter.test(tail)) {
            // Linkifier allows punctuation chars before prefix,
            // but we additionally disable `@` ("@@mention" is invalid)
            if (pos >= 2 && tail[pos - 2] === '@') {
                return false;
            }
            return tail.match(self.re.twitter)[0].length;
        }
        return 0;
    },
    normalize(match) {
        match.url = 'https://twitter.com/' + match.url.replace(/^@/, '');
    },
});

class IconvDecoder extends Transform {
    constructor(Iconv, charset) {
        super();

        // Iconv throws error on ks_c_5601-1987 when it is mapped to EUC-KR
        // https://github.com/bnoordhuis/node-iconv/issues/169
        if (charset === 'ks_c_5601-1987') {
            charset = 'CP949';
        }
        this.stream = new Iconv(charset, 'UTF-8//TRANSLIT//IGNORE');

        this.inputEnded = false;
        this.endCb = false;

        this.stream.on('error', (err) => this.emit('error', err));
        this.stream.on('data', (chunk) => this.push(chunk));
        this.stream.on('end', () => {
            this.inputEnded = true;
            if (typeof this.endCb === 'function') {
                this.endCb();
            }
        });
    }

    _transform(chunk, encoding, done) {
        this.stream.write(chunk);
        done();
    }

    _flush(done) {
        this.endCb = done;
        this.stream.end();
    }
}

class MailParser extends Transform {
    constructor(config) {
        super({
            readableObjectMode: true,
            writableObjectMode: false,
        });

        this.options = config || {};
        this.splitter = new Splitter(config);
        this.finished = false;
        this.waitingEnd = false;

        this.headers = false;
        this.headerLines = false;

        this.endReceived = false;
        this.reading = false;
        this.errored = false;

        this.tree = false;
        this.curnode = false;
        this.waitUntilAttachmentEnd = false;
        this.attachmentCallback = false;

        this.hasHtml = false;
        this.hasText = false;

        this.text = false;
        this.html = false;
        this.textAsHtml = false;

        this.attachmentList = [];

        this.boundaries = [];

        this.decoder = this.getDecoder();

        this.splitter.on('readable', () => {
            if (this.reading) {
                return false;
            }
            this.readData();
        });

        this.splitter.on('end', () => {
            this.endReceived = true;
            if (!this.reading) {
                this.endStream();
            }
        });

        this.splitter.on('error', (err) => {
            this.errored = true;
            if (typeof this.waitingEnd === 'function') {
                return this.waitingEnd(err);
            }
            this.emit('error', err);
        });

        this.libmime = new libmime.Libmime({ Iconv: this.options.Iconv });
    }

    getDecoder() {
        if (this.options.Iconv) {
            const Iconv = this.options.Iconv;
            // create wrapper
            return {
                decodeStream(charset) {
                    return new IconvDecoder(Iconv, charset);
                },
            };
        } else {
            return iconv;
        }
    }

    readData() {
        if (this.errored) {
            return false;
        }
        this.reading = true;
        const data = this.splitter.read();
        if (data === null) {
            this.reading = false;
            if (this.endReceived) {
                this.endStream();
            }
            return;
        }

        this.processChunk(data, (err) => {
            if (err) {
                if (typeof this.waitingEnd === 'function') {
                    return this.waitingEnd(err);
                }
                return this.emit('error', err);
            }
            setImmediate(() => this.readData());
        });
    }

    endStream() {
        this.finished = true;
        if (typeof this.waitingEnd === 'function') {
            this.waitingEnd();
        }
    }

    _transform(chunk, encoding, done) {
        if (!chunk || !chunk.length) {
            return done();
        }

        if (this.splitter.write(chunk) === false) {
            return this.splitter.once('drain', () => {
                done();
            });
        } else {
            return done();
        }
    }

    _flush(done) {
        setImmediate(() => this.splitter.end());
        if (this.finished) {
            return this.cleanup(done);
        }
        this.waitingEnd = () => {
            this.cleanup(done);
        };
    }

    cleanup(done) {
        const finish = () => {
            const t = this.getTextContent();
            this.push(t);
            done();
        };
        if (this.curnode && this.curnode.decoder && this.curnode.decoder.readable && !this.decoderEnded) {
            (this.curnode.contentStream || this.curnode.decoder).once('end', () => {
                finish();
            });
            this.curnode.decoder.end();
        } else {
            setImmediate(() => {
                finish();
            });
        }
    }

    processHeaders(lines) {
        const headers = new Map();
        (lines || []).forEach((line) => {
            let key = line.key;
            let value = ((this.libmime.decodeHeader(line.line) || {}).value || '').toString().trim();
            value = Buffer.from(value, 'binary').toString();
            switch (key) {
                case 'content-type':
                case 'content-disposition':
                case 'dkim-signature':
                    value = this.libmime.parseHeaderValue(value);
                    Object.keys((value && value.params) || {}).forEach((key) => {
                        try {
                            value.params[key] = this.libmime.decodeWords(value.params[key]);
                        } catch (E) {
                            // ignore, keep as is
                        }
                    });
                    break;
                case 'date':
                    value = new Date(value);
                    if (!value || value.toString() === 'Invalid Date' || !value.getTime()) {
                        // date parsing failed :S
                        value = new Date();
                    }
                    break;
                case 'subject':
                    try {
                        value = this.libmime.decodeWords(value);
                    } catch (E) {
                        // ignore, keep as is
                    }
                    break;
                case 'references':
                    value = value.split(/\s+/).map(this.ensureMessageIDFormat);
                    break;
                case 'message-id':
                    value = this.ensureMessageIDFormat(value);
                    break;
                case 'in-reply-to':
                    value = this.ensureMessageIDFormat(value);
                    break;
                case 'priority':
                case 'x-priority':
                case 'x-msmail-priority':
                case 'importance':
                    key = 'priority';
                    value = this.parsePriority(value);
                    break;
                case 'from':
                case 'to':
                case 'cc':
                case 'bcc':
                case 'sender':
                case 'reply-to':
                case 'delivered-to':
                case 'return-path':
                    value = addressparser(this.libmime.decodeWords(value));
                    this.decodeAddresses(value);
                    value = {
                        value,
                        html: this.getAddressesHTML(value),
                        text: this.getAddressesText(value),
                    };
                    break;
            }

            // handle list-* keys
            if (key.substr(0, 5) === 'list-') {
                value = this.parseListHeader(key.substr(5), value);
                key = 'list';
            }

            if (value) {
                if (!headers.has(key)) {
                    headers.set(key, [].concat(value || []));
                } else if (Array.isArray(value)) {
                    headers.set(key, headers.get(key).concat(value));
                } else {
                    headers.get(key).push(value);
                }
            }
        });

        // keep only the first value
        const singleKeys = [
            'message-id',
            'content-id',
            'from',
            'sender',
            'in-reply-to',
            'reply-to',
            'subject',
            'date',
            'content-disposition',
            'content-type',
            'content-transfer-encoding',
            'priority',
            'mime-version',
            'content-description',
            'precedence',
            'errors-to',
        ];

        headers.forEach((value, key) => {
            if (Array.isArray(value)) {
                if (singleKeys.includes(key) && value.length) {
                    headers.set(key, value[value.length - 1]);
                } else if (value.length === 1) {
                    headers.set(key, value[0]);
                }
            }

            if (key === 'list') {
                // normalize List-* headers
                const listValue = {};
                [].concat(value || []).forEach((val) => {
                    Object.keys(val || {}).forEach((listKey) => {
                        listValue[listKey] = val[listKey];
                    });
                });
                headers.set(key, listValue);
            }
        });

        return headers;
    }

    parseListHeader(key, value) {
        const addresses = addressparser(value);
        const response = {};
        const data = addresses
            .map((address) => {
                if (/^https?:/i.test(address.name)) {
                    response.url = address.name;
                } else if (address.name) {
                    response.name = address.name;
                }
                if (/^mailto:/.test(address.address)) {
                    response.mail = address.address.substr(7);
                } else if (address.address && address.address.indexOf('@') < 0) {
                    response.id = address.address;
                } else if (address.address) {
                    response.mail = address.address;
                }
                if (Object.keys(response).length) {
                    return response;
                }
                return false;
            })
            .filter((address) => address);
        if (data.length) {
            return {
                [key]: response,
            };
        }
        return false;
    }

    parsePriority(value) {
        value = value.toLowerCase().trim();
        if (!isNaN(parseInt(value, 10))) {
            // support "X-Priority: 1 (Highest)"
            value = parseInt(value, 10) || 0;
            if (value === 3) {
                return 'normal';
            } else if (value > 3) {
                return 'low';
            } else {
                return 'high';
            }
        } else {
            switch (value) {
                case 'non-urgent':
                case 'low':
                    return 'low';
                case 'urgent':
                case 'high':
                    return 'high';
            }
        }
        return 'normal';
    }

    ensureMessageIDFormat(value) {
        if (!value.length) {
            return false;
        }

        if (value.charAt(0) !== '<') {
            value = '<' + value;
        }

        if (value.charAt(value.length - 1) !== '>') {
            value += '>';
        }

        return value;
    }

    decodeAddresses(addresses) {
        addresses.forEach((address) => {
            address.name = (address.name || '').toString();
            if (address.name) {
                try {
                    address.name = this.libmime.decodeWords(address.name);
                } catch (E) {
                    // ignore, keep as is
                }
            }
            if (/@xn--/.test(address.address)) {
                address.address = address.address.substr(0, address.address.lastIndexOf('@') + 1) + punycode.toUnicode(address.address.substr(address.address.lastIndexOf('@') + 1));
            }
            if (address.group) {
                this.decodeAddresses(address.group);
            }
        });
    }

    createNode(node) {
        let contentType = node.contentType;
        let disposition = node.disposition;
        const encoding = node.encoding;
        const charset = node.charset;

        if (!contentType && node.root) {
            contentType = 'text/plain';
        }

        const newNode = {
            node,
            headerLines: node.headers.lines,
            headers: this.processHeaders(node.headers.getList()),
            contentType,
            children: [],
        };

        if (!/^multipart\//i.test(contentType)) {
            if (disposition && !['attachment', 'inline'].includes(disposition)) {
                disposition = 'attachment';
            }

            if (!disposition && !['text/plain', 'text/html'].includes(contentType)) {
                newNode.disposition = 'attachment';
            } else {
                newNode.disposition = disposition || 'inline';
            }

            newNode.isAttachment = !['text/plain', 'text/html'].includes(contentType) || newNode.disposition !== 'inline';

            newNode.encoding = ['quoted-printable', 'base64'].includes(encoding) ? encoding : 'binary';

            if (charset) {
                newNode.charset = charset;
            }

            let decoder = node.getDecoder();
            if (
                (/^text\//.test(contentType) && node.flowed) ||
                (node.root && encoding === 'base64' && node.flowed) // Handle emails with base64 encoded root node
            ) {
                const flowDecoder = decoder;
                decoder = new FlowedDecoder({
                    delSp: node.delSp,
                    encoding: newNode.encoding,
                    Iconv: this.options.Iconv,
                });
                flowDecoder.on('error', (err) => {
                    decoder.emit('error', err);
                });
                flowDecoder.pipe(decoder);
            }
            decoder.on('end', () => (this.decoderEnded = true));
            newNode.decoder = decoder;
        }

        if (node.root) {
            this.headers = newNode.headers;
            this.headerLines = newNode.headerLines;
        }

        // find location in tree

        if (!this.tree) {
            newNode.root = true;
            this.curnode = this.tree = newNode;
            return newNode;
        }

        // immediate child of root node
        if (!this.curnode.parent) {
            newNode.parent = this.curnode;
            this.curnode.children.push(newNode);
            this.curnode = newNode;
            return newNode;
        }

        // siblings
        if (this.curnode.parent.node === node.parentNode) {
            newNode.parent = this.curnode.parent;
            this.curnode.parent.children.push(newNode);
            this.curnode = newNode;
            return newNode;
        }

        // first child
        if (this.curnode.node === node.parentNode) {
            newNode.parent = this.curnode;
            this.curnode.children.push(newNode);
            this.curnode = newNode;
            return newNode;
        }

        // move up
        let parentNode = this.curnode;
        while ((parentNode = parentNode.parent)) {
            if (parentNode.node === node.parentNode) {
                newNode.parent = parentNode;
                parentNode.children.push(newNode);
                this.curnode = newNode;
                return newNode;
            }
        }

        // should never happen, can't detect parent
        this.curnode = newNode;
        return newNode;
    }

    getTextContent() {
        const text = [];
        const html = [];
        const processNode = (alternative, level, node) => {
            if (node.showMeta) {
                const meta = ['From', 'Subject', 'Date', 'To', 'Cc', 'Bcc']
                    .map((fkey) => {
                        const key = fkey.toLowerCase();
                        if (!node.headers.has(key)) {
                            return false;
                        }
                        const value = node.headers.get(key);
                        if (!value) {
                            return false;
                        }
                        return {
                            key: fkey,
                            value: Array.isArray(value) ? value[value.length - 1] : value,
                        };
                    })
                    .filter((entry) => entry);
                if (this.hasHtml) {
                    html.push(
                        '<table class="mp_head">' +
                            meta
                                .map((entry) => {
                                    let value = entry.value;
                                    switch (entry.key) {
                                        case 'From':
                                        case 'To':
                                        case 'Cc':
                                        case 'Bcc':
                                            value = value.html;
                                            break;
                                        case 'Date':
                                            value = this.options.formatDateString ? this.options.formatDateString(value) : value.toUTCString();
                                            break;
                                        case 'Subject':
                                            value = '<strong>' + he.encode(value) + '</strong>';
                                            break;
                                        default:
                                            value = he.encode(value);
                                    }

                                    return '<tr><td class="mp_head_key">' + he.encode(entry.key) + ':</td><td class="mp_head_value">' + value + '<td></tr>';
                                })
                                .join('\n') +
                            '<table>'
                    );
                }
                if (this.hasText) {
                    text.push(
                        '\n' +
                            meta
                                .map((entry) => {
                                    let value = entry.value;
                                    switch (entry.key) {
                                        case 'From':
                                        case 'To':
                                        case 'Cc':
                                        case 'Bcc':
                                            value = value.text;
                                            break;
                                        case 'Date':
                                            value = this.options.formatDateString ? this.options.formatDateString(value) : value.toUTCString();
                                            break;
                                    }
                                    return entry.key + ': ' + value;
                                })
                                .join('\n') +
                            '\n'
                    );
                }
            }
            if (node.textContent) {
                if (node.contentType === 'text/plain') {
                    text.push(node.textContent);
                    if (!alternative && this.hasHtml) {
                        html.push(this.textToHtml(node.textContent));
                    }
                } else if (node.contentType === 'text/html') {
                    let failedToParseHtml = false;
                    if ((!alternative && this.hasText) || (node.root && !this.hasText)) {
                        if (this.options.skipHtmlToText) {
                            text.push('');
                        } else if (node.textContent.length > this.options.maxHtmlLengthToParse) {
                            this.emit('error', new Error(`HTML too long for parsing ${node.textContent.length} bytes`));
                            text.push('Invalid HTML content (too long)');
                            failedToParseHtml = true;
                        } else {
                            try {
                                text.push(htmlToText.fromString(node.textContent));
                            } catch (err) {
                                this.emit('error', new Error('Failed to parse HTML'));
                                text.push('Invalid HTML content');
                                failedToParseHtml = true;
                            }
                        }
                    }
                    if (!failedToParseHtml) {
                        html.push(node.textContent);
                    }
                }
            }
            alternative = alternative || node.contentType === 'multipart/alternative';
            node.children.forEach((subNode) => {
                processNode(alternative, level + 1, subNode);
            });
        };

        processNode(false, 0, this.tree);

        const response = {
            type: 'text',
        };
        if (html.length) {
            this.html = response.html = html.join('<br/>\n');
        }
        if (text.length) {
            this.text = response.text = text.join('\n');
            this.textAsHtml = response.textAsHtml = text.map((part) => this.textToHtml(part)).join('<br/>\n');
        }
        return response;
    }

    processChunk(data, done) {
        let partId = null;
        if (data._parentBoundary) {
            partId = this._getPartId(data._parentBoundary);
        }
        switch (data.type) {
            case 'node': {
                const node = this.createNode(data);
                if (node === this.tree) {
                    ['subject', 'references', 'date', 'to', 'from', 'to', 'cc', 'bcc', 'message-id', 'in-reply-to', 'reply-to'].forEach((key) => {
                        if (node.headers.has(key)) {
                            this[key.replace(/-([a-z])/g, (m, c) => c.toUpperCase())] = node.headers.get(key);
                        }
                    });
                    this.emit('headers', node.headers);
                }

                if (data.contentType === 'message/rfc822' && data.messageNode) {
                    break;
                }

                if (data.parentNode && data.parentNode.contentType === 'message/rfc822') {
                    node.showMeta = true;
                }

                if (node.isAttachment) {
                    let contentType = node.contentType;
                    if (node.contentType === 'application/octet-stream' && data.filename) {
                        contentType = this.libmime.detectMimeType(data.filename) || 'application/octet-stream';
                    }

                    const attachment = {
                        type: 'attachment',
                        content: null,
                        contentType,
                        partId,
                        release: () => {
                            attachment.release = null;
                            if (this.waitUntilAttachmentEnd && typeof this.attachmentCallback === 'function') {
                                setImmediate(this.attachmentCallback);
                            }
                            this.attachmentCallback = false;
                            this.waitUntilAttachmentEnd = false;
                        },
                    };

                    const hasher = new StreamHash(attachment, 'md5');
                    node.decoder.on('error', (err) => {
                        hasher.emit('error', err);
                    });
                    node.decoder.pipe(hasher);
                    attachment.content = hasher;

                    this.waitUntilAttachmentEnd = true;
                    if (data.disposition) {
                        attachment.contentDisposition = data.disposition;
                    }

                    if (data.filename) {
                        attachment.filename = data.filename;
                    }

                    if (node.headers.has('content-id')) {
                        attachment.contentId = [].concat(node.headers.get('content-id') || []).shift();
                        attachment.cid = attachment.contentId
                            .trim()
                            .replace(/^<|>$/g, '')
                            .trim();
                        // check if the attachment is "related" to text content like an embedded image etc
                        let parentNode = node;
                        while ((parentNode = parentNode.parent)) {
                            if (parentNode.contentType === 'multipart/related') {
                                attachment.related = true;
                            }
                        }
                    }

                    attachment.headers = node.headers;
                    this.push(attachment);
                    this.attachmentList.push(attachment);
                } else if (node.disposition === 'inline') {
                    const chunks = [];
                    let chunklen = 0;
                    node.contentStream = node.decoder;

                    if (node.contentType === 'text/plain') {
                        this.hasText = true;
                    } else if (node.contentType === 'text/html') {
                        this.hasHtml = true;
                    }

                    const charset = node.charset || 'utf-8';
                    // charset = charset || 'windows-1257';

                    if (!['ascii', 'usascii', 'utf8'].includes(charset.toLowerCase().replace(/[^a-z0-9]+/g, ''))) {
                        try {
                            const decodeStream = this.decoder.decodeStream(charset);
                            node.contentStream.on('error', (err) => {
                                decodeStream.emit('error', err);
                            });
                            node.contentStream.pipe(decodeStream);
                            node.contentStream = decodeStream;
                        } catch (E) {
                            // do not decode charset
                        }
                    }

                    node.contentStream.on('readable', () => {
                        let chunk;
                        while ((chunk = node.contentStream.read()) !== null) {
                            if (typeof chunk === 'string') {
                                chunk = Buffer.from(chunk);
                            }
                            chunks.push(chunk);
                            chunklen += chunk.length;
                        }
                    });

                    node.contentStream.once('end', () => {
                        node.textContent = Buffer.concat(chunks, chunklen)
                            .toString()
                            .replace(/\r?\n/g, '\n');
                    });

                    node.contentStream.once('error', (err) => {
                        this.emit('error', err);
                    });
                }

                break;
            }

            case 'data':
                if (this.curnode && this.curnode.decoder) {
                    this.curnode.decoder.end();
                }

                if (this.waitUntilAttachmentEnd) {
                    this.attachmentCallback = done;
                    return;
                }

                // multipart message structure
                // this is not related to any specific 'node' block as it includes
                // everything between the end of some node body and between the next header
                // process.stdout.write(data.value);
                break;

            case 'body':
                if (this.curnode && this.curnode.decoder && this.curnode.decoder.writable) {
                    if (this.curnode.decoder.write(data.value) === false) {
                        return this.curnode.decoder.once('drain', done);
                    }
                }

                // Leaf element body. Includes the body for the last 'node' block. You might
                // have several 'body' calls for a single 'node' block
                // process.stdout.write(data.value);
                break;
        }

        setImmediate(done);
    }

    _getPartId(parentBoundary) {
        let boundaryIndex = this.boundaries.findIndex((item) => item.name === parentBoundary);
        if (boundaryIndex === -1) {
            this.boundaries.push({ name: parentBoundary, count: 1 });
            boundaryIndex = this.boundaries.length - 1;
        } else {
            this.boundaries[boundaryIndex].count++;
        }
        let partId = '1';
        for (let i = 0; i <= boundaryIndex; i++) {
            if (i === 0) {
                partId = this.boundaries[i].count.toString();
            } else {
                partId += '.' + this.boundaries[i].count.toString();
            }
        }
        return partId;
    }

    getAddressesHTML(value) {
        const formatSingleLevel = (addresses) =>
            addresses
                .map((address) => {
                    let str = '<span class="mp_address_group">';
                    if (address.name) {
                        str += '<span class="mp_address_name">' + he.encode(address.name) + (address.group ? ': ' : '') + '</span>';
                    }
                    if (address.address) {
                        const link = '<a href="mailto:' + he.encode(address.address) + '" class="mp_address_email">' + he.encode(address.address) + '</a>';
                        if (address.name) {
                            str += ' &lt;' + link + '&gt;';
                        } else {
                            str += link;
                        }
                    }
                    if (address.group) {
                        str += formatSingleLevel(address.group) + ';';
                    }
                    return str + '</span>';
                })
                .join(', ');
        return formatSingleLevel([].concat(value || []));
    }

    getAddressesText(value) {
        const formatSingleLevel = (addresses) =>
            addresses
                .map((address) => {
                    let str = '';
                    if (address.name) {
                        str += address.name + (address.group ? ': ' : '');
                    }
                    if (address.address) {
                        const link = address.address;
                        if (address.name) {
                            str += ' <' + link + '>';
                        } else {
                            str += link;
                        }
                    }
                    if (address.group) {
                        str += formatSingleLevel(address.group) + ';';
                    }
                    return str;
                })
                .join(', ');
        return formatSingleLevel([].concat(value || []));
    }

    updateImageLinks(replaceCallback, done) {
        if (!this.html) {
            return setImmediate(() => done(null, false));
        }

        const cids = new Map();
        let html = (this.html || '').toString();

        if (this.options.skipImageLinks) {
            return done(null, html);
        }

        html.replace(/\bcid:([^'"\s]{1,256})/g, (match, cid) => {
            for (let i = 0, len = this.attachmentList.length; i < len; i++) {
                if (this.attachmentList[i].cid === cid && /^image\/[\w]+$/i.test(this.attachmentList[i].contentType)) {
                    if (/^image\/[\w]+$/i.test(this.attachmentList[i].contentType)) {
                        cids.set(cid, {
                            attachment: this.attachmentList[i],
                        });
                    }
                    break;
                }
            }
            return match;
        });

        const cidList = [];
        cids.forEach((entry) => {
            cidList.push(entry);
        });

        let pos = 0;
        const processNext = () => {
            if (pos >= cidList.length) {
                html = html.replace(/\bcid:([^'"\s]{1,256})/g, (match, cid) => {
                    if (cids.has(cid) && cids.get(cid).url) {
                        return cids.get(cid).url;
                    }
                    return match;
                });

                return done(null, html);
            }
            const entry = cidList[pos++];
            replaceCallback(entry.attachment, (err, url) => {
                if (err) {
                    return setImmediate(() => done(err));
                }
                entry.url = url;
                setImmediate(processNext);
            });
        };

        setImmediate(processNext);
    }

    textToHtml(str) {
        if (this.options.skipTextToHtml) {
            return '';
        }
        str = (str || '').toString();
        let encoded;

        let linkified = false;
        if (!this.options.skipTextLinks) {
            try {
                if (linkify.pretest(str)) {
                    linkified = true;
                    const links = linkify.match(str) || [];
                    const result = [];
                    let last = 0;

                    links.forEach((link) => {
                        if (last < link.index) {
                            const textPart = he
                                // encode special chars
                                .encode(str.slice(last, link.index), {
                                    useNamedReferences: true,
                                });
                            result.push(textPart);
                        }

                        result.push(`<a href="${link.url}">${link.text}</a>`);

                        last = link.lastIndex;
                    });

                    const textPart = he
                        // encode special chars
                        .encode(str.slice(last), {
                            useNamedReferences: true,
                        });
                    result.push(textPart);

                    encoded = result.join('');
                }
            } catch (E) {
                // failed, don't linkify
            }
        }

        if (!linkified) {
            encoded = he
                // encode special chars
                .encode(str, {
                    useNamedReferences: true,
                });
        }

        const text =
            '<p>' +
            encoded
                .replace(/\r?\n/g, '\n')
                .trim() // normalize line endings
                .replace(/[ \t]+$/gm, '')
                .trim() // trim empty line endings
                .replace(/\n\n+/g, '</p><p>')
                .trim() // insert <p> to multiple linebreaks
                .replace(/\n/g, '<br/>') + // insert <br> to single linebreaks
            '</p>';

        return text;
    }
}

module.exports = MailParser;
