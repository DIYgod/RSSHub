const got = require('@/utils/got');
const utils = require('./utils');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const { data: response } = await got(`https://www.dongqiudi.com/api/old/columns/${id}`);

    const list = response.data.map((item) => ({
        title: item.title,
        link: `https://www.dongqiudi.com/articles/${item.aid}.html`,
        mobileLink: `https://m.dongqiudi.com/article/${item.aid}.html`,
        pubDate: parseDate(item.show_time, 'X'),
    }));

    const out = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.mobileLink);

                utils.ProcessFeedType3(item, response);

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `懂球帝专题-${response.title}`,
        description: response.description,
        link: `https://www.dongqiudi.com/special/${id}`,
        item: out.filter((e) => e),
    };
};
