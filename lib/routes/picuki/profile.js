const got = require('@/utils/got');
const cheerio = require('cheerio');
const chrono = require('chrono-node');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const url = `https://www.picuki.com/profile/${id}`;

    const response = await got.get(url);
    const $ = cheerio.load(response.data);

    const profile_name = $('.profile-name-bottom').text();
    const profile_img = $('.profile-avatar > img').attr('src');
    const profile_description = $('.profile-description').text();

    const list = $('ul.box-photos [data-s="media"]').get();

    ctx.state.data = {
        title: `${profile_name} (@${id}) - Picuki`,
        link: url,
        image: profile_img,
        description: profile_description,
        item: list.map((post) => {
            post = $(post);
            const post_image = post.find('.post-image').attr('src');
            const post_description = post.find('.photo-description').text().trim();
            const post_link = post.find('.photo > a').attr('href');
            const post_time = post.find('.time');
            return {
                title: post_description || 'Untitled',
                author: `@${id}`,
                description: `<img src="${post_image}">` + (post_description.length > 100 ? `<p>${post_description}</p>` : ''),
                link: post_link,
                pubDate: post_time ? chrono.parseDate(post_time.text()) : new Date(),
            };
        }),
    };
};
