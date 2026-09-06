import { load } from 'cheerio';

import cache from '@/utils/cache';
import got from '@/utils/got';

const parseArticle = (item) =>
    cache.tryGet(item.link, async () => {
        const detailResponse = await got({
            method: 'get',
            url: item.link,
        });

        const $ = load(detailResponse.data);

        $('.article-nfh-icon, .article-crumb, .article-share, .article-copyright').remove();

        item.description += $('#content').html() ?? '';
        item.author = $('meta[name="author"]').attr('content');

        return item;
    });

export { parseArticle };
