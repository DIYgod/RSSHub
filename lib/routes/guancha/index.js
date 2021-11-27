const got = require('@/utils/got');
const cheerio = require('cheerio');
const date = require('@/utils/date');

const config = {
    review: { title: '评论 & 研究', query: '.module-news-main' },
    story: { title: '要闻', query: '.img-List' },
    fengwen: { title: '风闻', query: '.fengwen-list' },
    redian: { title: '热点' },
    gundong: { title: '滚动' },
    all: { title: '全部' },
    home: { title: '首页' },
    others: { title: '热点 & 滚动' },
};

module.exports = async (ctx) => {
    const total = 10;
    const caty = ctx.params.caty || 'all';
    const rootUrl = 'https://www.guancha.cn';

    let newsList = [],
        redianList = [],
        gundongList = [];

    // 'review', 'story' and 'fengwen' come from homepage.

    if (caty === 'review' || caty === 'story' || caty === 'fengwen' || caty === 'all' || caty === 'home') {
        const response = await got({
            method: 'get',
            url: rootUrl,
        });

        const $ = cheerio.load(response.data);

        const fetchPost = (slice) =>
            slice
                .find('h4.module-title a')

                // Filter some blank links which lead to no contents but 'https://user.guancha.cn'.

                .filter((_, item) => $(item).attr('href') !== 'https://user.guancha.cn')
                .map((_, item) => {
                    item = $(item);
                    const link = item.attr('href');
                    return {
                        title: item.text(),
                        link: (link.indexOf('http') === 0 ? '' : rootUrl) + link,
                    };
                })
                .get();

        if (caty === 'all' || caty === 'home') {
            newsList = fetchPost($(config.review.query))
                .slice(0, total / 3)
                .concat(fetchPost($(config.story.query)).slice(0, total / 3), fetchPost($(config.fengwen.query)).slice(0, total / 3));
        } else {
            newsList = fetchPost($(config[caty].query)).slice(0, total);
        }
    }

    // 'redian' and 'gundong' come from api.

    if (caty === 'redian' || caty === 'all' || caty === 'others') {
        const response = await got({
            method: 'get',
            url: `${rootUrl}/api/redian.htm`,
        });
        redianList = response.data.items
            .map((item) => ({
                title: item.TITLE,
                link: `${rootUrl}${item.HTTP_URL}`,
            }))
            .slice(0, caty === 'all' ? total / 3 : total);
    }
    if (caty === 'gundong' || caty === 'all' || caty === 'others') {
        const response = await got({
            method: 'get',
            url: `${rootUrl}/api/gundong.htm`,
        });
        gundongList = response.data.items
            .map((item) => ({
                title: item.TITLE,
                link: `${rootUrl}${item.HTTP_URL}`,
            }))
            .slice(0, caty === 'all' ? total / 3 : total);
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
                    item.link = `https://user.guancha.cn/main/content?id=${jumpMatch[1]}`;
                    detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });
                }

                const content = cheerio.load(detailResponse.data);

                const dateMatch = detailResponse.data.match(/"pubDate": "(.*)"/);
                if (dateMatch === null) {
                    // PubDates of posts in 'fengwen' are in an informal format.

                    item.pubDate = date(content('.time1').text(), 8);
                } else {
                    item.pubDate = new Date(dateMatch[1]).toUTCString();
                }

                item.description = content('.all-txt').html() || content('.article-txt-content').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `观察者网 - ${config[caty].title}`,
        link: rootUrl,
        item: items,
    };
};
