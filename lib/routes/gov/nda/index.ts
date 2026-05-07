import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

interface ChannelEntry {
    name: string;
    path: string;
}

interface SubChannelEntry {
    name: string;
    path: string;
}

// Channel map: channel key → { name, path, subchannels? }
// Main channels and subchannels are all flat-accessible by key
const channelMap: Record<string, ChannelEntry> = {};
const subChannelMap: Record<string, Record<string, SubChannelEntry>> = {};

// --- Main channels ---
const mainChannels: Record<string, string> = {
    swdt: '新闻动态',
    ywpd: '业务频道',
    zwgk: '政务公开',
};

for (const [key, name] of Object.entries(mainChannels)) {
    channelMap[key] = { name, path: `/sjj/${key}` };
}

// --- Subchannels under swdt (新闻动态) ---
const swdtSubs: Record<string, string> = {
    xwfb: '新闻发布',
    jlddt: '领导活动',
    sjdt: '司局动态',
    dfdt: '地方动态',
    mtsy: '媒体声音',
};

subChannelMap.swdt = {};
for (const [key, name] of Object.entries(swdtSubs)) {
    const path = `/sjj/swdt/${key}`;
    subChannelMap.swdt[key] = { name, path };
    channelMap[key] = { name, path };
}

// --- Subchannels under ywpd (业务频道) ---
const ywpdSubs: Record<string, string> = {
    sjzg: '数字中国',
    zcgh: '政策规划',
    sjzy: '数据资源',
    szjj: '数字经济',
    szsh: '数字社会',
    szkjyjcss: '数字科技和基础设施',
    gjjlhz: '国际交流合作',
};

subChannelMap.ywpd = {};
for (const [key, name] of Object.entries(ywpdSubs)) {
    const path = `/sjj/ywpd/${key}`;
    subChannelMap.ywpd[key] = { name, path };
    channelMap[key] = { name, path };
}

// --- Subchannels under zwgk (政务公开) ---
const zwgkSubs: Record<string, string> = {
    zcfb: '政策发布',
    zcjd: '政策解读',
    zjjd: '专家解读',
    tzgg: '通知公告',
};

subChannelMap.zwgk = {};
for (const [key, name] of Object.entries(zwgkSubs)) {
    const path = `/sjj/zwgk/${key}`;
    subChannelMap.zwgk[key] = { name, path };
    channelMap[key] = { name, path };
}

const validChannels = new Set(Object.keys(channelMap));
const baseUrl = 'https://www.nda.gov.cn';

function getChannelInfo(channel: string, subchannel?: string): { basePath: string; channelName: string } {
    if (subchannel) {
        // If subchannel is specified, check if it's valid under this parent
        const parentSubs = subChannelMap[channel];
        if (parentSubs?.[subchannel]) {
            return { basePath: parentSubs[subchannel].path, channelName: parentSubs[subchannel].name };
        }
        // Subchannel exists in global channelMap but not under this parent
        if (channelMap[subchannel]) {
            throw new Error(`"${subchannel}" is not a subchannel of "${channel}". Access it directly as /nda/${subchannel}`);
        }
        // Dynamic subchannel (not in any map)
        return { basePath: `/sjj/${channel}/${subchannel}`, channelName: subchannel };
    }
    // No subchannel: return the channel itself
    const entry = channelMap[channel];
    if (entry) {
        return { basePath: entry.path, channelName: entry.name };
    }
    // Dynamic channel (not in channelMap)
    return { basePath: `/sjj/${channel}`, channelName: channel };
}

async function handler(ctx) {
    const { channel = 'swdt', subchannel } = ctx.req.param();

    // Validate channel
    if (!validChannels.has(channel)) {
        throw new Error(`不支持的栏目: ${channel}，可选: ${[...validChannels].join(', ')}`);
    }

    const { basePath, channelName } = getChannelInfo(channel, subchannel);
    const listUrl = `${baseUrl}${basePath}/list/index_pc_1.html`;

    const { data: listResponse } = await got(listUrl);
    const $ = load(listResponse);

    const items = $('a[href*="_pc.html"]')
        .toArray()
        .filter((el) => {
            const href = $(el).attr('href') || '';
            return href.includes('_pc.html') && !href.includes('/list/') && !href.includes('/sjj/index_pc.html') && !href.endsWith('/index_pc.html') && !href.endsWith('index_pc.html');
        })
        .map((el) => {
            const $el = $(el);
            const href = $el.attr('href') || '';
            return {
                title: $el.attr('title') || $el.text().trim(),
                link: new URL(href, baseUrl).href,
            };
        });

    // Deduplicate
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
    path: '/nda/:channel?/:subchannel?',
    name: '栏目内容',
    maintainers: ['benzking'],
    categories: ['government'],
    example: '/nda/swdt',
    parameters: {
        channel: '栏目简称，默认 swdt。可选: swdt, ywpd, zwgk',
        subchannel: '子栏目简称，可选。如 swdt 下有 xwfb, jlddt, sjdt, dfdt, mtsy；ywpd 下有 sjzg, zcgh, sjzy, szjj, szsh, szkjyjcss, gjjlhz；zwgk 下有 zcfb, zcjd, zjjd, tzgg',
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
        { source: ['www.nda.gov.cn/'], target: '/nda' },
        { source: ['www.nda.gov.cn/sjj/:channel/list/index_pc_1.html'], target: '/nda/:channel' },
        { source: ['www.nda.gov.cn/sjj/:channel/:subchannel/list/index_pc_1.html'], target: '/nda/:channel/:subchannel' },
    ],
    description: `国家数据局官方网站内容订阅，支持主栏目和子栏目。

| 主栏目 | 简称 | 子栏目 | 简称 |
|------|------|-------|------|
| 新闻动态 | swdt | 新闻发布, 领导活动, 司局动态, 地方动态, 媒体声音 | xwfb, jlddt, sjdt, dfdt, mtsy |
| 业务频道 | ywpd | 数字中国, 政策规划, 数据资源, 数字经济, 数字社会, 数字科技和基础设施, 国际交流合作 | sjzg, zcgh, sjzy, szjj, szsh, szkjyjcss, gjjlhz |
| 政务公开 | zwgk | 政策发布, 政策解读, 专家解读, 通知公告 | zcfb, zcjd, zjjd, tzgg |`,
    handler,
};
