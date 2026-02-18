import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { KEMONO_API_URL, KEMONO_ROOT_URL, MIME_TYPE_MAP } from './const';
import type { DiscordMessage, KemonoFile, KemonoPost } from './types';

const headers = { Accept: 'text/css' };

export const route: Route = {
    path: '/:source?/:id?/:type?',
    categories: ['anime'],
    example: '/kemono',
    parameters: {
        source: 'Source, see below, Posts by default',
        id: 'User id, can be found in URL',
        type: 'Content type: announcements or fancards',
    },
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
            source: ['kemono.cr/'],
            target: '',
        },
        {
            source: ['kemono.cr/:source/user/:id'],
            target: '/:source/:id',
        },
        {
            source: ['kemono.cr/:source/user/:id/announcements'],
            target: '/:source/:id/announcements',
        },
        {
            source: ['kemono.cr/:source/user/:id/fancards'],
            target: '/:source/:id/fancards',
        },
        {
            source: ['kemono.cr/discord/server/:id'],
            target: '/discord/:id',
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
    if (typeof field !== 'string') {
        return field;
    }

    try {
        let parsedData = JSON.parse(field);
        if (typeof parsedData === 'string') {
            parsedData = JSON.parse(parsedData);
        }
        return parsedData;
    } catch {
        return field;
    }
}

function buildApiUrl(source: string, userId?: string, contentType?: string): string {
    if (source === 'posts') {
        return `${KEMONO_API_URL}/posts`;
    }

    if (source === 'discord' && userId) {
        return `${KEMONO_API_URL}/discord/channel/lookup/${userId}`;
    }

    if (!userId) {
        throw new Error('User ID is required for non-posts sources');
    }

    const basePath = `${KEMONO_API_URL}/${source}/user/${userId}`;
    return contentType ? `${basePath}/${contentType}` : `${basePath}/posts`;
}

function buildFrontendUrl(source: string, userId?: string, contentType?: string): string {
    if (source === 'posts') {
        return `${KEMONO_ROOT_URL}/posts`;
    }

    if (source === 'discord' && userId) {
        return `${KEMONO_ROOT_URL}/${source}/server/${userId}`;
    }

    if (!userId) {
        throw new Error('User ID is required for non-posts sources');
    }

    const basePath = `${KEMONO_ROOT_URL}/${source}/user/${userId}`;
    return contentType ? `${basePath}/${contentType}` : basePath;
}

async function fetchUserProfile(source: string, userId: string): Promise<string> {
    try {
        const profileUrl = `${KEMONO_API_URL}/${source}/user/${userId}/profile`;
        const response = await got({ method: 'get', url: profileUrl, headers });
        return response.data.name || 'Unknown User';
    } catch {
        return 'Unknown User';
    }
}

function processPostFiles(post: KemonoPost): KemonoFile[] {
    const files: KemonoFile[] = [];

    if (post.file) {
        const parsedFile = parseJsonField(post.file);
        if (parsedFile && typeof parsedFile === 'object' && 'path' in parsedFile) {
            files.push({
                name: parsedFile.name || 'Unnamed File',
                path: parsedFile.path,
                extension: extractFileExtension(parsedFile.path),
            });
        }
    }

    if (Array.isArray(post.attachments)) {
        for (const attachment of post.attachments) {
            const parsedAttachment = parseJsonField(attachment);
            if (parsedAttachment && typeof parsedAttachment === 'object' && 'path' in parsedAttachment) {
                files.push({
                    name: parsedAttachment.name || 'Unnamed Attachment',
                    path: parsedAttachment.path,
                    extension: extractFileExtension(parsedAttachment.path),
                });
            }
        }
    }

    return files;
}

function extractFileExtension(filePath: string): string {
    return filePath.replace(/.*\./, '').toLowerCase();
}

function generateEnclosureInfo(htmlContent: string): { enclosure_url?: string; enclosure_type?: string } {
    const $ = load(htmlContent);
    let enclosureInfo = {};

    $('audio source, video source').each(function () {
        const src = $(this).attr('src');
        if (!src) {
            return;
        }

        const extension = extractFileExtension(src);
        const mimeType = MIME_TYPE_MAP[extension as keyof typeof MIME_TYPE_MAP];

        if (mimeType) {
            enclosureInfo = {
                enclosure_url: new URL(src, KEMONO_ROOT_URL).toString(),
                enclosure_type: mimeType,
            };
            return false;
        }
    });

    return enclosureInfo;
}

const renderDiscordMessage = (message: DiscordMessage) =>
    renderToString(
        <>
            {message.content ? <p>{message.content}</p> : null}
            {message.attachments?.map((attachment) => (
                <img src={`https://img.kemono.cr/thumbnail/data${attachment.path}`} />
            ))}
            {message.embeds?.map((embed) => {
                if (embed.type === 'image') {
                    return <img src={embed.thumbnail.proxy_url} />;
                }
                if (embed.type === 'link') {
                    return (
                        <>
                            {embed.thumbnail ? (
                                <a href={embed.thumbnail.url}>
                                    <img src={embed.thumbnail.proxy_url} />
                                </a>
                            ) : null}
                            <a href={embed.url}>{embed.title}</a>
                            {embed.description ? <p>{embed.description}</p> : null}
                        </>
                    );
                }
                return null;
            })}
        </>
    );

const renderPostFiles = (post: KemonoPost & { files?: KemonoFile[] }) =>
    renderToString(
        <>
            {post.files?.map((file) => {
                const extension = file.extension;
                const typeSuffix = file.extention ?? '';

                if (['jpg', 'png', 'webp', 'jpeg', 'jfif'].includes(extension)) {
                    return <img src={file.path} />;
                }
                if (['m4a', 'mp3', 'ogg'].includes(extension)) {
                    return (
                        <audio controls>
                            <source src={file.path} type={`audio/${typeSuffix}`} />
                        </audio>
                    );
                }
                if (['mp4', 'webm'].includes(extension)) {
                    return (
                        <video controls>
                            <source src={file.path} type={`video/${typeSuffix}`} />
                        </video>
                    );
                }
                return <a href={file.path}>{file.name}</a>;
            })}
            {post.embed ? (
                post.embed.type === 'image' ? (
                    <img src={post.embed.thumbnail.proxy_url} />
                ) : post.embed.type === 'link' ? (
                    <>
                        {post.embed.thumbnail ? (
                            <a href={post.embed.thumbnail.url}>
                                <img src={post.embed.thumbnail.proxy_url} />
                            </a>
                        ) : null}
                        <a href={post.embed.url}>{post.embed.title}</a>
                        {post.embed.description ? <p>{post.embed.description}</p> : null}
                    </>
                ) : null
            ) : null}
        </>
    );

async function processDiscordMessages(channels: any[], limit: number) {
    const items = await Promise.all(
        channels.map((channel) =>
            cache.tryGet(`discord_${channel.id}`, async () => {
                const channelResponse = await got({
                    method: 'get',
                    url: `${KEMONO_ROOT_URL}/api/v1/discord/channel/${channel.id}?o=0`,
                    headers,
                });

                return channelResponse.data
                    .filter((message: DiscordMessage) => message.content || message.attachments)
                    .toSorted((a, b) => b.id.localeCompare(a.id))
                    .slice(0, limit)
                    .map((message: DiscordMessage) => ({
                        title: message.content || 'Discord Message',
                        description: renderDiscordMessage(message),
                        author: `${message.author.username}#${message.author.discriminator}`,
                        pubDate: parseDate(message.published),
                        category: channel.name,
                        guid: `kemono:discord:${message.server}:${message.channel}:${message.id}`,
                        link: `https://discord.com/channels/${message.server}/${message.channel}/${message.id}`,
                    }));
            })
        )
    );

    return items.flat();
}

function processAnnouncements(announcements: any[], authorName: string, source: string, userId: string, limit: number) {
    return announcements.slice(0, limit).map((announcement) => {
        const rawDate = announcement.published || announcement.added;
        const displayDate = parseDate(rawDate);

        return {
            title: `Announcement from ${displayDate.toDateString()}`,
            description: `<div>${announcement.content || ''}</div>`,
            author: authorName,
            pubDate: displayDate,
            guid: `kemono:${source}:${userId}:announcement:${announcement.hash}`,
            link: `${KEMONO_ROOT_URL}/${source}/user/${userId}/announcements`,
        };
    });
}

function processFancards(fancards: any[], authorName: string, source: string, userId: string, limit: number) {
    return fancards.slice(0, limit).map((fancard) => {
        const imageUrl = `${fancard.server}${fancard.path}`;

        return {
            title: `Fancard ${fancard.id}`,
            description: `<img src="${imageUrl}" alt="Fancard ${fancard.id}" />`,
            author: authorName,
            pubDate: parseDate(fancard.added),
            guid: `kemono:${source}:${userId}:fancard:${fancard.id}`,
            link: imageUrl,
            enclosure_url: imageUrl,
            enclosure_type: fancard.mime,
        };
    });
}

function processPosts(posts: KemonoPost[], authorName: string, limit: number) {
    return posts
        .filter((post) => post.content || post.attachments)
        .slice(0, limit)
        .map((post) => {
            const files = processPostFiles(post);
            const postWithFiles = { ...post, files };

            const filesHtml = renderPostFiles(postWithFiles);
            let description = post.content ? `<div>${post.content}</div>` : '';

            const $ = load(description);
            const kemonoFileElements = load(filesHtml)('img, a, audio, video')
                .toArray()
                .map((el) => $(el).prop('outerHTML')!);

            let replacementCount = 0;
            const fanboxRegex = /downloads\.fanbox\.cc/;
            $('a').each(function () {
                const link = $(this).attr('href');
                if (link && fanboxRegex.test(link)) {
                    $(this).replaceWith(kemonoFileElements[replacementCount] || '');
                    replacementCount++;
                }
            });

            description = (kemonoFileElements[0] || '') + $.html();
            for (const fileElement of kemonoFileElements.slice(replacementCount + 1)) {
                description += fileElement;
            }

            return {
                title: post.title || 'Untitled Post',
                description,
                author: authorName,
                pubDate: parseDate(post.published),
                guid: `kemono:${post.service}:${post.user}:post:${post.id}`,
                link: `${KEMONO_ROOT_URL}/${post.service}/user/${post.user}/post/${post.id}`,
                ...generateEnclosureInfo(description),
            };
        });
}

async function handler(ctx) {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 25;
    const source = ctx.req.param('source') || 'posts';
    const userId = ctx.req.param('id');
    const contentType = ctx.req.param('type');

    const isPostsMode = source === 'posts';
    const isDiscordMode = source === 'discord';

    try {
        const apiUrl = buildApiUrl(source, userId, contentType);
        const frontendUrl = buildFrontendUrl(source, userId, contentType);

        const response = await got({ method: 'get', url: apiUrl, headers });

        const authorName = isPostsMode || isDiscordMode || !userId ? '' : await fetchUserProfile(source, userId);

        const iconUrl = isPostsMode || isDiscordMode ? `${KEMONO_ROOT_URL}/favicon.ico` : `https://img.kemono.cr/icons/${source}/${userId}`;

        let items: any[];
        let title: string;

        if (isDiscordMode) {
            title = `Posts of ${userId} from Discord | Kemono`;
            items = await processDiscordMessages(response.data, limit);
        } else if (contentType === 'announcements') {
            title = `Announcements of ${authorName} from ${source} | Kemono`;
            items = processAnnouncements(response.data, authorName, source, userId, limit);
        } else if (contentType === 'fancards') {
            title = `Fancards of ${authorName} from ${source} | Kemono`;
            items = processFancards(response.data, authorName, source, userId, limit);
        } else {
            title = isPostsMode ? 'Kemono Posts' : `Posts of ${authorName} from ${source} | Kemono`;
            const posts = isPostsMode ? response.data.posts : response.data;
            items = processPosts(posts, authorName, limit);
        }

        return {
            title,
            image: iconUrl,
            link: frontendUrl,
            item: items,
        };
    } catch (error) {
        throw new Error(`Failed to fetch data from Kemono: ${error instanceof Error ? error.message : 'Unknown error'}`, { cause: error });
    }
}
