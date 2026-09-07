import { load } from 'cheerio';
import type { Context } from 'hono';

import { getLanguage, type HkoLanguage, parseDataset, removeBom, resolveHkoUrl, rewriteRelativeUrls } from '@/hko-editorial';
import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const languages = {
    en: 'en',
    tc: 'zh-HK',
    sc: 'zh-CN',
} as const;

type EditorialConfig = {
    dateField: string;
    dataset: (year: number) => string;
    detailSelector: string;
    indexUrl: Record<HkoLanguage, string>;
    itemField: string;
    removeParagraphs?: number;
    title: Record<HkoLanguage, string>;
};

export const createEditorialHandler =
    (config: EditorialConfig, defaultLanguage: HkoLanguage = 'en') =>
    async (ctx: Context) => {
        const language = getLanguage(ctx.req.param('lang'), defaultLanguage);
        const { body: data } = await got(config.dataset(new Date().getFullYear()));
        const records = parseDataset(data, config.itemField);
        const items = records
            .map((record): DataItem | undefined => {
                const rawTitle = record[`${language}_title`];
                const title = rawTitle && removeBom(rawTitle);
                const url = record[`${language}_url`];
                if (!title || !url) {
                    return;
                }

                const image = record[`${language}_index_img`];
                return {
                    title,
                    link: resolveHkoUrl(url),
                    pubDate: parseDate(`${record[config.dateField]!.replace(' ', 'T')}+08:00`),
                    ...(image && { image: resolveHkoUrl(image) }),
                };
            })
            .filter((item): item is DataItem => item !== undefined)
            .filter((item, index, items) => items.findIndex(({ link }) => link === item.link) === index)
            .slice(0, 20);

        const populatedItems = await Promise.all(
            items.map((item) =>
                cache.tryGet(item.link!, async () => {
                    const { body: detail } = await got(item.link!);
                    const $ = load(detail);
                    const content = $(config.detailSelector).first();
                    content.find('script').remove();
                    content.find('p').slice(0, config.removeParagraphs).remove();
                    item.description = rewriteRelativeUrls(content.html() ?? '');
                    return item;
                })
            )
        );

        return {
            title: config.title[language],
            link: resolveHkoUrl(config.indexUrl[language]),
            language: languages[language],
            item: populatedItems,
        };
    };

export const parameter = {
    lang: {
        description: 'Language',
        options: [
            { value: 'en', label: 'English' },
            { value: 'tc', label: '繁體中文' },
            { value: 'sc', label: '简体中文' },
        ],
        default: 'en',
    },
};
