const got = require('@/utils/got');

module.exports = async (ctx) => {
    const comic_id = ctx.params.comicid.startsWith('mc') ? ctx.params.comicid.replace('mc', '') : ctx.params.comicid;
    const link = `https://manga.bilibili.com/detail/mc${comic_id}`;

    const response = await got({
        method: 'POST',
        url: `https://manga.bilibili.com/twirp/comic.v2.Comic/ComicDetail?device=pc&platform=web`,
        json: {
            comic_id: Number(comic_id),
        },
        headers: {
            Referer: link,
        },
    });
    const data = response.data.data;
    const author = data.author_name.join(', ');

    ctx.state.data = {
        title: `${data.title} - 哔哩哔哩漫画`,
        link: link,
        image: data.vertical_cover,
        description: data.classic_lines,
        item: data.ep_list.slice(0, 20).map((item) => ({
            title: item.short_title === item.title ? item.short_title : `${item.short_title} ${item.title}`,
            author: author,
            description: `<img src="${item.cover}">`,
            pubDate: new Date(item.pub_time + ' +0800'),
            link: `https://manga.bilibili.com/mc${comic_id}/${item.id}`,
        })),
    };
};
