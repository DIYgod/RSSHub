import got from '~/utils/got.js';
import cheerio from 'cheerio';
import {getItem} from './util.js';

export default async (ctx) => {
    let {
        tag
    } = ctx.params;
    if (tag === undefined || tag === 'undefined')
        {tag = '';}

    const link = `https://www.mzitu.com/tag/${tag}`;
    const response = await got({
        method: 'get',
        url: link,
    });
    const $ = cheerio.load(response.data);
    const items = await getItem(ctx, response.data);

    let name = $('div.currentpath').text();
    [, name] = name.split('»');

    ctx.state.data = {
        title: name,
        link,
        item: items,
    };
};
