// @ts-nocheck
import logger from '@/utils/logger';
const { getItems } = require('./utils');

export default async (ctx) => {
    const { topic, category } = ctx.req.param();
    const baseUrl = 'https://insider.finology.in';
    let route;
    let number;
    if (topic) {
        route = `/tag/${topic}`;
        number = 2;
    } else if (category) {
        route = `/${category}`;
        number = 6;
    } else {
        logger.error('Invalid URL');
    }
    const extra = {
        date: true,
        topicName: '',
        selector: `div.w100.pb${number}.bg-color.flex.flex-col.align-center div.w23.br0625.shadow.position-r.bg-white.m-w100.card.t-w45`,
    };
    const listItems = await getItems(ctx, `${baseUrl}${route}`, extra);
    ctx.set('data', {
        title: `${extra.topicName} - Finology Insider`,
        link: `${baseUrl}${route}`,
        item: listItems,
        description: number === 2 ? `Everything that Insider has to offer about ${extra.topicName} for you to read and learn.` : `Articles for your research and knowledge under ${extra.topicName}`,
        logo: 'https://assets.finology.in/insider/images/favicon/apple-touch-icon.png',
        icon: 'https://assets.finology.in/insider/images/favicon/favicon-32x32.png',
        language: 'en-us',
    });
};
