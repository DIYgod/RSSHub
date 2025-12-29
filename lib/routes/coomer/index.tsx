import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const headers = { Accept: 'text/css' };

export const route: Route = {
    path: '/:source?/:id?',
    categories: ['multimedia'],
    example: '/coomer',
    parameters: { source: 'Source, see below, Posts by default', id: 'User id, can be found in URL' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        nsfw: true,
    },
    radar: [
        {
            source: ['coomer.st/'],
            target: '',
        },
        {
            source: ['coomer.st/:source/user/:id'],
            target: '/:source/:id',
        },
    ],
    name: 'Posts',
    maintainers: ['nczitzk', 'AiraNadih'],
    handler,
    description: `Sources

| Posts | OnlyFans | Fansly | CandFans |
| ----- | -------- | ------- | -------- |
| posts | onlyfans | fansly   | candfans |

::: tip
  When \`posts\` is selected as the value of the parameter **source**, the parameter **id** does not take effect.
  There is an optinal parameter **limit** which controls the number of posts to fetch, default value is 25.
:::`,
};

async function handler(ctx) {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 25;
    const source = ctx.req.param('source') ?? 'posts';
    const id = ctx.req.param('id');
    const isPosts = source === 'posts';

    const rootUrl = 'https://coomer.st';
    const apiUrl = `${rootUrl}/api/v1`;
    const currentUrl = isPosts ? `${apiUrl}/posts` : `${apiUrl}/${source}/user/${id}/posts`;

    const response = await got({
        method: 'get',
        url: currentUrl,
        headers,
    });
    const responseData = isPosts ? response.data.posts : response.data;

    const author = isPosts ? '' : await getAuthor(`${apiUrl}/${source}/user/${id}`);
    const title = isPosts ? 'Coomer Posts' : `Posts of ${author} from ${source} | Coomer`;
    const image = isPosts ? `${rootUrl}/favicon.ico` : `https://img.coomer.st/icons/${source}/${id}`;
    const items = responseData
        .filter((i) => i.content || i.attachments)
        .slice(0, limit)
        .map((i) => {
            i.files = [];
            if ('path' in i.file) {
                i.files.push({
                    name: i.file.name,
                    path: i.file.path,
                    extension: i.file.path.replace(/.*\./, '').toLowerCase(),
                });
            }
            for (const attachment of i.attachments) {
                i.files.push({
                    name: attachment.name,
                    path: attachment.path,
                    extension: attachment.path.replace(/.*\./, '').toLowerCase(),
                });
            }
            const filesHTML = renderSource(i);
            let $ = load(filesHTML);
            const coomerFiles = $('img, a, audio, video').map(function () {
                return $(this).prop('outerHTML')!;
            });
            let desc = '';
            if (i.content) {
                desc += `<div>${i.content}</div>`;
            }
            $ = load(desc);
            let count = 0;
            const regex = /downloads.fanbox.cc/;
            $('a').each(function () {
                const link = $(this).attr('href');
                if (regex.test(link!)) {
                    count++;
                    $(this).replaceWith(coomerFiles[count]);
                }
            });
            desc = (coomerFiles.length > 0 ? coomerFiles[0] : '') + $.html();
            for (const coomerFile of coomerFiles.slice(count + 1)) {
                desc += coomerFile;
            }

            let enclosureInfo = {};
            load(desc)('audio source, video source').each(function () {
                const src = $(this).attr('src') ?? '';
                const mimeType =
                    {
                        m4a: 'audio/mp4',
                        mp3: 'audio/mpeg',
                        mp4: 'video/mp4',
                    }[src.replace(/.*\./, '').toLowerCase()] || null;

                if (mimeType === null) {
                    return;
                }

                enclosureInfo = {
                    enclosure_url: new URL(src, rootUrl).toString(),
                    enclosure_type: mimeType,
                };
            });

            return {
                title: i.title || parseDate(i.published),
                description: desc,
                author,
                pubDate: parseDate(i.published),
                guid: `coomer:${i.service}:${i.user}:post:${i.id}`,
                link: `${rootUrl}/${i.service}/user/${i.user}/post/${i.id}`,
                ...enclosureInfo,
            };
        });

    return {
        title,
        image,
        link: isPosts ? `${rootUrl}/posts` : `${rootUrl}/${source}/user/${id}`,
        item: items,
    };
}

const renderSource = (item): string =>
    renderToString(
        <>
            {item.files?.map((file, index) => {
                if (['jpg', 'png', 'webp', 'jpeg', 'jfif'].includes(file.extension)) {
                    return <img key={`image-${index}`} src={file.path} />;
                }

                if (['m4a', 'mp3', 'ogg'].includes(file.extension)) {
                    return (
                        <audio key={`audio-${index}`} controls>
                            <source src={file.path} type={`audio/${file.extention}`} />
                        </audio>
                    );
                }

                if (['mp4', 'webm'].includes(file.extension)) {
                    return (
                        <video key={`video-${index}`} controls>
                            <source src={file.path} type={`video/${file.extention}`} />
                        </video>
                    );
                }

                return (
                    <a key={`file-${index}`} href={file.path}>
                        {file.name}
                    </a>
                );
            })}
            {item.embed ? (
                <>
                    {item.embed.type === 'image' ? <img src={item.embed.thumbnail?.proxy_url} /> : null}
                    {item.embed.type === 'link' ? (
                        <>
                            {item.embed.thumbnail ? (
                                <a href={item.embed.thumbnail.url}>
                                    <img src={item.embed.thumbnail.proxy_url} />
                                </a>
                            ) : null}
                            <a href={item.embed.url}>{item.embed.title}</a>
                            {item.embed.description ? <p>{item.embed.description}</p> : null}
                        </>
                    ) : null}
                </>
            ) : null}
        </>
    );

async function getAuthor(currentUrl) {
    const profileResponse = await got({
        method: 'get',
        url: `${currentUrl}/profile`,
        headers,
    });
    return profileResponse.data.name;
}
