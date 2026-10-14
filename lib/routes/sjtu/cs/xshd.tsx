import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';
import pMap from 'p-map';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { fetchArticle, WeChatMpError } from '@/utils/wechat-mp';

const host = 'https://www.cs.sjtu.edu.cn';

interface ListItem {
    title: string;
    link: string;
    image: string;
    location: string;
    topic: string;
    speakers: string;
    timeText: string;
}

function absolutize(url: string | undefined): string {
    if (!url) {
        return '';
    }
    return new URL(url, host).href;
}

function parseListing(html: string): ListItem[] {
    const $ = load(html);
    return $('.ny-con .u12 > li')
        .toArray()
        .map((el) => {
            const $el = $(el);
            const link = absolutize($el.find('> a').attr('href'));
            const title = $el.find('.txt .tit').text();
            const image = absolutize($el.find('.imgk img').attr('src'));
            const adRows = $el
                .find('.txt .ad p')
                .toArray()
                .map((p) => $(p).find('span').text().trim())
                .filter(Boolean);
            const findRow = (prefix: string) => adRows.find((s) => s.startsWith(prefix))?.slice(prefix.length) ?? '';
            return {
                title,
                link,
                image,
                timeText: findRow('时间：'),
                location: findRow('地点：'),
                speakers: findRow('报告人：'),
                topic: findRow('主题：'),
            };
        })
        .filter((it) => it.link && it.title);
}

function renderDescription(item: ListItem): string {
    return renderToString(
        <>
            {item.timeText && <p>举办时间：{item.timeText}</p>}
            {item.location && <p>地点：{item.location}</p>}
            {item.topic && <p>主题：{item.topic}</p>}
        </>
    );
}

function extractWechatUrl(finalUrl: string): string {
    const url = new URL(finalUrl);
    return url.searchParams.get('target_url') || finalUrl;
}

function basicItem(item: ListItem): DataItem {
    return {
        title: item.title,
        link: item.link,
        description: renderDescription(item),
        author: item.speakers || undefined,
        image: item.image || undefined,
    };
}

async function enrichItem(item: ListItem): Promise<DataItem> {
    const details = await cache.tryGet(`sjtu:cs:activity:v4:${item.link}`, async () => {
        const response = await ofetch.raw<string>(item.link);
        const finalUrl = response.url;
        let description = '';
        let pubDate: Date | undefined;

        if (new URL(finalUrl).hostname === 'mp.weixin.qq.com') {
            try {
                const article = await fetchArticle(extractWechatUrl(finalUrl));
                description += `<hr>${article.description}`;
                pubDate = article.pubDate || pubDate;
            } catch (error) {
                if (!(error instanceof WeChatMpError)) {
                    throw error;
                }
            }
        } else {
            const $ = load(response._data ?? '');
            const $body = $('.xw-cont');
            if ($body.length > 0) {
                const $txt = $body.find('.txt');
                description += `<hr>${$txt.html() ?? ''}`;

                const publishedText = $body.find('.jj p').first().text();
                const publishedMatch = publishedText.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
                if (publishedMatch) {
                    const [, y, m, d] = publishedMatch;
                    pubDate = parseDate(`${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')} +0000`, 'YYYY-MM-DD ZZ');
                }
            }
        }

        return { description, pubDate };
    });
    return { ...basicItem(item), description: renderDescription(item) + details.description, pubDate: details.pubDate };
}

async function enrichItemSafely(item: ListItem): Promise<DataItem> {
    try {
        return await enrichItem(item);
    } catch {
        return basicItem(item);
    }
}

export const route: Route = {
    path: '/cs/xshd',
    categories: ['university'],
    example: '/sjtu/cs/xshd',
    parameters: {},
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
            source: ['www.cs.sjtu.edu.cn/xshd.html'],
            target: '/cs/xshd',
        },
    ],
    name: '计算机学院 - 学术活动',
    maintainers: ['BeaCox'],
    handler,
    url: 'www.cs.sjtu.edu.cn/xshd.html',
};

async function handler(): Promise<Data> {
    const listLink = `${host}/xshd.html`;
    const data = await ofetch<string>(listLink);
    const items = parseListing(data);
    const enriched = await pMap(items, enrichItemSafely, { concurrency: 3 });

    return {
        title: '上海交通大学计算机学院 - 学术活动',
        link: listLink,
        description: '上海交通大学计算机学院（网络空间安全学院、密码学院）学术活动',
        language: 'zh-CN',
        item: enriched,
    };
}
