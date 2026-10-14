import { load } from 'cheerio';
import pMap from 'p-map';
import { CookieJar } from 'tough-cookie';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/news/:caty/:year?/:country?/:type?',
    categories: ['journal'],
    example: '/telecompaper/news/mobile/2020/China/News',
    parameters: {
        caty: 'Category, see table below',
        year: 'Year. The year in respective category page filter, `all` for unlimited year, empty by default',
        country: 'Country or continent, `all` for unlimited country or continent, empty by default',
        type: 'Type, can be found in the `Types` filter, `all` for unlimited type, unlimited by default',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'News',
    maintainers: ['nczitzk'],
    handler,
    description: `Category

| WIRELESS | BROADBAND | VIDEO     | GENERAL | IT | INDUSTRY RESOURCES |
| -------- | --------- | --------- | ------- | -- | ------------------ |
| mobile   | internet  | boardcast | general | it | industry-resources |

::: tip
If \`country\` or \`type\` includes empty space, use \`-\` instead. For example, \`United States\` needs to be replaced with \`United-States\`, \`White paper\` needs to be replaced with \`White-paper\`

Filters in [INDUSTRY RESOURCES](https://www.telecompaper.com/industry-resources) only provides \`Content Type\` which corresponds to \`type\`. \`year\` and \`country\` are not supported.
:::`,
};

async function handler(ctx) {
    const rootUrl = `https://www.telecompaper.com/${ctx.req.param('caty') === 'industry-resources' ? ctx.req.param('caty') : 'international/news/' + ctx.req.param('caty')}`;
    const year = ctx.req.param('year') ?? 'all';
    const country = ctx.req.param('country') ? ctx.req.param('country').split('-').join(' ') : 'all';
    const type = ctx.req.param('type') ? ctx.req.param('type').split('-').join(' ') : 'all';

    const cookieJar = new CookieJar();
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
    form.append('__VIEWSTATE', $('#__VIEWSTATE').attr('value') ?? '');
    form.append('__VIEWSTATEGENERATOR', 'E4EF4CD1');
    form.append('ctl00$header$searchText', ctx.req.param('keyword') || '');
    form.append('ctl00$header$searchTextMobile', ctx.req.param('keyword') || '');
    if (ctx.req.param('caty') !== 'industry-resources') {
        form.append(
            'ctl00$MainPlaceHolder$ddlYears',
            year && year !== 'all'
                ? ($('select[name="ctl00$MainPlaceHolder$ddlYears"] option')
                      .filter((index, element) => $(element).text().split(' (', 1)[0] === ctx.req.param('year'))
                      .attr('value') ?? '0')
                : '0'
        );
        form.append(
            'ctl00$MainPlaceHolder$ddlCountries',
            country && country !== 'all'
                ? ($('select[name="ctl00$MainPlaceHolder$ddlCountries"] option')
                      .filter((index, element) => $(element).text().split(' (', 1)[0] === country)
                      .attr('value') ?? '0')
                : '0'
        );
    }
    form.append(
        'ctl00$MainPlaceHolder$ddlContentType',
        type && type !== 'all'
            ? ($('select[name="ctl00$MainPlaceHolder$ddlContentType"] option')
                  .filter((index, element) => $(element).text().split(' (', 1)[0] === type)
                  .attr('value') ?? '')
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
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            const a = $item.find('a');
            const date = $item.find('span.source').text().replace('Published ', '').split(' CET | ', 1)[0];
            return {
                title: a.text(),
                link: a.attr('href'),
                pubDate: date ? parseDate(`${date} GMT+1`) : undefined,
            };
        });

    const items = await pMap(
        list,
        async (item) => {
            const detail = await cache.tryGet(`telecompaper:detail-fields:v1:${item.link}`, async (): Promise<Partial<DataItem>> => {
                const detailResponse = await got({ method: 'get', url: item.link });
                const content = load(detailResponse.data);
                return { description: content('#pageContainer').html() };
            });
            return { ...item, ...detail };
        },
        { concurrency: 3 }
    );

    return {
        title: 'Telecompaper - ' + $('h1').text(),
        link: rootUrl,
        item: items,
    };
}
