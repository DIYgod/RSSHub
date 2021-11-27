const cheerio = require('cheerio');
const crypto = require('crypto');

const cityTimezones = require('city-timezones');
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

const utils = {
    expandOdd: () => {
        cheerio.prototype.odd = function () {
            const odds = [];
            this.each((index, item) => {
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
            this.each((index, item) => {
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
            this.each((index, item) => {
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
    parseDatetime: (t, o, r, tz, l) => {
        const formatJaDate = 'YYYY/MM/DD';
        const formatJaDateTime = 'YYYY/MM/DD HH:mm';
        const formatEnDate = 'MM/DD/YYYY';
        const formatEnDateTime = 'MM/DD/YYYY HH:mm';
        let customFormat;

        switch (l) {
            case 'ja':
                customFormat = dayjs(t, formatJaDate, true).isValid() ? formatJaDate : dayjs(t, formatJaDateTime, true).isValid() ? formatJaDateTime : undefined;
                break;
            case 'en':
                customFormat = dayjs(t, formatEnDate, true).isValid() ? formatEnDate : dayjs(t, formatEnDateTime, true).isValid() ? formatEnDateTime : undefined;
                break;
        }

        if (o) {
            const packageInJPKeywords = [['郵便局'], ['都​', '道', '府', '県']];
            if (packageInJPKeywords[0].some((i) => o.includes(i)) || packageInJPKeywords[1].some((i) => r.includes(i))) {
                tz = 'Asia/Tokyo';
            } else {
                const oS = o.replace(' EMS', '').replace(' INT', '');
                try {
                    try {
                        tz = cityTimezones.lookupViaCity(oS)[0].timezone;
                    } catch {
                        tz = cityTimezones.lookupViaCity(r)[0].timezone;
                    }
                } catch {
                    // empty
                }
            }
        }

        if (!customFormat) {
            return [new Date(t).getTime(), tz];
        } else {
            return [dayjs.tz(t, customFormat, tz).valueOf(), tz];
        }
    },
};

module.exports = utils;
