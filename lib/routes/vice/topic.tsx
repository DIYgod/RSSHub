import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const render = (data) =>
    renderToString(
        <>
            {data.image ? (
                <figure>
                    <img src={data.image.url} alt={data.image.alt} />
                    <figcaption>{data.image.caption || data.image.credit || data.image.alt}</figcaption>
                </figure>
            ) : null}
            {data.body ? <p>{raw(data.body.html)}</p> : null}
            {data.heading2 ? (
                <>
                    <hr />
                    <h2>{raw(data.heading2.html)}</h2>
                </>
            ) : null}
            {data.oembed ? raw(data.oembed.html) : null}
        </>
    );

export const route: Route = {
    path: '/topic/:topic/:language?',
    categories: ['traditional-media'],
    example: '/vice/topic/politics/en',
    parameters: {
        topic: 'Can be found in the URL',
        language: 'defaults to `en`, use the website to discover other codes',
    },
    radar: [
        {
            source: ['www.vice.com/:language/topic/:topic'],
            target: '/topic/:topic/:language',
        },
    ],
    name: 'Topic',
    maintainers: ['K33k0'],
    handler,
    url: 'vice.com/',
};

async function handler(ctx) {
    const { language = 'en', topic } = ctx.req.param();
    const response = await ofetch(`https://www.vice.com/${language}/topic/${topic}`);
    const $ = load(response);
    const nextData = JSON.parse($('script#__NEXT_DATA__').text());

    const list = nextData.props.pageProps.listPageData.articles.map((item) => ({
        title: item.title,
        link: `https://vice.com${item.url}`,
        pubDate: parseDate(item.publish_date, 'x'),
        author: item.contributions.map((c) => c.contributor.full_name).join(', '),
        description: item.dek,
        category: [...new Set([item.primary_topic.name, ...item.topics.map((t) => t.name)])],
    }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link);
                const $ = load(response);
                const articleNextData = JSON.parse($('script#__NEXT_DATA__').text()).props.pageProps.data.articles[0];
                const bodyComponent = JSON.parse(articleNextData.body_components_json);

                item.description =
                    render({
                        image: {
                            url: articleNextData.thumbnail_url,
                            alt: articleNextData.caption,
                            caption: articleNextData.caption,
                            credit: articleNextData.credit,
                        },
                    }) +
                    bodyComponent
                        .map((component) => {
                            switch (component.role) {
                                case 'body':
                                    return render({ body: { html: component.html } });
                                case 'heading2':
                                    return render({ heading2: { html: component.html } });
                                case 'image':
                                    return render({
                                        image: {
                                            url: component.URL,
                                            alt: component.alt,
                                            caption: component.caption,
                                        },
                                    });
                                case 'oembed':
                                case 'tweet':
                                case 'youtube':
                                    return render({ oembed: { html: component.oembed.html } });
                                default:
                                    return '';
                            }
                        })
                        .join('');

                return item;
            })
        )
    );

    return {
        // channel title
        title: `VICE | ${topic} articles`,
        // channel link
        link: `https://vice.com/${language}/topic/${topic}`,
        // each feed item
        item: items,
    };
}
