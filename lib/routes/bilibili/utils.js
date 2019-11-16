const got = require('@/utils/got');

async function load(aid) {
    const response = await got({
        method: 'get',
        url: `https://api.bilibili.com/x/article/archives?ids=${aid}`,
    });
    return response.data;
}

const ProcessFeed = async (list, caches) =>
    await Promise.all(
        list
            .filter(async (aid) => {
                const data = await caches.tryGet('av' + aid, async () => await load(aid));
                return data.code === 0;
            })
            .map(async (aid) => {
                let data = await caches.tryGet('av' + aid, async () => await load(aid));
                data = data.data[aid + ''];
                const single = {
                    title: data.title,
                    description:
                        `${data.desc}<br><img src="${data.pic}">` +
                        `<br><iframe src="https://player.bilibili.com/player.html?aid=${aid}" width="640" height="360" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>`,
                    pubDate: new Date(data.pubdate * 1000).toUTCString(),
                    author: data.owner.name,
                    link: `https://www.bilibili.com/video/av${aid}`,
                    guid: `https://www.bilibili.com/video/av${aid}`,
                };
                return Promise.resolve(single);
            })
    );

module.exports = {
    ProcessFeed,
};
