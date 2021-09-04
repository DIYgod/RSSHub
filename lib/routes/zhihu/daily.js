const got = require('@/utils/got');
const utils = require('./utils');
const { parseDate } = require('@/utils/parse-date');

// 参考：https://github.com/izzyleung/ZhihuDailyPurify/wiki/%E7%9F%A5%E4%B9%8E%E6%97%A5%E6%8A%A5-API-%E5%88%86%E6%9E%90
// 文章给出了v4版 api的信息，包含全文api

module.exports = async (ctx) => {
    const api = 'https://news-at.zhihu.com/api/4/news';
    const listRes = await got({
        method: 'get',
        url: `${api}/latest`,
        headers: {
            ...utils.header,
            Referer: `${api}/latest`,
        },
    });
    // 根据api的说明，过滤掉极个别站外链接
    const storyList = listRes.data.stories.filter((el) => el.type === 0);
    const date = listRes.data.date;

    const articleList = storyList.map((item) => ({
        title: item.title,
        pubDate: parseDate(date, 'YYYYMMDD'),
        link: item.url,
        guid: item.url,
        storyId: item.id,
    }));

    const items = await Promise.all(
        articleList.map(async (item) => {
            const url = `${api}/${item.storyId}`;
            const description = await ctx.cache.tryGet(item.link, async () => {
                const storyDetail = await got({
                    method: 'get',
                    url: url,
                    headers: {
                        Referer: url,
                    },
                });
                return utils.ProcessImage(storyDetail.data.body.replace(/<div class="meta">([\s\S]*?)<\/div>/g, '<strong>$1</strong>').replace(/<\/?h2.*?>/g, ''));
            });
            item.description = description;
            return Promise.resolve(item);
        })
    );

    ctx.state.data = {
        title: '知乎日报',
        link: 'https://daily.zhihu.com',
        description: '每天3次，每次7分钟',
        item: items,
    };
};
