const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const BASE = 'https://www.timednews.com/topic';

const PATH_LIST = {
    all: {
        name: '全部',
        path: 'cat/1.html',
    },
    currentAffairs: {
        name: '时政',
        path: 'subcat/1.html',
    },
    finance: {
        name: '财经',
        path: 'subcat/2.html',
    },
    technology: {
        name: '科技',
        path: 'subcat/3.html',
    },
    social: {
        name: '社会',
        path: 'subcat/4.html',
    },
    sports: {
        name: '体娱',
        path: 'subcat/5.html',
    },
    international: {
        name: '国际',
        path: 'subcat/6.html',
    },
    usa: {
        name: '美国',
        path: 'subcat/7.html',
    },
    cn: {
        name: '中国',
        path: 'subcat/8.html',
    },
    europe: {
        name: '欧洲',
        path: 'subcat/9.html',
    },
    comments: {
        name: '评论',
        path: 'subcat/14.html',
    },
};

module.exports = async (ctx) => {
    const type = ctx.params.type ?? 'all';
    const url = `${BASE}/${PATH_LIST[type].path}`;
    const res = await got({
        method: 'get',
        url,
    });

    const $ = cheerio.load(res.data);

    const list = $('#content li')
        .map((i, e) => {
            const c = cheerio.load(e);
            return {
                title: c('a').text().trim(),
                link: c('a').attr('href'),
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const c = cheerio.load(detailResponse.data, { decodeEntities: false });
                c('.event .twitter').remove();
                item.pubDate = parseDate(c('.datetime #publishdate').text(), 'YYYY-MM-DD');
                item.author = c('.datetime #author').text();
                item.description = c('.event').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: '时刻新闻',
        link: url,
        description: `时刻新闻 ${PATH_LIST[type].name}`,
        item: items,
    };

    ctx.state.json = {
        title: '时刻新闻',
        link: url,
        description: `时刻新闻 ${PATH_LIST[type].name}`,
        item: items,
    };
};
