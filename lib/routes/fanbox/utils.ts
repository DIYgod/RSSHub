import { config } from '@/config';
import type { DataItem } from '@/types';
import ofetch from '@/utils/ofetch';
import type { ArticlePost, FilePost, ImagePost, PostDetailResponse, PostItem, TextPost, VideoPost } from './types';
import { parseDate } from '@/utils/parse-date';
import cache from '@/utils/cache';
import { art } from '@/utils/render';
import path from 'node:path';
import { getCurrentPath } from '@/utils/helpers';

const __dirname = getCurrentPath(import.meta.url);

export function getHeaders() {
    const sessionid = config.fanbox.session;
    const cookie = sessionid ? `FANBOXSESSID=${sessionid}` : '';
    return {
        origin: 'https://fanbox.cc',
        cookie,
    };
}

function embedUrlMap(urlEmbed: ArticlePost['body']['urlEmbedMap'][string]) {
    switch (urlEmbed.type) {
        case 'html':
            return urlEmbed.html;
        case 'fanbox.post':
            return art(path.join(__dirname, 'templates/fanbox-post.art'), {
                postUrl: `https://${urlEmbed.postInfo.creatorId}.fanbox.cc/posts/${urlEmbed.postInfo.id}`,
                title: urlEmbed.postInfo.title,
                user: urlEmbed.postInfo.user,
                excerpt: urlEmbed.postInfo.excerpt,
            });
        default:
            return '';
    }
}

function passageConv(p) {
    const seg = [...p.text];
    if (p.styles) {
        p.styles.map((s) => {
            switch (s.type) {
                case 'bold':
                    seg[s.offset] = `<b>` + seg[s.offset];
                    seg[s.offset + s.length - 1] += `</b>`;
                    break;
                default:
            }
            return s;
        });
    }
    if (p.links) {
        p.links.map((l) => {
            seg[l.offset] = `<a href="${l.url}">` + seg[l.offset];
            seg[l.offset + l.length - 1] += `</a>`;
            return l;
        });
    }
    const ret = seg.join('');
    return ret;
}

function parseText(body: TextPost['body']) {
    return body.text || '';
}

function parseImage(body: ImagePost['body']) {
    let ret = body.text || '';
    for (const i of body.images) {
        ret += `<hr><img src="${i.originalUrl}">`;
    }
    return ret;
}

function parseFile(body: FilePost['body']) {
    let ret = body.text || '';
    for (const f of body.files) {
        ret += `<br><a href="${f.url}" download="${f.name}.${f.extension}">${f.name}.${f.extension}</a>`;
    }
    return ret;
}

async function parseVideo(body: VideoPost['body']) {
    let ret = '';
    switch (body.video.serviceProvider) {
        case 'soundcloud':
            ret += await getSoundCloudEmbedUrl(body.video.videoId);
            break;
        case 'youtube':
            ret += `<iframe src="https://www.youtube-nocookie.com/embed/${body.video.videoId}" frameborder="0"></iframe>`;
            break;
        case 'vimeo':
            ret += `<iframe src="https://player.vimeo.com/video/${body.video.videoId}" frameborder="0"></iframe>`;
            break;
        default:
    }
    ret += `<br>${body.text}`;
    return ret;
}

async function parseArtile(body: ArticlePost['body']) {
    let ret: Array<string> = [];
    for (let x = 0; x < body.blocks.length; ++x) {
        const b = body.blocks[x];
        ret.push('<p>');

        switch (b.type) {
            case 'p':
                ret.push(passageConv(b));
                break;
            case 'header':
                ret.push(`<h2>${b.text}</h2>`);
                break;
            case 'image': {
                const i = body.imageMap[b.imageId];
                ret.push(`<img src="${i.originalUrl}">`);
                break;
            }
            case 'file': {
                const file = body.fileMap[b.fileId];
                ret.push(`<a href="${file.url}" download="${file.name}.${file.extension}">${file.name}.${file.extension}</a>`);
                break;
            }
            case 'url_embed':
                ret.push(embedUrlMap(body.urlEmbedMap[b.urlEmbedId]));
                break;
            default:
        }
    }
    ret = await Promise.all(ret);
    return ret.join('');
}

async function parseDetail(i: PostDetailResponse['body']) {
    let ret = '';
    if (i.feeRequired !== 0) {
        ret += `Fee Required: <b>${i.feeRequired} JPY/month</b><hr>`;
    }
    if (i.coverImageUrl) {
        ret += `<img src="${i.coverImageUrl}"><hr>`;
    }

    if (!i.body) {
        ret += i.excerpt;
        return ret;
    }

    switch (i.type) {
        case 'text':
            ret += parseText(i.body);
            break;
        case 'file':
            ret += parseFile(i.body);
            break;
        case 'image':
            ret += parseImage(i.body);
            break;
        case 'video':
            ret += await parseVideo(i.body);
            break;
        case 'article':
            ret += await parseArtile(i.body);
            break;
        default:
            ret += '<b>Unsupported content (RSSHub)</b>';
    }
    return ret;
}

export function parseItem(item: PostItem) {
    return cache.tryGet(`fanbox-${item.id}-${item.updatedDatetime}`, async () => {
        const postDetail = (await ofetch(`https://api.fanbox.cc/post.info?postId=${item.id}`, { headers: getHeaders() })) as PostDetailResponse;
        return {
            title: item.title || `No title`,
            description: await parseDetail(postDetail.body),
            pubDate: parseDate(item.updatedDatetime),
            link: `https://${item.creatorId}.fanbox.cc/posts/${item.id}`,
            category: item.tags,
        };
    }) as Promise<DataItem>;
}

async function getSoundCloudEmbedUrl(videoId: string) {
    const videoUrl = `https://soundcloud.com/${videoId}`;
    const apiUrl = `https://soundcloud.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json&maxheight=400&format=json`;
    const resp = await ofetch(apiUrl);
    return resp.html;
}
