const axios = require('@/utils/axios');

module.exports = async (ctx) => {
    const {
        data: { data },
    } = await axios.get('https://app.jike.ruguoapp.com/1.0/dailies/list');

    ctx.state.data = {
        title: '即刻小报',
        link: 'https://jike.app/',
        description: '不定期呈现的即刻内容精选',
        item: data.map((item) => ({
            title: item.title,
            description: `<img referrerpolicy="no-referrer" src="${item.picture}">`,
            pubDate: new Date(item.date).toUTCString(),
            link: `https://m.okjike.com/dailies/${item.id}`,
        })),
    };
};
