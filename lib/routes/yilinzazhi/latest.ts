import { load } from 'cheerio';
import dayjs from 'dayjs';
import { FetchError } from 'ofetch';
import pMap from 'p-map';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

export const route: Route = {
    path: '/latest',
    categories: ['reading'],
    view: ViewType.Articles,
    example: '/yilinzazhi/latest',
    radar: [
        {
            source: ['www.yilinzazhi.com'],
            target: '/latest',
        },
    ],
    name: '近期文章汇总',
    maintainers: ['g0ngjie'],
    handler,
    url: 'www.yilinzazhi.com',
    description: '最近一期的文章汇总',
};

type Stage = {
    link: string;
    title: string;
};

type Catalog = {
    title: string;
    tables: DataItem[];
};

async function fetchDescription(link: string): Promise<Pick<DataItem, 'description' | 'author'>> {
    const response = await got(link);
    const $ = load(response.data);
    const currentContainer = $('.article-main > .article-content');
    const detailContainer = currentContainer.length ? currentContainer : $('.blkContainerSblk.collectionContainer');
    if (!detailContainer.length) {
        throw new Error(`Article content is unavailable at ${link}`);
    }
    const author = $('.article-header .article-meta .author').text();
    return { description: detailContainer.html()!, author: author.trim() ? author : undefined };
}

async function fetchCatalog(stage: Stage, currentYear: number, baseUrl: string): Promise<Catalog[]> {
    const stageRes = await got(stage.link);
    const $$ = load(stageRes.data);
    const sections = $$('.catalog-section').toArray();
    if (sections.length) {
        return sections.map<Catalog>((section) => ({
            title: $$(section).find('.catalog-section-title').text(),
            tables: $$(section)
                .find('.article-title a')
                .toArray()
                .map((aTag) => ({
                    title: $$(aTag).text(),
                    link: new URL($$(aTag).attr('href')!, stage.link).href,
                })),
        }));
    }
    const catalogsEl = $$('.maglistbox dl').toArray();
    const children = catalogsEl.map<Catalog>((catalog) => {
        const title = $$(catalog).find('dt span').text();
        const tables = $$(catalog)
            .find('a')
            .toArray()
            .map<DataItem>((aTag) => {
                const href = $$(aTag).attr('href')!;
                const yearType = currentYear + href.slice(4, 5);
                return {
                    title: $$(aTag).text(),
                    link: `${baseUrl}${currentYear}/yl${yearType}/${href}`,
                };
            });
        return { title, tables };
    });
    return children;
}

async function handler(): Promise<Data> {
    const baseUrl = 'https://www.yilinzazhi.com/';
    const response = await got(baseUrl);
    const $ = load(response.data);

    const currentYear = dayjs().year();
    const yearSection = $('.year-section')
        .toArray()
        .find((el) =>
            $(el)
                .find('.year-title')
                .text()
                .includes(currentYear + '')
        );

    const stage = $(yearSection!)
        .find('a')
        .toArray()
        .map<Stage>((elem) => {
            const aTag = $(elem);
            const link = new URL(aTag.attr('href')!, baseUrl).href;
            const title = aTag.text();
            return { link, title };
        })[0];

    const catalogs = await fetchCatalog(stage, currentYear, baseUrl);

    const contents: DataItem[] = catalogs.flatMap((catalog) => catalog.tables.map((table) => ({ ...table, category: catalog.title.trim() ? [catalog.title] : undefined })));

    const items = await pMap(
        contents,
        async (target) => {
            try {
                const detail = await cache.tryGet<Pick<DataItem, 'description' | 'author'>>(`yilinzazhi:article:${target.link}`, () => fetchDescription(target.link!));
                return { ...target, description: detail.description, author: detail.author };
            } catch (error) {
                if (error instanceof FetchError && error.status === 429) {
                    return target;
                }
                throw error;
            }
        },
        { concurrency: 3, stopOnError: false }
    );

    return {
        title: '意林 - 近期文章汇总',
        link: stage.link,
        item: items,
    };
}
