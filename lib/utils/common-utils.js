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

module.exports = {
    toTitleCase,
    collapseWhitespace,
};
