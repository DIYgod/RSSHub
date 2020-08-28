const got = require('@/utils/got');

module.exports = async (ctx) => {
    const response = await got({
        method: 'post',
        url: 'https://apinew.juejin.im/recommend_api/v1/short_msg/recommend',
        json: { id_type: 4, sort_type: 300, cursor: '0', limit: 20 },
    });

    const items = response.data.data.map((item) => {
        const content = item.msg_Info.content;
        const title = content;
        const guid = item.msg_id;
        const link = `https://juejin.im/pin/${guid}`;
        const pubDate = new Date(parseInt(item.msg_Info.ctime) * 1000).toUTCString();
        const author = item.author_user_info.user_name;
        const imgs = item.msg_Info.pic_list.reduce((imgs, item) => {
            imgs += `
          <img src="${item}"><br>
        `;
            return imgs;
        }, '');
        const description = `
            ${content.replace(/\n/g, '<br>')}<br>
            ${imgs}<br>
        `;

        return {
            title,
            link,
            description,
            guid,
            pubDate,
            author,
        };
    });

    ctx.state.data = {
        title: '沸点 - 推荐',
        link: 'https://juejin.im/pins/recommended',
        item: items,
    };
};
