const got = require('@/utils/got');

async function load(aid) {
    const response = await got({
        method: 'get',
        url: `https://api.bilibili.com/x/article/archives?ids=${aid}`,
    });
    return response.data;
}

async function ProcessFeed(aids, caches) {
    const res = [];
    for (const a of aids.slice(0, 5)) {
        const aid = a.aid;
        let data = await caches.tryGet('av' + aid, async () => await load(aid));
        if (data.code != 0) {
            continue;
        }
        data = data.data[aid + ''];
        res.push({
            title: data.title,
            description: data.desc,
            pubDate: new Date(data.pubdate * 1000).toUTCString(),
            author: data.owner.name,
            link: `https://www.bilibili.com/video/av${aid}`,
            guid: `https://www.bilibili.com/video/av${aid}`,
        });
    }
    return res;
}
module.exports = {
    ProcessFeed,
};
