import { load } from 'cheerio';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const categories = {
    all: {
        en: { name: 'All', path: 'about/news/all-news' },
        zh: { name: '全部', path: 'about/news/all-news' },
    },
    anniversary: {
        en: { name: 'XJTLU 20th Anniversary', path: 'news/xjtlu-20th-anniversary-en' },
        zh: { name: '西浦20周年', path: 'news/xjtlu-20th-anniversary' },
    },
    technology: {
        en: { name: 'Science and Technology', path: 'news/science-and-technology' },
        zh: { name: '科技', path: 'news/technology' },
    },
    business: {
        en: { name: 'Business', path: 'news/business' },
        zh: { name: '商业管理', path: 'news_category/topictopic1680' },
    },
    environment: {
        en: { name: 'Built Environment', path: 'news/built-environment' },
        zh: { name: '建筑环境', path: 'news_category/topictopic1670' },
    },
    humanities: {
        en: { name: 'Humanities and Social Sciences', path: 'news/humanities-and-social-sciences' },
        zh: { name: '人文社科', path: 'news_category/topictopic1672' },
    },
    community: {
        en: { name: 'Community', path: 'news/community' },
        zh: { name: '校园与社区', path: 'news_category/topictopic1679' },
    },
    about: {
        en: { name: 'About XJTLU', path: 'news/about-xjtlu' },
        zh: { name: '要闻聚焦', path: 'news_category/%E8%A6%81%E9%97%BB%E8%81%9A%E7%84%A6' },
    },
    stories: {
        en: { name: 'XJTLU Stories', path: 'news/xjtlu-stories' },
        zh: { name: '招生专区', path: 'news_category/topictopic4683' },
    },
};

const handler = async (ctx) => {
    const lang = ctx.req.param('lang') ?? 'en';
    const category = ctx.req.param('category') ?? 'all';

    // Validate language parameter
    if (lang !== 'en' && lang !== 'zh') {
        throw new InvalidParameterError('Invalid language parameter. Use "en" or "zh".');
    }

    // Validate category parameter
    if (!categories[category]) {
        throw new InvalidParameterError(`Invalid category: ${category}. Please refer to the category table in the documentation.`);
    }

    // Build the list URL based on category
    const baseUrl = `https://www.xjtlu.edu.cn/${lang}`;
    const categoryPath = categories[category][lang].path;
    const listUrl = `${baseUrl}/${categoryPath}`;

    // Fetch the news list page
    const response = await ofetch(listUrl);
    const $ = load(response);

    // Extract article cards from the page
    const list = $('.card-group-3 .card.up-down-card, .content .card.up-down-card')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const link = $item.find('.a-links-block').attr('href');
            const title = $item.find('.card-title').text().trim();
            const categoryTags = $item
                .find('.tag-group .tag')
                .toArray()
                .map((tag) => $(tag).text().trim())
                .filter((text) => text.length > 0);

            return {
                title,
                link,
                category: categoryTags,
            };
        })
        .filter((item) => item.link);

    // Fetch full article content for each item
    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const articleResponse = await ofetch(item.link!);
                const $article = load(articleResponse);

                const fullContent = $article('.post_content').html();
                const articleDate = $article('.edited-view .date, p.date').first().text().trim();

                // Parse date based on language
                // English: "21 Jan 2026" with 'en' locale for month name recognition
                // Chinese: "2026年01月20日" - numeric format, no locale needed
                const pubDate = articleDate ? parseDate(articleDate, lang === 'en' ? 'DD MMM YYYY' : 'YYYY年MM月DD日', lang === 'en' ? 'en' : undefined) : undefined;

                return {
                    title: item.title,
                    link: item.link!,
                    category: item.category,
                    description: fullContent || undefined,
                    pubDate,
                };
            })
        )
    );

    const categoryTitle = categories[category][lang].name;
    const iconUrl = 'https://www.xjtlu.edu.cn/favicon.ico';

    return {
        title: `XJTLU ${categoryTitle}${lang === 'en' ? ' News' : '新闻'}`,
        link: listUrl,
        description: lang === 'en' ? "Official news from Xi'an Jiaotong-Liverpool University" : '西交利物浦大学官方新闻',
        image: iconUrl,
        icon: iconUrl,
        logo: iconUrl,
        item: items,
        lang: lang === 'en' ? 'en' : 'zh-CN',
    };
};

export const route: Route = {
    path: '/news/:lang?/:category?',
    categories: ['university'],
    example: '/xjtlu/news/en/technology',
    url: 'www.xjtlu.edu.cn/en/news',
    parameters: {
        lang: 'Language, `en` or `zh`, default: `en`',
        category: 'Category, see table below, default: `all`',
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
        {
            source: ['www.xjtlu.edu.cn/:lang/about/news/all-news', 'www.xjtlu.edu.cn/:lang/news'],
            target: '/news/:lang',
        },
    ],
    name: 'News',
    maintainers: ['Circloud'],
    handler,
    description: `Categories:

| Category | English Name | Chinese Name |
| -------- | ------------ | ------------ |
${Object.entries(categories)
    .map(([key, value]) => `| \`${key}\` | ${value.en.name} | ${value.zh.name} |`)
    .join('\n')}`,
};
