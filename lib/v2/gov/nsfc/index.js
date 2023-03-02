const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const types = {
    jjyw: {
        title: '基金要闻',
        url: '/publish/portal0/tab440/',
    },
    tzgg: {
        title: '通知公告',
        url: '/publish/portal0/tab442/',
    },
    zzcg: {
        title: '资助成果',
        url: '/publish/portal0/tab448/',
    },
    kpkx: {
        title: '科普快讯',
        url: '/publish/portal0/tab446/',
    },
};

module.exports = async (ctx) => {
    const type = ctx.params.type ?? 'jjyw';

    const rootUrl = 'https://www.nsfc.gov.cn';
    const currentUrl = `${rootUrl}${types[type].url}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
        https: {
            rejectUnauthorized: false,
        },
    });

    const $ = cheerio.load(response.data);

    let items = $('.fl a')
        .toArray()
        .map((item) => {
            item = $(item);

            const link = item.attr('href');

            return {
                title: item.attr('title'),
                link: `${/^http/.test(link) ? '' : rootUrl}${link}`,
                pubDate: parseDate(item.parent().next().text()),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                if (/nsfc\.gov\.cn/.test(item.link)) {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                        https: {
                            rejectUnauthorized: false,
                        },
                    });

                    const content = cheerio.load(detailResponse.data);

                    item.description = content('.content_xilan').html();
                    item.pubDate = timezone(parseDate(content('meta[name="docdate"]').attr('content')), +8);
                }

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `国家自然科学基金委员会 - ${$('title').text()}`,
        link: currentUrl,
        item: items,
    };
};
