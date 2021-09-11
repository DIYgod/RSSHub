const got = require('@/utils/got');
const cheerio = require('cheerio');

const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

function entry(ctx, list) {
    const now = list.map((line) =>
        ctx.cache.tryGet(line, async () => {
            const [, id] = line.match(/.*&nid=(.*)&start=.*/);
            const a_r = await got.get(`https://port-tdm-com-mo.translate.goog/c_radio/radio_notice_content.php?id=${id}&_x_tr_sl=zh-CN&_x_tr_tl=zh-TW&_x_tr_hl=zh-TW&_x_tr_pto=ajax,op,elem`);
            const $ = cheerio.load(a_r.data);
            // article validation
            const [, yearRaw] = $('div.grey_shadow.pie div small')
                .first()
                .text()
                .match(/.*\/.*\/(.*) .*:.*:.*/);
            const year = parseInt(yearRaw);

            if (year > 1970) {
                // title
                const title = $('div.grey_shadow.pie div h3').text();
                // time
                const time = $('div.grey_shadow.pie div small').first().text();
                // desc
                $('div#content_wrap').find('audio#audio_player').remove();
                $('div#content_wrap').find('script').remove();
                const content = $('div#content_wrap').html();

                return {
                    title,
                    description: content,
                    pubDate: timezone(parseDate(time, 'DD/MM/YYYY HH:mm:ss'), +8),
                    link: `https://port.tdm.com.mo/c_radio/index.php?ra=nd&id=${id}`,
                };
            }
        })
    );
    return Promise.all(now);
}

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: `https://mobile-tdm-com-mo.translate.goog/pt/index_pop.php?se=inews&type=pt&_x_tr_sl=zh-CN&_x_tr_tl=zh-TW&_x_tr_hl=zh-TW&_x_tr_pto=ajax,op,elem`,
    });

    const $ = cheerio.load(response.data);
    const dom = $('div.post');
    const relink = dom.map((_index, li) => $(li).find('a').first().attr('href'));
    const list = relink.toArray();

    let rss;
    rss = await entry(ctx, list);
    rss = rss.filter(function( element ) {
        return element !== undefined;
     });

    ctx.state.data = {
        title: 'Rádio Macau',
        link: 'https://port.tdm.com.mo/c_radio/index.php?ra=nd',
        item: rss,
    };
};
