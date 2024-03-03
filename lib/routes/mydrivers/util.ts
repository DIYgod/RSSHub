// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

const domain = 'mydrivers.com';
const rootUrl = `https://m.${domain}`;
const rootRSSUrl = `https://rss.${domain}`;
const apiVoteUrl = new URL('m/newsvote.ashx', rootUrl).href;

const title = '快科技';

const categories = {
    new: '最新',
    hot: '热门',
    zhibo: '直播',
};

/**
 * Converts a path string into a query string.
 * @param {string} path - The path string separated by slashes, containing key-value pairs.
 * @returns {string} - The query string with key-value pairs separated by question marks and equal signs.
 */
const convertToQueryString = (path) => {
    const parts = path.split('/');
    const queryStringParams = [];

    for (const [key, value] of parts.reduce((acc, part, index) => {
        if (index % 2 === 0) {
            acc.push([part]);
        } else {
            acc.at(-1).push(part);
        }
        return acc;
    }, [])) {
        queryStringParams.push(`${key}=${value}`);
    }

    return `?${queryStringParams.join('&')}`;
};

/**
 * Retrieves information from a given URL using a provided tryGet function.
 * @param {string} url - The URL to retrieve information from.
 * @param {function} tryGet - The tryGet function that handles the retrieval process.
 * @param {number|undefined} [range] - The index value of the range (optional).
 * @returns {Promise<Object>} - A promise that resolves to an object containing the retrieved information.
 */
const getInfo = (url, tryGet, range) =>
    tryGet(url, async () => {
        const { data: response } = await got(url);

        const $ = load(response);

        const icon = new URL($('link[rel="apple-touch-icon-precomposed"]').prop('href'), rootUrl).href;
        const image = `https:${$('div.logo a img').prop('src')}`;
        const ranges = $('div.hottime a')
            .toArray()
            .map((a) => $(a).text());

        return {
            title: `${title} - ${range !== undefined && ranges ? ranges[range] : $(`a[data-id="${url.split(/=/).pop()}"]`).text() || $('#newsEventSwitch a.cur').text()}`,
            link: url,
            description: $('meta[name="description"]').prop('content'),
            language: 'zh-cn',
            image,
            icon,
            logo: icon,
            subtitle: $('meta[name="keywords"]').prop('content'),
            author: title,
            allowEmpty: true,
        };
    });

/**
 * Process items asynchronously.
 *
 * @param {Array<Object>} items - The array of items to process.
 * @param {function} tryGet - The tryGet function that handles the retrieval process.
 * @returns {Promise<Array<Object>>} Returns a Promise that resolves to an array of processed items.
 */
const processItems = async (items, tryGet) =>
    await Promise.all(
        items.map((item) =>
            tryGet(`${domain}#${item.guid}`, async () => {
                const { data: detailResponse } = await got(`${rootUrl}/newsview/${item.guid}.html`);

                const { data: voteResponse } = await got.post(apiVoteUrl, {
                    json: {
                        Tid: item.guid,
                    },
                });

                const content = load(detailResponse);

                item.title = content('div.news_t').text() || item.title;
                item.description = content('#content').html() ?? item.description;
                item.author = content('li.writer').text() || item.author;
                item.category = [
                    ...(item.category ?? []),
                    ...content('div.bqian1 a')
                        .toArray()
                        .map((c) => content(c).contents().last().text().trim()),
                ].filter(Boolean);
                item.guid = `${domain}#${item.guid}`;
                item.pubDate = item.pubDate ?? timezone(parseDate(content('li.writer').next().text().trim(), 'YYYY年MM月DD日 HH:mm'), +8);
                item.upvotes = voteResponse.NewsSupport ? Number.parseInt(voteResponse.NewsSupport, 10) : 0;
                item.downvotes = voteResponse.NewsOppose ? Number.parseInt(voteResponse.NewsOppose, 10) : 0;
                item.comments = content('#tpinglun').text() ? Number.parseInt(content('#tpinglun').text(), 10) : 0;

                return item;
            })
        )
    );

module.exports = {
    rootUrl,
    rootRSSUrl,
    title,
    categories,

    convertToQueryString,
    getInfo,
    processItems,
};
