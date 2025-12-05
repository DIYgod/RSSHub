import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/article/:id',
    name: '章节',
    url: 'www.69shuba.cx',
    maintainers: ['eternasuno'],
    example: '/69shu/article/47117',
    parameters: { id: '小说 id, 可在对应小说页 URL 中找到' },
    categories: ['reading'],
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
            source: ['www.69shuba.cx/book/:id.htm'],
            target: '/article/:id',
        },
    ],
    handler: async (ctx) => {
        const { id } = ctx.req.param();
        const link = `https://www.69shuba.cx/book/${id}.htm`;
        const $ = load(await get(link));

        const item = await Promise.all(
            $('.qustime li>a')
                .toArray()
                .map((chapter) => createItem(chapter.attribs.href))
        );

        return {
            title: $('h1>a').text(),
            description: $('.navtxt>p:first-of-type').text(),
            link,
            item,
            image: $('.bookimg2>img').attr('src'),
            author: $('.booknav2>p:first-of-type>a').text(),
            language: 'zh-cn',
        };
    },
};

const createItem = (url: string) =>
    cache.tryGet(url, async () => {
        const $ = load(await get(url));
        const { articleid, chapterid, chaptername } = parseObject(/bookinfo\s?=\s?{[\S\s]+?}/, $('head>script:not([src])').text());
        const decryptionMap = parseObject(/_\d+\s?=\s?{[\S\s]+?}/, $('.txtnav+script').text());

        return {
            title: chaptername,
            description: decrypt($('.txtnav').html() || '', articleid, chapterid, decryptionMap),
            link: url,
        };
    }) as Promise<DataItem>;

const get = async (url: string, encoding = 'gbk') => new TextDecoder(encoding).decode(await ofetch(url, { responseType: 'arrayBuffer' }));

const parseObject = (reg: RegExp, str: string): Record<string, string> => {
    const obj = {};
    const match = reg.exec(str);
    if (match) {
        for (const line of match[0].matchAll(/(\w+):\s?["']?([\S\s]+?)["']?[\n,}]/g)) {
            obj[line[1]] = line[2];
        }
    }

    return obj;
};

const decrypt = (txt: string, articleid: string, chapterid: string, decryptionMap: Record<string, string>) => {
    if (!txt || txt.length < 10) {
        return txt;
    }

    const lineMap = {};
    const articleKey = Number(articleid) + 3_061_711;
    const chapterKey = Number(chapterid) + 3_421_001;
    for (const key of Object.keys(decryptionMap)) {
        lineMap[(Number(key) ^ chapterKey) - articleKey] = (Number(decryptionMap[key]) ^ chapterKey) - articleKey;
    }

    return txt
        .replaceAll(/\u2003|\n/g, '')
        .split('<br><br>')
        .flatMap((line, index, array) => (lineMap[index] ? array[lineMap[index]] : line).split('<br>'))
        .slice(1, -2)
        .join('<br><br>');
};
