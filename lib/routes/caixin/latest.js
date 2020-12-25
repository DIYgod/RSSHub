const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const li_r = await got({
        method: 'get',
        url: 'http://finance.caixin.com/2020-11-03/101622309.html',
    });

    const $ = cheerio.load(li_r.data);
    const lis = $('div.columnBox a[name="new_artical"]~ul.list li');

    const rss = await Promise.all(
        lis &&
            lis.map(async (li) => {
                const link_t = $(li).find('a').attr('href');
                const link = link_t.filter((t) => t.indexOf('fm.caixin.com') === -1 && t.indexOf('video.caixin.com') === -1); // content filter

                const entry = await ctx.cache.tryGet(link, async () => {
                    const entry_r = await got.get(link);
                    const $ = cheerio.load(entry_r.data);
                    // title
                    const h1 = $('div#conTit h1').text();
                    // desc
                    const subhead = $('div#subhead.subhead').text();
                    const pic_url = $('img.cx-img-loader').attr('src');
                    const pic_alt = $('dl.media_pic dd').text();
                    const content = $('div#Main_Content_Val.text').html();
                    // time
                    // const info = $('div#artInfo.artInfo').text();
                    // const time_t = info;

                    return {
                        title: h1,
                        description: `<blockquote><p>${subhead}</p></blockquote><img src="${pic_url}" alt="${pic_alt}">${content}`,
                        // pubDate: new Date(card_data.publish_time * 1000).toUTCString(),
                        link: link,
                    };
                });
                return Promise.resolve(entry);
            })
    );

    ctx.state.data = {
        title: '财新网 - 最新文章',
        link: 'http://www.caixin.com/',
        item: rss,
    };
};
