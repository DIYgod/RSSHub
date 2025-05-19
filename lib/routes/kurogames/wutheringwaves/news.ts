import { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import * as cheerio from 'cheerio';
import ofetch from '@/utils/ofetch';
import { Article, Language, Parameter, SUPPORTED_LANGUAGES } from './constants';
import { fetchArticles, getArticleContentLink, getArticleLink, getHandlerLanguage, isValidLanguage, parseInteger } from './utils';

export const route: Route = {
    path: `/wutheringwaves/news/:${Parameter.Language}?`,
    categories: ['game'],
    example: '/kurogames/wutheringwaves/news',
    parameters: {
        [Parameter.Language]: 'The language to use for the content. Default: `zh`.',
    },
    name: '鸣潮 — 游戏公告、新闻与活动',
    radar: [
        {
            source: ['mc.kurogames.com/m/main/news', 'mc.kurogames.com/main'],
        },
        {
            title: 'Wuthering Waves — Game announcements, news and events',
            source: ['wutheringwaves.kurogames.com/en/main/news', 'wutheringwaves.kurogames.com/en/main'],
        },
    ],
    maintainers: ['goestav', 'enpitsulin'],
    description: `
Language codes for the \`${Parameter.Language}\` parameter:

| Language | Code         |
|----------|--------------|
| English  | en           |
| 日本語    | jp           |
| 한국어     | kr           |
| 简体中文   | zh (default) |
| 繁體中文   | zh-tw        |
| Español  | es           |
| Français | fr           |
| Deutsch  | de           |
    `,
    async handler(ctx) {
        const limitParam = ctx.req.query(Parameter.Limit);
        const languageParam = ctx.req.param(Parameter.Language);

        const limit = parseInteger(limitParam, 30);
        const language = languageParam || Language.Chinese;

        if (!isValidLanguage(language)) {
            throw new TypeError(`Language parameter is not valid. Please use one of the following: ${SUPPORTED_LANGUAGES.join(', ')}`);
        }

        const articles = await fetchArticles(language);
        const filteredArticles = articles.filter((a) => a.articleType !== 0).slice(0, limit);

        const item = await Promise.all(
            filteredArticles.map((article) => {
                const contentUrl = getArticleContentLink(language, article.articleId);
                const item: DataItem = {
                    title: article.articleTitle,
                    pubDate: timezone(parseDate(article.createTime), +8),
                    link: getArticleLink(language, article.articleId),
                };

                return cache.tryGet(`wutheringwaves:${language}:${article.articleId}`, async () => {
                    const articleDetails = await ofetch<Article>(contentUrl, { query: { t: Date.now() } });
                    // Article content may not always be available, e.g: https://wutheringwaves.kurogames.com/zh-tw/main/news/detail/2596
                    const articleContent = articleDetails.articleContent ?? '';

                    const $ = cheerio.load(articleContent);

                    item.description = $.html() ?? article.articleDesc ?? '';

                    return item;
                }) as Promise<DataItem>;
            })
        );

        const title = language === Language.Chinese ? '《鸣潮》— 游戏公告、新闻和活动' : 'Wuthering Waves - Announcements, News and Events';
        const link = language === Language.Chinese ? 'https://mc.kurogames.com/main#news' : `https://wutheringwaves.kurogames.com/${language}/main/#news`;

        return {
            title,
            link,
            item,
            language: getHandlerLanguage(language),
        };
    },
};
