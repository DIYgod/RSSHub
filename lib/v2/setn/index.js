const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const defaultRootUrl = 'https://www.setn.com';

const rootUrls = {
    娛樂: 'https://star.setn.com',
    健康: 'https://health.setn.com',
    旅遊: 'https://travel.setn.com',
    富房網: 'https://fuhouse.setn.com',
    女孩: 'https://watch.setn.com',
};

const ids = {
    即時: '',
    熱門: 0,
    政治: 6,
    社會: 41,
    國際: 5,
    兩岸: 68,
    生活: 4,
    運動: 34,
    地方: 97,
    財經: 2,
    名家: 9,
    新奇: 42,
    科技: 7,
    汽車: 12,
    寵物: 47,
    HOT焦點: 31,
};

const getCurrentUrl = (category) => {
    const rootUrl = rootUrls.hasOwnProperty(category) ? rootUrls[category] : defaultRootUrl;

    if (ids.hasOwnProperty(category)) {
        return `${rootUrl}/ViewAll.aspx${ids[category] === '' ? '' : `?PageGroupID=${ids[category]}`}`;
    }

    return `${rootUrl}/viewall`;
};

module.exports = async (ctx) => {
    const category = ctx.params.category ?? '即時';
    const limit = ctx.query.limit ? parseInt(ctx.query.limit) : 42;

    const currentUrl = getCurrentUrl(category);

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $('#NewsList, .newsList, .hotNewsList')
        .find('.newsItems, .st-news, .all_three_list, div.title-word')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const a = item.find('a').last();
            const link = a.attr('href').replace(/(\?|&)utm_campaign=.*/g, '');

            return {
                title: a.text(),
                link: /^http/.test(link) ? link : `${rootUrls.hasOwnProperty(category) ? rootUrls[category] : defaultRootUrl}${link}`,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = cheerio.load(detailResponse.data);

                content('#gad_setn_innity_oop_1x1').remove();

                item.author = content('meta[property="author"]').attr('content');
                item.category = [content('meta[property="article:section"]').attr('content'), ...content('meta[name="news_keywords"]').attr('content').split(',')];
                item.pubDate = parseDate(content('meta[property="article:published_time"]').attr('content'));
                item.description = content('article, .content-p').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `三立新聞網 - ${category}`,
        link: currentUrl,
        item: items,
    };
};
