const axios = require('../../utils/axios');
const config = require('../../config');

module.exports = async (ctx) => {
    const liststr = ctx.query.list;
    const list = decodeURI(liststr).split(',');
    const requests = list.map(async (route) => {
        const url = `http://localhost:${config.connect.port}${route}.json`;
        return await axios({
            method: 'get',
            url: url,
        });
    });

    const datalist = await Promise.all(requests);
    const data = datalist.map((res) => res.data);

    const title = data.map((res) => res.title);
    const items = data
        .reduce(
            (acc, current) =>
                acc.concat(
                    current.items.map((item) => ({
                        title: `「${current.title}」${item.title}`,
                        pubDate: item.date_published,
                        link: (item.guid = item.url),
                        description: item.summary,
                    }))
                ),
            []
        )
        .sort((a, b) => Date.parse(a.pubDate) - Date.parse(b.pubDate));
    ctx.state.data = {
        title: title.join(' | '),
        link: ctx.url,
        item: items,
    };
};
