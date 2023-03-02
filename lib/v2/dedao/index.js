const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const category = ctx.params.category ?? 'news';

    const rootUrl = `https://www.igetget.com/${category === 'video' ? 'video' : 'news'}`;

    const response = await got({
        method: 'get',
        url: rootUrl,
    });

    const data = JSON.parse(response.data.match(/window.__INITIAL_STATE__= (.*);<\/script>/)[1]);

    let items = (category === 'news' ? data.news : category === 'figure' ? data.figure : data.videoList).map((item) => ({
        title: item.title,
        pubDate: parseDate(item.online_time),
        link: `${rootUrl}/${category === 'news' ? 'article/' : category === 'figure' ? 'people/' : ''}${item.online_time.split('T')[0].split('-').join('')}/${item.token}`,
    }));

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = cheerio.load(detailResponse.data);

                item.description = content('.menu-article').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `得到${category === 'video' ? '' : '大事件'} - ${category === 'news' ? '新闻' : category === 'figure' ? '人物故事' : '视频'}`,
        link: rootUrl,
        item: items,
        description: data.description,
    };
};
