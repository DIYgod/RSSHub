const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

const generateResponse = (items) => ({
    // 源标题
    title: 'Soul 热门瞬间',
    // 源链接
    link: 'https://api-h5.soulapp.cn/html/v2/post/hot?postIdEcpt',
    item: items.map((item) => ({
        title: `「${item.uName}」的瞬间：${item.pureContent}`,
        author: item.uName,
        description: item.content,
        pubDate: parseDate(item.createTime),
        guid: item.pId,
        link: `https://w3.soulsmile.cn/activity/#/web/topic/detail?postIdEcpt=${item.pId}`,
    })),
});

module.exports = async (ctx) => {
    // 根据不同用户瞬间会得到不同的结果，这里提供一些例子
    const defaultPid = 'NXJiSlM5V21kamJWVlgvZUh1NEExdz09';
    const userPid = ctx.params.pid || defaultPid;
    const examplePids = userPid.split('/');

    const rsps = await Promise.all(
        examplePids.map((pId) =>
            got({
                method: 'get',
                url: `https://api-h5.soulapp.cn/html/v2/post/hot?postIdEcpt=${pId}`,
            })
        )
    );

    const allItems = [];
    rsps.forEach((response) => {
        // 瞬间信息（数组）
        let items = response.data.data.posts;

        items = items.map((item) => {
            const pureContent = `${item.content}`;
            let content = pureContent.replace(/\n/, '<br />');

            if (item.attachments) {
                for (const attachment of item.attachments) {
                    if (attachment.type === 'IMAGE') {
                        content += '<br />';
                        content += `<img src="${attachment.fileUrl}" />`;
                    } else if (attachment.type === 'VIDEO') {
                        content += '<br />';
                        content += `<video controls="controls" src="${attachment.fileUrl}" width="640" height="360"></video>`;
                    } else if (attachment.type === 'AUDIO') {
                        content += '<br />';
                        content += `<audio controls="controls" src="${attachment.fileUrl}" width="360" height="120"></audio>`;
                    }
                }
            }

            return {
                pId: item.postIdEcpt,
                pureContent,
                content,
                createTime: item.createTime,
                uId: item.authorIdEcpt,
                uName: item.signature,
            };
        });

        allItems.push(...items);
    });

    const uniqAllItems = allItems.filter((value, idx, arr) => arr.findIndex((item) => item.pId === value.pId) === idx);

    ctx.state.data = generateResponse(uniqAllItems);
};
