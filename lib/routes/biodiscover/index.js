import got from '~/utils/got.js';
import cheerio from 'cheerio';
import {parseRelativeDate} from '~/utils/parse-date.js';
import timezone from '~/utils/timezone';

export default async (ctx) => {
    const {
        channel = 'home'
    } = ctx.params;
    const listUrl = 'http://www.biodiscover.com' + (channel === 'home' ? '/' : '/news/' + channel);
    const response = await got({ url: listUrl });
    const $ = cheerio.load(response.data);

    const listTitle = $('.list-title').text().trim();
    const itemUrls = $('.news_list li h2 a')
        .map((_, item) => 'http://www.biodiscover.com' + $(item).attr('href'))
        .toArray();

    ctx.state.data = {
        title: '生物探索' + (listTitle ? ` - ${listTitle}` : ''),
        link: listUrl,
        description: $('meta[name=description]').attr('content'),
        item: await Promise.all(
            itemUrls.map((itemUrl) =>
                ctx.cache.tryGet(itemUrl, async () => {
                    const detailResponse = await got({ url: itemUrl });
                    const $ = cheerio.load(detailResponse.data);

                    const dateStr = $('.from').children().last().text().replace('·', '').trim();

                    return {
                        title: $('.article_title').text(),
                        author: $('.from').children().first().text().trim(),
                        category: $('.article .share .tag a')
                            .map((_, a) => $(a).text().trim())
                            .toArray(),
                        description: $('.article .main_info').html(),
                        pubDate: timezone(parseRelativeDate(dateStr) || new Date(dateStr), +8),
                        link: itemUrl,
                    };
                })
            )
        ),
    };
};
