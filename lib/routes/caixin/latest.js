const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const li_r = await got({
        method: 'get',
        url: 'http://finance.caixin.com/2020-11-03/101622309.html',
    });

    const $ = cheerio.load(li_r.data);
    const list = $('div.columnBox a[name="new_artical"]~ul.list li');

    const tasks = [];

    list.map((_index, li) => $(li).find('a').first().attr('href'))
        .filter((_index, link) => link.indexOf('fm.caixin.com') === -1 && link.indexOf('video.caixin.com') === -1)
        .each((_index, link) => {
            const entry = ctx.cache.tryGet(link, async () => {
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
                const info = $('div#artInfo.artInfo').text();
                const [, year, month, day, hour, minute] = info.match(/(\d+)年(\d+)月(\d+)日 *(\d+):(\d+)/);
                const time = new Date(`${year}-${month}-${day}T${hour}:${minute}:00+0800`).toUTCString();

                return {
                    title: h1,
                    description: `<blockquote><p>${subhead}</p></blockquote><img src="${pic_url}" alt="${pic_alt}">${content}`,
                    pubDate: time,
                    link: link,
                };
            });
            tasks.push(entry);
        });

    const rss = await Promise.all(tasks);

    ctx.state.data = {
        title: '财新网 - 最新文章',
        link: 'http://www.caixin.com/',
        item: rss,
    };
};
