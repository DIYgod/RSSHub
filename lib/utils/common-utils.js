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

const resolveLazyLoadImage = ($) => {
    const imgs_suffix = ['gif', 'png', 'jpg', 'webp'];
    $('img')
        .each((_, ele) => {
            const $ele = $(ele);
            if ($ele.attr('src')) {
                $ele.attr('referrerpolicy', 'no-referrer');
            } else {
                let valid_src = '';
                Object.values(ele.attribs).some((attr_value) => {
                    attr_value = attr_value.trim();
                    const is_matched = /^(http:|https:)?\/\//.test(attr_value) && imgs_suffix.some((suffix) => attr_value.includes(suffix));
                    if (is_matched) {
                        valid_src = attr_value;
                    }
                    return is_matched;
                });
                if (valid_src) {
                    $ele.attr('src', valid_src);
                    $ele.attr('referrerpolicy', 'no-referrer');
                }
            }
        })
        .get();
};

module.exports = {
    toTitleCase,
    addNoReferrer,
    resolveLazyLoadImage,
};
