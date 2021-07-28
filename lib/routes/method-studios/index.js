const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const menu = ctx.params.menu || 'features';
    const response = await got({
        method: 'get',
        url: `https://www.methodstudios.com/en/${menu}`,
    });
    const data = response.data;
    const $ = cheerio.load(data); // 使用 cheerio 加载返回的 HTML
    const list = $('div.grid>div.grid-item>div a').get().slice(0, 6);
    const articledata = await Promise.all(
        list.map(async (item) => {
            const link = `https:${$(item)
                .attr('href')
                .replace(/https:/, '')}`;

            const cache = await ctx.cache.get(link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const response2 = await got({
                method: 'get',
                url: link,
            });

            const articleHtml = response2.data;
            const $2 = cheerio.load(articleHtml);

            $2('div.carousel-text').remove();
            $2('div.carousel-nav').remove();
            $2('i').remove();
            const content = $2('.content-placeholder')
                .html()
                .replace(/<video*.+poster=/g, '<video controls="controls" poster=')
                .replace(/<div*.+>/g, '')
                .replace(/<.?div>/g, '');
            const single = {
                describe: content,
                title: $2('.content-placeholder').find('h2').text(),
                link: link,
            };
            ctx.cache.set(link, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: `Method Studios | ${menu}`,
        link: 'https://www.methodstudios.com/',
        description: $('description').text(),
        item: list.map((item, index) => ({
            title: `${articledata[index].title}`,
            description: `${articledata[index].describe}`,
            link: `${articledata[index].link}`,
        })),
    };
};
