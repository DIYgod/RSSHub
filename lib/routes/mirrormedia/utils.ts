import { load } from 'cheerio';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

export function getArticle(item) {
    return cache.tryGet(item.link, async () => {
        const detailResponse = await ofetch(item.link);

        const content = load(detailResponse);

        item.description = content("div[data-contents='true']").html();

        return item;
    });
}
