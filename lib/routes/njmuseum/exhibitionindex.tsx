import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { parseDateRange } from '@/utils/parse-date-range';

import { namespace } from './namespace';

interface ExhibitType {
    modular: string;
    code: string;
    value: string;
    pageSize?: number;
    pageNum?: number;
    isList?: boolean;
}

interface Exhibit {
    title: string;
    link: string;
    id: number;
    imgSrc?: string[];
    position?: string;
    timedesc: string;
}

interface ExhibitList {
    list: Exhibit[];
    title: string;
}

const TYPE_MAP = {
    review: { modular: 'exIndexReview', code: 'properties', value: '5' },
    abroad: { modular: 'exIndexGoAbroad', code: 'properties', value: '7' },
    virtual: { modular: 'exIndexVirtual', code: 'properties', value: '11' },
    forecast: { modular: 'exIndexForecast', code: 'properties', value: '1' },
    default: { modular: 'exIndex', code: '', value: '0', pageSize: 6, pageNum: 1, isList: true },
} satisfies Record<string, ExhibitType>;

export const route: Route = {
    path: '/exhibitionIndex/:type?',
    categories: ['travel'],
    example: '/njmuseum/exhibitionIndex/review',
    parameters: {
        type: 'Exhibition type, supported values: review (展览回顾) | abroad (赴外展览) | virtual (虚拟展厅) | forecast (展览预告). Default: Current Exhibitions (正在展出).',
    },
    name: 'Exhibitions',
    maintainers: ['magazian'],
    radar: [
        {
            source: ['www.njmuseum.com/zh/exhibitionIndex'],
            target: '/exhibitionIndex',
        },
    ],
    handler: async (ctx) => {
        const typeParam = ctx.req.param('type') || 'default';
        const currentType = TYPE_MAP[typeParam];

        const baseUrl = 'https://www.njmuseum.com';
        const resourceUrl = 'https://manage.njmuseum.org.cn'; // use for imgUrl

        const apiUrl = `${baseUrl}/api/exhibition/list`;

        const museumName = namespace.zh?.name || namespace.name;

        const fetchExhibits = async (config: ExhibitType): Promise<ExhibitList> => {
            const response = await got.post(apiUrl, {
                form: config,
            });

            const data = response.data?.data;

            return {
                list: data.list,
                title: data.title,
            };
        };

        const { list: rawItems, title: titleTag } = await fetchExhibits(currentType);

        const items = rawItems?.map((item) => {
            const title = item.title;
            const itemLink = `${baseUrl}/zh/${item.link}?id=${item.id}`;
            const imgPath = item.imgSrc?.[0];
            const imgUrl = `${resourceUrl}${imgPath}`;
            const location = item.position;
            const fullDuration = item.timedesc;
            const { startDate, endDate } = parseDateRange(fullDuration);
            const pubDate = startDate ? parseDate(startDate) : undefined; // use start date as publication date if publication date is notavailable

            const description = renderToString(
                <div>
                    <img src={imgUrl} />
                    <br />
                    <p>
                        <b>地点：</b>
                        {location || '参考展览详情'}
                    </p>
                    <p>
                        <b>开展：</b>
                        {startDate ?? '未定/常设'}
                    </p>
                    <p>
                        <b>闭展：</b>
                        {endDate ?? '未定/常设'}
                    </p>
                    <p>
                        <small>原始展期：{fullDuration}</small>
                    </p>
                </div>
            );

            return {
                title,
                link: itemLink,
                pubDate,
                description,
                // For further .ics file processing
                _extra: {
                    museumName,
                    location,
                    startDate,
                    endDate,
                },
            };
        });

        return {
            title: `${museumName} - 展览 - ${titleTag}`,
            link: `${baseUrl}/zh/exhibitionIndex`,
            language: 'zh-CN',
            item: items,
        };
    },
};
