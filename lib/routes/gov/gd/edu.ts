import { load } from 'cheerio';
import type { Context } from 'hono';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import { fixArticleContent } from '@/utils/wechat-mp';

export const route: Route = {
    path: '/edu/:caty',
    categories: ['government'],
    example: '/gov/gd/edu/gdjyxw',
    parameters: {
        caty: '资讯类别',
    },
    name: '省教育厅',
    maintainers: ['nczitzk'],
    handler,
    description: `| 时政要闻 | 广东教育新闻 | 图片新闻 | 战线联播 | 公示公告 | 教育政策法规 | 政策解读 |
| :------: | :----------: | :------: | :------: | :------: | :----------: | :------: |
|   szyw   |    gdjyxw    |   tpxw   |   zxlb   |   gsgg   |    jyzcfg    |   zcjd   |`,
};

const rootUrl = 'https://edu.gd.gov.cn/';

const config = {
    szyw: {
        link: '/jyzxnew/szyw/index.html',
        title: '时政要闻',
    },
    gdjyxw: {
        link: '/jyzxnew/gdjyxw/index.html',
        title: '广东教育新闻',
    },
    tpxw: {
        link: '/jyzxnew/tpxw/index.html',
        title: '图片新闻',
    },
    zxlb: {
        link: '/jyzxnew/zxlb/index.html',
        title: '战线联播',
    },
    gsgg: {
        link: '/zwgknew/gsgg/index.html',
        title: '公示公告',
    },
    jyzcfg: {
        link: '/zwgknew/jyzcfg/zc/index.html',
        title: '教育政策法规',
    },
    zcjd: {
        link: '/zwgknew/zcjd/index.html',
        title: '政策解读',
    },
};

async function handler(ctx: Context) {
    const { caty } = ctx.req.param();
    const cfg = config[caty];
    if (!Object.hasOwn(config, caty)) {
        throw new InvalidParameterError('Bad category. See docs');
    }

    const currentUrl = new URL(cfg.link, rootUrl).href;
    const response = await ofetch(currentUrl);

    const $ = load(response);
    const list = $('div.newsList ul.list li')
        .toArray()
        .map((item): DataItem => {
            const a = $(item).find('a');
            return {
                title: a.text(),
                link: a.attr('href'),
                pubDate: getPublicationDate($(item).find('span.time').text()),
            };
        });

    const items = await Promise.all(
        list.map(async (item) => {
            if (new URL(item.link!).hostname === 'mp.weixin.qq.com') {
                const article = await getWechatArticle(item.link!);
                return { ...item, ...article, pubDate: article.pubDate ?? item.pubDate };
            }
            return cache.tryGet(item.link!, async () => {
                if (!new URL(item.link!).hostname.endsWith('.gd.gov.cn')) {
                    return item;
                }
                const detailResponse = await ofetch(item.link!);
                const content = load(detailResponse);
                item.description = content('div.article').html();
                item.author = content('meta[name="ContentSource"]').attr('content');
                item.pubDate = getPublicationDate(content('div.message span.time').text().replace('时间：', '')) ?? getPublicationDate(content('meta[name="PubDate"]').attr('content')) ?? item.pubDate;
                return item;
            });
        })
    );

    return {
        title: `广东省教育厅 - ${cfg.title}`,
        link: currentUrl,
        item: items,
    };
}

function getPublicationDate(dateText: string | undefined) {
    const date = dateText ? parseDate(dateText) : undefined;
    return date && !Number.isNaN(date.getTime()) ? timezone(date, 8) : undefined;
}

function getWechatArticle(link: string) {
    // Older route caches contain only list metadata under the raw article URL.
    return cache.tryGet(`${link}:gov-gd-wechat`, async () => {
        const response = await ofetch<string, 'text'>(link, { responseType: 'text' });
        const $ = load(response);
        const content = $('#js_content');
        if (!content.length) {
            throw new Error(`WeChat article content is unavailable: ${link}`);
        }
        content.find('iframe[data-src]').each((_, iframe) => {
            const element = $(iframe);
            const src = element.attr('data-src');
            if (src && new URL(src).hostname === 'mp.weixin.qq.com') {
                element.attr('src', src).removeAttr('data-src');
            }
        });
        const timestamp = response.match(/\bvar\s+ct\s*=\s*["'](\d+)["']/)?.[1];
        const pubDate = timestamp ? parseDate(Number(timestamp) * 1000) : undefined;
        return {
            description: fixArticleContent(content),
            author: $('meta[name="author"]').attr('content') || $('#js_name').text().trim() || undefined,
            pubDate: pubDate && !Number.isNaN(pubDate.getTime()) ? pubDate : undefined,
        };
    });
}
