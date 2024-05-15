const { instance, evil } = require('./helper');

const api = 'http://www.dean.swust.edu.cn/cms/portal/notice.json';
const page = 'http://www.dean.swust.edu.cn/notice/page/';
const tag = 'http://www.dean.swust.edu.cn/notice/tag/';

module.exports = async (ctx) => {
    const type = ctx.params.type || 1;

    const response = await instance.get(api);
    const responseData = evil(response.body);
    const data = responseData[type - 1];

    const info = data.name || '';
    const tag_url = data.id || '';

    const resultItems = await Promise.all(
        data.items.map(async (item) => {
            const link = page + item.id;
            const author = item.publisher;
            const date = item.outdate;
            const title = item.title;

            let resultItem = {};

            const value = await ctx.cache.get(link);
            if (value) {
                resultItem = JSON.parse(value);
            } else {
                resultItem = {
                    title,
                    link,
                    pubDate: new Date(date).toUTCString(),
                    author,
                };

                ctx.cache.set(link, JSON.stringify(resultItem));
            }

            return resultItem;
        })
    );

    ctx.state.data = {
        allowEmpty: true,
        title: '西南科技大学教务处 ' + info,
        link: tag + tag_url,
        description: `西南科技大学教务处 ${info}`,
        item: resultItems,
    };
};
