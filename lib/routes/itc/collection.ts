import { DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';

/**
 * OpenGithub - Github开源项目精选
 *  colType：0 | 1 | 2 | 3
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

    const result = {
        title: RESULT_DESC_MAP[colType] ?? 'NULL',
        link: url,
        description: RESULT_DESC_MAP[colType] ?? 'NULL',
        item: [] as DataItem[],
    };
    const response = await ofetch(`${url}/github/collection/list?colType=${colType}`);
    const $ = load(response);

    result.item = [...$('.tab-pane > .row > .card')].map((item) => {
        const date = $(item).find('.d-flex.mt-3.ms-sm-auto').text()?.split(':')?.[1];
        const dataObject = date ? new Date(date) : undefined;

        return {
            title: $(item).find('a.btn-link').text(),
            description: $(item).find('.d-sm-inline-block').text(),
            link: $(item).find('a.btn-link').attr('href') || '',
            pubDate: dataObject,
            category: [...$(item).find('.nav.nav-stack.small li')].map((sub) => $(sub).find('.badge').text()),
        };
    });

    return result;
}
