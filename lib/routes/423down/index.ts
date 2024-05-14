import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

export const handler = async (ctx) => {
    const { category = '' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 18;

    const domain = '423down.com';
    const rootUrl = `https://www.${domain}`;
    const currentUrl = new URL(category, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    const language = $('html').prop('lang');

    let items = $('ul.excerpt li')
        .toArray()
        .filter((item) => {
            item = $(item);

            const link = item.find('h2 a').prop('href');

            return new RegExp(domain).test(link);
        })
        .slice(0, limit)
        .map((item) => {
            item = $(item);

            const title = item.find('h2').text();
            const image = item.find('a.pic img').prop('src');
            const description = art(path.join(__dirname, 'templates/description.art'), {
                images: image
                    ? [
                          {
                              src: image,
                              alt: title,
                          },
                      ]
                    : undefined,
                intro: item.find('div.note').text(),
            });

            return {
                title,
                description,
                pubDate: parseDate(item.find('span.time').text(), 'MM-DD'),
                link: item.find('h2 a').prop('href'),
                category: item
                    .find('span.cat a')
                    .toArray()
                    .map((c) => $(c).text()),
                content: {
                    html: description,
                    text: item.find('div.note').text(),
                },
                image,
                banner: image,
                language,
                enclosure_url: image,
                enclosure_type: image ? `image/${image.split(/\./).pop()}` : undefined,
                enclosure_title: title,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const $$ = load(detailResponse);

                const title = $$('h1.meta-tit a').text();
                const description =
                    item.description +
                    art(path.join(__dirname, 'templates/description.art'), {
                        description: $$('div.entry').html(),
                    });

                item.title = title;
                item.description = description;
                item.pubDate = parseDate($$('p.meta-info').contents().first().text().trim().split(/\s/)[0], 'YYYY-MM-DD');
                item.category = $$('p.meta-info a[rel="category tag"]')
                    .toArray()
                    .map((c) => $$(c).text());
                item.content = {
                    html: description,
                    text: $$('div.entry').text(),
                };
                item.language = language;

                return item;
            })
        )
    );

    const title = $('title').first().text();
    const image = new URL('wp-content/themes/D7/img/423Down.png', rootUrl).href;

    return {
        title,
        description: $('title').last().text(),
        link: currentUrl,
        item: items,
        allowEmpty: true,
        image,
        author: title.split(/-/).pop()?.trim(),
        language,
    };
};

export const route: Route = {
    path: '/:category{.+}?',
    name: '423Down',
    url: '423down.com',
    maintainers: ['nczitzk'],
    handler,
    example: '/423down',
    parameters: { category: '分类，默认为首页，可在对应分类页 URL 中找到' },
    description: `:::tip
  若订阅 [Android - 423Down](https://www.423down.com/apk)，网址为 \`https://www.423down.com/apk\`。截取 \`https://www.423down.com/\` 到末尾的部分 \`apk\` 作为参数填入，此时路由为 [\`/423down/apk\`](https://rsshub.app/423down/apk)。
  :::

  #### [安卓软件](https://www.423down.com/apk)

  | [安卓软件](https://www.423down.com/apk) |
  | --------------------------------------- |
  | [apk](https://rsshub.app/423down/apk)   |
  
  #### 电脑软件
  
  | [原创软件](https://www.423down.com/zd423) | [媒体播放](https://www.423down.com/multimedia)      | [网页浏览](https://www.423down.com/browser)   | [图形图像](https://www.423down.com/image) | [聊天软件](https://www.423down.com/im) |
  | ----------------------------------------- | --------------------------------------------------- | --------------------------------------------- | ----------------------------------------- | -------------------------------------- |
  | [zd423](https://rsshub.app/423down/zd423) | [multimedia](https://rsshub.app/423down/multimedia) | [browser](https://rsshub.app/423down/browser) | [image](https://rsshub.app/423down/image) | [im](https://rsshub.app/423down/im)    |
  
  | [办公软件](https://www.423down.com/work) | [上传下载](https://www.423down.com/down) | [实用软件](https://www.423down.com/softtool)    | [系统辅助](https://www.423down.com/systemsoft)      | [系统必备](https://www.423down.com/systemplus)      |
  | ---------------------------------------- | ---------------------------------------- | ----------------------------------------------- | --------------------------------------------------- | --------------------------------------------------- |
  | [work](https://rsshub.app/423down/work)  | [down](https://rsshub.app/423down/down)  | [softtool](https://rsshub.app/423down/softtool) | [systemsoft](https://rsshub.app/423down/systemsoft) | [systemplus](https://rsshub.app/423down/systemplus) |
  
  | [安全软件](https://www.423down.com/security)    | [补丁相关](https://www.423down.com/patch) | [硬件相关](https://www.423down.com/hardware)    |
  | ----------------------------------------------- | ----------------------------------------- | ----------------------------------------------- |
  | [security](https://rsshub.app/423down/security) | [patch](https://rsshub.app/423down/patch) | [hardware](https://rsshub.app/423down/hardware) |
  
  #### 操作系统
  
  | [Windows 11](https://www.423down.com/win11) | [Windows 10](https://www.423down.com/win10) | [Windows 7](https://www.423down.com/win7) | [Windows XP](https://www.423down.com/win7/winxp)    | [WinPE](https://www.423down.com/pe-system)        |
  | ------------------------------------------- | ------------------------------------------- | ----------------------------------------- | --------------------------------------------------- | ------------------------------------------------- |
  | [win11](https://rsshub.app/423down/win11)   | [win10](https://rsshub.app/423down/win10)   | [win7](https://rsshub.app/423down/win7)   | [win7/winxp](https://rsshub.app/423down/win7/winxp) | [pe-system](https://rsshub.app/423down/pe-system) |
  `,
    categories: ['program-update'],

    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['423down.com/:category', '423down.com'],
            target: (params) => {
                const category = params.category;

                return `/423down${category ? `/${category}` : ''}`;
            },
        },
        {
            title: '首页',
            source: ['www.423down.com'],
            target: '/',
        },
        {
            title: '安卓软件',
            source: ['www.423down.com/apk'],
            target: '/apk',
        },
        {
            title: '电脑软件 - 原创软件',
            source: ['www.423down.com/zd423'],
            target: '/zd423',
        },
        {
            title: '电脑软件 - 媒体播放',
            source: ['www.423down.com/multimedia'],
            target: '/multimedia',
        },
        {
            title: '电脑软件 - 网页浏览',
            source: ['www.423down.com/browser'],
            target: '/browser',
        },
        {
            title: '电脑软件 - 图形图像',
            source: ['www.423down.com/image'],
            target: '/image',
        },
        {
            title: '电脑软件 - 聊天软件',
            source: ['www.423down.com/im'],
            target: '/im',
        },
        {
            title: '电脑软件 - 办公软件',
            source: ['www.423down.com/work'],
            target: '/work',
        },
        {
            title: '电脑软件 - 上传下载',
            source: ['www.423down.com/down'],
            target: '/down',
        },
        {
            title: '电脑软件 - 实用软件',
            source: ['www.423down.com/softtool'],
            target: '/softtool',
        },
        {
            title: '电脑软件 - 系统辅助',
            source: ['www.423down.com/systemsoft'],
            target: '/systemsoft',
        },
        {
            title: '电脑软件 - 系统必备',
            source: ['www.423down.com/systemplus'],
            target: '/systemplus',
        },
        {
            title: '电脑软件 - 安全软件',
            source: ['www.423down.com/security'],
            target: '/security',
        },
        {
            title: '电脑软件 - 补丁相关',
            source: ['www.423down.com/patch'],
            target: '/patch',
        },
        {
            title: '电脑软件 - 硬件相关',
            source: ['www.423down.com/hardware'],
            target: '/hardware',
        },
        {
            title: '操作系统 - Windows 11',
            source: ['www.423down.com/win11'],
            target: '/win11',
        },
        {
            title: '操作系统 - Windows 10',
            source: ['www.423down.com/win10'],
            target: '/win10',
        },
        {
            title: '操作系统 - Windows 7',
            source: ['www.423down.com/win7'],
            target: '/win7',
        },
        {
            title: '操作系统 - Windows XP',
            source: ['www.423down.com/win7/winxp'],
            target: '/win7/winxp',
        },
        {
            title: '操作系统 - WinPE',
            source: ['www.423down.com/pe-system'],
            target: '/pe-system',
        },
    ],
};
