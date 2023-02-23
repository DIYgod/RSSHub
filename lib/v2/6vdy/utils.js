const got = require('@/utils/got');
const iconv = require('iconv-lite');
const cheerio = require('cheerio');

const utils = {
    loadDetailPage: async function loadDetailPage(link) {
        const response = await got.get(link, {
            responseType: 'buffer',
        });
        response.data = iconv.decode(response.data, 'gb2312');

        const $ = cheerio.load(response.data);

        const detailInfo = {
            title: $('title')
                .text()
                .replace(/，免费下载，迅雷下载|，6v电影/g, ''),
            description: $('meta[name="description"]').attr('content'),
            enclosure_urls: $('table td')
                .map((i, e) => ({
                    title: $(e).text().replace('磁力：', ''),
                    magnet: $(e).find('a').attr('href'),
                }))
                .toArray()
                .filter((item) => item.magnet?.includes('magnet')),
        };
        return detailInfo;
    },
    processItems: async (ctx, baseURL) => {
        const response = await got.get(baseURL, {
            responseType: 'buffer',
        });
        response.data = iconv.decode(response.data, 'gb2312');

        const $ = cheerio.load(response.data);
        const list = $('ul.list')[0].children;

        const process = await Promise.all(
            list.map((item) => {
                const link = $(item).find('a');
                const href = link.attr('href');
                const pubDate = new Date($(item).find('span').text().replace(/[[\]]/g, '')).toUTCString();

                if (href === undefined) {
                    return undefined;
                }

                const itemUrl = 'https://www.hao6v.cc' + link.attr('href');

                return ctx.cache.tryGet(itemUrl, async () => {
                    const detailInfo = await utils.loadDetailPage(itemUrl);

                    if (detailInfo.enclosure_urls.length > 1) {
                        return detailInfo.enclosure_urls.map((url) => ({
                            enclosure_url: url.magnet,
                            enclosure_type: 'application/x-bittorrent',
                            title: `${link.text()} ( ${url.title} )`,
                            description: detailInfo.description,
                            pubDate,
                            link: itemUrl,
                            guid: `${itemUrl}#${url.title}`,
                        }));
                    }

                    return {
                        enclosure_url: detailInfo.enclosure_urls[0].magnet,
                        enclosure_type: 'application/x-bittorrent',
                        title: link.text(),
                        description: detailInfo.description,
                        pubDate,
                        link: itemUrl,
                    };
                });
            })
        );

        return process.filter((item) => item !== undefined).flat();
    },
};

module.exports = utils;
