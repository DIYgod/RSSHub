import path from 'node:path';

import { type CheerioAPI, load } from 'cheerio';
import { type Context } from 'hono';

import { type DataItem, type Route, type Data, ViewType } from '@/types';

import { art } from '@/utils/render';
import cache from '@/utils/cache';
import { getCurrentPath } from '@/utils/helpers';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const __dirname = getCurrentPath(import.meta.url);

export const handler = async (ctx: Context): Promise<Data> => {
    const { id } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '12', 10);

    const baseUrl: string = 'https://www.scientificamerican.com';
    const targetUrl: string = new URL(`podcast${id ? `/${id}` : 's'}/`, baseUrl).href;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language: string = $('html').attr('lang') ?? 'en';
    const data: string | undefined = response.match(/window\.__DATA__=JSON\.parse\(`(.*?)`\)/)?.[1];
    const parsedData = data ? JSON.parse(data.replaceAll('\\\\', '\\')) : undefined;

    let items: DataItem[] = [];

    items = parsedData
        ? parsedData.initialData.props.results.slice(0, limit).map((item): DataItem => {
              const title: string = item.title;
              const image: string | undefined = item.image_url;
              const description: string = art(path.join(__dirname, 'templates/description.art'), {
                  images: image
                      ? [
                            {
                                src: image,
                                alt: item.image_alt_text || title,
                                width: item.image_width,
                                height: item.image_height,
                            },
                        ]
                      : undefined,
                  intro: item.summary,
              });
              const pubDate: number | string = item.date_published;
              const linkUrl: string | undefined = item.url;
              const categories: string[] = [...new Set([item.category, item.subtype, item.column, item.digital_column].filter(Boolean))];
              const authors: DataItem['author'] = item.authors.map((author) => ({
                  name: author.name,
                  url: author.url ? new URL(author.url, baseUrl).href : undefined,
                  avatar: author.picture_file,
              }));
              const guid: string = `-${item.id}`;
              const updated: number | string = item.release_date ?? pubDate;

              let processedItem: DataItem = {
                  title,
                  description,
                  pubDate: pubDate ? timezone(parseDate(pubDate), +8) : undefined,
                  link: linkUrl ? new URL(linkUrl, baseUrl).href : undefined,
                  category: categories,
                  author: authors,
                  doi: item.article_doi,
                  guid,
                  id: guid,
                  content: {
                      html: description,
                      text: item.summary ?? description,
                  },
                  image,
                  banner: image,
                  updated: updated ? timezone(parseDate(updated), +8) : undefined,
                  language,
              };

              const enclosureUrl: string | undefined = item.media_url;

              if (enclosureUrl) {
                  const enclosureType: string = `audio/${enclosureUrl.replace(/\?.*$/, '').split(/\./).pop()}`;

                  processedItem = {
                      ...processedItem,
                      enclosure_url: enclosureUrl,
                      enclosure_type: enclosureType,
                      enclosure_title: title,
                      itunes_item_image: image,
                  };
              }

              return processedItem;
          })
        : [];

    items = (
        await Promise.all(
            items.map((item) => {
                if (!item.link) {
                    return item;
                }

                return cache.tryGet(item.link, async (): Promise<DataItem> => {
                    const detailResponse = await ofetch(item.link);

                    const detailData: string | undefined = detailResponse.match(/window\.__DATA__=JSON\.parse\(`(.*?)`\)/)?.[1];
                    const parsedDetailData = detailData ? JSON.parse(detailData.replaceAll('\\\\', '\\')) : undefined;

                    if (!parsedDetailData) {
                        return item;
                    }

                    const articleData = parsedDetailData.initialData.article;

                    const title: string = articleData.title;
                    const image: string | undefined = articleData.image_url;
                    const description: string = art(path.join(__dirname, 'templates/description.art'), {
                        images: image
                            ? [
                                  {
                                      src: image,
                                      alt: articleData.image_alt_text || title,
                                      width: articleData.image_width,
                                      height: articleData.image_height,
                                  },
                              ]
                            : undefined,
                        intro: articleData.summary,
                        content: articleData.content,
                    });
                    const pubDate: number | string = articleData.published_at_date_time;
                    const categories: string[] = [...new Set([articleData.display_category, articleData.primary_category, articleData.subcategory, ...(articleData.categories ?? []), articleData.podcast_series_name])];
                    const authors: DataItem['author'] = articleData.authors.map((author) => ({
                        name: author.name,
                        url: author.url ? new URL(author.url, baseUrl).href : undefined,
                        avatar: author.picture_file,
                    }));
                    const guid: string = `scientificamerican-${articleData.id}`;
                    const updated: number | string = articleData.updated_at_date_time ?? pubDate;

                    let processedItem: DataItem = {
                        title,
                        description,
                        pubDate: pubDate ? timezone(parseDate(pubDate), +8) : undefined,
                        category: categories,
                        author: authors,
                        doi: articleData.article_doi,
                        guid,
                        id: guid,
                        content: {
                            html: description,
                            text: articleData.summary ?? description,
                        },
                        image,
                        banner: image,
                        updated: updated ? timezone(parseDate(updated), +8) : undefined,
                        language,
                    };

                    const enclosureUrl: string | undefined = articleData.media_url;

                    if (enclosureUrl) {
                        const enclosureType: string = `audio/${enclosureUrl.replace(/\?.*$/, '').split(/\./).pop()}`;

                        processedItem = {
                            ...processedItem,
                            enclosure_url: enclosureUrl,
                            enclosure_type: enclosureType,
                            enclosure_title: title,
                            itunes_item_image: image,
                        };
                    }

                    return {
                        ...item,
                        ...processedItem,
                    };
                });
            })
        )
    ).filter((_): _ is DataItem => true);

    return {
        title: $('title').text(),
        description: $('meta[name="description"]').attr('content'),
        link: targetUrl,
        item: items,
        allowEmpty: true,
        image: $('meta[property="og:image"]').attr('content'),
        author: $('meta[property="og:site_name"]').attr('content'),
        language,
        feedLink: $('link[type="application/rss+xml"]').attr('href'),
        itunes_author: $('meta[property="og:site_name"]').attr('content'),
        itunes_category: 'Science',
        id: $('meta[property="og:url"]').attr('content'),
    };
};

export const route: Route = {
    path: '/podcast/:id?',
    name: 'Podcasts',
    url: 'www.scientificamerican.com',
    maintainers: ['nczitzk'],
    handler,
    example: '/scientificamerican/podcast',
    parameters: {
        id: 'ID, see below',
    },
    description: `:::tip
If you subscribe to [Science Quickly](https://www.scientificamerican.com/podcast/science-quickly/)，where the URL is \`https://www.scientificamerican.com/podcast/science-quickly/\`, extract the part \`https://www.scientificamerican.com/podcast/\` to the end, which is \`science-quickly\`, and use it as the parameter to fill in. Therefore, the route will be [\`/scientificamerican/podcast/science-quickly\`](https://rsshub.app/scientificamerican/podcast/science-quickly).
:::

| All | Science Quickly | Uncertain    |
| --- | --------------- | ------------ |
|     | science-quickly | science-talk |
`,
    categories: ['new-media'],
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
            source: ['www.scientificamerican.com/podcasts/', 'www.scientificamerican.com/podcast/:id'],
            target: (params) => {
                const id: string = params.id;

                return `/scientificamerican/podcast${id ? `/${id}` : ''}`;
            },
        },
        {
            title: 'Science Quickly',
            source: ['www.scientificamerican.com/podcast/science-quickly/'],
            target: '/podcast/science-quickly',
        },
        {
            title: 'Uncertain',
            source: ['www.scientificamerican.com/podcast/science-talk/'],
            target: '/podcast/science-talk',
        },
    ],
    view: ViewType.Articles,

    zh: {
        path: '/podcast/:id?',
        name: 'Podcasts',
        url: 'www.scientificamerican.com',
        maintainers: ['nczitzk'],
        handler,
        example: '/scientificamerican/podcast',
        parameters: {
            id: 'ID，见下表',
        },
        description: `:::tip
若订阅 [Science Quickly](https://www.scientificamerican.com/podcast/science-quickly/)，网址为 \`https://www.scientificamerican.com/podcast/science-quickly/\`，请截取 \`https://www.scientificamerican.com/podcast/\` 到末尾 \`/\` 的部分 \`science-quickly\` 作为 \`id\` 参数填入，此时目标路由为 [\`/scientificamerican/podcast/science-quickly\`](https://rsshub.app/scientificamerican/podcast/science-quickly)。
:::

| 全部 | Science Quickly | Uncertain    |
| ---- | --------------- | ------------ |
|      | science-quickly | science-talk |
`,
    },
};
