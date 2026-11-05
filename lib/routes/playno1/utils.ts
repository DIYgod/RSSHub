import { load } from 'cheerio';
import pMap from 'p-map';
import { Cookie, CookieJar } from 'tough-cookie';

import type { DataItem } from '@/types';
import got from '@/utils/got';

const cookieJar = new CookieJar();
const cookie = Cookie.fromJSON({
    key: 'playno1',
    value: 'playno1Cookie',
    domain: 'playno1.com',
    path: '/',
});
(async () => {
    await cookieJar.setCookie(cookie!, 'http://www.playno1.com/');
})();

const processArticle = (items: DataItem[], cache) =>
    pMap(
        items,
        async (item) => {
            const detail = await cache.tryGet(`playno1:article:v2:${item.link}`, async () => {
                const detailResponse = await got(item.link, {
                    cookieJar,
                });
                const content = load(detailResponse.data);
                return { description: content('#article_content').html() ?? undefined };
            });
            return { ...item, ...detail };
        },
        { concurrency: 3 }
    );

export { cookieJar, processArticle };
