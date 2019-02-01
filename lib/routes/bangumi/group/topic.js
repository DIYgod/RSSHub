const axios = require('../../../utils/axios');
const cheerio = require('cheerio');
const resolve_url = require('url').resolve;

const base_url = 'https://bgm.tv/';

module.exports = async (ctx) => {
    const groupID = ctx.params.id;
    const link = 'https://bgm.tv/group/' + groupID + '/forum';
    const html = (await axios.get(link)).data;
    const $ = cheerio.load(html);
    const title = 'Bangumi - ' + $('.SecondaryNavTitle').text();

    ctx.state.data = {
        title: `${title}`,
        link: link,
        item: $('.topic_list .topic')
            .map((_, elem) => ({
                link: resolve_url(base_url, $('.subject a', elem).attr('href')),
                title: $('.subject a', elem).attr('title'),
                pubDate: new Date($('.lastpost .time', elem).text()).toUTCString(),
                description: 'Author: ' + $('.author a', elem).text() + '<br>' + 'Replay: ' + $('.posts', elem).text(),
            }))
            .get(),
    };
};
