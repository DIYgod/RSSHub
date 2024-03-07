import cache from '@/utils/cache';
import got from '@/utils/got';
import { apiUrl, baseUrl, getBParam, getBuildId, getGToken, parseList, parseItem } from './utils';

export default async (ctx) => {
    const { tagId, lang = 'en' } = ctx.req.param();
    const { limit = 20 } = ctx.req.query();

    const buildId = await getBuildId(cache.tryGet);
    const tagInfo = await cache.tryGet(`followin:tag:${tagId}:${lang}`, async () => {
        const { data: response } = await got(`${baseUrl}/_next/data/${buildId}/${lang}/tag/${tagId}.json`);
        const { queries } = response.pageProps.dehydratedState;
        const { base_info: tagInfo } = queries.find((q) => q.queryKey[0] === '/tag/info/v2').state.data;
        return tagInfo;
    });

    const gToken = await getGToken(cache.tryGet);
    const bParam = getBParam(lang);
    const { data: tagResponse } = await got.post(`${apiUrl}/feed/list/tag`, {
        headers: {
            'x-bparam': JSON.stringify(bParam),
            'x-gtoken': gToken,
        },
        json: {
            count: limit,
            id: Number.parseInt(tagId),
            type: 'tag_discussion_feed',
        },
    });
    if (tagResponse.code !== 2000) {
        throw new Error(tagResponse.msg);
    }

    const list = parseList(tagResponse.data.list.slice(0, limit), lang, buildId);
    const items = await Promise.all(list.map((item) => parseItem(item, cache.tryGet)));

    ctx.set('data', {
        title: `${tagInfo.name} - Followin`,
        description: tagInfo.description,
        link: `${baseUrl}/${lang}/tag/${tagId}`,
        image: tagInfo.logo,
        language: lang,
        item: items,
    });
};
