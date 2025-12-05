import { load } from 'cheerio';

import got from '@/utils/got';

const baseUrl = 'https://www.woshipm.com';

const parseArticle = (item, tryGet) =>
    tryGet(item.link, async () => {
        const { data: response } = await got(item.link);

        const $ = load(response);
        $('.support-author').remove();

        item.description = $('.article--content').html();

        return item;
    });

export { baseUrl, parseArticle };
