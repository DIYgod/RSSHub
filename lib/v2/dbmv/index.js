const got = require('@/utils/got');
const cherrio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const { category = '' } = ctx.params;
    let url;

    if (category !== '') {
        url = 'https://www.buxiuse.com/?cid=' + category;
    } else {
        url = 'https://www.buxiuse.com';
    }

    const response = await got({
        url,
        headers: {
            Referer: 'https://www.buxiuse.com',
        },
    });

    const data = response.data;
    const $ = cherrio.load(data);

    let resultItem = $('li.span3 img')
        .toArray()
        .map((item) => {
            item = $(item);
            const img_url = item.attr('src');
            return {
                title: item.attr('title'),
                link: item.parent().attr('href'),
                description: `<img src="${img_url}">`,
                guid: img_url,
            };
        });

    resultItem = await Promise.all(
        resultItem.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    url: item.link,
                    headers: {
                        Referer: url,
                    },
                });
                const detailData = detailResponse.data;
                const $ = cherrio.load(detailData);

                item.author = $('li.name').text();
                item.pubDate = timezone(parseDate($('div.info abbr').attr('title')), +8);
                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('title').text(),
        link: url,
        item: resultItem,
        description: '不羞涩 | 真实的图片分享交友社区',
    };
};
