const cheerio = require('cheerio');
const crypto = require('crypto');

const utils = {
    expandOdd: () => {
        cheerio.prototype.odd = function () {
            const odds = [];
            this.each(function (index, item) {
                if (index % 2 === 1) {
                    odds.push(item);
                }
            });
            return cheerio(odds);
        };
    },
    expandEven: () => {
        cheerio.prototype.even = function () {
            const evens = [];
            this.each(function (index, item) {
                if (index % 2 === 0) {
                    evens.push(item);
                }
            });
            return cheerio(evens);
        };
    },
    expandReverse: () => {
        cheerio.prototype.reverse = function () {
            const reverses = [];
            this.each(function (index, item) {
                reverses.push(item);
            });
            reverses.reverse();
            return cheerio(reverses);
        };
    },
    generateGuid: (t) => {
        const hash = crypto.createHash('sha512');
        hash.update(t);
        const r = hash.digest('hex').toUpperCase();
        return r;
    },
};

module.exports = utils;
