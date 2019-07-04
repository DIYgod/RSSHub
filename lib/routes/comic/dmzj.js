const got = require('@/utils/got');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: `http://v3api.dmzj.com/comic/comic_${ctx.params.id}.json`,
    });

    const data = response.data;

    ctx.state.data = {
        title: `动漫之家 - ${data.title}`,
        link: `https://manhua.dmzj.com/${ctx.params.name}/`,
        description: data.description,
        item: data.chapters
            .map((i) => i.data)
            .reduce((all, cur) => [].concat(all, cur))
            .sort((a, b) => (a.updatetime > b.updatetime ? 1 : a.updatetime < b.updatetime ? -1 : 0))
            .map((item) => ({
                title: item.chapter_title,
                description: `<h1>第${item.chapter_title}话</h1><h2>${data.title}</h2>`,
                pubDate: new Date(item.updatetime * 1000).toUTCString(),
                guid: item.chapter_id,
                link: `https://manhua.dmzj.com/${ctx.params.name}/${item.chapter_id}.shtml?cid=${ctx.params.id}`,
            })),
    };
};
