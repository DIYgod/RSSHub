const { parseDate } = require('@/utils/parse-date');

// convert a string into title case
const toTitleCase = (str) =>
    str
        .toLowerCase()
        .split(' ')
        .map((word) => word.replace(word[0], word[0].toUpperCase()))
        .join(' ');

const rWhiteSpace = /\s+/;
const rAllWhiteSpace = /\s+/g;

// collapse all whitespaces into a single space (like "white-space: normal;" would do), and trim
const collapseWhitespace = (str) => {
    if (str && rWhiteSpace.test(str)) {
        return str.replace(rAllWhiteSpace, ' ').trim();
    }
    return str;
};

const convertDate = (date, toISO = false) => {
    if (!date) {
        return date;
    }
    if (typeof date !== 'object') {
        date = parseDate(date);
    }
    const ret = toISO ? date.toISOString() : date.toUTCString();
    if (ret === 'Invalid Date') {
        throw new RangeError('Invalid Date');
    }
    return ret;
};
const convertDateToISO8601 = (date) => convertDate(date, true);
const convertDateToRFC2822 = (date) => convertDate(date, false);

module.exports = {
    toTitleCase,
    collapseWhitespace,
    convertDateToISO8601,
    convertDateToRFC2822,
};
