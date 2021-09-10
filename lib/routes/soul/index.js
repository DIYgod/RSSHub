const got = require('@/utils/got');

const generateResponse = (info, items) => ({
    // 源标题
    title: `「${info.name}」的瞬间`,
    // 源链接
    link: `https://w3.soulsmile.cn/activity/#/web/user?userIdEcpt=${info.id}`,
    item: items.map((item) => ({
        title: `「${info.name}」的新瞬间：${item.pureContent}`,
        author: info.name,
        description: item.content,
        pubDate: new Date(item.createTime).toUTCString(),
        guid: item.id,
        link: `https://w3.soulsmile.cn/activity/#/web/topic/detail?postIdEcpt=${item.id}`,
    })),
});

module.exports = async (ctx) => {
    const userIdEcpt = ctx.params.id;
    const response = await got({
        method: 'get',
        url: 'https://api-h5.soulapp.cn/html/v2/post/homepage?userIdEcpt=' + userIdEcpt,
    });

    // 瞬间信息（数组）
    let items = response.data.data;

    // 用户信息
    const info = {
        id: userIdEcpt,
        name: null,
    };

    if (items.length === 0) {
        // 未发表过任何瞬间
        const infoResponse = await got({
            method: 'get',
            url: 'https://api-h5.soulapp.cn/html/v2/user/info?userIdEcpt=' + userIdEcpt,
        });

        const infoData = infoResponse.data.data;

        info.name = infoData.signature;
    } else {
        // 发表过瞬间 -> 直接从瞬间信息取用户名
        info.name = items[0].signature;
    }

    items = items.map((item) => {
        const pureContent = `${item.content}`;
        let content = pureContent.replace(/\n/, '<br />');

        if (item.attachments) {
            for (const attachment of item.attachments) {
                if (attachment.type === 'IMAGE') {
                    content += '<br />';
                    content += `<img src="${attachment.fileUrl}" />`;
                }
            }
        }

        return {
            id: item.postIdEcpt,
            pureContent,
            content,
            createTime: item.createTime,
        };
    });

    ctx.state.data = generateResponse(info, items);
};
