import got from '@/utils/got';
import { toTitleCase } from '@/utils/common-utils';
import { load } from 'cheerio';

const handler = async (ctx) => {
    let type = 'new-releases';
    let title = 'New Releases';

    const sort = ctx.req.param('sort') || 'date';

    switch (ctx.req.param('type')) {
        case 'coming':
            type = 'coming-soon';
            title = 'Coming Soon';
            break;
        case 'all':
            type = 'available';
            title = 'All Releases';
            break;
    }

    const url = `https://www.metacritic.com/browse/games/release-date/${type}/${ctx.req.param('platform')}/${sort}`;

    const response = await got({
        method: 'get',
        url,
    });
    const data = response.body;

    const $ = load(data);
    const list = $('.list_products > li').toArray().slice(0, 10);

    const result = list.map((item) => {
        const $ = load(item);
        return {
            title: $('.product_title').text().trim(),
            url: 'https://www.metacritic.com' + $('.product_title > a').attr('href'),
            metascore: $('.brief_metascore').text().trim(),
            userscore: $('.textscore').text().trim(),
            date: $('.release_date > .data').text().trim(),
        };
    });

    return {
        title: toTitleCase(`Metacritic ${ctx.req.param('platform')} games ${title}`),
        link: url,
        item: result.map((item) => ({
            title: `${item.metascore === 'tbd' ? '' : '[' + item.metascore + ']'} ${item.title}`,
            description: `Release Date: ${item.date} <br> Metacritic Score: ${item.metascore} <br> User Score: ${item.userscore} <br>`,
            link: item.url,
        })),
    };
};
export default handler;
