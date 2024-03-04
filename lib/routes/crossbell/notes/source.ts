// @ts-nocheck
import got from '@/utils/got';
const { getItem } = require('./utils');

export default async (ctx) => {
    const source = ctx.req.param('source');

    const response = await got('https://indexer.crossbell.io/v1/notes', {
        searchParams: {
            sources: source,
            includeCharacter: true,
        },
    });

    ctx.set('data', {
        title: 'Crossbell Notes from ' + source,
        link: 'https://crossbell.io/',
        item: response.data?.list?.map((item) => getItem(item)),
    });
};
