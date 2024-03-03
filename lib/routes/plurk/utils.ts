// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://www.plurk.com';

/**
 *
 * @param {objects} userIds Array of user ids
 * @returns
 */
const fetchFriends = async (userIds) => {
    const { data } = await got.post(`${baseUrl}/Users/fetchFriends`, {
        form: {
            ids: JSON.stringify(userIds),
            r: 'gp',
        },
    });
    return data;
};

/**
 *
 * @param {string} plurkGuid plurk guid, should start with 'plurk:'
 * @param {object} item plurk object
 * @param {string} author author name, can be `null`
 * @param {function} tryGet cache get function
 * @returns {object} item object
 */
const getPlurk = (plurkGuid, item, author, tryGet) =>
    tryGet(plurkGuid, () => {
        const $ = load(item.content || item.rendered, null, false);
        $('img').each((_, e) => {
            e = $(e);
            e.removeAttr('height').removeAttr('width');
            if (e.attr('alt') && e.attr('alt').startsWith('http')) {
                e.attr('src', e.attr('alt'));
                e.removeAttr('alt');
            }
        });

        return {
            title: item.content_raw ?? ($.text() || plurkGuid),
            description: $.html(),
            guid: plurkGuid,
            link: item.rendered ? item.link_url : null,
            author,
            pubDate: parseDate(item.posted),
        };
    });

module.exports = {
    baseUrl,
    fetchFriends,
    getPlurk,
};
