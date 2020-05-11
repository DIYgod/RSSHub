const { instance, evil } = require('./helper');

const api = 'http://www.dean.swust.edu.cn/cms/portal/news.json';
const host = 'http://www.dean.swust.edu.cn/';
const page = 'http://www.dean.swust.edu.cn/news/';

module.exports = async (ctx) => {
    const response = await instance.get(api);
    const data = evil(response.body);

    const resultItems = await Promise.all(
        data.map(async (item) => {
            const title = item.title;
            const date = item.outdate;
            const link = page + item.id;
            const author = item.publisher;

            let resultItem = {};

            const value = await ctx.cache.get(link);
            if (value) {
                resultItem = JSON.parse(value);
            } else {
                resultItem = {
                    title: title,
                    link: link,
                    pubDate: new Date(date).toUTCString(),
                    author: author,
                };

                ctx.cache.set(link, JSON.stringify(resultItem));
            }

            return Promise.resolve(resultItem);
        })
    );

    ctx.state.data = {
        allowEmpty: true,
        title: '西南科技大学教务处 新闻',
        link: host,
        description: '西南科技大学教务处 新闻',
        item: resultItems,
    };
};
