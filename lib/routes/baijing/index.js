const got = require('@/utils/got');
const date = require('@/utils/date');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'http://www.baijingapp.com/api/get_more_articles/',
    });

    const data = JSON.parse(response.data.substr(1, response.data.length - 1));

    const output = data.data.list.map((item) => {
        const title = item.title;
        const link = 'https://www.baijingapp.com/article/' + item.id;
        const pubDate = date(item.time.replace(' ', ''));
        const author = item.user_name;
        const description = `<img src="${item.image}">`;
        const single = {
            title,
            link,
            pubDate,
            author,
            description,
        };

        return single;
    });

    ctx.state.data = {
        title: `白鲸出海`,
        desription: '白鲸出海 - 泛互联网出海服务平台',
        item: output,
    };
};
