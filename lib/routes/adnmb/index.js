const got = require('@/utils/got');

const adnmbBaseUrl = 'https://adnmb3.com';
const cdnBaseUrl = 'https://nmbimg.fastmirror.org/image/';

async function getForumInfo(pid, ctx) {
    const cache_key = `adnmb::forum::${pid}`;
    const cache = await ctx.cache.get(cache_key);
    if (cache) {
        return JSON.parse(cache);
    }
    const forumListResponse = await got(`${adnmbBaseUrl}/Api/getForumList`);
    const matchedForum = forumListResponse.data
        .map((a) => a.forums)
        .flat()
        .filter((c) => c.id === pid || c.name === pid || c.showName === pid);
    if (matchedForum.length === 0) {
        throw 'Forum Not Found';
    }
    const basicForumInfo = (({ id, name, showName, msg }) => ({ id, name, showName, msg }))(matchedForum[0]);
    ctx.cache.set(cache_key, JSON.stringify(basicForumInfo));
    return basicForumInfo;
}

module.exports = async (ctx) => {
    const pid = ctx.params.pid;

    const forumInfo = await getForumInfo(pid, ctx);

    const url = forumInfo.name === '时间线' ? `${adnmbBaseUrl}/Api/timeline?page=1` : `${adnmbBaseUrl}/Api/showf?id=${forumInfo.id}&page=1`;
    const response = await got({
        method: 'get',
        url: url,
    });
    const data = response.data;

    const items = [];
    data.forEach((item) => {
        const newItems = {
            title: item.content,
            pubDate: new Date(item.now.replace(/\(.*?\)/g, ' ') + ' +0800').toUTCString(),
            link: `${adnmbBaseUrl}/t/${item.id}`,
        };
        const img = item.img !== '' ? '<img style="max-width: 100%" src="' + cdnBaseUrl + item.img + item.ext + '"/>' : '';
        let replys = '';
        item.replys.forEach((reply) => {
            const replyImg = reply.img !== '' ? '<img style="max-width: 100%" src="' + cdnBaseUrl + reply.img + reply.ext + '"/>' : '';
            replys += `<h4>${reply.title} ${reply.name}  ${reply.now} ID:${reply.userid} No.${reply.id}</h4> </br>
                          ${reply.content}
                          ${replyImg}
                          <hr />
            `;
        });
        newItems.description = `<h2>${item.title} ${item.name}  ${item.now} ID:${item.userid} No.${item.id}</h2> </br>
                          ${item.content}
                           ${img}
                          <hr />
                          ${replys}
            `;
        items.push(newItems);
    });

    ctx.state.data = {
        title: `${forumInfo.showName ? forumInfo.showName : forumInfo.name} - A岛匿名版`,
        link: `${adnmbBaseUrl}/f/${forumInfo.name}`,
        description: forumInfo.msg,
        item: items,
    };
};
