const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const base_url = 'https://bgm.tv';

module.exports = async (ctx) => {
    const groupID = ctx.params.id;
    const link = `${base_url}/group/${groupID}/forum`;
    const { data: html } = await got(link);
    const $ = cheerio.load(html);
    const title = 'Bangumi - ' + $('.SecondaryNavTitle').text();

    ctx.state.data = {
        title,
        link,
        item: $('.topic_list .topic')
            .toArray()
            .map((elem) => ({
                link: new URL($('.subject a', elem).attr('href'), base_url).href,
                title: $('.subject a', elem).attr('title'),
                pubDate: parseDate($('.lastpost .time', elem).text()),
                description: 'Reply: ' + $('.posts', elem).text(),
                author: $('.author a', elem).text(),
            })),
    };
};
