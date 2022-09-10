const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const { parseJSONP } = require('./jsonpHelper');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const api = 'https://www.sonymusic.co.jp/json/v2/artist/lisa/discography/start/0/count/-1';
    const url = 'https://www.sonymusic.co.jp/artist/lisa/discography';

    const title = 'LATEST DISCOGRAPHY';

    const response = await got({
        method: 'get',
        url: api,
    });

    const data = parseJSONP(response.data).items.map((item) => ({
        title: item.title,
        referID: item.representative_goods_number,
        imageLink: item.image !== '' ? item.image : item.image_original,
        type: item.type,
        releaseDate: item.release_date,
        price: item.price !== '' ? item.price + ' (Tax Inclusive)' : 'Unknown Yet',
        description: item.comment,
        comment: item.catch_copy !== '' ? item.catch_copy : '今日もいい日だ！',
    }));

    ctx.state.data = {
        // the source title
        title,
        // the source url
        link: url,
        // the source description
        description: "LiSA's Latest Albums",
        // iterate through all leaf objects
        item: data.map((item) => ({
            // the article title
            title: item.title,
            // the article content
            description: art(path.join(__dirname, 'templates/disco.art'), {
                comment: item.comment,
                type: item.type,
                price: item.price,
                image: item.imageLink,
                description: item.description,
            }),
            // the article publish time
            pubDate: parseDate(item.releaseDate),
            // the article link
            link: `${url}/${item.referID}`,
        })),
    };
};
