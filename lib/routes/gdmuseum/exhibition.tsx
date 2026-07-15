import { load } from 'cheerio';
import dayjs from 'dayjs';
import type { Context } from 'hono';
import { renderToString } from 'hono/jsx/dom/server';

import type { DataItem, Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { namespace } from './namespace';

// convert exhibition date string to YYYY-MM-DD format, e.g. "2023年5月1日" or "2023/5/1" => "2023-05-01"
const formatExhibitionDate = (d?: string) => {
    if (!d) {
        return;
    }
    return dayjs(d.replaceAll(/[年月/.]/g, '-').replaceAll('日', '')).format('YYYY-MM-DD');
};

const parseExhibitionDuration = (duration?: string) => {
    const allDates = duration?.match(/\d{4}[./年-]\d{1,2}[./月-]\d{1,2}日?/g) || [];
    return {
        startDate: formatExhibitionDate(allDates[0]),
        endDate: formatExhibitionDate(allDates[1]),
    };
};

export const route: Route = {
    path: '/exhibition/:type?',
    categories: ['travel'],
    example: '/gdmuseum/exhibition/temp',
    parameters: {
        type: 'Exhibition type, supported values: temp(临时展览), default: All exhibitions.',
    },
    name: 'Current Exhibitions',
    maintainers: ['magazian'],
    radar: [
        {
            source: ['www.gdmuseum.org.cn/col9/list'],
            target: '/exhibition',
        },
    ],
    handler: async (ctx: Context) => {
        const typeParam = ctx.req.param('type') || 'all';

        const museumName = namespace.zh?.name || namespace.name;
        const baseUrl = 'https://www.gdmuseum.org.cn';
        const url = `${baseUrl}/col9/list`;

        const response = await got(url);
        const $ = load(response.data);

        const list = $('.ULLIST li a[href^="/cn/col"]')
            .toArray()
            .map((el) => {
                const $item = $(el);
                const title = $item.find('.divtt.qui-dot').text();

                if (typeParam === 'temp') {
                    if (title.includes('常设展览')) {
                        return null;
                    }
                } else if (typeParam !== 'all') {
                    return null;
                }

                const rawLink = $item.attr('href');
                const itemLink = rawLink ? new URL(rawLink, baseUrl).href : '';

                const rawSrc = $item.find('img').attr('src');
                const imgUrl = rawSrc ? new URL(rawSrc, baseUrl).href : undefined;

                const textDurationAndLocation = $item.find('.quitxt.qui-dot').text().trim();
                const [fullDuration = '', location = ''] = textDurationAndLocation.split('|').map((p) => p.trim());

                const { startDate, endDate } = parseExhibitionDuration(fullDuration);
                const pubDate = startDate ? parseDate(startDate) : undefined;

                const description = renderToString(
                    <div>
                        {imgUrl && <img src={imgUrl} />}
                        <br />
                        <p>
                            <b>地点：</b>
                            {location || '参考详情'}
                        </p>
                        <p>
                            <b>开展：</b>
                            {startDate || '未定/常设'}
                        </p>
                        <p>
                            <b>闭展：</b>
                            {endDate || '未定/常设'}
                        </p>
                        {fullDuration && (
                            <p>
                                <small>原始展期：{fullDuration}</small>
                            </p>
                        )}
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
                } as DataItem;
            })
            .filter((i): i is DataItem => i !== null);

        return {
            title: `${museumName} - 正在热展${typeParam === 'temp' ? ' - 临时展览' : ''}`,
            link: url,
            language: 'zh-CN',
            item: list,
        };
    },
};
