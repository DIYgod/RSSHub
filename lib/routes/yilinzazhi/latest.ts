import { Data, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import dayjs from 'dayjs';

export const route: Route = {
    path: '/latest',
    categories: ['reading'],
    example: '/yilinzazhi/latest',
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
};

type Catalog = {
    title: string;
    tables: Data[];
};

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
        .map<typeof yearSection, Stage>(function () {
            const aTag = $(this);
            const link = baseUrl + aTag.attr('href');
            const title = aTag.text();
            return { link, title };
        })
        .toArray()[0];

    const catalogs = (await cache.tryGet(stage.link, async () => {
        const stageRes = await got(stage.link);
        const $$ = load(stageRes.data);
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
        return children;
    })) as Catalog[];

    const contents: Data[] = catalogs.flatMap((catalog) => catalog.tables);

    await Promise.all(
        contents.map((stage) =>
            cache.tryGet(stage.link!, async () => {
                const detailRes = await got(stage.link);
                const $$ = load(detailRes.data);
                const detailContainer = $$('.blkContainerSblk.collectionContainer');

                stage.description = detailContainer.html()!;

                return stage;
            })
        )
    );

    return {
        title: '意林 - 近期文章汇总',
        link: stage.link,
        item: contents,
    };
}
