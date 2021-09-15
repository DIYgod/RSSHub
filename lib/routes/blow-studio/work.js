const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: `https://www.blowstudio.es/work/`,
    });
    const data = response.data;
    const $ = cheerio.load(data); // 使用 cheerio 加载返回的 HTML
    const list = $('.portfolios.normal > ul > li').get().slice(0, 10);
    const articledata = await Promise.all(
        list.map(async (item) => {
            const link = `https://www.blowstudio.es${$(item).find('a').attr('href')}/`;

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
            const imglist = $2('div.attachment-grid img').get();
            const mainvideo = $2('.single-page-vimeo-div').attr('data-video-id');

            const img = imglist.map((item) => ({
                img: $2(item).attr('src'),
            }));
            const single = {
                mainvideo,
                describe: $2('div.portfolio-content > div:nth-child(2)').html(),
                title: $2('div.portfolio-content > div:nth-child(1)').text(),
                images: img,
                link,
            };
            ctx.cache.set(link, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: 'Blow Studio',
        link: 'http://blowstudio.es',
        description: $('description').text(),
        item: list.map((item, index) => {
            let content = '';
            const videostyle = `width="640" height="360"`;
            const imgstyle = `style="max-width: 650px; height: auto; object-fit: contain; flex: 0 0 auto;"`;

            content += `<iframe ${videostyle} src='https://player.vimeo.com/video/${articledata[index].mainvideo}' frameborder='0' webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe><br>`;
            content += articledata[index].describe;

            if (articledata[index].images) {
                for (let p = 0; p < articledata[index].images.length; p++) {
                    content += `<img ${imgstyle} src="${articledata[index].images[p].img}"><br>`;
                }
            }

            return {
                title: articledata[index].title,
                description: content,
                link: articledata[index].link,
            };
        }),
    };
};
