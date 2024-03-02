import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'http://www.ulapia.com';

const titleMap = {
    brokerage_news: '券商晨报',
    stock_research: '个股研报',
    industry_research: '行业研报',
    strategy_research: '策略研报',
    macro_research: '宏观研报',
    ipo_research: 'IPO研报',
};

const selectorMap = {
    brokerage_news: 'div.col-md-4',
    stock_research: 'div.col-md-6',
    industry_research: 'div.col-md-6',
    strategy_research: 'div.col-md-6',
    macro_research: 'div.col-md-6',
    ipo_research: 'div.col-md-6',
};

export default async (ctx) => {
    const category = ctx.req.param('category') ?? 'brokerage_news';
    const url = `${rootUrl}/reports/${category}`;

    const response = await got.get(url);
    const $ = load(response.data);
    const items = $(String(selectorMap[category]))
        .filter((_, item) => $(item).find('img').attr('src'))
        .map((_, item) => ({
            title: `${$(item).find('strong').text()}  ${$(item).find('h5.mb-1').text()}`,
            author: $(item).find('div.col.p-8.d-flex.px-3.py-3.flex-column.position-static > div:nth-child(4) > span:nth-child(2)').text(),
            link: $(item).find('h5.mb-1 > a').attr('href'),
            description: `<img src="${$(item).find('img').attr('src').split('!')[0]}">`,
            pubDate: parseDate($(item).find('div.mb-0.text-muted').last().text().split(':')[1], 'YYYY-MM-DD'),
        }))
        .get();

    ctx.set('data', {
        title: ` ulapia - ${titleMap[category]}`,
        link: url,
        item: items,
    });
};
