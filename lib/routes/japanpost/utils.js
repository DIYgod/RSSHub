const cheerio = require('cheerio');
const Base64 = require('js-base64').Base64;
const JsSHA = require('jssha');

function utils() {
    this.expandOdd = function() {
        cheerio.prototype.odd = function() {
            const odds = [];
            this.each(function(index, item) {
                if (index % 2 === 1) {
                    odds.push(item);
                }
            });
            return cheerio(odds);
        };
    };

    this.expandEven = function() {
        cheerio.prototype.even = function() {
            const evens = [];
            this.each(function(index, item) {
                if (index % 2 === 0) {
                    evens.push(item);
                }
            });
            return cheerio(evens);
        };
    };

    this.expandReverse = function() {
        cheerio.prototype.reverse = function() {
            const reverses = [];
            this.each(function(index, item) {
                reverses.push(item);
            });
            reverses.reverse();
            return cheerio(reverses);
        };
    };

    this.generateGuid = function(t) {
        const tBase64 = Base64.encode(t);
        const shaObj = new JsSHA('SHA-512', 'TEXT');
        shaObj.update(tBase64);
        const r = shaObj.getHash('HEX', { outputUpper: true, b64Pad: '=' });
        return r;
    };
}

module.exports = utils;
