const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const { type, tag } = ctx.params || '';
    const response = await got({
        method: 'get',
        url: `https://axisstudiosgroup.com/${type}/${tag}`,
    });
    const data = response.data;
    const $ = cheerio.load(data); // 使用 cheerio 加载返回的 HTML
    const list = $('a.overlay-link').get().slice(0, 13);
    const articledata = await Promise.all(
        list.map(async (item) => {
            const link = `https://axisstudiosgroup.com${$(item)
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

            $2('.slider-nav').remove(); // 图片导航
            $2('.social-wrapper').remove(); // 社交按钮
            $2('source').remove(); // 莫名其妙的图片
            $2('video').remove(); // 视频标签
            $2('button').remove(); // 按钮
            $2('div.modal.fade').remove(); // 莫名奇妙的图片
            $2('i').remove();

            const youtube = $2('.mcdr.playlist-control a').attr('data-video-type') === 'video/youtube' ? $2('.mcdr.playlist-control a').attr('data-video-url').replace('https://www.youtube.com/watch?v=', '') : '';
            const mp4 = $2('.mcdr.playlist-control a').attr('data-video-type') === 'video/mp4' ? $2('.mcdr.playlist-control a').attr('data-video-url') : '';

            const content = $2('.container-fluid>div:nth-child(2)')
                .html()
                .replace(/<video*.+poster=/g, '<video controls="controls" poster=')
                .replace(/<.?picture>/g, '')
                .replace(/<picture*.+>/g, '')
                .replace(/<div*.+>/g, '')
                .replace(/<.?div>/g, '')
                .replace(/<!--*.+-->/g, '');
            const single = {
                describe: content,
                title: $2('.overlay-content').find('h1').text(),
                link,
                mp4,
                youtube,
            };
            ctx.cache.set(link, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: `Axis Studios | ${type} ${tag ? tag : ''}`,
        link: 'http://axisstudiosgroup.com',
        description: $('description').text(),
        item: list.map((item, index) => {
            let video = '';
            if (articledata[index].mp4) {
                video = `<video width="100%" controls="controls" width="640" height="360" source src="${articledata[index].mp4}" type="video/mp4"></video><br>`;
            }
            if (articledata[index].youtube) {
                video = `<iframe id="ytplayer" type="text/html" width="640" height="360" src='https://youtube.com/embed/${articledata[index].youtube}' frameborder='0' webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe><br>`;
            }
            return {
                title: `${articledata[index].title}`,
                description: `${video}+${articledata[index].describe}`,
                link: `${articledata[index].link}`,
            };
        }),
    };
};
