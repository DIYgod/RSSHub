// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
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
        .map((_, item) => {
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
        })
        .get();

    ctx.set('data', {
        title: 'Verfassungsgerichtshof Baden-Württemberg - Pressemitteilungen',
        link: request.url,
        description: 'Pressemitteilungen des Verfassungsgerichtshof für das Land Baden-Württemberg',
        item: list,
    });
};
