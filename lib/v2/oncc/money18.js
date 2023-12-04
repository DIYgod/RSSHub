const got = require('@/utils/got');
const cheerio = require('cheerio');
const dayjs = require('dayjs');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

const sections = {
    exp: '新聞總覽',
    fov: '全日焦點',
    industry: '板塊新聞',
    int: '國際金融',
    recagent: '大行報告',
    ntlgroup: 'A股新聞',
    pro: '地產新聞',
    weainvest: '投資理財',
    ipo: '新股IPO',
    tech: '科技財情',
};

module.exports = async (ctx) => {
    const id = ctx.params.id ?? 'exp';
    const limit = ctx.query.limit ? parseInt(ctx.query.limit) : 30;

    const rootUrl = 'https://money18.on.cc';
    const currentUrl = `${rootUrl}/finnews/news_${id === 'industry' ? 'industry.html' : `breaking.html?section=${id}`}`;
    const ipoApiUrl = `https://dyn.on.cc/api/asrh/v1/events/names/新股/articles?page=1&limit=${limit}`;
    const industryApiUrl = `${rootUrl}/cnt/utf8/content/articleList/sector_list_exp_1.js`;

    const toApiUrl = (date) => `${rootUrl}/cnt/utf8/content/${date}/articleList/list_${id}_all.js`;

    let apiUrl = id === 'ipo' ? ipoApiUrl : id === 'industry' ? industryApiUrl : toApiUrl(dayjs().format('YYYYMMDD')),
        hasArticle = false,
        items = [],
        i = 0,
        response;

    /* eslint-disable no-await-in-loop */

    while (!hasArticle) {
        try {
            response = await got({
                method: 'get',
                url: apiUrl,
            });
            hasArticle = true;
        } catch (e) {
            if (e.code === 'ERR_NON_2XX_3XX_RESPONSE') {
                hasArticle = false;
                apiUrl = toApiUrl(dayjs().subtract(++i, 'day').format('YYYYMMDD'));
            }
        }
    }

    /* eslint-enable no-await-in-loop */

    if (id === 'ipo') {
        items = response.data.articles.map((item) => ({
            title: item.title,
            author: item.authorname,
            link: `${rootUrl}/finnews/content/${id}/${item.articleId}.html`,
            description: art(path.join(__dirname, 'templates/money18.art'), {
                images: item.hasHdPhoto ? [`https://hk.on.cc/hk/bkn${item.hdEnlargeThumbnail}`] : undefined,
                description: item.content,
            }),
            pubDate: timezone(parseDate(item.pubDate), +8),
        }));
    } else if (id === 'industry') {
        items = response.data.articles.slice(0, limit).map((item) => ({
            title: item.title,
            author: item.authorname,
            link: `${rootUrl}/finnews/content/${id}/${item.articleId}.html`,
            category: item.sector.map((s) => s.name),
            pubDate: timezone(parseDate(item.pubDate), +8),
        }));
    } else {
        items = response.data.slice(0, limit).map((item) => ({
            title: item.title,
            author: item.authorname,
            link: `${rootUrl}/finnews/content/${id}/${item.articleId}.html`,
            pubDate: timezone(parseDate(item.pubDate), +8),
        }));
    }

    if (id !== 'ipo') {
        items = await Promise.all(
            items.map((item) =>
                ctx.cache.tryGet(item.link, async () => {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });

                    const content = cheerio.load(detailResponse.data);

                    item.description = art(path.join(__dirname, 'templates/money18.art'), {
                        images: content('.photo img')
                            .toArray()
                            .map((i) => content(i).attr('src')),
                        description: content('.content').html(),
                    });

                    return item;
                })
            )
        );
    }

    ctx.state.data = {
        title: `東網產經 - ${sections[id]}`,
        link: currentUrl,
        item: items,
    };
};
