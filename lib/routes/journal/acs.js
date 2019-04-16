const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const util = require('./acs_utils');



module.exports = async (ctx) => {
    const uid = ctx.params.uid;
    const link = `http://feeds.feedburner.com/acs/${uid}?format=xml`;
    const response = await axios({
        method: 'get',
        url: link, 
        headers: {
            Referer: 'https://pubs.acs.org/journal/esthag',
        },
    }); 

    const data = response.data;

    const $ = cheerio.load(data, { xmlMode: true });

    //获得期刊info
    const journaltitle = $("title").slice(0).eq(0).text();
    const journallink = $("link").slice(0).eq(0).text();
    const journaldes = $("description").slice(0).eq(0).text();

    const list = $("item").get();

    const result = await util.ProcessFeed(list, ctx.cache);

    ctx.state.data = {
        title: journaltitle,
        link: link,
        author: journaldes,
        description: journaldes,
        item: result,
    };
};
