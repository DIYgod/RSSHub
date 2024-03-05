// @ts-nocheck
const utils = require('./utils');
import { load } from 'cheerio';
import got from '@/utils/got';

export default async (ctx) => {
    const link = 'https://www.penguinrandomhouse.com/the-read-down/';
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

    const out = await utils.parseList(itemArray, ctx, utils.parseBooks);

    ctx.set('data', {
        title: 'Penguin Random House Book Lists',
        link,
        description: 'Never wonder what to read next! Check out these lists to find your next favorite book.',
        item: out,
    });
};
