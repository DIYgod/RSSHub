// @ts-nocheck
import got from '@/utils/got';
const { getApiUrl, parseArticle } = require('./common');

export default async (ctx) => {
    const apiUrl = new URL('/api/v1/research-publications', await getApiUrl());
    const researchRootUrl = 'https://openai.com/research';

    // Construct API query
    apiUrl.searchParams.append('sort', '-publicationDate,-createdAt');
    apiUrl.searchParams.append('include', 'media');

    const resp = await got({
        method: 'get',
        url: apiUrl,
    });
    const obj = resp.data;

    const items = await Promise.all(
        obj.data.map((item) => {
            const attributes = item.attributes;
            return parseArticle(ctx, researchRootUrl, attributes);
        })
    );

    const title = 'OpenAI Research';

    ctx.set('data', {
        title,
        link: researchRootUrl,
        item: items,
    });
};
