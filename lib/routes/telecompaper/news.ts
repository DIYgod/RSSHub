// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
const tough = require('tough-cookie');
// eslint-disable-next-line n/no-extraneous-require
const FormData = require('form-data');

export default async (ctx) => {
    const rootUrl = `https://www.telecompaper.com/${ctx.req.param('caty') === 'industry-resources' ? ctx.req.param('caty') : 'international/news/' + ctx.req.param('caty')}`;
    const year = ctx.req.param('year') ?? 'all';
    const country = ctx.req.param('country') ? ctx.req.param('country').split('-').join(' ') : 'all';
    const type = ctx.req.param('type') ? ctx.req.param('type').split('-').join(' ') : 'all';

    const cookieJar = new tough.CookieJar();
    let response = await got({
            method: 'get',
            url: rootUrl,
            cookieJar,
        }),
        $ = load(response.data);

    const form = new FormData();
    form.append('__EVENTTARGET', 'ctl00$MainPlaceHolder$ddlContentType');
    form.append('__EVENTARGUMENT', '');
    form.append('__LASTFOCUS', '');
    form.append('__VIEWSTATE', $('#__VIEWSTATE').attr('value'));
    form.append('__VIEWSTATEGENERATOR', 'E4EF4CD1');
    form.append('ctl00$header$searchText', ctx.req.param('keyword') || '');
    form.append('ctl00$header$searchTextMobile', ctx.req.param('keyword') || '');
    if (ctx.req.param('caty') !== 'industry-resources') {
        form.append(
            'ctl00$MainPlaceHolder$ddlYears',
            year && year !== 'all'
                ? $('select[name="ctl00$MainPlaceHolder$ddlYears"] option')
                      .filter((index, element) => $(element).text().split(' (')[0] === ctx.req.param('year'))
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
    $ = load(response.data);

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
        title: 'Telecompaper - ' + $('h1').text(),
        link: rootUrl,
        item: items,
    });
};
