import { load } from 'cheerio';

import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

export function getArticle(item) {
    return cache.tryGet(item.link, async () => {
        const detailResponse = await ofetch(item.link);

        const content = load(detailResponse);

        item.description = item.link.includes('external')
            ? content(':is([class^=external-article-brief],[class^=external-article-content])').html()
            : content(':is([class^=brief__BriefContainer],[class^=article-content__Wrapper])').html();

        item.category = [...item.category, ...(content("meta[name='keywords']").attr('content') ?? '').split(',')];

        return item;
    });
}
