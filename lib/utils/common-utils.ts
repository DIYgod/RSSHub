import parseDate from '@/utils/parse-date';
const title = require('title');

// convert a string into title case
const toTitleCase = (str: string) => title(str);

const rWhiteSpace = /\s+/;
const rAllWhiteSpace = /\s+/g;

// collapse all whitespaces into a single space (like "white-space: normal;" would do), and trim
const collapseWhitespace = (str?: string | null) => {
    if (str && rWhiteSpace.test(str)) {
        return str.replaceAll(rAllWhiteSpace, ' ').trim();
    }
    return str;
};

const convertDateToISO8601 = (date?: string | Date | number | null) => {
    if (!date) {
        return date;
    }
    if (typeof date !== 'object') {
        // some routes may call `.toUTCString()` before passing the date to ctx...
        date = parseDate.parse(date);
    }
    return date.toISOString();
};

export default {
    toTitleCase,
    collapseWhitespace,
    convertDateToISO8601,
};
