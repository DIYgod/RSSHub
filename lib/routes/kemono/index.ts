import { Route } from '@/types';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

export const route: Route = {
    path: '/:source?/:id?/:type?',
    categories: ['anime'],
    example: '/kemono',
    parameters: {
        source: 'Source, see below, Posts by default',
        id: 'User id, can be found in URL',
        type: 'Content type: announcements or fancards (optional)',
    },
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
            source: ['kemono.su/'],
            target: '/kemono',
        },
        {
            source: ['kemono.su/:source/user/:id'],
            target: '/kemono/:source/:id',
        },
        {
            source: ['kemono.su/:source/user/:id/announcements'],
            target: '/kemono/:source/:id/announcements',
        },
        {
            source: ['kemono.su/:source/user/:id/fancards'],
            target: '/kemono/:source/:id/fancards',
        },
    ],
    name: 'Posts',
    maintainers: ['nczitzk', 'AiraNadih'],
    handler,
    description: `Sources

| Posts | Patreon | Pixiv Fanbox | Gumroad | SubscribeStar | DLsite | Discord | Fantia |
| ----- | ------- | ------------ | ------- | ------------- | ------ | ------- | ------ |
| posts | patreon | fanbox       | gumroad | subscribestar | dlsite | discord | fantia |

::: tip
  When \`posts\` is selected as the value of the parameter **source**, the parameter **id** does not take effect.
  There is an optinal parameter **limit** which controls the number of posts to fetch, default value is 25.
  
  Support for announcements and fancards:
  - Use \`/:source/:id/announcements\` to get announcements
  - Use \`/:source/:id/fancards\` to get fancards
:::`,
};

function parseJsonField(field: any): any {
    if (typeof field === 'string') {
        try {
            let parsed = JSON.parse(field);
            if (typeof parsed === 'string') {
                try {
                    parsed = JSON.parse(parsed);
                } catch {
                    return field;
                }
            }
            return parsed;
        } catch {
            return field;
        }
    }
    return field;
}

function buildUrl(apiUrl: string, isPosts: boolean, source: string, id: string, type?: string): string {
    if (isPosts) {
        return `${apiUrl}/posts`;
    }
    if (source === 'discord') {
        return `${apiUrl}/discord/channel/lookup/${id}`;
    }
    if (type) {
        return `${apiUrl}/${source}/user/${id}/${type}`;
    }
    return `${apiUrl}/${source}/user/${id}`;
}

function buildLink(isPosts: boolean, rootUrl: string, source: string, id: string, type?: string): string {
    if (isPosts) {
        return `${rootUrl}/posts`;
    }
    if (source === 'discord') {
        return `${rootUrl}/${source}/server/${id}`;
    }
    if (type) {
        return `${rootUrl}/${source}/user/${id}/${type}`;
    }
    return `${rootUrl}/${source}/user/${id}`;
}

async function getAuthor(profileUrl: string) {
    const profileResponse = await got({ method: 'get', url: profileUrl });
    return profileResponse.data.name;
}

async function handler(ctx) {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 25;
    const source = ctx.req.param('source') ?? 'posts';
    const id = ctx.req.param('id');
    const type = ctx.req.param('type');
    const isPosts = source === 'posts';

    const rootUrl = 'https://kemono.su';
    const apiUrl = `${rootUrl}/api/v1`;
    const profileUrl = source ? `${apiUrl}/${source}/user/${id}/profile` : '';
    const currentUrl = buildUrl(apiUrl, isPosts, source, id, type);

    const response = await got({ method: 'get', url: currentUrl });
    const author = isPosts || source === 'discord' ? '' : await getAuthor(profileUrl);
    const image = isPosts || source === 'discord' ? `${rootUrl}/favicon.ico` : `https://img.kemono.su/icons/${source}/${id}`;

    let items, title;

    if (source === 'discord') {
        title = `Posts of ${id} from Discord | Kemono`;

        items = await Promise.all(
            response.data.map((channel) =>
                cache.tryGet(channel.id, async () => {
                    const channelResponse = await got({
                        method: 'get',
                        url: `${rootUrl}/api/v1/discord/channel/${channel.id}?o=0`,
                    });

                    return channelResponse.data
                        .filter((i) => i.content || i.attachments)
                        .slice(0, limit)
                        .map((i) => ({
                            title: i.content,
                            description: art(path.join(__dirname, 'templates/discord.art'), { i }),
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
    } else if (type === 'announcements') {
        title = `Announcements of ${author} from ${source} | Kemono`;

        items = response.data.slice(0, limit).map((announcement) => ({
            title: `Announcement from ${announcement.published ? parseDate(announcement.published).toDateString() : 'Unknown Date'}`,
            description: `<div>${announcement.content}</div>`,
            author,
            pubDate: parseDate(announcement.published),
            guid: `kemono:${source}:${id}:announcement:${announcement.hash}`,
            link: `${rootUrl}/${source}/user/${id}/announcements`,
        }));
    } else if (type === 'fancards') {
        title = `Fancards of ${author} from ${source} | Kemono`;

        items = response.data.slice(0, limit).map((fancard) => {
            const imageUrl = `${fancard.server}${fancard.path}`;

            return {
                title: `Fancard ${fancard.id}`,
                description: `<img src="${imageUrl}" />`,
                author,
                pubDate: parseDate(fancard.added),
                guid: `kemono:${source}:${id}:fancard:${fancard.id}`,
                link: imageUrl,
                enclosure_url: imageUrl,
                enclosure_type: fancard.mime,
            };
        });
    } else {
        title = isPosts ? 'Kemono Posts' : `Posts of ${author} from ${source} | Kemono`;

        const responseData = isPosts ? response.data.posts : response.data;
        items = responseData
            .filter((i) => i.content || i.attachments)
            .slice(0, limit)
            .map((i) => {
                if (i.file) {
                    i.file = parseJsonField(i.file);
                }

                if (i.attachments && Array.isArray(i.attachments)) {
                    i.attachments = i.attachments.map((attachment) => parseJsonField(attachment));
                }

                i.files = [];

                if (i.file && typeof i.file === 'object' && 'path' in i.file) {
                    i.files.push({
                        name: i.file.name,
                        path: i.file.path,
                        extension: i.file.path.replace(/.*\./, '').toLowerCase(),
                    });
                }

                if (i.attachments && Array.isArray(i.attachments)) {
                    for (const attachment of i.attachments) {
                        if (attachment && typeof attachment === 'object' && 'path' in attachment) {
                            i.files.push({
                                name: attachment.name,
                                path: attachment.path,
                                extension: attachment.path.replace(/.*\./, '').toLowerCase(),
                            });
                        }
                    }
                }

                const filesHTML = art(path.join(__dirname, 'templates/source.art'), { i });
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
        link: buildLink(isPosts, rootUrl, source, id, type),
        item: items,
    };
}
