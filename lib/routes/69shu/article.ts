import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

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
        const html = await get(link);
        const $ = load(html);

        const item = await Promise.all(
            $('.qustime li>a')
                .toArray()
                .map((chapter) => createItem(new URL(chapter.attribs.href, link).href))
        );

        return {
            title: $('h1>a').text(),
            description: $('.navtxt>p:first-of-type').text(),
            link,
            item,
            image: $('.bookimg2>img').attr('src'),
            author: $('.booknav2>p:first-of-type>a').text(),
            language: 'zh-CN',
        };
    },
};

const createItem = (url: string) =>
    cache.tryGet(url, async (): Promise<DataItem> => {
        const html = await get(url);
        const $ = load(html);
        const { articleid, chapterid, chaptername } = parseObject(/bookinfo\s?=\s?\{[\s\S]+?\}/, $('head>script:not([src])').text());
        const decryptionMap = parseObject(/_\d+\s?=\s?\{[\s\S]+?\}/, $('.txtnav+script').text());
        const content = $('.txtnav');
        const encryptedContent = content.html() || '';
        const title = chaptername || content.find('h1').text() || $('h1').first().text();
        const pubDate = content
            .find('.txtinfo span')
            .first()
            .text()
            .match(/\d{4}-\d{2}-\d{2}/)?.[0];
        const author =
            content
                .find('.txtinfo span')
                .eq(1)
                .text()
                .replace(/^作者[：:]\s*/, '') || undefined;

        content.find('h1, .txtinfo, #txtright, .bottom-ad, script').remove();
        content
            .contents()
            .filter((_, node) => node.type === 'text' && $(node).text().trim() === title)
            .remove();

        return {
            title,
            description: Object.keys(decryptionMap).length ? decrypt(encryptedContent, articleid, chapterid, decryptionMap) : content.html(),
            pubDate: pubDate ? timezone(parseDate(pubDate, 'YYYY-MM-DD'), 8) : undefined,
            author,
            link: url,
        };
    });

const get = async (url: string) => new TextDecoder('gbk').decode(await ofetch(url, { responseType: 'arrayBuffer' }));

const parseObject = (reg: RegExp, str: string) => {
    const obj: Record<string, string> = {};
    const match = reg.exec(str);
    if (match) {
        const matchedLines = match[0].matchAll(/(\w+):\s?["']?([\s\S]+?)["']?[\n,}]/g);
        for (const line of matchedLines) {
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
    for (const [key, value] of Object.entries(decryptionMap)) {
        lineMap[(Number(key) ^ chapterKey) - articleKey] = (Number(value) ^ chapterKey) - articleKey;
    }

    return txt
        .replaceAll(/\u{2003}|\n/gu, '')
        .split('<br><br>')
        .flatMap((line, index, array) => {
            const mapped = lineMap[index];
            return (mapped === undefined ? line : array[mapped]).split('<br>');
        })
        .slice(1, -2)
        .join('<br><br>');
};
