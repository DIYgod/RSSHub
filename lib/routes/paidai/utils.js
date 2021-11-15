import cheerio from 'cheerio';
import got from '~/utils/got.js';
import date from '~/utils/date.js';

const ProcessFeed = async (info) => {
    const {
        title
    } = info;
    const itemUrl = info.link;
    const itemDate = info.date;

    const response = await got.get(itemUrl);

    const $ = cheerio.load(response.data);
    const description = $('#topic_content').html().trim();

    const single = {
        title,
        link: itemUrl,
        description,
        pubDate: date(itemDate),
    };
    return single;
};

export default {
    ProcessFeed,
};
