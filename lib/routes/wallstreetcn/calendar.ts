import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/calendar/:section?',
    categories: ['finance'],
    example: '/wallstreetcn/calendar',
    parameters: { section: '`macrodatas` 或 `report`，默认为 `macrodatas`' },
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
            source: ['wallstreetcn.com/calendar'],
        },
    ],
    name: '财经日历',
    maintainers: ['TonyRL'],
    handler,
    url: 'wallstreetcn.com/calendar',
};

const rootUrl = 'https://wallstreetcn.com';

const macrodataSuffix = {
    CA: 'CA10YR.OTC',
    CN: 'USDCNH.OTC',
    DE: 'DE30.OTC',
    FR: 'FR40.OTC',
    // HK: '',
    IT: 'EURUSD.OTC',
    JP: 'USDJPY.OTC',
    UK: 'UK100.OTC',
    US: 'DXY.OTC',
};

const getMacrodataUrl = (countryId, wscnTicker) => `${rootUrl}/data-analyse/${wscnTicker}/${macrodataSuffix[countryId]}`;

const hasValue = (value?: string | number | null) => value !== undefined && value !== null && value !== '';
const formatValue = (value?: string | number | null, unit: string = '') => (hasValue(value) ? `${value}${unit}` : '-');

function parseSourceTime(value?: string | number | null) {
    if ((typeof value !== 'number' && typeof value !== 'string') || (typeof value === 'string' && !value.trim())) {
        return;
    }
    const seconds = Number(value);
    if (!Number.isFinite(seconds)) {
        return;
    }
    const date = parseDate(seconds * 1000);
    return Number.isFinite(date.getTime()) ? date : undefined;
}

async function handler(ctx) {
    const { section = 'macrodatas' } = ctx.req.param();

    const link = `${rootUrl}/calendar`;
    const apiRootUrl = section === 'macrodatas' ? 'https://api-one-wscn.awtmt.com' : 'https://api-ddc-wscn.awtmt.com';
    const apiUrl = section === 'macrodatas' ? `${apiRootUrl}/apiv1/finance/macrodatas` : `${apiRootUrl}/finance/report/list`;
    const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Shanghai' });
    const start = parseDate(`${today}T00:00:00+08:00`).getTime() / 1000;

    const response = await ofetch(apiUrl, {
        query:
            section === 'macrodatas'
                ? {
                      start,
                      end: start + 86399,
                  }
                : undefined,
    });

    const items =
        section === 'macrodatas'
            ? response.data.items.map((item) => ({
                  title: `${item.country}${item.title}`,
                  description: `重要性: ${'★'.repeat(item.importance)} 今值: ${formatValue(item.actual, item.unit)} 预期: ${formatValue(item.forecast, item.unit)} 前值: ${formatValue(hasValue(item.revised) ? item.revised : item.previous, item.unit)}${item.foresight ? `\n${item.foresight}` : ''}`,
                  link: item.uri && macrodataSuffix[item.country_id] && getMacrodataUrl(item.country_id, item.wscn_ticker),
                  guid: item.id,
                  pubDate: parseSourceTime(item.public_date),
                  category: item.country,
              }))
            : // report
              response.data.items
                  .map((item) => Object.fromEntries(response.data.fields.map((field, index) => [field, item[index]])))
                  .map((item) => ({
                      title: `${item.company_name} ${item.observation_date}`,
                      description: `${item.code} 预期EPS: ${formatValue(item.eps_estimate)} 实际EPS: ${formatValue(item.reported_eps)} 差异度: ${!hasValue(item.surprise) || item.surprise === -1 ? '-' : (item.surprise * 100).toFixed(2) + '%'}`,
                      link,
                      guid: item.id,
                      pubDate: parseSourceTime(item.public_date),
                  }));

    return {
        title: '财经日历 - 华尔街见闻',
        link,
        item: items,
        itunes_author: '华尔街见闻',
        image: 'https://static.wscn.net/wscn/_static/favicon.png',
    };
}
