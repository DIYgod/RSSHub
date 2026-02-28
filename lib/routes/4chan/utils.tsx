import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';
import sanitizeHtml from 'sanitize-html';

import { parseDate } from '@/utils/parse-date';
import { queryToBoolean } from '@/utils/readable-social';

const parseParams = (routeParams: string) => {
    const parsed = new URLSearchParams(routeParams);
    const viewOptions = {
        includeLastReplies: !!queryToBoolean(parsed.get('showLastReplies')),
        includeReplyCount: !!queryToBoolean(parsed.get('showReplyCount')),
        revealSpoilers: !!queryToBoolean(parsed.get('revealSpoilers')),
    };
    return viewOptions;
};

const processCatalog = ({ data, board, viewOptions }: { data: CatalogApiReturn; board: string; viewOptions: ViewOptions }) => {
    const transformedData = data.flatMap((page) => page.threads);
    return transformedData.map((thread) => ({
        author: `${thread.name} ${thread.trip ?? thread.no}`,
        description: renderToString(renderPost({ post: thread, board, viewOptions })),
        link: `https://boards.4chan.org/${board}/thread/${thread.no}`,
        pubDate: parseDate(thread.time * 1000),
        title: thread.sub ?? sanitizeHtml(thread.com?.split('<br>')[0] ?? '', { allowedTags: [] }),
    }));
};

const renderPost = ({ post, board, viewOptions }: { post: ChanPost; board: string; viewOptions: ViewOptions }) => {
    let media = <></>;
    switch (post.ext) {
        case '.jpg':
        case '.png':
        case '.gif':
            media = <img width={post.w} height={post.h} style="" src={`https://i.4cdn.org/${board}/${post.tim}${post.ext}`} />;
            break;
        case '.pdf':
            media = <embed src={`https://i.4cdn.org/${board}/${post.tim}${post.ext}`} width="100%" height="500px"></embed>;
            break;
        case '.swf':
            media = <embed src={`https://i.4cdn.org/${board}/${post.tim}${post.ext}`} type="application/x-shockwave-flash" width={post.w} height={post.h} />;
            break;
        case '.webm':
            media = <video src={`https://i.4cdn.org/${board}/${post.tim}${post.ext}`} loop controls class="full-image"></video>;
            break;
        default:
            break;
    }
    if (post.spoiler) {
        media = (
            <details open={viewOptions.revealSpoilers}>
                <summary>Spoiler</summary>
                {media}
            </details>
        );
    }
    media = (
        <>
            <br /> {media} <br />
        </>
    );
    const renderedPost = (
        <>
            {post.last_replies && viewOptions.includeReplyCount && (
                <>
                    <small>{post.replies} 💬</small>
                    <br />
                </>
            )}
            {raw(post.com ?? '')}
            {media}
            {viewOptions.includeLastReplies && post.last_replies?.map((n) => <div className="post reply">{renderPost({ post: n, board, viewOptions })}</div>)}
        </>
    );
    return renderedPost;
};

type CatalogApiReturn = Array<{ page: number; threads: ChanPost[] }>;
type ViewOptions = ReturnType<typeof parseParams>;

interface ChanPost {
    no: number;
    resto: number;
    sticky?: number;
    closed?: number;
    now: string;
    time: number;
    name: string;
    trip?: string;
    id?: string;
    capcode?: string;
    country?: string;
    country_name?: string;
    sub?: string;
    com?: string;
    tim?: number;
    filename: string;
    ext: '.jpg' | '.png' | '.gif' | '.pdf' | '.swf' | '.webm';
    fsize: number;
    md5: string;
    w?: number;
    h?: number;
    tn_w?: number;
    tn_h?: number;
    filedeleted?: 1;
    spoiler?: 1;
    custom_spoiler?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
    omitted_posts?: number;
    omitted_images?: number;
    replies?: number;
    images?: number;
    bumplimit?: 1;
    imagelimit?: 1;
    last_modified?: number;
    tag?: string;
    semantic_url?: string;
    since4pass?: number;
    unique_ips?: number;
    m_img?: 1;
    last_replies?: ChanPost[];
}

export type { CatalogApiReturn, ChanPost, ViewOptions };
export { parseParams, processCatalog, renderPost };
