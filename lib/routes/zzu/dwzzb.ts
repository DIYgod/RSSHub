import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

export const route: Route = {
    path: '/dwzzb/:type',
    categories: ['university'],
    example: '/zzu/dwzzb/djgz',
    parameters: { type: '分类名' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['dwzzb.v.zzu.edu.cn/'],
        },
    ],
    name: '党委组织部',
    maintainers: ['amandus1990'],
    handler,
    description: `| 党建工作 | 干部工作 | 人才工作 | 乡村振兴工作 |
| -------- | -------- | -------- | ------------ |
| djgz     | gbgz     | rcgz     | fpgz         |`,
};

function parsePublishedDate(value?: string) {
    if (!value) {
        return;
    }
    const match = value.match(/^\s*(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:\s|T|$)/);
    if (!match) {
        return;
    }
    const calendarDate = `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`;
    if (!Number.isFinite(parseDate(calendarDate, 'YYYY-MM-DD', true).getTime())) {
        return;
    }
    const date = parseDate(Date.parse(value));
    return Number.isFinite(date.getTime()) ? date : undefined;
}

async function handler(ctx) {
    const type = ctx.req.param('type');
    const typeDict = {
        djgz: ['党建工作', 'DJGZ'],
        gbgz: ['干部工作', 'GBGZ'],
        rcgz: ['人才工作', 'RCGZ'],
        fpgz: ['乡村振兴工作', 'FPGZ'],
    };

    const typeAlias = typeDict[type][1];
    const apiUrl = `https://dwzzb.v.zzu.edu.cn/mp/portal/article/list?alias=${typeAlias}`;

    const response = await got(apiUrl);
    const data = response.data.data;

    const items = data.slice(0, Math.max(20, getRouteLimit(ctx, 20))).map((item) => {
        const link = item.articleUrl || `article.jsp?catalogArticleId=${item.catalogArticleId}`;
        return {
            title: item.articleTitle,
            link: new URL(link, 'https://dwzzb.v.zzu.edu.cn').href,
            pubDate: parsePublishedDate(item.publishTime),
            description: item.articleSummary,
        };
    });

    return {
        title: `郑大党委组织部-${typeDict[type][0]}`,
        link: 'https://dwzzb.v.zzu.edu.cn/',
        item: items,
    };
}
