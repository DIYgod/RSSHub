import { load } from 'cheerio';

import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

export const fixDesc = ($, elem) => {
    // <august_name>???</august_name> => <b>???</b>
    const $elem = $(elem);
    $elem.find('august_name').each((_, item) => {
        item.name = 'b';
    });
    return $elem.html();
};

export const fetchPhoto = (url) =>
    cache.tryGet(url, async () => {
        const response = await ofetch(url);
        const $ = load(response);

        return $('.gallery img')
            .removeAttr('class')
            .toArray()
            .map((item) => $.html(item))
            .join('<br>');
    });
