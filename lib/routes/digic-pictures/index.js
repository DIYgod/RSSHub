const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const { menu, tags } = ctx.params;
    const url = `https://digicpictures.com/${menu}/${tags}`;
    const response = await got({
        method: 'get',
        url,
    });
    const data = response.data;
    const $ = cheerio.load(data);
    const list = $('ul#articles-slider li').get().slice(0, 5);
    const articledata = await Promise.all(
        list.map(async (item) => {
            item = $(item);
            const link = item.find('a').attr('href');
            const cache = await ctx.cache.get(link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const response2 = await got({
                method: 'get',
                url: link,
            });

            const articledata = response2.data;
            const $2 = cheerio.load(articledata);
            const title = $2('div#main-content>div>div>div').find('h1').text();
            const time = $2('div#main-content>div>div>div:nth-child(1) p').text();
            const images = $2('#main-slider img')
                .get()
                .map((item) => $2(item).attr('src'));
            const content = $2('div#main-content>div>div>div:nth-child(2)')
                .html()
                .replace(/<span style="(.*?)">/g, '')
                .replace('<span>', '<br>')
                .replace(/<.?p>/g, '');
            const single = {
                title,
                link,
                time,
                content,
                images,
            };
            ctx.cache.set(link, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: 'Digic Picture',
        link: 'https://www.digicpictures.com/',
        item: list.map((item, index) => {
            let content = '';
            const imgstyle = `style="max-width: 650px; height: auto; object-fit: contain; flex: 0 0 auto;"`;

            content += `${articledata[index].time}<br>${articledata[index].content}<br>`;
            if (articledata[index].images) {
                for (let p = 0; p < articledata[index].images.length; p++) {
                    content += `<img ${imgstyle} src="${articledata[index].images[p]}"><br>`;
                }
            }
            return {
                title: `${articledata[index].title}`,
                description: content,
                link: `${articledata[index].link}`,
                pubDate: `${articledata[index].time}`,
            };
        }),
    };
};
