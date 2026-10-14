import { load } from 'cheerio';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

/**
 * OpenGithub curated GitHub projects.
 * Collection types: 0 (handpicked), 1 (special), 2 (weekly), 3 (monthly).
 */

enum COL_TYPE {
    HANDPICK,
    SPECIAL,
    WEEKLY,
    MONTHLY,
}

const RESULT_DESC_MAP = {
    [COL_TYPE.HANDPICK]: 'OpenGithub - Github开源项目精选 - 精选文章',
    [COL_TYPE.SPECIAL]: 'OpenGithub - Github开源项目精选 - 专栏',
    [COL_TYPE.WEEKLY]: 'OpenGithub - Github开源项目精选 - 周刊',
    [COL_TYPE.MONTHLY]: 'OpenGithub - Github开源项目精选 - 月刊',
};

export const route: Route = {
    path: '/collection/:colType',
    categories: ['blog'],
    example: '/itc/collection/1',
    parameters: { colType: '合集类型：0 精选文章、1 专栏、2 周刊、3 月刊。' },
    radar: [
        {
            source: ['open.itc.cn/'],
        },
    ],
    name: '合集',
    maintainers: ['cnkmmk'],
    handler,
};

async function handler(ctx) {
    const url = 'https://open.itc.cn';

    const colType = ctx.req.param('colType');
    if (!Object.hasOwn(RESULT_DESC_MAP, colType)) {
        throw new InvalidParameterError('colType must be 0, 1, 2, or 3.');
    }

    const response = await ofetch(`${url}/github/collection/list?colType=${colType}`);
    const $ = load(response);

    const items = [...$('.tab-pane > .row > .card')].map((item): DataItem => {
        const date = $(item).find('.d-flex.mt-3.ms-sm-auto').text()?.split(':', 2)?.[1];
        const dateObject = date ? parseDate(`${date.trim()}T00:00:00Z`) : undefined;

        return {
            title: $(item).find('a.btn-link').text(),
            description: $(item).find('.d-sm-inline-block').text(),
            link: $(item).find('a.btn-link').attr('href') || '',
            pubDate: dateObject,
            category: [...$(item).find('.nav.nav-stack.small li')].map((sub) => $(sub).find('.badge').text()),
        };
    });

    return {
        title: RESULT_DESC_MAP[colType] ?? 'NULL',
        link: url,
        description: RESULT_DESC_MAP[colType] ?? 'NULL',
        item: items,
    };
}
