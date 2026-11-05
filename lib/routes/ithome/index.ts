import { load } from 'cheerio';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

import { parseSourceDate } from './utils';

const getUrl = (caty) => `https://${caty}.ithome.com/`;

const config = {
    it: {
        title: 'IT 资讯',
    },
    soft: {
        title: '软件之家',
    },
    win10: {
        title: 'win10 之家',
    },
    win11: {
        title: 'win11 之家',
    },
    iphone: {
        title: 'iphone 之家',
    },
    ipad: {
        title: 'ipad 之家',
    },
    android: {
        title: 'android 之家',
    },
    digi: {
        title: '数码之家',
    },
    next: {
        title: '智能时代',
    },
};

export const route: Route = {
    path: '/:caty',
    categories: ['new-media'],
    example: '/ithome/it',
    parameters: { caty: '类别' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '分类资讯',
    maintainers: ['luyuhuang'],
    handler,
    description: `| it      | soft     | win10      | win11      | iphone      | ipad      | android      | digi     | next     |
| ------- | -------- | ---------- | ---------- | ----------- | --------- | ------------ | -------- | -------- |
| IT 资讯 | 软件之家 | win10 之家 | win11 之家 | iphone 之家 | ipad 之家 | android 之家 | 数码之家 | 智能时代 |`,
};

async function handler(ctx) {
    const category = ctx.req.param('caty');
    if (!Object.hasOwn(config, category)) {
        throw new InvalidParameterError('Bad category. See <a href="https://docs.rsshub.app/routes/new-media#it-zhi-jia">https://docs.rsshub.app/routes/new-media#it-zhi-jia</a>');
    }
    const cfg = config[category];

    const currentUrl = getUrl(ctx.req.param('caty'));
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);
    const list = $('#list > div.fl > ul > li > div > h2 > a')
        .slice(0, 10)
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            return {
                title: $item.text(),
                link: $item.attr('href'),
            };
        });

    const items = await pMap(
        list,
        async (item) => {
            const details = await cache.tryGet(`ithome:article:${item.link}`, async () => {
                const res = await got({ method: 'get', url: item.link });
                const content = load(res.data);
                const post = content('#paragraph');
                post.find('img[data-original]').each((_, ele) => {
                    const $ele = $(ele);
                    $ele.attr('src', $ele.attr('data-original'));
                    $ele.removeAttr('class');
                    $ele.removeAttr('data-original');
                });
                return { description: post.html(), pubDate: parseSourceDate(content('#pubtime_baidu').text()) };
            });
            return { ...item, ...details };
        },
        { concurrency: 3 }
    );

    return {
        title: 'IT 之家 - ' + cfg.title,
        link: currentUrl,
        image: 'https://img.ithome.com/m/images/logo.png',
        item: items,
    };
}
