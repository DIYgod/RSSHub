// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import * as path from 'node:path';

export default async (ctx) => {
    const response = await got('https://www.nintendo.com/nintendo-direct/archive/');
    const data = response.data;

    const $ = load(data);
    const nextData = JSON.parse($('script#__NEXT_DATA__').text());

    delete nextData.props.pageProps.initialApolloState.ROOT_QUERY;
    const result = Object.values(nextData.props.pageProps.initialApolloState).map((item) => ({
        title: item.name,
        pubDate: parseDate(item.startDate),
        link: `https://www.nintendo.com/nintendo-direct/${item.slug}/`,
        description: art(path.join(__dirname, 'templates/direct.art'), {
            publicId: item.thumbnail.publicId,
            content: item.description.json.content,
        }),
    }));

    ctx.set('data', {
        title: 'Nintendo Direct（任天堂直面会）',
        link: 'https://www.nintendo.com/nintendo-direct/archive/',
        description: '最新的任天堂直面会日程信息',
        item: result,
    });
};
