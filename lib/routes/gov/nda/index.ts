import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

// 栏目映射：key → { name: 中文名, path: URL路径 }
const channelMap: Record<string, { name: string; path: string }> = {
    swdt: { name: '新闻动态', path: '/sjj/swdt' },
    ywpd: { name: '业务频道', path: '/sjj/ywpd' },
    zwgk: { name: '政务公开', path: '/sjj/zwgk' },
    xwfb: { name: '新闻发布', path: '/sjj/swdt/xwfb' },
    jlddt: { name: '领导活动', path: '/sjj/swdt/jlddt' },
    sjdt: { name: '数据动态', path: '/sjj/swdt/sjdt' },
    dfdt: { name: '地方动态', path: '/sjj/swdt/dfdt' },
    mtsy: { name: '媒体声音', path: '/sjj/swdt/mtsy' },
    sjzy: { name: '数据资源', path: '/sjj/ywpd/sjzy' },
    szkj: { name: '数字科技', path: '/sjj/ywpd/szkjyjcss' },
    zjjd: { name: '专家解读', path: '/sjj/zwgk/zjjd' },
    zcjd: { name: '政策解读', path: '/sjj/zwgk/zcjd' },
};

const validChannels = new Set(Object.keys(channelMap));
const baseUrl = 'https://www.nda.gov.cn';

// 计算请求路径和栏目名
function resolveChannel(channel: string, subchannel: string | undefined) {
    // 子栏目作为直接 key（如 /xwfb）
    if (subchannel && channelMap[subchannel]) {
        return { basePath: channelMap[subchannel].path, channelName: channelMap[subchannel].name };
    }
    // channel 是子栏目 key（如 xwfb → /sjj/swdt/xwfb）
    if (channelMap[channel]?.path.includes('/')) {
        return { basePath: channelMap[channel].path, channelName: channelMap[channel].name };
    }
    // channel 是主栏目 key（如 swdt → /sjj/swdt）
    if (channelMap[channel]) {
        return { basePath: channelMap[channel].path, channelName: channelMap[channel].name };
    }
    // 动态组合（不在 channelMap 中的 channel/subchannel）
    if (subchannel) {
        return { basePath: `/sjj/${channel}/${subchannel}`, channelName: channel };
    }
    return { basePath: `/sjj/${channel}`, channelName: channel };
}

async function handler(ctx) {
    const { channel = 'swdt', subchannel } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 20;

    // 提前校验 channel 合法性
    if (!validChannels.has(channel) && !(subchannel && validChannels.has(subchannel))) {
        const dynamicChannels = new Set(['swdt', 'ywpd', 'zwgk']);
        if (!dynamicChannels.has(channel)) {
            throw new Error(`不支持的栏目: ${channel}，可选: ${[...validChannels].join(', ')}`);
        }
    }

    const { basePath, channelName } = resolveChannel(channel, subchannel);
    const listUrl = `${baseUrl}${basePath}/list/index_pc_1.html`;

    const { data: listResponse } = await got(listUrl);
    const $ = load(listResponse);

    const items = $('a[href*="_pc.html"]')
        .toArray()
        .filter((el) => {
            const href = $(el).attr('href') || '';
            return href.includes('_pc.html') && !href.includes('/list/') && !href.includes('/sjj/index_pc.html') && !href.endsWith('/index_pc.html') && !href.endsWith('index_pc.html');
        })
        .slice(0, limit)
        .map((el) => {
            const $el = $(el);
            const href = $el.attr('href') || '';
            return {
                title: $el.attr('title') || $el.text().trim(),
                link: new URL(href, baseUrl).href,
            };
        });

    // 去重
    const seen = new Set<string>();
    const uniqueItems = items.filter((item) => {
        if (seen.has(item.link)) {
            return false;
        }
        seen.add(item.link);
        return true;
    });

    const detailedItems = await Promise.all(
        uniqueItems.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);
                const $detail = load(detailResponse);

                const metaTitle = $detail('meta[name="ArticleTitle"]').prop('content') || item.title;
                const pubDateStr = $detail('meta[name="PubDate"]').prop('content') || '';
                const author = $detail('meta[name="ContentSource"]').prop('content') || '国家数据局';
                const column = $detail('meta[name="ColumnName"]').prop('content') || '';

                const pubDate = pubDateStr ? timezone(parseDate(pubDateStr, 'YYYY.MM.DD'), +8) : undefined;

                const articleContent = $detail('div.article').html() || $detail('div.detail').html() || '';
                const $content = load(articleContent);

                $content('img').each((_, el) => {
                    const src = $content(el).attr('src') || $content(el).attr('oldsrc') || '';
                    if (src) {
                        $content(el).attr('src', new URL(src, item.link).href);
                    }
                });

                $content('a').each((_, el) => {
                    const href = $content(el).attr('href') || '';
                    if (href && !href.startsWith('http') && (href.endsWith('.pdf') || href.endsWith('.doc') || href.endsWith('.docx') || href.endsWith('.xls') || href.endsWith('.xlsx'))) {
                        $content(el).attr('href', new URL(href, item.link).href);
                    }
                });

                return {
                    title: metaTitle,
                    link: item.link,
                    description: $content.html(),
                    pubDate,
                    author,
                    category: column ? [column] : undefined,
                };
            })
        )
    );

    const validItems = detailedItems.filter((item) => item.title && item.link);

    return {
        title: `国家数据局 - ${channelName}`,
        link: listUrl,
        description: `国家数据局${channelName}栏目的最新文章`,
        item: validItems,
        language: 'zh-CN',
    };
}

export const route: Route = {
    path: '/:channel?/:subchannel?',
    name: '国家数据局',
    maintainers: ['benzking'],
    categories: ['government'],
    example: '/gov/nda/swdt',
    parameters: {
        channel: '栏目简称，默认 swdt。可选: swdt, ywpd, zwgk, xwfb, jlddt, sjdt, dfdt, mtsy, sjzy, szkj, zjjd, zcjd',
        subchannel: '子栏目，可选',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        { source: ['www.nda.gov.cn/'], target: '/gov/nda' },
        { source: ['www.nda.gov.cn/sjj/:channel/list/index_pc_1.html'], target: '/gov/nda/:channel' },
    ],
    description: `国家数据局官方网站内容订阅，支持主栏目和子栏目。

| 栏目 | 简称 | 路径 |
| ---- | ---- | ---- |
| 新闻动态 | swdt | /sjj/swdt |
| 业务频道 | ywpd | /sjj/ywpd |
| 政务公开 | zwgk | /sjj/zwgk |
| 新闻发布 | xwfb | /sjj/swdt/xwfb |
| 领导活动 | jlddt | /sjj/swdt/jlddt |
| 数据动态 | sjdt | /sjj/swdt/sjdt |
| 地方动态 | dfdt | /sjj/swdt/dfdt |
| 媒体声音 | mtsy | /sjj/swdt/mtsy |
| 数据资源 | sjzy | /sjj/ywpd/sjzy |
| 数字科技 | szkj | /sjj/ywpd/szkjyjcss |
| 专家解读 | zjjd | /sjj/zwgk/zjjd |
| 政策解读 | zcjd | /sjj/zwgk/zcjd |`,
    handler,
};
