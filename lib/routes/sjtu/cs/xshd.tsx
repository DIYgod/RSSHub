import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
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

function publishDateFromImage(imageUrl: string): Date | undefined {
    // Image path encodes upload date: /upload/image/YYYYMMDD/...
    const m = imageUrl.match(/\/upload\/[^/]+\/(\d{4})(\d{2})(\d{2})\//);
    if (!m) {
        return undefined;
    }
    const [, y, mo, d] = m;
    return timezone(parseDate(`${y}-${mo}-${d}`, 'YYYY-MM-DD'), +8);
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

function rewriteRelativeUrls($: CheerioAPI, item: Cheerio<any>): void {
    item.find('img').each((_, e) => {
        const src = $(e).attr('src') || $(e).attr('_src');
        if (src) {
            $(e).attr('src', absolutize(src));
        }
    });
    item.find('a').each((_, e) => {
        const href = $(e).attr('href');
        if (href) {
            $(e).attr('href', absolutize(href));
        }
    });
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
        pubDate: publishDateFromImage(item.image),
    };
}

function enrichItem(item: ListItem): Promise<DataItem> {
    return cache.tryGet(item.link, async () => {
        const response = await ofetch.raw<string>(item.link);
        const finalUrl = response.url;
        let description = renderDescription(item);
        let pubDate = publishDateFromImage(item.image);

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
                rewriteRelativeUrls($, $txt);
                description += `<hr>${$txt.html() ?? ''}`;

                const publishedText = $body.find('.jj p').first().text();
                const publishedMatch = publishedText.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
                if (publishedMatch) {
                    const [, y, m, d] = publishedMatch;
                    pubDate = timezone(parseDate(`${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`, 'YYYY-MM-DD'), +8);
                }
            }
        }

        return {
            title: item.title,
            link: item.link,
            description,
            author: item.speakers || undefined,
            image: item.image || undefined,
            pubDate,
        };
    }) as Promise<DataItem>;
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
    const settledItems = await Promise.allSettled(items.map((it) => enrichItem(it)));
    const enriched = settledItems.map((result, index) => (result.status === 'fulfilled' ? result.value : basicItem(items[index])));

    return {
        title: '上海交通大学计算机学院 - 学术活动',
        link: listLink,
        description: '上海交通大学计算机学院（网络空间安全学院、密码学院）学术活动',
        language: 'zh-CN',
        item: enriched,
    };
}
