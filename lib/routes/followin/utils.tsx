import type { Context } from 'hono';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';
import pMap from 'p-map';

import { renderYoutube } from '@/routes/youtube/utils';
import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { getRouteLimit } from '@/utils/route-limit';
import { compareDates, parseDate } from '@/utils/time';

const apiUrl = 'https://api.followin.io';
const baseUrl = 'https://followin.io';
const favicon = `${baseUrl}/favicon.ico`;
const renderContent = (info) => {
    const description = info.translated_full_content || info.full_content || info.translated_content || info.content;
    const videoId = info.source_name === 'youtube' ? info.videos[0] : undefined;
    return info.images.length || videoId
        ? renderToString(
              <>
                  {raw(description)}
                  {info.images.map((image) => (
                      <img src={image} />
                  ))}
                  {videoId ? raw(renderYoutube(true, videoId)) : null}
              </>
          )
        : description;
};
const renderThread = (list) =>
    renderToString(
        <>
            {list.map((item) => (
                <>
                    {raw((item.translated_content || item.content).replaceAll('\n', '<br>'))}
                    <br />
                    {item.images.length ? item.images.map((image) => <img src={image} />) : null}
                    {item.link_previews.length
                        ? item.link_previews.map((linkPreview) => (
                              <a href={linkPreview.link}>
                                  {linkPreview.title}
                                  <br />
                                  {linkPreview.content}
                              </a>
                          ))
                        : null}
                    <br />
                </>
            ))}
        </>
    );

const getBParam = (lang) => ({
    a: 'web',
    b: '',
    c: lang,
    d: 0,
    e: '',
    f: '',
    g: '',
    h: '0.1.0',
    i: 'official',
});

const getGToken = () =>
    cache.tryGet('followin:gtoken', async () => {
        const { data } = await got.post(`${apiUrl}/user/gtoken`);
        return data.data.gtoken;
    });

const getApi = async (path: string, lang: string, body: Record<string, number | string>) => {
    const gToken = await getGToken();
    const { data: response } = await got.post(`${apiUrl}${path}`, {
        headers: {
            'x-bparam': JSON.stringify(getBParam(lang)),
            'x-gtoken': gToken,
        },
        json: body,
    });
    if (response.code !== 2000) {
        throw new Error(`Followin ${path}: ${response.msg || response.code}`);
    }
    return response.data;
};

const parseList = (list, lang): DataItem[] =>
    list.map((item) => ({
        id: String(item.id),
        title: item.translated_title || item.title,
        description: item.translated_content || item.content,
        link: `${baseUrl}/${lang === 'en' ? '' : `${lang}/`}feed/${item.id}`,
        pubDate: parseDate(item.publish_time, 'x'),
        category: item.tags.map((tag) => tag.name),
        author: item.nickname,
    }));

const parseItem = async (item: DataItem, lang: string): Promise<DataItem> => {
    const detail = await cache.tryGet(`followin:api-detail-media:${lang}:${item.id}`, async () => {
        const info = await getApi('/feed/info', lang, { id: Number(item.id) });
        const thread = info.has_thread ? await getApi('/feed/thread', lang, { feed_id: Number(item.id) }) : undefined;
        return {
            description: thread ? renderThread(thread.list) : renderContent(info),
            category: info.tags.map((tag) => tag.name),
        };
    });
    return {
        ...item,
        description: detail.description,
        category: [...new Set([...(item.category as string[]), ...detail.category])],
    };
};

const getPoolSize = (ctx: Context, defaultLimit: number) => Math.max(defaultLimit, getRouteLimit(ctx, defaultLimit));

const processList = (list, lang: string, ctx: Context, defaultLimit: number) => {
    const limit = getRouteLimit(ctx, defaultLimit);
    let items = parseList(list, lang);
    if (ctx.req.query('sorted') !== 'false') {
        items = items.toSorted((a, b) => compareDates(b.pubDate, a.pubDate));
    }
    return pMap(items.slice(0, limit), (item) => parseItem(item, lang), { concurrency: 3 });
};

export { baseUrl, favicon, getApi, getPoolSize, processList };
