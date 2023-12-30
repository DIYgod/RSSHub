const got = require('@/utils/got');
const { parseJSONP } = require('./jsonpHelper');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const ARTIST = 'YOASOBI',
        SONYJPURL = 'https://www.sonymusic.co.jp',
        BASEURL = 'https://www.sonymusic.co.jp/json/v2/artist',
        POSTFIX = 'start/0/count/-1';

    const api = `${BASEURL}/${ARTIST}/live/${POSTFIX}`;
    const officialUrl = 'https://www.yoasobi-music.jp/live';
    const title = 'LATEST LIVE';

    const response = await got({
        method: 'get',
        url: api,
    });

    const data = parseJSONP(response.data).items.map((item) => ({
        title: item.tourName,
        imageLink: item.tourImage !== '' ? `${SONYJPURL}${item.tourImage}` : null,
        link: `${officialUrl}/${item.link.split('/').pop()}`,
        description: item.tourInfo,
        // @param {Array} liveItem - An array contains all the sessions
        sessions: item.liveItem,
    }));

    ctx.state.data = {
        // the source title
        title,
        // the source url
        link: officialUrl,
        // the source description
        description: "YOASOBI's Latest Live",
        // iterate through all leaf objects
        item: data.map((item) => ({
            // the article title
            title: item.title,
            // the article content
            description: art(path.join(__dirname, 'templates/live.art'), {
                image: item.imageLink,
                description: item.description,
                sessions: item.sessions,
            }),
            // no pubDate
            // the article link
            link: item.link,
        })),
    };
};
