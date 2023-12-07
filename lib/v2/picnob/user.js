const cheerio = require('cheerio');
// const { parseRelativeDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');
const { puppeteerGet } = require('./utils');

module.exports = async (ctx) => {
    const baseUrl = 'https://www.picnob.com';
    const { id } = ctx.params;
    const url = `${baseUrl}/profile/${id}/`;

    const data = await puppeteerGet(url);
    const $ = cheerio.load(data);
    const profileName = $('h1.fullname').text();

    const posts = $('.posts .items .item')
        .toArray()
        .map((item) => {
            const link = $(item).find('.cover_link').attr('href');
            const icon = $(item).find('.corner .icon');
            let type = 'img_sig';
            if (icon.hasClass('icon_video')) {
                type = 'video';
            }
            if (icon.hasClass('icon_multi')) {
                type = 'img_multi';
            }
            return {
                link,
                type,
            };
        });

    const list = await Promise.all(
        posts.slice(0, 10).map(async (item) => {
            const link = `${baseUrl}${item.link}`;
            const data = await ctx.cache.tryGet(link, async () => await puppeteerGet(link));
            const $ = cheerio.load(data);
            item.sum = $('.sum_full').text();
            item.time = $('.time').find('.txt').text();

            if (item.type === 'img_multi') {
                item.images = [
                    ...new Set(
                        $('.post_slide a')
                            .toArray()
                            .map((a) => {
                                a = $(a);
                                return {
                                    ori: a.attr('href'),
                                    url: a.find('img').attr('data-src'),
                                };
                            })
                    ),
                ];
            }
            if (item.type === 'video') {
                item.pic = $('.video_img').find('img').attr('data-src');
                item.video = $('.downbtn').attr('href');
            }
            if (item.type === 'img_sig') {
                item.pic = $('.pic').find('img').attr('data-src');
            }

            return {
                title: item.sum,
                description: art(path.join(__dirname, 'templates/desc.art'), { item }),
                link,
                // pubDate: parseRelativeDate(item.time),
            };
        })
    );

    ctx.state.data = {
        title: `${profileName} (@${id}) - Picnob`,
        description: $('.info .sum').text(),
        link: url,
        image: $('.ava .pic img').attr('src'),
        item: list,
    };
};
