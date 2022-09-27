const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const { parseJSONP } = require('./jsonpHelper');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const category = ctx.params.category;

    const ARTIST = 'YOASOBI',
        SONYJPURL = 'https://www.sonymusic.co.jp',
        BASEURL = 'https://www.sonymusic.co.jp/json/v2/artist',
        POSTFIX = category === 'news' ? 'start/0/count/-1' : 'start/0/count/-1/callback/hotCallback';

    const officialUrl = `https://www.yoasobi-music.jp/${category}`;
    const api = `${BASEURL}/${ARTIST}/${category === 'news' ? 'information' : 'hottopic'}/${POSTFIX}`;
    const title = `LATEST ${category.toUpperCase()}`;

    const response = await got({
        method: 'get',
        url: api,
    });

    const data = parseJSONP(response.data).items.map((item) => {
        const isBio = category === 'biography';
        const randomEmoji = (() => {
            const emojis = ['㊗️', '🎉', '🎊', '🎈', '🎁', '🎂', '🎀', '🎗', '🎆', '🎇', '🎐', '🎑', '🎃'];
            return emojis[Math.floor(Math.random() * emojis.length)];
        })();

        return {
            id: isBio ? null : item.id,
            title: isBio ? `${randomEmoji} ${item.url}` : item.title,
            category: item.category ?? 'Achievement',
            date: isBio ? item.url : item.date,
            description: isBio ? item.kiji : item.article,
            image: !isBio ? null : item.image_url === '' ? null : `${SONYJPURL}${item.image_url}`,
        };
    });

    ctx.state.data = {
        // the source title
        title,
        // the source url
        link: officialUrl,
        // the source description
        description: `Yoasobi's latest ${category}`,
        // iterate through all leaf objects
        item: data.map((i) => ({
            // the article title
            title: i.title,
            // the article content
            description: art(path.join(__dirname, 'templates/info.art'), {
                image: i.image,
                category: i.category,
                description: i.description.replace(/\n/g, '<br>'),
            }),
            // the article publish time
            pubDate: parseDate(i.date),
            // guid
            guid: i.title + i.date,
            // the article link
            link: i.id ? `${officialUrl}/${i.id}` : officialUrl,
            category: i.category,
        })),
    };
};
