const got = require('@/utils/got');
const cheerio = require('cheerio');
const chrono = require('chrono-node');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const displayVideo = !!ctx.params.displayVideo;

    const url = `https://www.picuki.com/profile/${id}`;

    const response = await got.get(url);
    const $ = cheerio.load(response.data);

    const profile_name = $('.profile-name-bottom').text();
    const profile_img = $('.profile-avatar > img').attr('src');
    const profile_description = $('.profile-description').text();

    const list = $('ul.box-photos [data-s="media"]').get();

    async function getMedia(url) {
        const response = await got.get(url);
        const $ = cheerio.load(response.data);
        // Instagram 允许最多 10 条图片/视频任意混合于一条 post，picuki 在所有情况下都会将它（们）置于 .single-photo 内
        const media_items = $('.single-photo img,video').get();
        let html = '';
        media_items.forEach((item) => {
            item = $(item);
            html += item.toString(); // 可能是视频，也可能是图片，格式都比较友好，这里直接添加
        });
        return html;
    }

    function deVideo(media) {
        const $ = cheerio.load(media);
        const media_list = $('img,video').get();
        let media_deVideo = '';
        media_list.forEach((medium) => {
            medium = $(medium);
            const poster = medium.attr('poster');
            // 如果有 poster 属性，表明它是视频，将它替换为它的 poster；如果不是，就原样返回
            media_deVideo += poster ? `<img src='${poster}' alt='video poster'>` : medium.toString();
        });
        return media_deVideo;
    }

    const items = await Promise.all(
        list.map(async (post) => {
            post = $(post);

            const post_link = post.find('.photo > a').attr('href');
            const cache = await ctx.cache.get(post_link);

            let cache_d;
            if (cache) {
                cache_d = JSON.parse(cache);
            } else {
                const post_description = post.find('.photo-description').text().trim();
                const post_time = post.find('.time');
                const media_displayVideo = await getMedia(post_link);
                const media = deVideo(media_displayVideo);

                cache_d = {
                    title: post_description || 'Untitled',
                    author: `@${id}`,
                    media_prefix: media,
                    media_displayVideo_prefix: media_displayVideo,
                    description_body: post_description.length > 100 ? `<p>${post_description}</p>` : '',
                    link: post_link,
                    pubDate: post_time ? chrono.parseDate(post_time.text()) : new Date(),
                };

                ctx.cache.set(post_link, JSON.stringify(cache_d));
            }

            cache_d.description = (displayVideo ? cache_d.media_displayVideo_prefix : cache_d.media_prefix) + cache_d.description_body;
            delete cache_d.media_prefix;
            delete cache_d.media_displayVideo_prefix;
            delete cache_d.description_body;
            return cache_d;
        })
    );

    ctx.state.data = {
        title: `${profile_name} (@${id}) - Picuki`,
        link: url,
        image: profile_img,
        description: profile_description,
        item: items,
    };
};
