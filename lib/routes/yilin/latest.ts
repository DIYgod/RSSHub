import { Data, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import dayjs from 'dayjs';

export const route: Route = {
    path: '/latest',
    categories: ['reading'],
    example: '/yilin/latest',
    radar: [
        {
            source: ['www.yilinzazhi.com'],
            target: '/',
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
    catalogs: Catalog[];
};

type Catalog = {
    title: string;
    tables: Data[];
};

async function handler(): Promise<Data> {
    const baseUrl = 'https://www.yilinzazhi.com/';
    const response = await got(baseUrl);
    const $ = load(response.data, { xmlMode: true });

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
        .map<typeof yearSection, Stage>(function () {
            const aTag = $(this);
            const link = baseUrl + aTag.attr('href');
            const title = aTag.text();
            return { link, title, catalogs: [] };
        })
        .toArray()[0];

    await Promise.resolve(
        cache.tryGet(stage.link, async () => {
            const contentResponse = await got(stage.link);
            const $$ = load(contentResponse.data, { xmlMode: true });
            const catalogsEl = $$('.maglistbox dl').toArray();
            const children = catalogsEl.map<Catalog>((catalog) => {
                const title = $$(catalog).find('dt span').text();
                const tables = $$(catalog)
                    .find('a')
                    .toArray()
                    .map<Data>((aTag) => {
                        const href = $$(aTag).attr('href')!;
                        const yearType = currentYear + href.substring(4, 5);
                        return {
                            title: $$(aTag).text(),
                            link: `${baseUrl}${currentYear}/yl${yearType}/${href}`,
                        };
                    });
                return { title, tables };
            });
            stage.catalogs.push(...children);
            return stage;
        })
    );

    const contents: Data[] = [];
    for (const catalog of stage.catalogs) {
        const list = catalog.tables;
        contents.push(...list);
    }

    await Promise.all(
        contents.map((stage) =>
            cache.tryGet(stage.link!, async () => {
                const contentResponse = await got(stage.link);
                const $$ = load(contentResponse.data, { xmlMode: true });
                const detailContainer = $$('.blkContainerSblk.collectionContainer');

                stage.description = detailContainer.html()!;

                return stage;
            })
        )
    );

    const contentLink = contents[0].link!;
    const preLinkIndex = contentLink.lastIndexOf('/');
    const routerLink = contentLink.substring(0, preLinkIndex + 1);
    return {
        title: '意林 - 近期文章汇总',
        link: routerLink,
        item: contents,
    };
}
