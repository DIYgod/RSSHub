const got = require('@/utils/got');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const sort = ctx.params.sort || 'new';

    const link = `https://www.douban.com/gallery/topic/${id}/?sort=${sort}`;

    const api = `https://m.douban.com/rexxar/api/v2/gallery/topic/${id}/items?sort=${sort}&start=0&count=10&status_full_text=1`;
    const response = await got({
        method: 'GET',
        url: api,
        headers: {
            Referer: link,
        },
    });

    const data = response.data.items;
    const title = data[0].topic.name;
    const description = data[0].topic.introduction;

    const out = await Promise.all(
        data.map(async (item) => {
            const type = item.target.type;
            let author;
            let date;
            let description;
            let link;
            let title;
            if (type === 'status') {
                link = item.target.status.sharing_url;
                author = item.target.status.author.name;
                title = author + '的广播';
                date = item.target.status.create_time;
                description = item.target.status.text;
                const images = item.target.status.images;
                if (images) {
                    let i;
                    for (i in images) {
                        description += `<br><img src="${images[i].normal.url}" />`;
                    }
                }
            } else {
                link = item.target.sharing_url;
                author = item.target.author.name;
                title = author + '的日记';
                date = item.target.create_time;

                const id = item.target.id;
                const itemUrl = `https://www.douban.com/j/note/${id}/full`;

                const cache = await ctx.cache.get(link);
                if (cache) {
                    return Promise.resolve(JSON.parse(cache));
                }
                const response = await got.get(itemUrl);
                description = response.data.html;
            }
            const single = {
                title: title,
                link: link,
                author: author,
                pubDate: new Date(date).toUTCString(),
                description: description,
            };

            if (type !== 'status') {
                ctx.cache.set(link, JSON.stringify(single));
            }
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: `${title}-豆瓣话题`,
        description: description,
        link: link,
        item: out,
    };
};
