const got = require('@/utils/got');

module.exports = async (ctx) => {
    const uid = ctx.params.uid;

    const rootUrl = 'https://tieba.baidu.com';
    const userUrl = `${rootUrl}/home/get/getthread?un=${uid}&pn=1&ie=utf8`;
    const response = await got({
        method: 'get',
        url: userUrl,
    });

    ctx.state.data = {
        title: `${uid}的贴子 - 百度贴吧`,
        link: `${rootUrl}/home/main?un=${uid}`,
        item: response.data.data.thread_list.map((item) => {
            let media = '';
            if (item.media) {
                for (const m of item.media) {
                    media += `<img src="${m.big_pic}">`;
                }
            }
            return {
                title: item.title,
                description: `<p>${item.content}</p>${media}`,
                pubDate: new Date(item.create_time * 1000).toUTCString(),
                link: `https://tieba.baidu.com/p/${item.thread_id}?pid=${item.post_id}&cid=#${item.post_id}`,
            };
        }),
    };
};
