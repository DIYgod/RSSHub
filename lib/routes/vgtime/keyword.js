const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const { keyword = '' } = ctx.params;
    const response = await got({
        method: 'get',
        url: `http://www.vgtime.com/search/load.jhtml?keyword=${encodeURIComponent(keyword)}&type=topic&typeTag=2&page=1&pageSize=12`,
        headers: {
            Referer: `http://www.vgtime.com/search/list.jhtml?keyword=${encodeURIComponent(keyword)}`,
        },
    });
    const data = response.data.data;

    const result = await Promise.all(
        data.map(async (item) => {
            const url = `https://www.vgtime.com/topic/${item.objectId}.jhtml`;

            const description = await ctx.cache.tryGet(url, async () => {
                const result = await got.get(url);

                const $ = cheerio.load(result.data);
                $('h1.art_tit').remove();
                $('.editor_name').remove();

                return $('.vg_main article').html();
            });

            const result = {
                title: item.title,
                author: JSON.parse(item.content).userName,
                pubDate: new Date(item.createTime * 1000).toUTCString(),
                link: url,
                description,
            };

            return Promise.resolve(result);
        })
    );

    ctx.state.data = {
        title: `游戏时光${keyword}资讯`,
        link: `http://www.vgtime.com/search/list.jhtml?keyword=${encodeURIComponent(keyword)}`,
        item: result,
    };
};
