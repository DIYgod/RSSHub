// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';

export default async (ctx) => {
    const keyword = ctx.req.param('keyword') || '';
    const company = ctx.req.param('company') || '';
    const sort = ctx.req.param('sort') || '2';
    const period = ctx.req.param('period') || '12';

    const rootUrl = `https://www.telecompaper.com/search/index.aspx?search=${keyword}`;

    let response = await got({
            method: 'get',
            url: rootUrl,
        }),
        $ = load(response.data);

    response = await got({
        method: 'post',
        url: rootUrl,
        data: JSON.stringify({
            __EVENTTARGET: '',
            __EVENTARGUMENT: '',
            __VSTATE: $('#__VSTATE').attr('value'),
            __VIEWSTATE: '',
            ctl00$header$searchText: 'Search keywords',
            ctl00$header$searchTextMobile: 'Search keywords',
            ctl00$MainPlaceHolder$SearchText: keyword,
            ctl00$MainPlaceHolder$CompanyText: company,
            ctl00$MainPlaceHolder$Sort: Number.parseInt(sort),
            ctl00$MainPlaceHolder$Results: 20,
            ctl00$MainPlaceHolder$Date: 'Timeframe1',
            ctl00$MainPlaceHolder$Period: Number.parseInt(period),
            ctl00$MainPlaceHolder$txtStartDate: '',
            ctl00$MainPlaceHolder$txtEndDate: '',
            ctl00$MainPlaceHolder$chkEnglish: 'on',
            ctl00$MainPlaceHolder$Submit: 'Search',
        }),
    });
    $ = load(response.data);

    const list = $('table.details_rows tbody tr')
        .slice(0, 15)
        .map((_, item) => {
            item = $(item);
            const a = item.find('a');
            return {
                title: a.text(),
                link: a.attr('href'),
                pubDate: new Date(item.find('span.source').text().split(' | ')[0] + ' GMT+1').toUTCString(),
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = load(detailResponse.data);

                item.description = content('#pageContainer').html();

                return item;
            })
        )
    );

    ctx.set('data', {
        title: `Telecompaper Search - ${keyword}`,
        link: rootUrl,
        item: items,
    });
};
