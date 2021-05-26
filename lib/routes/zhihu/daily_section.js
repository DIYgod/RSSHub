const got = require('@/utils/got');
const utils = require('./utils');

// 参考：https://github.com/izzyleung/ZhihuDailyPurify/wiki/%E7%9F%A5%E4%B9%8E%E6%97%A5%E6%8A%A5-API-%E5%88%86%E6%9E%90
// 文章给出了v7版 api的信息，包含全文api

module.exports = async (ctx) => {
    const { sectionId } = ctx.params;
    const listRes = await got({
        method: 'get',
        url: `https://news-at.zhihu.com/api/7/section/${sectionId}`,
        headers: {
            ...utils.header,
            Referer: `https://news-at.zhihu.com/api/7/section/${sectionId}`,
        },
    });
    // 根据api的说明，过滤掉极个别站外链接
    const storyList = listRes.data.stories.filter((el) => el.url.includes('daily.zhihu.com'));
    const resultItem = await Promise.all(
        storyList.map(async (story) => {
            const url = 'https://news-at.zhihu.com/api/7/news/' + story.id;
            const item = {
                title: story.title,
                description: '',
                link: 'https://daily.zhihu.com/story/' + story.id,
            };
            const key = 'daily' + story.id;
            const value = await ctx.cache.get(key);

            if (value) {
                item.description = value;
            } else {
                const storyDetail = await got({
                    method: 'get',
                    url: url,
                    headers: {
                        Referer: url,
                    },
                });
                item.description = utils.ProcessImage(storyDetail.data.body.replace(/<div class="meta">([\s\S]*?)<\/div>/g, '<strong>$1</strong>').replace(/<\/?h2.*?>/g, ''));
                ctx.cache.set(key, item.description);
            }

            return Promise.resolve(item);
        })
    );

    ctx.state.data = {
        title: `${listRes.data.name} - 知乎日报`,
        link: 'https://daily.zhihu.com',
        description: '每天3次，每次7分钟',
        item: resultItem,
    };
};
