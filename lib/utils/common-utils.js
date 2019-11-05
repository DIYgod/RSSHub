// convert a string into title case
const toTitleCase = (str) =>
    str
        .toLowerCase()
        .split(' ')
        .map((word) => word.replace(word[0], word[0].toUpperCase()))
        .join(' ');
const now2timestamp = Math.round(new Date().getTime());
module.exports = {
    toTitleCase,
    now2timestamp,
};
