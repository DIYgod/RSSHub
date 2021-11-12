const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const caty = ctx.params.caty || 'news';
    const rootUrl = `https://www.igetget.com/${caty === 'video' ? 'video' : 'news'}`;

    const response = await got({
        method: 'get',
        url: rootUrl,
    });

    const data = JSON.parse(response.data.match(/window.__INITIAL_STATE__= (.*);<\/script>/)[1]);

    const list = (caty === 'news' ? data.news : caty === 'figure' ? data.figure : data.videoList).map((item) => ({
        title: item.title,
        pubDate: new Date(item.online_time).toUTCString(),
        link: `${rootUrl}/${caty === 'news' ? 'article/' : caty === 'figure' ? 'people/' : ''}${item.online_time.split('T')[0].split('-').join('')}/${item.token}`,
    }));

    const items = await Promise.all(
        list.map((item) =>
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
        title: `得到${caty === 'video' ? '' : '大事件'} - ${caty === 'news' ? '新闻' : caty === 'figure' ? '人物故事' : '视频'}`,
        link: rootUrl,
        item: items,
        description: data.description,
    };
};
