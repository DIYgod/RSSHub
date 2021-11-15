import got from '~/utils/got.js';
import cheerio from 'cheerio';

export default async (ctx) => {
    const {
        media = -1
    } = ctx.params;
    const link_base = 'http://pianyuan.tv/';
    let description = '电影和剧集';
    let link = link_base;
    if (media !== -1) {
        link = link_base + `?cat=${media}`;
        if (media === 'mv') {
            description = '电影';
        } else if (media === 'tv') {
            description = '剧集';
        } else {
            link = link_base;
        }
    }

    const {
        data
    } = await got.get(link);
    const $ = cheerio.load(data);

    const items = [];
    $('#main-container > div > div.col-md-10 > table > tbody > tr').each((i, item) => {
        const link = $(item).find('td.dt.prel.nobr > a').attr('href');
        const text = $(item).find('td.dt.prel.nobr > a').text();
        const description = $(item)
            .find('td.dt.prel.nobr')
            .text()
            .replace(/^\s+|\s+$/g, '');
        const size = $(item).find('td:nth-child(2)').text();

        const description_simple = description.substr(0, description.indexOf('主演')).replace(text, '');

        items.push({
            title: `[${size}] ${description_simple}`,
            description,
            link: link_base + link,
        });
    });

    ctx.state.data = {
        title: `片源网`,
        description,
        link: link_base,
        item: items,
    };
};
