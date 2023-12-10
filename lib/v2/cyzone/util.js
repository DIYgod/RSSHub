const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const rootUrl = 'https://www.cyzone.cn';
const apiRootUrl = 'https://api1.cyzone.cn';
const apiShowUrl = new URL('v2/content/app_content/show', apiRootUrl).href;

/**
 * Retrieves information from a given URL using a provided tryGet function.
 * @param {string} url        - The URL to retrieve information from.
 * @param {Function} tryGet   - The tryGet function that handles the retrieval process.
 * @returns {Promise<Object>} - A promise that resolves to an object containing the retrieved information.
 */
const getInfo = (url, tryGet) =>
    tryGet(url, async () => {
        const { data: response } = await got(url);

        const $ = cheerio.load(response);

        const avatar = $('img.avatar')?.prop('src')?.split('?')[0] ?? undefined;
        const icon = new URL($('link[rel="icon"]')?.prop('href'), rootUrl).href;
        const image = new URL($('div.logo img')?.prop('src'), rootUrl).href;

        return {
            title: $('title').text(),
            link: url,
            description: $('meta[name="description"]').prop('content'),
            language: 'zh-cn',
            image: avatar || image,
            icon,
            logo: icon,
            subtitle: $('meta[name="keywords"]').prop('content'),
            author: $('meta[name="app-mobile-web-app-title"]').prop('content'),
        };
    });

/**
 * Process the item list and return the resulting array.
 * @param {string} apiUrl          - The URL of the API.
 * @param {number} limit           - The limit of the results.
 * @param {function} tryGet        - The tryGet function that handles the retrieval process.
 * @param {...Object} searchParams - The search parameter objects.
 * @returns {Promise<Array>}       - The processed item array.
 */
const processItems = async (apiUrl, limit, tryGet, ...searchParams) => {
    // Merge search parameters
    searchParams = {
        ...searchParams.reduce(
            (result, object) => ({
                ...result,
                ...object,
            }),
            {}
        ),
        ...{
            size: limit,
        },
    };

    const { data: response } = await got(apiUrl, {
        searchParams,
    });

    let items = (response.data?.article ?? response.data?.data ?? response.data).slice(0, limit).map((item) => {
        item = item.item ?? item;

        return {
            title: item.title,
            link: /^\/\//.test(item.url) ? `https:${item.url}` : item.url,
            description: item.description,
            category: [item.category_name, ...(item.tags?.split(',') ?? [])],
            guid: item.content_id,
            pubDate: parseDate(item.published_at * 1000),
            upvotes: item.votes ?? 0,
        };
    });

    items = await Promise.all(
        items.map((item) =>
            tryGet(`cyzone-${item.guid}`, async () => {
                const { data: detailResponse } = await got.post(apiShowUrl, {
                    json: {
                        content_id: item.guid,
                    },
                });

                const data = detailResponse.data;

                const categories = [data.category, ...item.category, ...(data.tags?.split(',') ?? [])];

                const content = cheerio.load(data.content);

                content('img').each(function () {
                    if (content(this).prop('src')) {
                        content(this).prop('src', content(this).prop('src').split('?')[0]);
                    } else {
                        content(this).remove();
                    }
                });

                item.title = data.title;
                item.link = /^\/\//.test(data.link_url) ? `https:${data.link_url}` : data.link_url;
                item.description = content.html();
                item.author = data.author_name ?? data.author;
                item.category = [...new Set(categories)].filter((c) => c);
                item.guid = `cyzone-${item.guid}`;
                item.pubDate = parseDate(data.published_at * 1000);
                item.upvotes = data.votes ?? 0;

                return item;
            })
        )
    );

    return items;
};

module.exports = {
    rootUrl,
    apiRootUrl,

    getInfo,
    processItems,
};
