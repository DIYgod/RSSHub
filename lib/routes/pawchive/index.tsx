import type { Context } from 'hono';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { apiBaseUrl, baseUrl, fileUrl, thumbnailUrl } from './const';
import type { PawchiveFile, PawchivePost } from './types';

export const route: Route = {
    path: '/:service/:id',
    categories: ['anime'],
    example: '/pawchive/fanbox/22445',
    parameters: {
        service: 'service, either `patreon` or `fanbox`',
        id: 'User id, can be found in URL',
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
            source: ['pawchive.st/'],
            target: '',
        },
        {
            source: ['pawchive.st/:service/user/:id'],
            target: '/:service/:id',
        },
    ],
    name: 'Posts',
    maintainers: ['TonyRL'],
    handler,
};

const processPostFiles = (post: PawchivePost) =>
    [post.file, ...post.attachments]
        .map((file) => {
            if (!file.path) {
                return null;
            }

            return {
                name: file.name,
                path: file.path,
            };
        })
        .filter(Boolean) as PawchiveFile[];

const render = (post: PawchivePost, files: PawchiveFile[]) =>
    renderToString(
        <>
            {files.length > 0 && <h2>Downloads / Files</h2>}
            {files.length > 0 && (
                <ul>
                    {files.map((file) => {
                        const extension = file.path.replace(/.*\./, '').toLowerCase();

                        let element;
                        if (['gif', 'jpg', 'jpeg', 'png', 'webp', 'jpeg', 'jfif'].includes(extension)) {
                            element = (
                                <a href={`${fileUrl}${file.path}?f=${file.name}`} target="_blank" rel="noopener noreferrer">
                                    <figure>
                                        <img src={`${thumbnailUrl}${file.path}`} alt={file.name} />
                                        <figcaption>{file.name}</figcaption>
                                    </figure>
                                </a>
                            );
                        } else if (['m4a', 'mp3', 'ogg'].includes(extension)) {
                            element = (
                                <audio controls preload="metadata">
                                    <source src={`${fileUrl}${file.path}`} type={`audio/${extension}`} />
                                </audio>
                            );
                        } else if (['mp4', 'webm'].includes(extension)) {
                            element = (
                                <>
                                    <video controls preload="metadata">
                                        <source src={`${fileUrl}${file.path}`} type={`video/${extension}`} />
                                    </video>
                                    <summary>{file.name}</summary>
                                </>
                            );
                        } else {
                            element = <a href={`${fileUrl}${file.path}`}>{file.name}</a>;
                        }

                        return <li style={{ listStyleType: 'none' }}>{element}</li>;
                    })}
                </ul>
            )}
            {post.content && <h2>Content</h2>}
            {post.content && raw(post.content)}
        </>
    );

async function handler(ctx: Context) {
    const { service, id } = ctx.req.param();

    const apiUrl = `${apiBaseUrl}/${service}/user/${id}`;
    const response = await ofetch(apiUrl);

    if (response.length === 0) {
        throw new Error('The user does not exist.');
    }

    const author = (await cache.tryGet(`pawchive:${service}:${id}`, async () => {
        const profileUrl = `${apiBaseUrl}/${service}/user/${id}/profile`;
        const data = await ofetch(profileUrl);
        return data.name || 'Unknown User';
    })) as Promise<string>;

    const items = response.map((post) => ({
        title: post.title || 'Untitled Post',
        description: render(post, processPostFiles(post)),
        author,
        pubDate: parseDate(post.published),
        link: `${baseUrl}/${post.service}/user/${post.user}/post/${post.id}`,
        guid: `pawchive:${post.service}:${post.user}:post:${post.id}`,
    }));

    return {
        title: `Posts of ${author} from ${service} | Pawchive`,
        link: `${baseUrl}/${service}/user/${id}`,
        image: `${baseUrl}/icons/${service}/${id}`,
        item: items,
    };
}
