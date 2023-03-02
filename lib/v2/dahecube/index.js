const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const utils = require('./utils');
const { TYPE, parseUrl } = utils;

module.exports = async (ctx) => {
    const type = ctx.params.type ?? 'recommend';
    const params = JSON.stringify({
        channelid: TYPE[type].id,
        pno: 1,
        psize: 15,
    });

    const res = await got({
        method: 'post',
        url: 'https://app.dahecube.com/napi/news/pc/list',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
        body: params,
    });

    const list = res.data.data.items.map((item) => ({
        title: item.title,
        pubDate: parseDate(item.pubtime, 'YYYY-MM-DD HH:ss:mm'),
        author: item.source,
        id: item.recid,
    }));

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'post',
                    url: 'https://app.dahecube.com/napi/news/pc/artinfo',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    },
                    body: JSON.stringify({
                        artid: item.id,
                    }),
                });

                item.description = detailResponse.data.data.content;
                item.link = `https://www.dahecube.com/article.html?artid=${item.id}`;
                delete item.id;
                return item;
            })
        )
    );

    ctx.state.data = {
        title: '大河财立方',
        link: parseUrl(type),
        description: `大河财立方 ${TYPE[type].name}`,
        language: 'zh-cn',
        item: items,
    };

    ctx.state.json = {
        title: '大河财立方',
        link: parseUrl(type),
        description: `大河财立方 ${TYPE[type].name}`,
        items,
    };
};
