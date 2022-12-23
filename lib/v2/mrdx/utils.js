const got = require('@/utils/got');
const cheerio = require('cheerio');

function parseDate(date) {
    const yearPosition = date.indexOf('年');
    const monthPosition = date.indexOf('月');
    const dayPosition = date.indexOf('日');

    const year = date.slice(0, yearPosition);
    const month = date.slice(yearPosition + 1, monthPosition);
    const day = date.slice(monthPosition + 1, dayPosition);

    return new Date(year, month, day);
}

/**
 * Return response and cache processed result.
 * @param {URL} link
 * @param {*} ctx
 * @returns {cheerio.Root}
 */
async function getHTMLWithCache(link, ctx) {
    return await ctx.cache.tryGet(link, async () => {
        const result = await got({
            url: link,
            method: 'get',
        });
        return cheerio.load(result.data);
    });
}

function getElementChildrenInnerText(element) {
    let text = '';
    for (const child of element.children) {
        if (child.type === 'text') {
            text += child.data.trim();
        }
        if (child.children !== undefined) {
            text += getElementChildrenInnerText(child);
        }
    }

    return text;
}

module.exports = {
    parseDate,
    getElementChildrenInnerText,
    getHTMLWithCache,
};
