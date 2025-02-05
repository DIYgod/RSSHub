import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

export const route: Route = {
    path: '/:source?/:id?',
    categories: ['anime'],
    example: '/kemono',
    parameters: { source: 'Source, see below, Posts by default', id: 'User id, can be found in URL' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['kemono.su/:source/user/:id', 'kemono.su/'],
        },
    ],
    name: 'Posts',
    maintainers: ['nczitzk'],
    handler,
    description: `Sources

| Posts | Patreon | Pixiv Fanbox | Gumroad | SubscribeStar | DLsite | Discord | Fantia |
| ----- | ------- | ------------ | ------- | ------------- | ------ | ------- | ------ |
| posts | patreon | fanbox       | gumroad | subscribestar | dlsite | discord | fantia |

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

    const rootUrl = 'https://kemono.su';
    const apiUrl = `${rootUrl}/api/v1`;
    const discordUrl = `${apiUrl}/discord/channel/lookup/${id}`;
    const currentUrl = isPosts ? `${apiUrl}/posts` : `${apiUrl}/${source}/user/${id}`;

    const headers = {
        cookie: '__ddg2=sBQ4uaaGecmfEUk7',
    };

    const response = await got({
        method: 'get',
        url: source === 'discord' ? discordUrl : currentUrl,
        headers,
    });

    let items, title, image;

    if (source === 'discord') {
        title = `Posts of ${id} from Discord | Kemono`;

        items = await Promise.all(
            response.data.map((channel) =>
                cache.tryGet(channel.id, async () => {
                    const channelResponse = await got({
                        method: 'get',
                        url: `${rootUrl}/api/v1/discord/channel/${channel.id}?o=0`,
                        headers,
                    });

                    return channelResponse.data
                        .filter((i) => i.content || i.attachments)
                        .slice(0, limit)
                        .map((i) => ({
                            title: i.content,
                            description: art(path.join(__dirname, 'templates', 'discord.art'), { i }),
                            author: `${i.author.username}#${i.author.discriminator}`,
                            pubDate: parseDate(i.published),
                            category: channel.name,
                            guid: `kemono:${source}:${i.server}:${i.channel}:${i.id}`,
                            link: `https://discord.com/channels/${i.server}/${i.channel}/${i.id}`,
                        }));
                })
            )
        );
        items = items.flat();
    } else {
        const author = isPosts ? '' : await getAuthor(currentUrl, headers);
        title = isPosts ? 'Kemono Posts' : `Posts of ${author} from ${source} | Kemono`;
        image = isPosts ? `${rootUrl}/favicon.ico` : `https://img.kemono.su/icons/${source}/${id}`;
        items = response.data
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
                const filesHTML = art(path.join(__dirname, 'templates', 'source.art'), { i });
                let $ = load(filesHTML);
                const kemonoFiles = $('img, a, audio, video').map(function () {
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
                        $(this).replaceWith(kemonoFiles[count]);
                    }
                });
                desc = (kemonoFiles.length > 0 ? kemonoFiles[0] : '') + $.html();
                for (const kemonoFile of kemonoFiles.slice(count + 1)) {
                    desc += kemonoFile;
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
                    title: i.title,
                    description: desc,
                    author,
                    pubDate: parseDate(i.published),
                    guid: `${apiUrl}/${i.service}/user/${i.user}/post/${i.id}`,
                    link: `${rootUrl}/${i.service}/user/${i.user}/post/${i.id}`,
                    ...enclosureInfo,
                };
            });
    }

    return {
        title,
        image,
        link: isPosts ? `${rootUrl}/posts` : source === 'discord' ? `${rootUrl}/${source}/server/${id}` : `${rootUrl}/${source}/user/${id}`,
        item: items,
    };
}

async function getAuthor(currentUrl, headers) {
    const profileResponse = await got({
        method: 'get',
        url: `${currentUrl}/profile`,
        headers,
    });
    return profileResponse.data.name;
}
