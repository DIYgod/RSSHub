import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat.js';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';
import type { JSX } from 'hono/jsx/jsx-runtime';
import { FetchError } from 'ofetch';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

export const route: Route = {
    path: '/app/:category{.+}?',
    categories: ['traditional-media'],
    example: '/washingtonpost/app/national',
    parameters: {
        category: 'Category from the path of the URL of the corresponding site, see below',
    },
    features: {
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'App',
    maintainers: ['quiniapiezoelectricity'],
    radar: [
        {
            source: ['www.washingtonpost.com/:category'],
            target: '/app/:category',
        },
    ],
    handler,
    description: `::: tip
For example, the category for https://www.washingtonpost.com/national/investigations would be /national/investigations.
:::`,
};

function handleDuplicates(array) {
    const objects = {};
    for (const obj of array) {
        objects[obj.id] = objects[obj.id] ? Object.assign(objects[obj.id], obj) : obj;
    }
    return Object.values(objects);
}

async function handler(ctx) {
    const category = ctx.req.param('category') ?? '';
    const headers = {
        Accept: '*/*',
        Connection: 'keep-alive',
        'User-Agent': 'Classic/6.70.0',
    };
    dayjs.extend(utc);
    dayjs.extend(timezone);
    dayjs.extend(advancedFormat);

    const url = `https://jsonapp1.washingtonpost.com/fusion_prod/v2/${category}`;
    const response = await got.get(url, { headers });
    const title = response.data.tracking.page_title.includes('Washington Post') ? response.data.tracking.page_title : `The Washington Post - ${response.data.tracking.page_title}`;
    const link = 'https://washingtonpost.com' + response.data.tracking.page_path;
    const mains = response.data.regions[0].items.filter((item) => item.items);
    const list = mains.flatMap((main) =>
        main.items[0].items
            .filter((item) => item.is_from_feed === true)
            .map((item) => {
                const object = {
                    id: item.id,
                    title: item.headline.text,
                    link: item.link.url,
                    pubDate: item.link.display_date,
                    updated: item.link.last_modified,
                };
                if (item.blurbs?.items[0]?.text) {
                    object.description = item.blurbs?.items[0]?.text;
                }
                return object;
            })
    );
    const feed = handleDuplicates(list);
    const items = await Promise.all(
        feed.map((item) =>
            cache.tryGet(item.link, async () => {
                let response;
                try {
                    response = await got(`https://rainbowapi-a.wpdigital.net/rainbow-data-service/rainbow/content-by-url.json?followLinks=false&url=${item.link}`, { headers });
                } catch (error) {
                    if (error instanceof FetchError && error.statusCode === 415) {
                        // Interactive or podcast contents will return 415 Unsupported Media Type. Keep calm and carry on.
                        return item;
                    } else {
                        throw error;
                    }
                }
                item.title = response.data.title ?? item.title;
                item.author =
                    response.data.items
                        .filter((entry) => entry.type === 'byline')
                        ?.flatMap((entry) => entry.authors.map((author) => author.name))
                        ?.join(', ') ?? '';
                item.description = renderDescription(response.data.items);
                return item;
            })
        )
    );

    return {
        title,
        link,
        item: items,
    };
}

const renderDescription = (content): string =>
    renderToString(
        <>
            {content?.map((entry, index) => {
                if (!entry) {
                    return null;
                }

                if (entry.type === 'title' && entry.subtype !== 'h1') {
                    const TitleTag = (entry.subtype || 'h2') as keyof JSX.IntrinsicElements;
                    return <TitleTag key={`title-${index}`}>{entry.mime === 'text/html' ? raw(entry.content) : entry.content}</TitleTag>;
                }

                if (entry.type === 'sanitized_html') {
                    if (entry.subtype === 'paragraph') {
                        return (
                            <p key={`paragraph-${index}`}>
                                {entry.mime === 'text/html' ? raw(entry.content) : entry.content}
                                {entry.oembed ? raw(entry.oembed) : null}
                            </p>
                        );
                    }

                    if (entry.subtype === 'subhead') {
                        const SubheadTag = `h${entry.subhead_level || 4}` as keyof JSX.IntrinsicElements;
                        return (
                            <SubheadTag key={`subhead-${index}`}>
                                {entry.mime === 'text/html' ? raw(entry.content) : entry.content}
                                {entry.oembed ? raw(entry.oembed) : null}
                            </SubheadTag>
                        );
                    }
                }

                if (entry.type === 'deck') {
                    return (
                        <blockquote key={`deck-${index}`}>
                            <p>{entry.mime === 'text/html' ? raw(entry.content) : entry.content}</p>
                        </blockquote>
                    );
                }

                if (entry.type === 'image') {
                    return (
                        <figure key={`image-${index}`}>
                            <img src={entry.imageURL} alt={entry.blurb} />
                            <figcaption>{entry.fullcaption}</figcaption>
                        </figure>
                    );
                }

                if (entry.type === 'video') {
                    if (entry.content?.html) {
                        return <span key={`video-html-${index}`}>{raw(entry.content.html)}</span>;
                    }

                    if (entry.mediaURL) {
                        return (
                            <figure key={`video-${index}`}>
                                <video controls poster={entry.imageURL}>
                                    <source src={entry.mediaURL} />
                                </video>
                                {entry.fullcaption ? <figcaption>{entry.fullcaption}</figcaption> : null}
                            </figure>
                        );
                    }
                }

                if (entry.type === 'list') {
                    const ListTag = entry.subtype === 'ordered' ? 'ol' : 'ul';
                    return (
                        <ListTag key={`list-${index}`}>
                            {(entry.content ?? []).map((listItem, itemIndex) => (
                                <li key={`list-${index}-${itemIndex}`}>{entry.mime === 'text/html' ? raw(listItem) : listItem}</li>
                            ))}
                        </ListTag>
                    );
                }

                if (entry.type === 'divider') {
                    return (
                        <span key={`divider-${index}`}>
                            <br />
                            <hr />
                            <br />
                        </span>
                    );
                }

                if (entry.type === 'byline' && (entry.subtype === 'live-update' || entry.subtype === 'live-reporter-insight')) {
                    return (
                        <p key={`byline-${index}`}>
                            <i>{entry.mime === 'text/html' ? raw(entry.content) : entry.content}</i>
                        </p>
                    );
                }

                if (entry.type === 'date' && entry.subtype === 'live-update') {
                    return entry.content ? <span key={`date-${index}`}>{dayjs.tz(entry.content, 'America/New_York').locale('en').format('dddd, MMMM D, YYYY h:mm A z')}</span> : null;
                }

                return null;
            })}
        </>
    );
