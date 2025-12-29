import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import got from '@/utils/got';

const renderDescription = (imgsrc, postBody) =>
    renderToString(
        <>
            {imgsrc ? (
                <>
                    <img src={imgsrc} />
                    <br />
                </>
            ) : null}
            {postBody ? <>{raw(postBody)}</> : null}
        </>
    );

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
        item.description = renderDescription(imgsrc, $('.post_body').html());

        item.feedLink = $('.post_wemedia_name a').attr('href');
        item.feedDescription = $('.post_wemedia_title').text();
        item.feedImage = $('.post_wemedia_avatar img').attr('src');

        return item;
    });

export { parseDyArticle };
