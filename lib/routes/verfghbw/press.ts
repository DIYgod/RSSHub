import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/press/:keyword?',
    categories: ['government'],
    example: '/verfghbw/press',
    parameters: { keyword: 'Keyword' },
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
            source: ['verfgh.baden-wuerttemberg.de/de/presse-und-service/pressemitteilungen/'],
            target: '/press',
        },
    ],
    name: 'Press releases',
    maintainers: ['quinn-dev'],
    handler,
    url: 'verfgh.baden-wuerttemberg.de/de/presse-und-service/pressemitteilungen/',
};

async function handler(ctx) {
    const keyword = ctx.req.param('keyword');
    const rootUrl = 'https://verfgh.baden-wuerttemberg.de';

    let request = {
        url: `${rootUrl}/de/presse-und-service/pressemitteilungen/`,
        headers: {
            Referer: `${rootUrl}/de/presse-und-service/pressemitteilungen/`,
        },
    };

    request = keyword
        ? {
              method: 'post',
              form: {
                  'tx_bwlistheader_list[search][keywords]': keyword,
              },
              ...request,
          }
        : {
              method: 'get',
              ...request,
          };

    const response = await got(request);

    const data = response.data;
    const $ = load(data);

    const list = $('.pressListItem')
        .toArray()
        .map((item) => {
            item = $(item);

            const title = item.find('.pressListItemTeaser > h3').text().trim();
            const link = rootUrl + '/' + item.find('.link-download').attr('href');
            item.find('.pressListItemTeaser > h3').replaceWith((_, e) => `<p>${$(e).html()}</p>`);
            item.find('a').each((_, e) => $(e).attr('href', rootUrl + '/' + $(e).attr('href')));

            return {
                title,
                link,
                description: item.find('.pressListItemTeaser').html(),
                pubDate: parseDate(item.find('.pressListItemDate > span').text(), 'DD.MM.YYYY'),
            };
        });

    return {
        title: 'Verfassungsgerichtshof Baden-Württemberg - Pressemitteilungen',
        link: request.url,
        description: 'Pressemitteilungen des Verfassungsgerichtshof für das Land Baden-Württemberg',
        item: list,
    };
}
