import cheerio from 'cheerio';
import iconv from 'iconv-lite'
import got from '~/utils/got.js';
const date = require('~/utils/date');

const ProcessFeed = async (link) => {
    const id = link.split('/').pop().split('.')[0];

    let response;
    response = await got.get(`http://www.aisixiang.com/data/view_json.php?id=${id}`, {
        responseType: 'json',
    });
    const description = response.data.content;

    link = `http://www.aisixiang.com${link}`;
    response = await got.get(link, {
        responseType: 'buffer',
    });

    response.data = iconv.decode(response.data, 'gbk');

    const $ = cheerio.load(response.data);

    const title = $('.show_text > h3').text();

    const pubDate = date($('.show_text > .info').text().split('：').pop(), 8);

    return {
        title: title.split('：')[1] || title,
        author: title.split('：')[0] || '',
        description,
        pubDate,
        link,
    };
};

export default {
    ProcessFeed,
};
