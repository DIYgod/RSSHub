const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const { type, tag } = ctx.params || '';
    const response = await got(`https://axisstudiosgroup.com/${type}/${tag}`);
    const data = response.data;
    const $ = cheerio.load(data); // 使用 cheerio 加载返回的 HTML
    const list = $('a.overlay-link')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('h2').text().trim(),
                link: new URL(item.attr('href'), 'https://axisstudiosgroup.com').href,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const response2 = await got(item.link);

                const $2 = cheerio.load(response2.data);

                $2('.slider-nav').remove(); // 图片导航
                $2('.social-wrapper').remove(); // 社交按钮
                $2('source').remove(); // 莫名其妙的图片
                $2('video').remove(); // 视频标签
                $2('button').remove(); // 按钮
                $2('div.modal.fade').remove(); // 莫名奇妙的图片
                $2('i').remove();
                $2('*')
                    .contents()
                    .filter((_, el) => el.type === 'comment')
                    .remove();

                const mcdrPlaylistControl = $2('.mcdr.playlist-control a');
                const youtube = mcdrPlaylistControl.data('video-type') === 'video/youtube' ? mcdrPlaylistControl.data('video-url').replace('https://www.youtube.com/watch?v=', '') : '';
                const mp4 = mcdrPlaylistControl.data('video-type') === 'video/mp4' ? mcdrPlaylistControl.data('video-url') : '';

                const content = $2('.container-fluid>div:nth-child(2)');
                content.find('video').attr('controls', 'controls');
                content.find('picture').each((_, el) => {
                    el = $2(el);
                    el.replaceWith(el.html());
                });
                content.find('div').each((_, el) => {
                    el = $2(el);
                    if (el.children().length) {
                        el.replaceWith(el.children());
                    }
                });

                let video = '';
                if (mp4) {
                    video = `<video width="100%" controls="controls" width="640" height="360" source src="${mp4}" type="video/mp4"></video><br>`;
                }
                if (youtube) {
                    video = `<iframe id="ytplayer" type="text/html" width="640" height="360" src='https://www.youtube-nocookie.com/embed/${youtube}' frameborder='0' webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe><br>`;
                }

                item.description = video + content.html();
                return item;
            })
        )
    );

    ctx.state.data = {
        title: `Axis Studios | ${type} ${tag ?? ''}`,
        link: 'http://axisstudiosgroup.com',
        description: $('description').text(),
        item: items,
    };
};
