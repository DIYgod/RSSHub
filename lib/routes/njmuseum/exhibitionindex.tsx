import { renderToString } from 'hono/jsx/dom/server';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';

import { namespace } from './namespace';

const formatCalendarDate = (year: number, month: number, day: number) => {
    const date = new Date(Date.UTC(year, month - 1, day));
    if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
        return;
    }
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

const extractDates = (duration: string) => {
    const start = duration?.match(/(\d{4})[年./-]\s*(\d{1,2})[月./-]\s*(\d{1,2})日?/);
    if (!start) {
        return {};
    }
    const year = Number(start[1]);
    const startDate = formatCalendarDate(year, Number(start[2]), Number(start[3]));
    if (!startDate) {
        return {};
    }
    const remainder = duration.slice((start.index ?? 0) + start[0].length);
    const endText = remainder.match(/^\s*[-~～至—–]\s*(.+)/)?.[1];
    const end = endText?.match(/^(?:(\d{4})[年./-])?(\d{1,2})[月./-]\s*(\d{1,2})日?/);
    const endDate = end ? formatCalendarDate(end[1] ? Number(end[1]) : year, Number(end[2]), Number(end[3])) : undefined;
    return { startDate, endDate };
};

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
    describe?: string;
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
        if (!Object.hasOwn(TYPE_MAP, typeParam)) {
            throw new InvalidParameterError('Unsupported exhibition type. Use review, abroad, virtual, forecast, or default.');
        }
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
            const imgUrl = imgPath ? new URL(imgPath, resourceUrl).href : undefined;
            const location = item.position;
            const fullDuration = item.timedesc;
            const { startDate, endDate } = extractDates(fullDuration);
            const pubDate = startDate ? parseDateInTimezone(startDate, 8) : undefined;

            const description = renderToString(
                <div>
                    {item.describe && <div dangerouslySetInnerHTML={{ __html: item.describe }} />}
                    {imgUrl && <img src={imgUrl} />}
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
