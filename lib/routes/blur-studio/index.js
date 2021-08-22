const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: `http://blur.com`,
    });
    const data = response.data;
    const $ = cheerio.load(data); // 使用 cheerio 加载返回的 HTML
    const list = $('.page-title a').get();
    const articledata = await Promise.all(
        list.map(async (item) => {
            const link = $(item).attr('href');
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
            const imglist = $2('.gridded img').get();
            const videolist = $2('.gridded iframe').get();
            const img = imglist.map((item) => ({
                img: $2(item).attr('src'),
            }));
            const video = videolist.map((item) => ({
                video: $2(item).attr('src'),
            }));
            const single = {
                mainvideo: $2('div.project-title').attr('data-video'),
                describe: $2('p').text(),
                title: $2('h1.page-title').text(),
                client: $2('div.client').text(),
                images: img,
                video,
                link,
            };
            ctx.cache.set(link, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: 'Blur Studio',
        link: 'http://blur.com',
        description: $('description').text(),
        item: list.map((item, index) => {
            const Num = /[0-9]+/;
            let content = '';
            const videostyle = `width="640" height="360"`;
            const imgstyle = `style="max-width: 650px; height: auto; object-fit: contain; flex: 0 0 auto;"`;
            content += `Client:${articledata[index].client}<br>${articledata[index].describe}`;
            if (Num.test(articledata[index].mainvideo)) {
                content += `<iframe ${videostyle} src='https://player.vimeo.com/video/${articledata[index].mainvideo}' frameborder='0' webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe><br>`;
            } else {
                content += `<iframe ${videostyle} src='https://youtube.com/embed/${articledata[index].mainvideo}' frameborder='0' webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe><br>`;
            }
            if (articledata[index].images) {
                for (let p = 0; p < articledata[index].images.length; p++) {
                    content += `<img ${imgstyle} src="${articledata[index].images[p].img}"><br>`;
                }
            }
            if (articledata[index].video) {
                for (let v = 0; v < articledata[index].video.length; v++) {
                    content += `<iframe ${videostyle} src='${articledata[index].video[v].video}' frameborder='0' webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe><br>`;
                }
            }

            return {
                title: `${articledata[index].title}`,
                description: `${content}`,
                link: `${articledata[index].link}`,
            };
        }),
    };
};
