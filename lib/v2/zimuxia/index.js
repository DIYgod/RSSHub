const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const { category } = ctx.params;

    const rootUrl = 'https://www.zimuxia.cn';
    const currentUrl = `${rootUrl}/我们的作品`;
    const response = await got({
        method: 'get',
        url: currentUrl,
        searchParams: {
            cat: category ? category : undefined,
        },
        https: {
            rejectUnauthorized: false,
        },
    });

    const $ = cheerio.load(response.data);

    const list = $('.pg-item a')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.find('h2').text(),
                link: item.attr('href'),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                    https: {
                        rejectUnauthorized: false,
                    },
                });
                const content = cheerio.load(detailResponse.data);

                const links = detailResponse.data.match(/<a href="magnet:(.*?)" target="_blank">磁力下载<\/a>/g);

                if (links) {
                    item.enclosure_type = 'application/x-bittorrent';
                    item.enclosure_url = decodeURIComponent(links.pop().match(/<a href="(.*)" target="_blank">磁力下载<\/a>/)[1]);
                }

                item.description = content('.content-box').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${category || 'ALL'} - FIX字幕侠`,
        link: response.url,
        item: items,
    };
};
