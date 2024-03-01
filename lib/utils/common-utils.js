const { parseDate } = require('@/utils/parse-date');
const title = require('title');

// convert a string into title case
const toTitleCase = (str) => title(str);

const rWhiteSpace = /\s+/;
const rAllWhiteSpace = /\s+/g;

// collapse all whitespaces into a single space (like "white-space: normal;" would do), and trim
const collapseWhitespace = (str) => {
    if (str && rWhiteSpace.test(str)) {
        return str.replaceAll(rAllWhiteSpace, ' ').trim();
    }
    return str;
};

const convertDateToISO8601 = (date) => {
    if (!date) {
        return date;
    }
    if (typeof date !== 'object') {
        // some routes may call `.toUTCString()` before passing the date to ctx...
        date = parseDate(date);
    }
    return date.toISOString();
};

module.exports = {
    toTitleCase,
    collapseWhitespace,
    convertDateToISO8601,
};
