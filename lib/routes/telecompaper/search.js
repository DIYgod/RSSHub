const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const keyword = ctx.params.keyword || '';
    const company = ctx.params.company || '';
    const sort = ctx.params.sort || '2';
    const period = ctx.params.period || '12';

    const rootUrl = `https://www.telecompaper.com/search/index.aspx?search=${keyword}`;

    let response = await got({
            method: 'get',
            url: rootUrl,
        }),
        $ = cheerio.load(response.data);

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
            ctl00$MainPlaceHolder$Sort: parseInt(sort),
            ctl00$MainPlaceHolder$Results: 20,
            ctl00$MainPlaceHolder$Date: 'Timeframe1',
            ctl00$MainPlaceHolder$Period: parseInt(period),
            ctl00$MainPlaceHolder$txtStartDate: '',
            ctl00$MainPlaceHolder$txtEndDate: '',
            ctl00$MainPlaceHolder$chkEnglish: 'on',
            ctl00$MainPlaceHolder$Submit: 'Search',
        }),
    });
    $ = cheerio.load(response.data);

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
        list.map(
            async (item) =>
                await ctx.cache.tryGet(item.link, async () => {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });
                    const content = cheerio.load(detailResponse.data);

                    item.description = content('#pageContainer').html();

                    return item;
                })
        )
    );

    ctx.state.data = {
        title: `Telecompaper Search - ${keyword}`,
        link: rootUrl,
        item: items,
    };
};
