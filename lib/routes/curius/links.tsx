import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/links/:name',
    categories: ['social-media'],
    example: '/curius/links/yuu-yuu',
    parameters: { name: 'Username, can be found in URL' },
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
            source: ['curius.app/:name'],
        },
    ],
    name: 'User',
    maintainers: ['Ovler-Young'],
    handler,
};

async function handler(ctx) {
    const username = ctx.req.param('name');

    const name_response = await got(`https://curius.app/api/users/${username}`, {
        headers: {
            Referer: `https://curius.app/${username}`,
        },
    });

    const data = name_response.data;

    const uid = data.user.id;
    const name = `${data.user.firstName} ${data.user.lastName}`;

    const response = await got(`https://curius.app/api/users/${uid}/links?page=0`, {
        headers: {
            Referer: `https://curius.app/${username}`,
        },
    });

    const items = response.data.userSaved.map((item) => ({
        title: item.title,
        description: renderDescription(item),
        link: item.link,
        pubDate: parseDate(item.createdDate),
        guid: `curius:${username}:${item.id}`,
    }));

    return {
        title: `${name} - Curius`,
        link: `https://curius.app/${username}`,
        description: `${name} - Curius`,
        allowEmpty: true,
        item: items,
    };
}

const renderDescription = (item): string => {
    const fullText = item.metadata?.full_text ? item.metadata.full_text.replaceAll('\n', '<br>') : '';
    const firstComment = item.comments?.length ? item.comments[0].text.slice(0, 100) : '';

    return renderToString(
        <>
            {fullText ? (
                <>
                    原文：{raw(fullText)}
                    <br />
                    <br />
                </>
            ) : null}
            {firstComment ? (
                <>
                    评论：{firstComment}
                    <br />
                    <br />
                </>
            ) : null}
            {item.highlights?.length ? (
                <>
                    评论：
                    {item.highlights.map((highlight, index) =>
                        highlight.comment ? (
                            <span key={`${highlight.highlight}-${index}`}>
                                {highlight.highlight}
                                <br />
                                评论：{highlight.comment.text}
                                <br />
                            </span>
                        ) : (
                            <span key={`${highlight.highlight}-${index}`}>
                                <br />
                                标注：{highlight.highlight}
                                <br />
                            </span>
                        )
                    )}
                </>
            ) : null}
        </>
    );
};
