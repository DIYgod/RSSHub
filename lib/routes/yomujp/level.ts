import { type Cheerio, type CheerioAPI, load } from 'cheerio';
import { type AnyNode, cloneNode, Document } from 'domhandler';

import type { Data, Route } from '@/types';
import got from '@/utils/got';
import md5 from '@/utils/md5';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/:level?',
    categories: ['reading'],
    example: '/yomujp/n1',
    parameters: { level: '等级，n1~n6，为空默认全部' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: true,
        supportScihub: false,
    },
    radar: [
        {
            source: ['yomujp.com/', 'yomujp.com/:level'],
            target: '/:level',
        },
    ],
    name: '等级',
    maintainers: ['eternasuno'],
    handler,
    url: 'yomujp.com/',
};
function parseGmtDate(value: string | undefined) {
    if (!value) {
        return;
    }
    const date = parseDate(value.replace(/(?:Z|\+00:00)$/, ''), ['YYYY-MM-DDTHH:mm:ss', 'YYYY-MM-DDTHH:mm:ss.SSS'], true);
    if (Number.isFinite(date.getTime())) {
        return timezone(date, 0);
    }
}
function getAuthor($: CheerioAPI) {
    const paragraph = $('.elementor-widget-text-editor > .elementor-widget-container p')
        .toArray()
        .find((paragraph) => /^\s*文[：:]/.test($(paragraph).text()));
    if (paragraph) {
        const credit = copyContent($(paragraph), $);
        credit.find('br').replaceWith('\n');
        return (
            credit
                .text()
                .trimStart()
                .replace(/^文[：:][^\S\r\n]*/, '')
                .split('\n', 1)[0]
                .trim() || undefined
        );
    }
    return (
        $('section:last-of-type p:first-of-type')
            .text()
            .replaceAll(/[\t\n\r]/g, '')
            .replace(/^.+：/, '') || undefined
    );
}
async function handler(ctx): Promise<Data> {
    const level = formatLevel(ctx.req.param('level'));
    const requestedLimit = Number(ctx.req.query('limit') ?? 10);
    const limit = Number.isFinite(requestedLimit) && requestedLimit >= 1 ? Math.min(Math.floor(requestedLimit), 100) : 10;
    const url = new URL('https://yomujp.com/wp-json/wp/v2/posts');
    url.searchParams.append('categories', getLevel(level));
    url.searchParams.append('per_page', `${limit}`);
    const posts = await get(url);
    const item = posts.map((post) => {
        const $ = load(post.content.rendered);
        const audio = $('audio > source').first();
        const description = $('.elementor-widget-text-editor > .elementor-widget-container, .elementor-widget-image > .elementor-widget-container')
            .toArray()
            .filter((el) => !/^\s*文[：:]/.test($(el).text()))
            .map((el) => $(el).html() ?? '')
            .join('');
        return {
            title: post.title.rendered,
            author: getAuthor($),
            description,
            pubDate: parseGmtDate(post.date_gmt),
            updated: parseGmtDate(post.modified_gmt),
            guid: md5(post.guid.rendered),
            link: post.link,
            itunes_item_image: $('section:nth-of-type(2) img').attr('src'),
            enclosure_url: audio.attr('src'),
            enclosure_type: audio.attr('type'),
        };
    });
    return {
        title: level ? `${level.toUpperCase()} | 日本語多読道場` : '日本語多読道場',
        link: `https://yomujp.com/${level}`,
        description: 'みなさん、こんにちは。 「 日本語多読道場(にほんごたどくどうじょう) Yomujp」は日本語を勉強する人のための読みものサイト（website）です。 日本の地理、食べもの、動物、植物、文化や歴史などを紹介します。',
        language: 'ja',
        itunes_author: 'Yomujp',
        image: 'https://yomujp.com/wp-content/uploads/2023/08/top1-2-300x99-1.png',
        item,
    };
}
const formatLevel = (level) => {
    const lowerCaseLevel = level?.toLowerCase();
    switch (lowerCaseLevel) {
        case 'n6':
            return 'n5l';
        case 'n5l':
        case 'n5':
        case 'n4':
        case 'n3':
        case 'n2':
        case 'n1':
            return lowerCaseLevel;
        default:
            return '';
    }
};
const getLevel = (level) => {
    switch (level) {
        case 'n6':
        case 'n5l':
            return '27';
        case 'n5':
            return '26';
        case 'n4':
            return '21';
        case 'n3':
            return '20';
        case 'n2':
            return '19';
        case 'n1':
            return '17';
        default:
            return '17,19,20,21,26,27';
    }
};
const get = async (url) => {
    const response = await got({ method: 'get', url });
    return response.data;
};
function copyContent<T extends AnyNode>(selection: Cheerio<T>, $: CheerioAPI): Cheerio<T> {
    const nodes = selection.toArray().map((node) => cloneNode(node, true));
    const root = new Document(nodes);
    for (const node of nodes) {
        node.parent = root;
    }
    return $(nodes);
}
