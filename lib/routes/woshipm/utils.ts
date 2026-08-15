import { load } from 'cheerio';

import cache from '@/utils/cache';
import got from '@/utils/got';

const baseUrl = 'https://www.woshipm.com';

const parseArticle = (item) =>
    cache.tryGet(item.link, async () => {
        const { data: response } = await got(item.link);

        const $ = load(response);
        $('.support-author').remove();

        item.description = $('.article--content').html();

        return item;
    });

export { baseUrl, parseArticle };
