const axios = require('../../utils/axios');

module.exports = async (ctx) => {
    const response = await axios({
        method: 'get',
        url: 'https://www.weseepro.com/api/v1/message/ground/spam?pageNumber=1&pageSize=20',
    });

    const data = response.data.data.data;

    ctx.state.data = {
        title: '刷屏-最新',
        link: 'https://www.weseepro.com',
        item: data.map(({ data: { spam } }) => ({
            title: spam.content,
            link: `https://www.weseepro.com/mine/article?uuid=${spam.uuid}`,
            description: `
                <img referrerpolicy="no-referrer" src="${spam.link.img_url}"/><br><br>
                <a href="${spam.link.url}">${spam.link.summary}</a><br><br>
                <strong>${spam.topMessage.account.name}</strong>: ${spam.topMessage.content}
              `,
            pubDate: new Date(spam.spam_add_time).toUTCString(),
        })),
    };
};
