import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import InvalidParameterError from '@/errors/types/invalid-parameter';

const config = {
    tzgg: {
        link: 'tzgg/',
        title: '通知公告',
    },
};

export const route: Route = {
    path: '/shenzhen/szlh/zwfw/zffw/:caty',
    categories: ['government'],
    example: '/gov/shenzhen/szlh/zwfw/zffw/tzgg',
    parameters: { caty: '信息类别' },
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
            source: ['szlh.gov.cn/zwfw/zffw/:caty'],
        },
    ],
    name: '深圳市罗湖区人民政府',
    maintainers: ['lonn'],
    handler,
    description: `| 通知公告 |
| :------: |
|   tzgg   |`,
};

async function handler(ctx) {
    const baseUrl = 'http://www.szlh.gov.cn/zwfw/zffw/';
    const cfg = config[ctx.req.param('caty')];
    if (!cfg) {
        throw new InvalidParameterError('Bad category. See <a href="https://docs.rsshub.app/routes/government#深圳市罗湖区人民政府">docs</a>');
    }

    const currentUrl = new URL(cfg.link, baseUrl).href;

    const response = await ofetch(currentUrl);
    const $ = load(response);

    const items = $('div.lists ul li')
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('a').first();

            // Extract the date from <i>
            const date = a.find('i').text().trim();

            // Clone and remove <i> to get only the visible text
            const textOnly = a.clone().find('i').remove().end().text().trim();

            return {
                title: textOnly,
                link: a.attr('href'),
                pubDate: timezone(parseDate(date, 'YYYY-MM-DD'), 0),
            };
        });

    return {
        title: '深圳市罗湖区人民政府 - ' + cfg.title,
        link: currentUrl,
        item: items,
    };
}
