const got = require('@/utils/got');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://www.weseepro.com/api/v1/message/stream/circle/2?end_uuid=&field_uuid=hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh',
    });

    const data = response.data.data.field_messages;

    ctx.state.data = {
        title: '刷屏-朋友圈',
        link: 'https://www.weseepro.com',
        item: data.map((item) => {
            const description = `${item.message.account.name}: ${item.message.message_text.content}`;
            let imgs = '';

            if (item.message.link) {
                imgs = item.message.link.url.split(',').reduce((imgs, img) => {
                    imgs += `
            <img src="${img}"/>
          `;
                    return imgs;
                }, '');
            }

            return {
                title: description,
                link: `https://www.weseepro.com/v/ask?uuid=${item.message_uuid}`,
                description: `
          ${description}<br><br>
          ${imgs}
        `,
                pubDate: new Date(item.message.message_text.add_time).toUTCString(),
            };
        }),
    };
};
