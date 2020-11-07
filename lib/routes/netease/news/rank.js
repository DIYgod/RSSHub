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
        link: '/special/0001386F/game_rank.html',
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
        .slice(0, 15)
        .map((_, item) => {
            item = $(item);
            return {
                link: item.attr('href'),
            };
        })
        .get();

    const items = await Promise.all(
        list.map(
            async (item) =>
                await ctx.cache.tryGet(item.link, async () => {
                    try {
                        const category = item.link.split('.163.com')[0].split('//').pop().split('.').pop();
                        const link = `https://3g.163.com/${category}/article/${item.link.split('/').pop()}`;
                        const detailResponse = await got({
                            method: 'get',
                            url: link,
                        });
                        const content = cheerio.load(detailResponse.data);

                        content('.bot_word').remove();
                        content('video').each(function () {
                            content(this).attr('src', content(this).attr('data-src'));
                        });

                        item.title = content('meta[property="og:title"]').attr('content').replace('_手机网易网', '');
                        item.pubDate = content('meta[property="og:release_date"]').attr('content');
                        item.description = content('.content').html();

                        return item;
                    } catch (err) {
                        return Promise.resolve('');
                    }
                })
        )
    );

    ctx.state.data = {
        title: `网易新闻${time[ctx.params.time].title}${ctx.params.type === 'click' ? '点击' : '跟帖'}榜 - ${cfg.title}`,
        link: currentUrl,
        item: items,
    };
};
