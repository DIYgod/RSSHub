import { load } from 'cheerio';
import { FetchError } from 'ofetch';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate, parseRelativeDate } from '@/utils/parse-date';

export const rootUrl = 'https://community.aijishu.com';

const parseArticle = (item) => {
    const articleUrl = new URL(item.url || item.object.url, rootUrl).href;
    return cache.tryGet(articleUrl, async () => {
        const d1 = parseDate(item.createdDate, ['YYYY-MM-DD', 'M-DD', 'YYYY年M月D日', 'M月D日']);
        const d2 = parseRelativeDate(item.createdDate);

        let resp, desc;
        try {
            resp = await got(articleUrl);
            const $ = load(resp.data);
            desc = $('article.fmt').html();
        } catch (error) {
            if (error instanceof FetchError && error.response?.status === 403) {
                // skip it
            } else {
                throw error;
            }
        }

        const article_item = {
            title: item.title || item.object.title,
            link: articleUrl,
            description: desc,
            pubDate: d1.toString() === 'Invalid Date' ? d2 : d1,
        };
        return article_item;
    });
};

export default { parseArticle };
