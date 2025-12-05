import path from 'node:path';

import { load } from 'cheerio';

import got from '@/utils/got';
import { art } from '@/utils/render';

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

        const imgsrc = item.imgsrc ? new URL(item.imgsrc).searchParams.get('url') : false;
        item.description = art(path.join(__dirname, 'templates/dy.art'), {
            imgsrc,
            postBody: $('.post_body').html(),
        });

        item.feedLink = $('.post_wemedia_name a').attr('href');
        item.feedDescription = $('.post_wemedia_title').text();
        item.feedImage = $('.post_wemedia_avatar img').attr('src');

        return item;
    });

export { parseDyArticle };
