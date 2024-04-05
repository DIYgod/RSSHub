import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { load } from 'cheerio';
import { art } from '@/utils/render';
import path from 'node:path';

const parseDyArticle = (item, tryGet) =>
    tryGet(item.link, async () => {
        const response = await got(item.link, {
            responseType: 'buffer',
        });

        const $ = load(response.data);

        $('.post_main img').each((_, i) => {
            if (!i.attribs.src) {
                return;
            }
            const url = new URL(i.attribs.src);
            if (url.host === 'nimg.ws.126.net') {
                i.attribs.src = url.searchParams.get('url');
            }
        });

        const imgUrl = new URL(item.imgsrc);
        item.description = art(path.join(__dirname, 'templates/dy.art'), {
            imgsrc: imgUrl.searchParams.get('url'),
            postBody: $('.post_body').html(),
        });

        item.feedLink = $('.post_wemedia_name a').attr('href');
        item.feedDescription = $('.post_wemedia_title').text();
        item.feedImage = $('.post_wemedia_avatar img').attr('src');

        return item;
    });

export { parseDyArticle };
