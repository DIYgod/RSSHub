import path from 'node:path';

import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';

export const handler = async (ctx) => {
    const { tag } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 1;

    const rootUrl = 'https://www.deeplearning.ai';
    const currentUrl = new URL(`the-batch${tag ? `/tag/${tag.replace(/^tag\//, '').replace(/\/$/, '')}` : ''}/`, rootUrl).href;

    const response = await ofetch(currentUrl);

    const $ = load(response);

    const language = $('html').prop('lang');

    const data = JSON.parse($('script#__NEXT_DATA__').text());

    const nextBuildId = data.buildId;
    const posts = data.props?.pageProps?.posts ?? [];

    let items = posts.slice(0, limit).map((item) => {
        const title = item.title;
        const description = art(path.join(__dirname, 'templates/description.art'), {
            images: item.feature_image
                ? [
                      {
                          src: item.feature_image,
                          alt: item.feature_image_alt,
                      },
                  ]
                : undefined,
            intro: item.excerpt ?? item.custom_excerpt,
        });
        const image = item.feature_image;
        const guid = `the-batch-${item.slug}`;

        return {
            title,
            description,
            pubDate: parseDate(item.published_at),
            link: new URL(`_next/data/${nextBuildId}/the-batch/${item.slug}.json`, rootUrl).href,
            category: item.tags.map((t) => t.name),
            guid,
            id: guid,
            content: {
                html: description,
                text: item.excerpt ?? item.custom_excerpt,
            },
            image,
            banner: image,
            language,
        };
    });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await ofetch(item.link);

                const post = detailResponse.pageProps?.post ?? undefined;

                if (!post) {
                    return item;
                }

                const $$ = load(post.html);

                $$('a').each((_, ele) => {
                    if (ele.attribs.href?.includes('utm_campaign')) {
                        const url = new URL(ele.attribs.href);
                        url.searchParams.delete('utm_campaign');
                        url.searchParams.delete('utm_source');
                        url.searchParams.delete('utm_medium');
                        url.searchParams.delete('_hsenc');
                        ele.attribs.href = url.href;
                    }
                });

                const title = post.title;
                const description = art(path.join(__dirname, 'templates/description.art'), {
                    images: post.feature_image
                        ? [
                              {
                                  src: post.feature_image,
                                  alt: post.feature_image_alt,
                              },
                          ]
                        : undefined,
                    intro: post.excerpt ?? post.custom_excerpt,
                    description: $$.html(),
                });
                const guid = `the-batch-${post.slug}`;
                const image = post.feature_image;

                item.title = title;
                item.description = description;
                item.pubDate = parseDate(post.published_at);
                item.link = new URL(`the-batch/${post.slug}`, rootUrl).href;
                item.category = post.tags.map((t) => t.name);
                item.author = post.authors.map((a) => a.name).join('/');
                item.guid = guid;
                item.id = guid;
                item.content = {
                    html: description,
                    text: post.excerpt ?? post.custom_excerpt,
                };
                item.image = image;
                item.banner = image;
                item.updated = parseDate(post.updated_at);
                item.language = language;

                return item;
            })
        )
    );

    const image = new URL($('meta[property="og:image"]').prop('content'), rootUrl).href;

    return {
        title: $('title').text(),
        description: $('meta[property="og:description"]').prop('content'),
        link: currentUrl,
        item: items,
        allowEmpty: true,
        image,
        author: $('meta[property="og:site_name"]').prop('content'),
        language,
    };
};

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
| [Learning & Education](https://www.deeplearning.ai/the-batch/tag/learning-education/)   | [learning-education](https://rsshub.app/deeplearning/the-batch/learning-education)     |
    `,
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
