// @ts-nocheck
const utils = require('./utils');
import { load } from 'cheerio';
import got from '@/utils/got';

export default async (ctx) => {
    const link = 'https://www.penguinrandomhouse.com/articles/';
    const res = await got(link);
    const $ = load(res.data);

    const itemArray = $('.archive-module-half-container,.archive-module-third-container')
        .map(function () {
            return {
                url: $(this).find('a').attr('href'),
                title: $(this).find('.archive-module-text').first().text(),
            };
        })
        .get();

    const out = await utils.parseList(itemArray, ctx, utils.parseArticle);

    ctx.set('data', {
        title: 'Penguin Random House Articles',
        link,
        description: 'In-depth interviews, author essays, fascinating essays. Go deeper into the books you love.',
        item: out,
    });
};
