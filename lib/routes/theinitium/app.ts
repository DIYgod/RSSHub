import type { Route } from '@/types';

import { applyLanguageToTagSlug, CHANNEL_TAG_MAP, ghostFetch, postsToItems } from './utils';

// Reason: Old app categories map to Ghost channel tag + language.
// The _sc suffix = Simplified Chinese (zh-hans), _tc = Traditional Chinese (zh-hant).
const APP_CATEGORY_MAP: Record<string, { channelType: string; language: string }> = {
    latest_sc: { channelType: 'latest', language: 'zh-hans' },
    latest_tc: { channelType: 'latest', language: 'zh-hant' },
    daily_brief_sc: { channelType: 'daily-brief', language: 'zh-hans' },
    daily_brief_tc: { channelType: 'daily-brief', language: 'zh-hant' },
    whats_new_sc: { channelType: 'whatsnew', language: 'zh-hans' },
    whats_new_tc: { channelType: 'whatsnew', language: 'zh-hant' },
    report_sc: { channelType: 'feature', language: 'zh-hans' },
    report_tc: { channelType: 'feature', language: 'zh-hant' },
    opinion_sc: { channelType: 'opinion', language: 'zh-hans' },
    opinion_tc: { channelType: 'opinion', language: 'zh-hant' },
    international_sc: { channelType: 'international', language: 'zh-hans' },
    international_tc: { channelType: 'international', language: 'zh-hant' },
    mainland_sc: { channelType: 'mainland', language: 'zh-hans' },
    mainland_tc: { channelType: 'mainland', language: 'zh-hant' },
    hongkong_sc: { channelType: 'hongkong', language: 'zh-hans' },
    hongkong_tc: { channelType: 'hongkong', language: 'zh-hant' },
    taiwan_sc: { channelType: 'taiwan', language: 'zh-hans' },
    taiwan_tc: { channelType: 'taiwan', language: 'zh-hant' },
};

// Reason: Display labels for the old app categories, kept for RSS feed titles
const APP_CATEGORY_LABELS: Record<string, string> = {
    latest_sc: '最新',
    latest_tc: '最新',
    daily_brief_sc: '日报',
    daily_brief_tc: '日報',
    whats_new_sc: '速递',
    whats_new_tc: '速遞',
    report_sc: '专题',
    report_tc: '專題',
    opinion_sc: '评论',
    opinion_tc: '評論',
    international_sc: '国际',
    international_tc: '國際',
    mainland_sc: '大陆',
    mainland_tc: '大陸',
    hongkong_sc: '香港',
    hongkong_tc: '香港',
    taiwan_sc: '台湾',
    taiwan_tc: '台灣',
};

export const route: Route = {
    path: '/app/:category?',
    categories: ['new-media'],
    example: '/theinitium/app',
    parameters: {
        category: 'Category, see below, latest_sc by default',
    },
    features: {
        requireConfig: [
            {
                name: 'INITIUM_MEMBER_COOKIE',
                optional: true,
                description: '端传媒会员登录后的 Cookie，用于获取付费文章全文。',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'App',
    maintainers: ['quiniapiezoelectricity'],
    radar: [
        {
            source: ['theinitium.com/latest/'],
            target: '/app/latest_sc',
        },
    ],
    handler,
    description: `Category 栏目：

| ----- | 简体中文     | 繁體中文      |
| ----- | ----------------- | ---------------- |
| 最新   | latest_sc | latest_tc |
| 日报   | daily_brief_sc | daily_brief_tc |
| 速递   | whats_new_sc | whats_new_tc |
| 专题   | report_sc | report_tc |
| 评论   | opinion_sc | opinion_tc |
| 国际   | international_sc | international_tc |
| 大陆   | mainland_sc | mainland_tc |
| 香港   | hongkong_sc | hongkong_tc |
| 台湾   | taiwan_sc | taiwan_tc |

:::tip
原 App 路由已迁移至 Ghost CMS API。播客（article_audio）分类已停用，请改用 \`/theinitium/channel\` 路由。
:::`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'latest_sc';

    const mapping = APP_CATEGORY_MAP[category];
    if (!mapping) {
        throw new Error(`Unknown category: ${category}. Supported: ${Object.keys(APP_CATEGORY_MAP).join(', ')}`);
    }

    const { channelType, language } = mapping;

    // Reason: Reuse the same Ghost tag filter logic as processFeed's channel case
    const baseTag = CHANNEL_TAG_MAP[channelType] ?? channelType;
    let filter = '';
    if (baseTag === '') {
        // "latest" = no tag filter, just filter by language via internal tag
        filter = `tag:hash-${language}`;
    } else {
        const tagSlug = applyLanguageToTagSlug(baseTag, language);
        filter = `tag:${tagSlug}`;
    }

    const params: Record<string, string> = {
        include: 'tags,authors',
        limit: '20',
        filter,
    };

    const data = await ghostFetch('posts', params);
    const items = await postsToItems(data.posts);

    const label = APP_CATEGORY_LABELS[category] ?? category;
    const name = language === 'zh-hans' ? '端传媒' : '端傳媒';

    return {
        title: `${name} - ${label}`,
        link: 'https://theinitium.com/latest/',
        icon: 'https://theinitium.com/favicon.ico',
        language: language === 'zh-hans' ? 'zh-CN' : 'zh-TW',
        item: items,
    };
}
