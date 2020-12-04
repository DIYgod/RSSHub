const got = require('@/utils/got');
const md5 = require('@/utils/md5');

module.exports = async (ctx) => {
    const projectID = ctx.params.project;
    const key = ctx.params.key;

    const response = await got({
        method: 'get',
        url: `https://support.qq.com/api/v1/${projectID}/posts`,
        headers: {
            Timestamp: Math.round(+new Date() / 1000).toString(),
            Signature: md5(Math.round(+new Date() / 1000).toString() + key),
        },
    });
    const data = response.data.data;

    ctx.state.data = {
        title: `${projectID} 的 吐个槽新帖`,
        link: `https://support.qq.com/product/${projectID}`,
        description: `${projectID} 的 吐个槽新帖`,
        item: data.map((item) => {
            const pubdate = new Date(item.created_at.replace(' ', 'T') + '+08:00');
            let imgHTML = '';
            if (data.images) {
                for (let i = 0; i < data.images.length; i++) {
                    imgHTML += `<img src="${data.images[i]}">`;
                }
            }
            return {
                title: item.nick_name + ' 的吐槽',
                description: `${item.content}${imgHTML}`,
                pubDate: pubdate.toUTCString(),
                link: `https://support.qq.com/products/${projectID}`,
                guid: `https://support.qq.com/products/${projectID} ${item.id}`,
            };
        }),
    };
};
