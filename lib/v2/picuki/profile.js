const got = require('@/utils/got');
const cheerio = require('cheerio');
const chrono = require('chrono-node');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const displayVideo = ctx.params.displayVideo !== '0';

    const profileUrl = `https://www.picuki.com/profile/${id}`;

    const response = await got.get(profileUrl);
    const $ = cheerio.load(response.data);

    const profileName = $('.profile-name-bottom').text();
    const profileImg = $('.profile-avatar > img').attr('src');
    const profileDescription = $('.profile-description').text();

    const list = $('ul.box-photos [data-s="media"]').get();

    async function getMedia(url) {
        const getPost = async () => {
            const response = await got.get(url, {
                headers: {
                    Referer: profileUrl,
                },
            });
            return response.data;
        };
        let data = await ctx.cache.tryGet(url, getPost);
        if (Object.prototype.toString.call(data) === '[object Object]') {
            // oops, it's a json, maybe it's an old cache from the old version of this route!
            data = await getPost();
            // re-cache it
            await ctx.cache.set(url, data);
        }
        const $ = cheerio.load(data);
        // Instagram 允许最多 10 条图片/视频任意混合于一条 post，picuki 在所有情况下都会将它（们）置于 .single-photo 内
        let html = '';
        $('.single-photo img,video').each((_, item) => {
            html += $(item).toString(); // 可能是视频，也可能是图片，格式都比较友好，这里直接添加
        });
        return html;
    }

    function deVideo(media) {
        const $ = cheerio.load(media);
        let media_deVideo = '';
        $('img,video').each((_, medium) => {
            const tag = medium.name;
            medium = $(medium);
            const poster = medium.attr('poster');
            // 如果有 poster 属性，表明它是视频，将它替换为它的 poster；如果不是，就原样返回
            media_deVideo += poster ? `<img src='${poster}' alt='video poster'>` : tag === 'img' ? medium.toString() : '';
        });
        return media_deVideo;
    }

    const items = await Promise.all(
        list.map(async (post) => {
            post = $(post);

            const post_link = post.find('.photo > a').attr('href');
            const post_time = post.find('.time');
            const media_displayVideo = await getMedia(post_link);
            const post_text = post
                .find('.photo-description')
                .text()
                .trim()
                .replaceAll(/[^\S\n]+/g, ' ')
                .replaceAll(/((?<=\n|^)[^\S\n])|([^\S\n](?=\n|$))/g, '');
            const title = post_text.replaceAll('\n', ' ') || 'Untitled';
            let description = post_text.replaceAll('\n', '<br>');
            description = (displayVideo ? media_displayVideo : deVideo(media_displayVideo)) + (description ? `<p>${description}</p>` : '');
            const pubDate = post_time ? chrono.parseDate(post_time.text()) : new Date();

            const locationLink = post.find('.photo-location .icon-globe-alt a');
            if (locationLink.length) {
                // add location
                const locationUrl = locationLink.attr('href');
                const location = locationUrl ? `<a href="${locationUrl}">${locationLink.text()}</a>` : locationLink.text();
                description += `<p>📍 <small>${location}<small></p>`;
            }

            return {
                title,
                author: `@${id}`,
                description,
                link: post_link,
                pubDate,
            };
        })
    );

    ctx.state.data = {
        title: `${profileName} (@${id}) - Picuki`,
        link: profileUrl,
        image: profileImg,
        description: profileDescription,
        item: items,
    };
};
