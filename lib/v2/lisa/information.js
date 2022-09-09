const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const { parseJSONP } = require('./jsonpHelper');

module.exports = async (ctx) => {
    const api = 'https://www.sonymusic.co.jp/json/v2/artist/lisa/information/start/0/count/-1';
    const url = 'https://www.sonymusic.co.jp/artist/lisa/info';

    const title = 'NEWS';

    const response = await got({
        method: 'get',
        url: api,
    });

    const data = parseJSONP(response.data).items.map((item) => ({
        id: item.id,
        title: item.title,
        category: item.category,
        date: item.date,
        description: item.article,
    }));

    ctx.state.data = {
        // the source title
        title,
        // the source url
        link: url,
        // the source description
        description: "Let's see what is new about LiSA.",
        // iterate through all leaf objects
        item: data.map((item) => ({
            // the article title
            title: item.title,
            // the article content
            description: `
                <span>Category: ${item.category}</span><br>
                <div>${item.description}</div>
            `,
            // the article publish time
            pubDate: parseDate(item.date),
            // the article link
            link: `${url}/${item.id}`,
        })),
    };
};
