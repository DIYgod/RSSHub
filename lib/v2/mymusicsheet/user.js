const got = require('@/utils/got');
const cheerio = require('cheerio');
const asyncPool = require('tiny-async-pool');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const baseUrl = 'https://www.mymusicsheet.com';
    const user = ctx.params.user;

    // get page data
    const response = await got(`${baseUrl}/${user}?viewType=sheet&orderBy=createdAt`);
    const $ = cheerio.load(response.data);

    // / get avatar
    const div = $('.profile-img');
    const backgroundImageUrl = div.css('background-image');
    const avatarUrl = backgroundImageUrl.replace(/url\(['"]?([^'"]+)['"]?\)/, '$1');

    // / get sheets
    const list = $('sheet-table td.title')
        .toArray()
        .map((item) => {
            item = $(item);
            const musicName = item.find('div.line-clamp').first().text().trim();
            const musicianName = item.find('.musician.line-clamp').first().text().trim();
            const link = item.find('a').attr('href');
            const price = item.nextAll().find('div.line-clamp').last().text().trim();
            return {
                title: `${user} | ${musicName} ${musicianName} | ${price}`,
                link: `${baseUrl}${link}`,
                itunes_item_image: avatarUrl,
            };
        });

    // get descriptions
    const items = [];
    for await (const item of asyncPool(4, list, (item) =>
        ctx.cache.tryGet(item.link, async () => {
            const { data: response } = await got(item.link);
            const $ = cheerio.load(response);

            // 检查页面中是否有YouTube视频，并加入到description中
            let videoId;
            const youtubePlayer = $('mp-youtube-player');
            if (youtubePlayer.length > 0) {
                const styleAttr = youtubePlayer.attr('style');
                const match = /https:\/\/i\.ytimg\.com\/vi\/([^/]+)\//.exec(styleAttr);
                if (match) {
                    videoId = match[1];
                }
            }
            const content = $('sheet-post-description .post-description p')
                .map((index, element) => $(element).text().trim())
                .get();
            item.description = art(path.join(__dirname, 'templates/description.art'), { videoId, content });

            return item;
        })
    )) {
        items.push(item);
    }
    const orderedItems = list.map((item) => items.find((i) => i.link === item.link));

    ctx.state.data = {
        title: `${user}'s sheets`,
        link: `https://www.mymusicsheet.com/${user}?viewType=sheet&orderBy=createdAt`,
        item: orderedItems,
    };
};
