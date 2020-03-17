const got = require('@/utils/got');

module.exports = async (ctx) => {
    const link = 'https://wolley.io/';

    const response = await got({
        method: 'get',
        url: `https://wolley.io/api/submissions/list?page=1&limit=30`,
        headers: {
            Referer: link,
        },
    });

    const data = response.data.data;

    ctx.state.data = {
        title: `wolley`,
        link,
        description: '',

        item: data.map((item) => {
            let item_title = item.title;
            let item_url = item.url;
            let item_content = '';

            if (item.content !== '') {
                item_content = `分享理由: ${item.content}<br>`;
            }

            // 当 item.url 不存在时，设置 url 为 wolley 的文章地址
            if (item.url === undefined) {
                item_url = `https://wolley.io/item/${item.id}`;
            }
            if (item.type === 'question') {
                item_title = `提问: ${item_title}`;
                item_content = `提问内容: ${item.content}<br>`;
            }

            return {
                title: item_title,
                description: `${item_content}via <a href=https://wolley.io/user/${item.user.handler}>@${item.user.handler}</a><br><a href=https://wolley.io/item/${item.id}>Comments</a>`,
                pubDate: item.createdAt,
                link: item_url,
            };
        }),
    };
};
