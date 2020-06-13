const url = require('url');
const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

const rootUrl = 'http://news.163.com/';

const config = {
    whole: {
        link: '/special/0001386F/rank_whole.html',
        title: '全站',
    },
    news: {
        link: '/special/0001386F/rank_news.html',
        title: '新闻',
    },
    entertainment: {
        link: '/special/0001386F/rank_ent.html',
        title: '娱乐',
    },
    sports: {
        link: '/special/0001386F/rank_sports.html',
        title: '体育',
    },
    money: {
        link: 'http://money.163.com/special/002526BH/rank.html',
        title: '财经',
    },
    tech: {
        link: '/special/0001386F/rank_tech.html',
        title: '科技',
    },
    auto: {
        link: '/special/0001386F/rank_auto.html',
        title: '汽车',
    },
    lady: {
        link: '/special/0001386F/rank_lady.html',
        title: '女人',
    },
    house: {
        link: '/special/0001386F/rank_house.html',
        title: '房产',
    },
    game: {
        link: '/special/0001386F/rank_game.html',
        title: '游戏',
    },
    travel: {
        link: '/special/0001386F/rank_travel.html',
        title: '旅游',
    },
    edu: {
        link: '/special/0001386F/rank_edu.html',
        title: '教育',
    },
};

const time = {
    hour: {
        index: 0,
        title: '1小时',
    },
    day: {
        index: 1,
        title: '24小时',
    },
    week: {
        index: 2,
        title: '本周',
    },
    month: {
        index: 3,
        title: '本月',
    },
};

module.exports = async (ctx) => {
    ctx.params.category = ctx.params.category ? ctx.params.category : 'whole';
    ctx.params.type = ctx.params.type ? ctx.params.type : 'click';
    ctx.params.time = ctx.params.time ? ctx.params.time : 'day';

    const cfg = config[ctx.params.category];
    if (!cfg) {
        throw Error('Bad category. See <a href="https://docs.rsshub.app/new-media.html#wang-yi-xin-wen-pai-hang-bang">docs</a>');
    } else if (
        (ctx.params.category !== 'whole' && ctx.params.type === 'click' && ctx.params.time === 'month') ||
        (ctx.params.category === 'whole' && ctx.params.type === 'click' && ctx.params.time === 'hour') ||
        (ctx.params.type === 'follow' && ctx.params.time === 'hour')
    ) {
        throw Error('Bad time range. See <a href="https://docs.rsshub.app/new-media.html#wang-yi-xin-wen-pai-hang-bang">docs</a>');
    }

    const currentUrl = ctx.params.category === 'money' ? cfg.link : url.resolve(rootUrl, cfg.link);
    const response = await got({
        method: 'get',
        url: currentUrl,
        responseType: 'buffer',
    });
    const $ = cheerio.load(iconv.decode(response.data, 'gbk'));
    const list = $('div.tabContents')
        .eq(time[ctx.params.time].index + (ctx.params.category === 'whole' ? (ctx.params.type === 'click' ? -1 : 2) : ctx.params.type === 'click' ? 0 : 2))
        .find('table tbody tr td a')
        .map((_, item) => {
            item = $(item);
            return {
                title: item.text(),
                link: item.attr('href'),
            };
        })
        .get();

    const items = await Promise.all(
        list.map(
            async (item) =>
                await ctx.cache.tryGet(item.link, async () => {
                    try {
                        const res = await got({
                            method: 'get',
                            url: item.link,
                            responseType: 'buffer',
                        });
                        const content = cheerio.load(iconv.decode(res.data, 'gbk'));

                        if (content('#ne_wrap').attr('data-publishtime')) {
                            // To get pubDate from most pages.

                            item.pubDate = new Date(content('#ne_wrap').attr('data-publishtime') + ' GMT+8').toUTCString();
                        } else if (content('div.headline span').text()) {
                            // To get pubDate from special pages in Money.
                            // eg. https://money.163.com/20/0513/14/FCH1G10000259E8J.html

                            item.pubDate = new Date(content('div.headline span').text() + ' GMT+8').toUTCString();
                        } else if (content('meta[property="article:published_time"]').attr('content')) {
                            // To get pubDate from pages with image collections.
                            // eg. http://lady.163.com/photoview/00A70026/115695.html

                            item.pubDate = new Date(content('meta[property="article:published_time"]').attr('content')).toUTCString();
                        }

                        if (content('#endText').html()) {
                            // To get description from most pages.

                            item.description = content('#endText').html();
                        } else if (content('div.biz_plus_content').html()) {
                            // To get description from special pages in Money.
                            // eg. https://money.163.com/20/0513/14/FCH1G10000259E8J.html

                            item.description = content('div.biz_plus_content').html();
                        }

                        return item;
                    } catch (err) {
                        return Promise.resolve('');
                    }
                })
        )
    );

    ctx.state.data = {
        title: `网易新闻${time[ctx.params.time].title}${ctx.params.type === 'click' ? '点击' : '跟帖'}榜 - ${cfg.title}`,
        link: rootUrl,
        item: items,
    };
};
