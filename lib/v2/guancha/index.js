const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { parseRelativeDate } = require('@/utils/parse-date');

const config = {
    review: {
        title: '评论 & 研究',
        query: '.module-news-main',
    },
    story: {
        title: '要闻',
        query: '.img-List',
    },
    fengwen: {
        title: '风闻',
        query: '.fengwen-list',
    },
    redian: {
        title: '热点',
    },
    gundong: {
        title: '滚动',
    },
    all: {
        title: '全部',
    },
    home: {
        title: '首页',
    },
    others: {
        title: '热点 & 滚动',
    },
};

module.exports = async (ctx) => {
    const total = 10;
    const category = ctx.params.category ?? 'all';
    const rootUrl = 'https://www.guancha.cn';

    let newsList = [],
        redianList = [],
        gundongList = [];

    // 'review', 'story' and 'fengwen' come from homepage.

    if (category === 'review' || category === 'story' || category === 'fengwen' || category === 'all' || category === 'home') {
        const response = await got({
            method: 'get',
            url: rootUrl,
        });

        const $ = cheerio.load(response.data);

        const fetchPost = (slice) =>
            slice
                .find('h4.module-title a')
                .toArray()

                // Filter some blank links which lead to no contents but 'https://user.guancha.cn'.

                .filter((item) => $(item).attr('href') !== 'https://user.guancha.cn')
                .map((item) => {
                    item = $(item);

                    const link = item.attr('href');

                    return {
                        title: item.text(),
                        link: `${link.indexOf('http') === 0 ? '' : rootUrl}${link.replace(/\.shtml/, '_s.shtml')}`,
                    };
                });

        if (category === 'all' || category === 'home') {
            newsList = fetchPost($(config.review.query))
                .slice(0, total / 3)
                .concat(fetchPost($(config.story.query)).slice(0, total / 3), fetchPost($(config.fengwen.query)).slice(0, total / 3));
        } else {
            newsList = fetchPost($(config[category].query)).slice(0, total);
        }
    }

    // 'redian' and 'gundong' come from api.

    if (category === 'redian' || category === 'all' || category === 'others') {
        const response = await got({
            method: 'get',
            url: `${rootUrl}/api/redian.htm`,
        });

        redianList = response.data.items
            .map((item) => ({
                title: item.TITLE,
                link: `${rootUrl}${item.HTTP_URL.replace(/\.shtml/, '_s.shtml')}`,
            }))
            .slice(0, category === 'all' ? total / 3 : total);
    }

    if (category === 'gundong' || category === 'all' || category === 'others') {
        const response = await got({
            method: 'get',
            url: `${rootUrl}/api/gundong.htm`,
        });

        gundongList = response.data.items
            .map((item) => ({
                title: item.TITLE,
                link: `${rootUrl}${item.HTTP_URL.replace(/\.shtml/, '_s.shtml')}`,
            }))
            .slice(0, category === 'all' ? total / 3 : total);
    }

    const items = await Promise.all(
        newsList.concat(redianList, gundongList).map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                let detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                // Some links to posts in 'fengwen' must be redirected in order to fetch content.
                // eg. https://www.guancha.cn/politics/2020_10_23_569021.shtml
                //  => https://user.guancha.cn/main/content?id=399176

                const jumpMatch = detailResponse.data.match(/user.guancha.cn\/main\/content\?id=(.*)";/);

                if (jumpMatch !== null) {
                    item.link = `https://user.guancha.cn/main/content?id=${jumpMatch[1]}&page=0`;
                    detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });
                }

                const content = cheerio.load(detailResponse.data);

                const dateMatch = detailResponse.data.match(/"pubDate": "(.*)"/);
                if (dateMatch === null) {
                    // PubDates of posts in 'fengwen' are in an informal format.

                    item.pubDate = parseRelativeDate(content('.time1').text());
                } else {
                    item.pubDate = timezone(parseDate(dateMatch[1]), +8);
                }

                item.description = content('.all-txt').html() || content('.article-txt-content').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `观察者网 - ${config[category].title}`,
        link: rootUrl,
        item: items,
    };
};
