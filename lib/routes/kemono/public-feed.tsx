import { renderToString } from 'hono/jsx/dom/server';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const periods = { '1d': 'day', '1w': 'week', '1m': 'month' };

export const periodOptions = Object.keys(periods).map((value) => ({ value, label: value }));

function renderFiles(post, assetsUrl: string) {
    const files = [post.file, ...(post.attachments ?? [])].filter((file) => file?.path);
    return files.map((file) => {
        const link = new URL(file.path, assetsUrl).href;
        const extension = file.path.split('.').pop().toLowerCase();
        if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(extension)) {
            return <img src={link} alt="" />;
        }
        if (['mp4', 'webm'].includes(extension)) {
            return (
                <video controls>
                    <source src={link} type={`video/${extension}`} />
                </video>
            );
        }
        if (extension === 'mp3' || extension === 'm4a') {
            return (
                <audio controls>
                    <source src={link} type={extension === 'mp3' ? 'audio/mpeg' : 'audio/mp4'} />
                </audio>
            );
        }
        return (
            <p>
                <a href={link}>{file.name ?? 'Attachment'}</a>
            </p>
        );
    });
}

export function createPublicHandler(rootUrl: string, assetsUrl: string, name: string, mode: 'popular' | 'search' | 'dms') {
    return async (ctx) => {
        const query = ctx.req.param('query');
        const period = ctx.req.param('period') ?? '1d';
        const source = ctx.req.param('source');
        const id = ctx.req.param('id');
        if (mode === 'popular' && !Object.hasOwn(periods, period)) {
            throw new InvalidParameterError('Popular periods must be 1d, 1w, or 1m.');
        }
        if (mode === 'dms' && (!/^[a-z]+$/.test(source) || !/^[\w.-]+$/.test(id))) {
            throw new InvalidParameterError('Use the source and creator ID from the website URL.');
        }
        const pathname = mode === 'popular' ? '/posts/popular' : mode === 'search' ? '/posts' : `/${source}/user/${id}/dms`;
        const params = new URLSearchParams(mode === 'popular' ? { period: periods[period] } : mode === 'search' ? { q: query } : {});
        const search = params.size ? `?${params}` : '';
        const link = `${rootUrl}${pathname}${search}`;
        const response = await ofetch(`${rootUrl}/api/v1${pathname}${search}`, { headers: { Accept: 'text/css' }, responseType: 'json' });
        const posts = mode === 'dms' ? response : response.posts;
        return {
            title: `${name} - ${mode === 'popular' ? `Popular posts (${period})` : mode === 'search' ? `Search: ${query}` : `${source}/${id} direct messages`}`,
            link,
            item: posts.slice(0, Number(ctx.req.query('limit')) || 25).map((post) => {
                const content = post.content ?? post.substring ?? '';
                const postLink = mode === 'dms' ? `${rootUrl}/${post.service}/user/${post.user}/dms#${post.hash}` : `${rootUrl}/${post.service}/user/${post.user}/post/${post.id}`;
                return {
                    title: post.title || (mode === 'dms' ? content : 'Untitled Post'),
                    link: postLink,
                    guid: `${name}:${post.service}:${post.user}:${mode === 'dms' ? `dm:${post.hash}` : `post:${post.id}`}`,
                    author: post.artist?.name,
                    pubDate: post.published ? parseDate(post.published) : undefined,
                    description: renderToString(
                        <>
                            <div dangerouslySetInnerHTML={{ __html: content }} />
                            {renderFiles(post, assetsUrl)}
                        </>
                    ),
                };
            }),
        };
    };
}
