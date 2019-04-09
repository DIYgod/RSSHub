const axios = require('../../../utils/axios');
const cheerio = require('cheerio');
const url = require('url');
const qs = require('querystring');

const baseUrl = 'http://jwc.scuteo.com/';

const categoryMap = {
    '1': { title: '教务通知', id: 'f25701314e90988c014e90ad57500004' },
    '2': { title: '交流交换', id: 'ff8080815bc6f38d015bd27cc8d8001d' },
    '3': { title: '新闻动态', id: '8a8a8a5d4ed24d4a014ed26f32600000' },
    '4': { title: '媒体关注', id: '8a8a8a5d4ed27047014ed272fb000001' },
    '5': { title: '学院通知', id: '8a8a8a5d4ed27047014ed2729a770000' },
};

module.exports = async (ctx) => {
    const category = ctx.params.category || '1';
    const categoryData = categoryMap[category];

    const listLink = baseUrl + 'jiaowuchu/cms/category/index.do?id=' + categoryData.id;
    const listResponse = await axios({
        method: 'post',
        url: baseUrl + 'jiaowuchu/cms/category/index.do',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: qs.stringify({
            id: categoryData.id,
            offset: 0,
            pagesize: 20,
        }),
    });

    const itemList = listResponse.data.results.splice(0, 10);
    const out = await Promise.all(
        itemList.map(async (itemData) => {
            const itemUrl = url.resolve(baseUrl, 'jiaowuchu' + itemData.href);
            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const itemResponse = await axios.get(itemUrl);
            const $ = cheerio.load(itemResponse.data);
            const desc = $('.department-content-detail');
            const item = {
                title: itemData.title,
                link: itemUrl,
                description:
                    desc.length > 0
                        ? desc
                              .html()
                              .replace(/src="\//g, `src="${url.resolve(baseUrl, '.')}`)
                              .replace(/href="\//g, `href="${url.resolve(baseUrl, '.')}`)
                              .trim()
                        : null,
                pubDate: itemData.date,
            };

            ctx.cache.set(itemUrl, JSON.stringify(item), 24 * 60 * 60);
            return Promise.resolve(item);
        })
    );

    ctx.state.data = {
        title: '华南理工大学教务处 - ' + categoryData.title,
        link: listLink,
        item: out,
    };
};
