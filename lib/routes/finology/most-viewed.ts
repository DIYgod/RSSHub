// @ts-nocheck
import logger from '@/utils/logger';
const { getItems } = require('./utils');

export default async (ctx) => {
    const baseUrl = 'https://insider.finology.in/most-viewed';
    let selector;
    let title;
    const time = ctx.req.param('time');
    if (time === 'alltime') {
        title = 'All Time';
        selector = 'div.w100.pb2.bg-color.flex.flex-col.align-center.pt6 div.w23.br0625.shadow.position-r.bg-white.m-w100.card.t-w45';
    } else if (time === 'monthly') {
        title = 'Monthly';
        selector = 'div.w100.pb2.bg-color.flex.flex-col.align-center:not(.pt6) div.w23.br0625.shadow.position-r.bg-white.m-w100.card.t-w45';
    } else {
        logger.error('Invalid Time');
    }

    const extra = {
        date: false,
        selector,
    };
    const listItems = await getItems(ctx, baseUrl, extra);
    ctx.set('data', {
        title: `Most Viewed ${title} - Finology Insider`,
        link: baseUrl,
        item: listItems,
        description: "A lot of Insider's readers seem to be reading these articles. Take a look and find out why.",
        logo: 'https://assets.finology.in/insider/images/favicon/apple-touch-icon.png',
        icon: 'https://assets.finology.in/insider/images/favicon/favicon-32x32.png',
        language: 'en-us',
    });
};
