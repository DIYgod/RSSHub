// convert a string into title case
const toTitleCase = (str) =>
    str
        .toLowerCase()
        .split(' ')
        .map((word) => word.replace(word[0], word[0].toUpperCase()))
        .join(' ');

// add no-referrer attribute to images
// $: cheerio selector
// source: source selector, string
// target: target attribute name, typically for lazyload imgs, string
// srcPrefix: prefix for src, string
// removeAttr: attributes to remove, array: ['attrA','attrA']

const addNoReferrer = ($, source, target, srcPrefix, removeAttr) => {
    $(`${source} img`).each((index, e) => {
        const $e = $(e);
        let src = target ? $e.attr(target) : $e.attr('src');

        if (src) {
            if (srcPrefix) {
                src = srcPrefix + src;
            }

            if (target) {
                $e.removeAttr(target);
            }

            if (removeAttr) {
                removeAttr.forEach((e) => {
                    $e.removeAttr(e);
                });
            }

            $e.attr('src', src);
            $e.attr('referrerpolicy', 'no-referrer');
        }
    });
};

module.exports = {
    toTitleCase,
    addNoReferrer,
};
