import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Language, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { renderDescription } from './templates/description';

const parseFlightData = (buf: Buffer) => {
    const rows = new Map<string, string>();
    let i = 0;
    while (i < buf.length) {
        const colon = buf.indexOf(0x3a, i);
        const id = buf.toString('utf8', i, colon);
        let end, value;
        if (buf[colon + 1] === 0x54) {
            const comma = buf.indexOf(0x2c, colon);
            const length = Number.parseInt(buf.toString('utf8', colon + 2, comma), 16);
            value = buf.toString('utf8', comma + 1, comma + 1 + length);
            end = comma + 1 + length;
        } else {
            end = buf.indexOf(0x0a, colon);
            value = buf.toString('utf8', colon + 1, end);
        }
        rows.set(id, value);
        i = end + 1;
    }
    return rows;
};

async function handler(ctx: Context) {
    const { tag } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 16;

    const rootUrl = 'https://www.deeplearning.ai';
    const currentUrl = new URL(`the-batch${tag ? `/tag/${tag.replace(/^tag\//, '').replace(/\/$/, '')}` : ''}`, rootUrl).href;

    const response = await ofetch(currentUrl);

    const $ = load(response);

    const language = $('html').prop('lang') as Language;

    const flight = $('script:contains("self.__next_f")')
        .toArray()
        .map((script) =>
            $(script)
                .text()
                .match(/^self\.__next_f\.push\(\[1,(".*")\]\)$/s)
        )
        .filter(Boolean)
        .map((m) => JSON.parse(m![1]) as string)
        .join('');

    const cardsRow = flight.split('\n').find((row) => row.includes('"cards":['));
    if (!cardsRow) {
        throw new Error('No cards found in flight payload');
    }
    const { cards } = JSON.parse(cardsRow.replace(/^[0-9a-f]+:/, ''))[3];

    let items = cards.slice(0, limit).map((card) => {
        const title = card.title;
        const description = renderDescription({
            images: card.image?.src
                ? [
                      {
                          src: card.image.src,
                          alt: card.image.alt,
                      },
                  ]
                : undefined,
            intro: card.excerpt,
        });
        const image = card.image?.src;
        const guid = `the-batch-${card.href.split('/').pop()}`;

        return {
            title,
            description,
            link: new URL(card.href, rootUrl).href,
            guid,
            id: guid,
            content: {
                html: description,
                text: card.excerpt,
            },
            image,
            banner: image,
            language,
        };
    });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await ofetch(item.link, {
                    headers: { rsc: '1' },
                    responseType: 'arrayBuffer',
                });

                const rows = parseFlightData(Buffer.from(detailResponse));

                const bodyId = rows
                    .values()
                    .find((row) => row.includes('"prose'))
                    ?.match(/"__html":"\$(\w+)"/)?.[1];
                if (!bodyId || !rows.has(bodyId)) {
                    throw new Error('No article body found in flight payload');
                }
                const $$ = load(rows.get(bodyId)!);

                $$('#elevenlabs-audionative-widget').remove();

                $$('a').each((_, ele) => {
                    if (!ele.attribs.href?.includes('utm_campaign')) {
                        return;
                    }
                    const url = new URL(ele.attribs.href);
                    url.searchParams.delete('utm_campaign');
                    url.searchParams.delete('utm_source');
                    url.searchParams.delete('utm_medium');
                    url.searchParams.delete('_hsenc');
                    ele.attribs.href = url.href;
                });

                const metaProps = JSON.parse(rows.values().find((row) => row.includes('"og:title"'))!)
                    .filter((element) => element[1] === 'meta')
                    .map((element) => element[3] as Record<string, string>);
                const meta = (property: string) => metaProps.find((props) => props.property === property)?.content;

                const title = meta('og:title')!;
                const intro = meta('og:description');
                const image = meta('og:image');
                const description = renderDescription({
                    images: image
                        ? [
                              {
                                  src: image,
                                  alt: title,
                              },
                          ]
                        : undefined,
                    intro,
                    description: $$.html(),
                });
                item.title = title;
                item.description = description;
                item.pubDate = parseDate(meta('article:published_time')!);
                item.category = metaProps.filter((props) => props.property === 'article:tag').map((props) => props.content);
                item.author = meta('article:author');
                item.content = {
                    html: description,
                    text: intro,
                };
                item.image = image;
                item.banner = image;
                item.updated = parseDate(meta('article:modified_time')!);

                return item;
            })
        )
    );

    return {
        title: $('title').text(),
        description: $('meta[property="og:description"]').prop('content'),
        link: currentUrl,
        item: items,
        allowEmpty: true,
        image: `${rootUrl}/favicon.ico`,
        author: $('meta[property="og:site_name"]').prop('content'),
        language,
    };
}

export const route: Route = {
    path: '/the-batch/:tag{.+}?',
    name: 'The Batch',
    url: 'www.deeplearning.ai',
    maintainers: ['nczitzk', 'juvenn', 'TonyRL'],
    handler,
    example: '/deeplearning/the-batch',
    parameters: { tag: 'Tag, Weekly Issues by default' },
    description: `::: tip
If you subscribe to [Data Points](https://www.deeplearning.ai/the-batch/tag/data-points/)，where the URL is \`https://www.deeplearning.ai/the-batch/tag/data-points/\`, extract the part \`https://www.deeplearning.ai/the-batch/tag\` to the end, which is \`data-points\`, and use it as the parameter to fill in. Therefore, the route will be [\`/deeplearning/the-batch/data-points\`](https://rsshub.app/deeplearning/the-batch/data-points).

:::

| Tag                                                                    | ID                                                                   |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------- |
| [Weekly Issues](https://www.deeplearning.ai/the-batch/)                | [*null*](https://rsshub.app/deeplearning/the-batch)                  |
| [Andrew's Letters](https://www.deeplearning.ai/the-batch/tag/letters/) | [letters](https://rsshub.app/deeplearning/the-batch/letters)         |
| [Data Points](https://www.deeplearning.ai/the-batch/tag/data-points/)  | [data-points](https://rsshub.app/deeplearning/the-batch/data-points) |
| [ML Research](https://www.deeplearning.ai/the-batch/tag/research/)     | [research](https://rsshub.app/deeplearning/the-batch/research)       |
| [Business](https://www.deeplearning.ai/the-batch/tag/business/)        | [business](https://rsshub.app/deeplearning/the-batch/business)       |
| [Science](https://www.deeplearning.ai/the-batch/tag/science/)          | [science](https://rsshub.app/deeplearning/the-batch/science)         |
| [AI & Society](https://www.deeplearning.ai/the-batch/tag/ai-society/)  | [ai-society](https://rsshub.app/deeplearning/the-batch/ai-society)   |
| [Culture](https://www.deeplearning.ai/the-batch/tag/culture/)          | [culture](https://rsshub.app/deeplearning/the-batch/culture)         |
| [Hardware](https://www.deeplearning.ai/the-batch/tag/hardware/)        | [hardware](https://rsshub.app/deeplearning/the-batch/hardware)       |
| [AI Careers](https://www.deeplearning.ai/the-batch/tag/ai-careers/)    | [ai-careers](https://rsshub.app/deeplearning/the-batch/ai-careers)   |

#### [Letters from Andrew Ng](https://www.deeplearning.ai/the-batch/tag/letters/)

| Tag                                                                                     | ID                                                                                     |
| --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| [All](https://www.deeplearning.ai/the-batch/tag/letters/)                               | [letters](https://rsshub.app/deeplearning/the-batch/letters)                           |
| [Personal Insights](https://www.deeplearning.ai/the-batch/tag/personal-insights/)       | [personal-insights](https://rsshub.app/deeplearning/the-batch/personal-insights)       |
| [Technical Insights](https://www.deeplearning.ai/the-batch/tag/technical-insights/)     | [technical-insights](https://rsshub.app/deeplearning/the-batch/technical-insights)     |
| [Business Insights](https://www.deeplearning.ai/the-batch/tag/business-insights/)       | [business-insights](https://rsshub.app/deeplearning/the-batch/business-insights)       |
| [Tech & Society](https://www.deeplearning.ai/the-batch/tag/tech-society/)               | [tech-society](https://rsshub.app/deeplearning/the-batch/tech-society)                 |
| [DeepLearning.AI News](https://www.deeplearning.ai/the-batch/tag/deeplearning-ai-news/) | [deeplearning-ai-news](https://rsshub.app/deeplearning/the-batch/deeplearning-ai-news) |
| [AI Careers](https://www.deeplearning.ai/the-batch/tag/ai-careers/)                     | [ai-careers](https://rsshub.app/deeplearning/the-batch/ai-careers)                     |
| [Just For Fun](https://www.deeplearning.ai/the-batch/tag/just-for-fun/)                 | [just-for-fun](https://rsshub.app/deeplearning/the-batch/just-for-fun)                 |
| [Learning & Education](https://www.deeplearning.ai/the-batch/tag/learning-education/)   | [learning-education](https://rsshub.app/deeplearning/the-batch/learning-education)     |`,
    categories: ['programming'],

    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.deeplearning.ai/the-batch', 'www.deeplearning.ai/the-batch/tag/:tag/'],
            target: (params) => {
                const tag = params.tag;

                return `/the-batch${tag ? `/${tag}` : ''}`;
            },
        },
        {
            title: 'Weekly Issues',
            source: ['www.deeplearning.ai/the-batch/'],
            target: '/the-batch',
        },
        {
            title: "Andrew's Letters",
            source: ['www.deeplearning.ai/the-batch/tag/letters/'],
            target: '/the-batch/letters',
        },
        {
            title: 'Data Points',
            source: ['www.deeplearning.ai/the-batch/tag/data-points/'],
            target: '/the-batch/data-points',
        },
        {
            title: 'ML Research',
            source: ['www.deeplearning.ai/the-batch/tag/research/'],
            target: '/the-batch/research',
        },
        {
            title: 'Business',
            source: ['www.deeplearning.ai/the-batch/tag/business/'],
            target: '/the-batch/business',
        },
        {
            title: 'Science',
            source: ['www.deeplearning.ai/the-batch/tag/science/'],
            target: '/the-batch/science',
        },
        {
            title: 'AI & Society',
            source: ['www.deeplearning.ai/the-batch/tag/ai-society/'],
            target: '/the-batch/ai-society',
        },
        {
            title: 'Culture',
            source: ['www.deeplearning.ai/the-batch/tag/culture/'],
            target: '/the-batch/culture',
        },
        {
            title: 'Hardware',
            source: ['www.deeplearning.ai/the-batch/tag/hardware/'],
            target: '/the-batch/hardware',
        },
        {
            title: 'AI Careers',
            source: ['www.deeplearning.ai/the-batch/tag/ai-careers/'],
            target: '/the-batch/ai-careers',
        },
        {
            title: 'Letters from Andrew Ng - All',
            source: ['www.deeplearning.ai/the-batch/tag/letters/'],
            target: '/the-batch/letters',
        },
        {
            title: 'Letters from Andrew Ng - Personal Insights',
            source: ['www.deeplearning.ai/the-batch/tag/personal-insights/'],
            target: '/the-batch/personal-insights',
        },
        {
            title: 'Letters from Andrew Ng - Technical Insights',
            source: ['www.deeplearning.ai/the-batch/tag/technical-insights/'],
            target: '/the-batch/technical-insights',
        },
        {
            title: 'Letters from Andrew Ng - Business Insights',
            source: ['www.deeplearning.ai/the-batch/tag/business-insights/'],
            target: '/the-batch/business-insights',
        },
        {
            title: 'Letters from Andrew Ng - Tech & Society',
            source: ['www.deeplearning.ai/the-batch/tag/tech-society/'],
            target: '/the-batch/tech-society',
        },
        {
            title: 'Letters from Andrew Ng - DeepLearning.AI News',
            source: ['www.deeplearning.ai/the-batch/tag/deeplearning-ai-news/'],
            target: '/the-batch/deeplearning-ai-news',
        },
        {
            title: 'Letters from Andrew Ng - AI Careers',
            source: ['www.deeplearning.ai/the-batch/tag/ai-careers/'],
            target: '/the-batch/ai-careers',
        },
        {
            title: 'Letters from Andrew Ng - Just For Fun',
            source: ['www.deeplearning.ai/the-batch/tag/just-for-fun/'],
            target: '/the-batch/just-for-fun',
        },
        {
            title: 'Letters from Andrew Ng - Learning & Education',
            source: ['www.deeplearning.ai/the-batch/tag/learning-education/'],
            target: '/the-batch/learning-education',
        },
    ],
};
