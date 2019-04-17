const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const util = require('./utils');

module.exports = async (ctx) => {
    const uid = ctx.params.uid;
    const link = `http://rss.cnki.net/KNS/rss.aspx?journal=${uid}`;

    const response = await axios({
        method: 'get',
        url: link,
        headers: {
            Referer: `http://navi.cnki.net/KNavi/JournalDetail?pcode=CJFD&pykm=${uid}`,
        },
    });

    const data = response.data;

    const $ = cheerio.load(data, { xmlMode: true });

    // 获得期刊info
    const journaltitle = $("title").slice(0).eq(0).text();
    const journaldes = $("title").slice(1).eq(0).text();
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
