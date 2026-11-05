import { load } from 'cheerio';
import iconv from 'iconv-lite';
import pMap from 'p-map';

import got from '@/utils/got';
import wait from '@/utils/wait';

const gbk2utf8 = (s) => iconv.decode(s, 'gbk');

async function loadContent(link) {
    // Wait for a random delay between 1 and 3 seconds.
    const randomDelay = Math.floor(Math.random() * (3000 - 1000 + 1)) + 1000;
    await wait(randomDelay);

    const response = await got.get(link, {
        responseType: 'buffer',
    });
    const $ = load(gbk2utf8(response.data));

    // Remove trailing page widgets.
    $('.lookMore').remove();
    $('style').remove();
    $('#loginDialog').remove();

    // Select the original post.
    const firstpost = $('.firstpost');

    // Restore source image URLs.
    firstpost.find('ignore_js_op img').each((_, el) => {
        $(el).attr('src', $(el).attr('file'));
        // Remove site-specific attributes.
        for (const attr of ['id', 'aid', 'zoomfile', 'file', 'zoomfile', 'class', 'onclick', 'title', 'inpost', 'alt', 'onmouseover']) {
            $(el).removeAttr(attr);
        }
    });

    // Remove attachment widgets while preserving inline image positions.
    firstpost.find('ignore_js_op').each((_, el) => {
        const wrapper = $(el);
        wrapper.replaceWith(wrapper.find('img'));
    });

    // Extract the original post body.
    const description = firstpost.html();

    return { description };
}

const processFeed = (list: any[], caches) => {
    const host = 'https://www.flyert.com.cn';

    return pMap(
        list,
        async (item) => {
            const $ = load(item);

            const $label = $(".comiis_common a[data-track='版块页主题分类']");
            const $title = $(".comiis_common a[data-track='版块页文章']");
            // Resolve relative article links.
            const itemUrl = new URL($title.attr('href')!, host).href;

            // Keep the current list metadata.
            const single = {
                title: $label.text() + '-' + $title.text(),
                link: itemUrl,
                guid: itemUrl,
            };

            // Cache article content.
            const other = await caches.tryGet(itemUrl, () => loadContent(itemUrl));

            // Combine current list metadata with cached article content.
            return { ...single, ...other };
        },
        { concurrency: 2 }
    ); // Limit article requests to two concurrent requests.
};

export default { processFeed };
