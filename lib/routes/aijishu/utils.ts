// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseRelativeDate, parseDate } from '@/utils/parse-date';
import { load } from 'cheerio';

const parseArticle = (item) => {
    const articleUrl = `https://aijishu.com${item.url || item.object.url}`;
    return cache.tryGet(articleUrl, async () => {
        const d1 = parseDate(item.createdDate, ['YYYY-MM-DD', 'M-DD']);
        const d2 = parseRelativeDate(item.createdDate);

        let resp, desc;
        try {
            resp = await got(articleUrl);
            const $ = load(resp.data);
            desc = $('article.fmt').html();
        } catch (error) {
            if (error.response.status === 403) {
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

module.exports = {
    parseArticle,
};
