const got = require('@/utils/got');
const { parseJSONP } = require('./jsonpHelper');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const ARTIST = 'YOASOBI',
        BASEURL = 'https://www.sonymusic.co.jp/json/v2/artist',
        POSTFIX = 'start/0/count/-1';

    const api = `${BASEURL}/${ARTIST}/media/${POSTFIX}`;
    const officialUrl = 'https://www.yoasobi-music.jp/media';
    const title = 'LATEST MEDIA';

    const response = await got({
        method: 'get',
        url: api,
    });

    const data = Object.values(parseJSONP(response.data).items)
        .reduce((p, c) => p.concat(c))
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map((item) => ({
            date: item.date,
            weekDay: item.youbi,
            startTime: item.startTime || null,
            endTime: item.endTime || null,
            tvStation: item.media || null,
            title: item.program || item.media,
            description: item.note,
        }));

    ctx.state.data = {
        // the source title
        title,
        // the source url
        link: officialUrl,
        // the source description
        description: "YOASOBI's Latest Media",
        // iterate through all leaf objects
        item: data.map((i) => ({
            // the article title
            title: i.title,
            // the article content
            description: art(path.join(__dirname, 'templates/media.art'), {
                date: i.date,
                weekDay: i.weekDay,
                postFix: i.startTime && i.endTime && i.tvStation ? `${i.startTime} ~ ${i.endTime} ${i.tvStation}` : null,
                description: i.description,
            }),
            // no pubDate
            pubDate: i.date,
            // specify guid because the link is not unique
            guid: i.title + i.date,
            // the article link
            link: officialUrl,
        })),
    };
};
