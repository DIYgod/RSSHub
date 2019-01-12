const axios = require('../../utils/axios');

module.exports = async (ctx) => {
    const response = await axios.get('https://www.guokr.com/apis/minisite/article.json?retrieve_type=by_subject&limit=20&offset=0');

    const result = response.data.result;

    ctx.state.data = {
        title: '果壳网 科学人',
        link: 'https://www.guokr.com/scientific',
        description: '果壳网 科学人',
        item: result.map((item) => ({
            title: item.title,
            description: `${item.summary}<br><img referrerpolicy="no-referrer" src="${item.image_info.url}">`,
            pubDate: item.date_published,
            link: item.url,
        })),
    };
};
