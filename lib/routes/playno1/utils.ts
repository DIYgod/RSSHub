// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
const { CookieJar, Cookie } = require('tough-cookie');
const cookieJar = new CookieJar();
const cookie = Cookie.fromJSON({
    key: 'playno1',
    value: 'playno1Cookie',
    domain: 'playno1.com',
    path: '/',
});
(async () => {
    await cookieJar.setCookie(cookie, 'http://www.playno1.com/');
})();

const processArticle = (items, cache) =>
    Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link, {
                    cookieJar,
                });
                const content = load(detailResponse.data);
                item.description = content('#article_content').html();
                return item;
            })
        )
    );

module.exports = {
    cookieJar,
    processArticle,
};
