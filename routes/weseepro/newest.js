const axios = require('../../utils/axios');

module.exports = async (ctx) => {
    const response = await axios({
        method: 'get',
        url: 'https://www.weseepro.com/api/v1/message/ground/spam?pageNumber=1&pageSize=20',
    });

    const data = response.data.data.data;
    const generateMessage = (message) => `
            <img referrerpolicy="no-referrer" src="${message.link.img_url}"/><br><br>
            <a href="${message.link.url}">${message.link.summary}</a><br><br>
            <strong>${message.topMessage.account.name}</strong>: ${message.topMessage.content.replace(/\n/g, '<br>')}<br><br>
        `;

    ctx.state.data = {
        title: '刷屏-最新',
        link: 'https://www.weseepro.com',
        item: data.map((item) => {
            let title;
            let link;
            let description;
            let pubDate;

            if (item.data.spam) {
                const spam = item.data.spam;

                title = spam.content;
                link = `https://www.weseepro.com/mine/article?uuid=${spam.uuid}`;
                description = generateMessage(spam);
                pubDate = new Date(spam.spam_add_time).toUTCString();
            } else if (item.data.special) {
                const special = item.data.special;
                const specialMessages = item.data.special_messages;
                const messages = specialMessages.reduce((messages, message) => {
                    messages += generateMessage(message);
                    return messages;
                }, '');

                title = special.title;
                link = `https://www.weseepro.com/mine/album?uuid=${special.uuid}`;
                description = `
                    <img referrerpolicy="no-referrer" src="${special.image}"/><br><br>
                    ${special.description}<br><br>
                    ${messages}
                `;
            } else {
                title = description = '未知类型，请点击<a href="https://github.com/DIYgod/RSSHub/issues">链接</a>提交issue';
            }

            return {
                title,
                link,
                description,
                pubDate,
            };
        }),
    };
};
