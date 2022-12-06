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

    const items = await Promise.all(
        $('.topic_list .topic')
            .toArray()
            .map(async (elem) => {
                const link = new URL($('.subject a', elem).attr('href'), base_url).href;
                const fullText = await ctx.cache.tryGet(link, async () => {
                    const { data: html } = await got(link);
                    const $ = cheerio.load(html);
                    return $('.postTopic .topic_content').html();
                });
                const summary = 'Reply: ' + $('.posts', elem).text();
                return {
                    link,
                    title: $('.subject a', elem).attr('title'),
                    pubDate: parseDate($('.lastpost .time', elem).text()),
                    description: fullText ? summary + '<br><br>' + fullText : summary,
                    author: $('.author a', elem).text(),
                };
            })
    );

    ctx.state.data = {
        title,
        link,
        item: items,
    };
};
