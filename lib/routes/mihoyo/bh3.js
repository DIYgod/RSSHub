const got = require('@/utils/got');
const cheerio = require('cheerio');

const rootUrl = 'https://www.bh3.com/content/bh3Cn/getContentList?pageSize=10&pageNum=1&channelId=';

const config = {
    latest: {
        id: '171',
        title: '最新',
    },
    news: {
        id: '172',
        title: '动态',
    },
    notice: {
        id: '173',
        title: '公告',
    },
    activity: {
        id: '174',
        title: '活动',
    },
    strategy: {
        id: '175',
        title: '补给',
    },
};

module.exports = async (ctx) => {
    const cfg = config[ctx.params.type];
    if (!cfg) {
        throw Error(`Bad type: ${ctx.params.type}. See <a href="https://docs.rsshub.app/game.html#beng-huai-3-you-xi-gong-gao">docs</a>`);
    }

    const response = await got({
        method: 'get',
        url: rootUrl + cfg.id,
    });

    const list = response.data.data.list.map((item) => ({
        title: item.title,
        link: `https://www.bh3.com/news/${item.contentId}`,
        pubDate: new Date(item.start_time).toUTCString(),
    }));

    ctx.state.data = {
        title: `崩坏3作战资讯 - ${cfg.title}`,
        link: `https://www.bh3.com/news/cate/${cfg.id}`,
        item: await Promise.all(
            list.map(
                async (item) =>
                    await ctx.cache.tryGet(item.link, async () => {
                        const contentResponse = await got({ method: 'get', url: item.link });
                        const content = cheerio.load(contentResponse.data);
                        item.description = content('div.article__bd').html();
                        return item;
                    })
            )
        ),
    };
};
