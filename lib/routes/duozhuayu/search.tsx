import aesjs from 'aes-js';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/search/:wd',
    categories: ['shopping'],
    example: '/duozhuayu/search/JavaScript',
    parameters: { wd: '搜索关键词' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['duozhuayu.com/search/book/:wd'],
        },
    ],
    name: '搜索结果',
    maintainers: ['fengkx'],
    handler,
};

async function handler(ctx) {
    const wd = ctx.req.param('wd');
    const baseUrl = 'https://www.duozhuayu.com';
    const type = 'book';
    const link = `${baseUrl}/search/${type}/${wd}`;

    // token获取见 https://github.com/wong2/userscripts/blob/master/duozhuayu.user.js
    const key = [...'DkOliWvFNR7C4WvR'].map((c) => c.charCodeAt());
    const iv = [...'GQWKUE2CVGOOBKXU'].map((c) => c.charCodeAt());
    const aesCfb = new aesjs.ModeOfOperation.cfb(key, iv);

    const encrypt = (text) => {
        const textBytes = aesjs.utils.utf8.toBytes(text);
        const encryptedBytes = aesCfb.encrypt(textBytes);
        return aesjs.utils.hex.fromBytes(encryptedBytes);
    };

    const getCustomRequestHeaders = () => {
        const timestamp = Date.now();
        const userId = 0;
        const securityKey = Math.floor(1e8 * Math.random());
        const token = encrypt([timestamp, userId, securityKey].join(':'));
        const requestId = [userId, timestamp, Math.round(1e5 * Math.random())].join('-');
        return {
            'x-api-version': '0.0.48',
            'x-refer-request-id': requestId,
            'x-request-id': requestId,
            'x-request-misc': '{"platform":"browser","originSource":"search","originFrom":"normal","webVersion":"1.2.201774"}',
            'x-request-token': token,
            'x-security-key': securityKey,
            'x-timestamp': timestamp,
            'x-user-id': userId,
        };
    };

    const response = await got({
        method: 'get',
        url: `${baseUrl}/api/search/book`,
        searchParams: {
            type: 'normal',
            q: wd,
        },
        headers: getCustomRequestHeaders(),
    });

    const item = response.data.data
        .filter((item) => item.type === type)
        .map(({ [type]: item }) => ({
            title: item.title,
            link: `${baseUrl}/books/${item.id}`,
            pubDate: parseDate(item.updated), // 2023-05-07T13:33:09+08:00
            description: renderToString(
                <div>
                    <img src={item.images.origin} />
                    <br />
                    书名：{item.title} {item.originalTitle}
                    <br />
                    {item.subtitle ? (
                        <>
                            {item.subtitle}
                            <br />
                        </>
                    ) : null}
                    作者：{item.rawAuthor}
                    <br />
                    {item.translators?.length ? (
                        <>
                            译者：{item.translators.map((translator) => translator.name).join(' / ')}
                            <br />
                        </>
                    ) : null}
                    ISBN：{item.isbn13}
                    <br />
                    出版社：{item.publisher}
                    <br />
                    出版时间：{item.publishDate}
                    <br />
                    豆瓣评分：{item.doubanRating}
                    <br />
                    价格：{(item.price / 100).toFixed(2)}元起 <del>{(item.originalPrice / 100).toFixed(2)}元</del>
                </div>
            ),
        }));

    return {
        title: `多抓鱼搜索-${wd}`,
        link,
        description: `多抓鱼搜索-${wd}`,
        item,
    };
}
