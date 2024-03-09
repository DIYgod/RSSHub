import got from '@/utils/got';
import { getItem } from './utils';

export default async (ctx) => {
    const response = await got('https://indexer.crossbell.io/v1/notes', {
        searchParams: {
            includeCharacter: true,
        },
    });

    ctx.set('data', {
        title: 'Crossbell Notes',
        link: 'https://crossbell.io/',
        item: response.data?.list?.map((item) => getItem(item)),
    });
};
