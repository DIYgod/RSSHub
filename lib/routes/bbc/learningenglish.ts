import { Route } from '@/types';
import cache from '@/utils/cache';
import { load } from 'cheerio';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    name: 'Learning English',
    maintainers: ['Blank0120'],
    categories: ['study'],
    handler,
    path: '/learningenglish/:channel?',
    example: '/bbc/learningenglish/take-away-english',
    parameters: {
        channel: 'channel, default to `take-away-english`',
    },
    description: `| 随身英语 | 地道英语 | 媒体英语 | 英语大破解 | 一分钟英语 |
| -------- | -------- | -------- | -------- | -------- |
| take-away-english | authentic-real-english | media-english | lingohack | english-in-a-minute |

| 短语动词 | 今日短语 | 你问我答 | 白领英语 | 亲子英语故事 |
| -------- | -------- | -------- | -------- | -------- |
| phrasal-verbs | todays-phrase | q-and-a | english-at-work | storytellers |`,
};

async function handler(ctx) {
    // set targetURL
    const { channel = 'take-away-english' } = ctx.req.param();

    const rootURL = 'https://www.bbc.co.uk';
    const targerURL = `${rootURL}/learningenglish/chinese/features/${channel}`;

    const response = await ofetch(targerURL, { parseResponse: (txt) => txt });
    const $ = load(response);

    // get top article links
    const firstItem = {
        title: $('[data-widget-index=4]').find('h2').text(),
        link: `${rootURL}${$('[data-widget-index=4]').find('h2 a').attr('href')}`,
        pubDate: parseDate($('[data-widget-index=4]').find('.details h3').text()),
    };

    // get rest ul article links
    const restItems = $('.threecol li')
        .toArray()
        .slice(0, 10)
        .map((article) => {
            const $article = load(article);

            return {
                title: $article('h2').text(),
                link: `${rootURL}${$article('h2 a').attr('href')}`,
                pubDate: parseDate($article('.details h3').text()),
            };
        });

    // try get article content detail
    const items = await Promise.all(
        [firstItem, ...restItems].map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await ofetch(item.link, { parseResponse: (txt) => txt });

                const $content = load(detailResponse);

                item.description = $content('.widget-richtext').html();
                return item;
            })
        )
    );

    return {
        title: `Learningenglish-${channel}-BBC`,
        link: targerURL,
        item: items,
    };
}
