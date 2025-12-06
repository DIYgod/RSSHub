import CryptoJS from 'crypto-js/crypto-js';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/hqsz',
    categories: ['university'],
    example: '/ouc/hqsz',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['hqsz.ouc.edu.cn/news.html'],
        },
    ],
    name: '后勤公告通知',
    maintainers: ['ladeng07'],
    handler,
    url: 'hqsz.ouc.edu.cn/news.html?typeId=02',
};

function Decrypt(word, keyStr = '1974051005060708', ivStr = '1974051005060708') {
    const key = CryptoJS.enc.Utf8.parse(keyStr); // ""中与后台一样  密码
    const iv = CryptoJS.enc.Utf8.parse(ivStr); // ""中与后台一样
    const base64 = CryptoJS.enc.Base64.parse(word);
    const src = CryptoJS.enc.Base64.stringify(base64);

    const decrypt = CryptoJS.AES.decrypt(src, key, {
        iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });

    const decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
    return decryptedStr;
}

async function handler() {
    const base = 'http://hqsz.ouc.edu.cn/';
    const link = base + 'api/website/frontendWebsite/lists';
    const { data } = await got.post(link, {
        form: {
            schoolCode: '10423',
            website: '89e97da117d547128283cf9d12891fa9',
            code: '0202',
            pageSize: '10',
            pageIndex: '1',
        },
    });
    const list = JSON.parse(Decrypt(data)).data.list.map((item) => ({
        title: item.title,
        id: item.id,
        author: item.author,
        link: base + 'news_detail.html?id=' + item.id,
        pubDate: parseDate(item.publishTime),
    }));

    const out = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data } = await got.post(base + 'api/website/frontendWebsite/info', {
                    form: {
                        schoolCode: '10423',
                        website: '89e97da117d547128283cf9d12891fa9',
                        id: item.id,
                    },
                });
                item.description = Decrypt(JSON.parse(Decrypt(data)).data.content);
                delete item.id;
                return item;
            })
        )
    );

    return {
        title: '中国海洋大学后勤公告通知',
        link,
        description: '中国海洋大学后勤公告通知',
        item: out,
    };
}
