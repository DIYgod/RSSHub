import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const MAP = {
    news: '6277',
    scholar: '6278',
    states: '6279',
    notice: '6280',
};

const HEAD = {
    news: '学院新闻',
    scholar: '学术关注',
    states: '学工动态',
    notice: '通知公告',
};
export const route: Route = {
    path: '/jsj/:type',
    categories: ['university'],
    example: '/upc/jsj/news',
    parameters: { type: '分类，见下表' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '计算机科学与技术学院',
    maintainers: ['Veagau'],
    handler,
    description: `| 学院新闻 | 学术关注 | 学工动态 | 通知公告 |
| -------- | -------- | -------- | -------- |
| news     | scholar  | states   | notice   |`,
};
function parseArticleAuthor(byline: string | undefined) {
    const prefix = byline && /^【(?:作者(?:、[^：:]+)?|文字)[：:]\s*/.exec(byline);
    if (!prefix) {
        return;
    }
    const remainder = byline!.slice(prefix[0].length);
    const firstLineBreak = remainder.search(/[\r\n\u{2028}\u{2029}]/u);
    for (const marker of remainder.matchAll(/摄影|图片|责任编辑|编辑|审核|】/g)) {
        if (!marker.index) {
            continue;
        }
        let boundary = marker.index;
        if (marker[0] !== '】') {
            while (boundary > 0 && /\s/.test(remainder[boundary - 1])) {
                boundary--;
            }
            if (remainder[boundary - 1] === '|' || remainder[boundary - 1] === '｜') {
                boundary--;
                while (boundary > 0 && /\s/.test(remainder[boundary - 1])) {
                    boundary--;
                }
            }
            boundary = Math.max(1, boundary);
        }
        if (firstLineBreak === -1 || boundary <= firstLineBreak) {
            const author = remainder.slice(0, boundary);
            return author.trim() || undefined;
        }
    }
}

async function handler(ctx) {
    const baseUrl = 'https://computer.upc.edu.cn';
    const type = ctx.req.param('type');
    const link = `${baseUrl}/${MAP[type]}/list.htm`;
    const response = await got({
        method: 'get',
        url: link,
    });
    const $ = load(response.data);

    const list = $('div[portletmode=simpleList] .li').length ? $('div[portletmode=simpleList] .li') : $('.list tbody table tr');
    const entries = list.toArray().map((item): DataItem => {
        const $item = $(item);
        const a = $item.find('a');
        const link = a.attr('href');
        return {
            title: a.attr('title')!,
            link: link!.startsWith('http') ? link : `${baseUrl}${link}`,
            pubDate: $item.find('div[style]').text() ? timezone(parseDate($item.find('div[style]').text(), 'YYYY-MM-DD'), 8) : undefined,
        };
    });

    const out = await pMap(
        entries,
        async (item) => {
            const details = await cache.tryGet<Pick<DataItem, 'description' | 'pubDate' | 'author'>>(`upc:jsj:detail:${item.link}`, async () => {
                const details: Pick<DataItem, 'description' | 'pubDate' | 'author'> = {};

                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const $ = load(detailResponse.data);
                const detailContent = $('.v_news_content, .wp_articlecontent').first();
                const authorLabel = $('.arti_publisher')
                    .toArray()
                    .map((element) => $(element).text())
                    .find((text) => /^作者[：:]/.test(text));
                const byline = detailContent
                    .find('p')
                    .toArray()
                    .map((element) => $(element).text().trim())
                    .find((text) => /^【(?:作者(?:、[^：:]+)?|文字)[：:]/.test(text));
                details.author = authorLabel?.replace(/^作者[：:]\s*/, '').trim() || parseArticleAuthor(byline) || undefined;
                detailContent
                    .find('p')
                    .filter((_, element) => /^【(?:作者(?:、[^：:]+)?|文字)[：:][^【】]+】$/.test($(element).text().trim()))
                    .remove();
                details.description = detailContent.html();
                const published = $('.nr-xinxi i').first().text().trim();
                details.pubDate = published ? timezone(parseDate(published, 'YYYY-MM-DD HH:mm:ss'), 8) : undefined;

                return details;
            });
            return { ...item, ...details, pubDate: details.pubDate ?? item.pubDate };
        },
        { concurrency: 3 }
    );
    return {
        title: HEAD[type] + '-计算机科学与技术学院',
        link,
        description: HEAD[type] + '-计算机科学与技术学院',
        item: out,
    };
}
