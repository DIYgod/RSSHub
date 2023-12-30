const got = require('@/utils/got');
const cheerio = require('cheerio');
const tough = require('tough-cookie');
// eslint-disable-next-line n/no-extraneous-require
const FormData = require('form-data');

module.exports = async (ctx) => {
    const rootUrl = `https://www.telecompaper.com/${ctx.params.caty === 'industry-resources' ? ctx.params.caty : 'international/news/' + ctx.params.caty}`;
    const year = ctx.params.year ? ctx.params.year : 'all';
    const country = ctx.params.country ? ctx.params.country.split('-').join(' ') : 'all';
    const type = ctx.params.type ? ctx.params.type.split('-').join(' ') : 'all';

    const cookieJar = new tough.CookieJar();
    let response = await got({
            method: 'get',
            url: rootUrl,
            cookieJar,
        }),
        $ = cheerio.load(response.data);

    const form = new FormData();
    form.append('__EVENTTARGET', 'ctl00$MainPlaceHolder$ddlContentType');
    form.append('__EVENTARGUMENT', '');
    form.append('__LASTFOCUS', '');
    form.append('__VIEWSTATE', $('#__VIEWSTATE').attr('value'));
    form.append('__VIEWSTATEGENERATOR', 'E4EF4CD1');
    form.append('ctl00$header$searchText', ctx.params.keyword || '');
    form.append('ctl00$header$searchTextMobile', ctx.params.keyword || '');
    if (ctx.params.caty !== 'industry-resources') {
        form.append(
            'ctl00$MainPlaceHolder$ddlYears',
            year && year !== 'all'
                ? $('select[name="ctl00$MainPlaceHolder$ddlYears"] option')
                      .filter((index, element) => $(element).text().split(' (')[0] === ctx.params.year)
                      .attr('value')
                : '0'
        );
        form.append(
            'ctl00$MainPlaceHolder$ddlCountries',
            country && country !== 'all'
                ? $('select[name="ctl00$MainPlaceHolder$ddlCountries"] option')
                      .filter((index, element) => $(element).text().split(' (')[0] === country)
                      .attr('value')
                : '0'
        );
    }
    form.append(
        'ctl00$MainPlaceHolder$ddlContentType',
        type && type !== 'all'
            ? $('select[name="ctl00$MainPlaceHolder$ddlContentType"] option')
                  .filter((index, element) => $(element).text().split(' (')[0] === type)
                  .attr('value')
            : ''
    );

    response = await got({
        method: 'post',
        url: rootUrl,
        cookieJar,
        headers: {
            referer: 'https://www.telecompaper.com/international/news/mobile',
        },
        body: form,
    });
    $ = cheerio.load(response.data);

    const list = $('table.details_rows tbody tr')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            const a = item.find('a');
            return {
                title: a.text(),
                link: a.attr('href'),
                pubDate: new Date(item.find('span.source').text().replace('Published ', '').split(' CET | ')[0] + ' GMT+1').toUTCString(),
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
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
        title: 'Telecompaper - ' + $('h1').text(),
        link: rootUrl,
        item: items,
    };
};
