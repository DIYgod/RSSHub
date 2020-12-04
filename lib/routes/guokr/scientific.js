const got = require('@/utils/got');

module.exports = async (ctx) => {
    const response = await got.get('https://www.guokr.com/apis/minisite/article.json?retrieve_type=by_subject&limit=20&offset=0');

    const result = response.data.result;

    ctx.state.data = {
        title: '果壳网 科学人',
        link: 'https://www.guokr.com/scientific',
        description: '果壳网 科学人',
        item: result.map((item) => ({
            title: item.title,
            description: `${item.summary}<br><img src="${item.image_info ? item.image_info.url : item.small_image}">`,
            pubDate: item.date_published,
            link: item.url,
            author: item.author.nickname,
        })),
    };
};
