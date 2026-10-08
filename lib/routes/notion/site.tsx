import { renderToString } from 'hono/jsx/dom/server';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

interface PublicBlock {
    id: string;
    type: string;
    alive: boolean;
    content?: string[];
    properties?: { title?: Array<[string, unknown?]> };
    format?: { slug?: string };
    created_time?: number;
    last_edited_time?: number;
}

export const route: Route = {
    path: '/site/:domain',
    categories: ['blog'],
    example: '/notion/site/notion',
    parameters: {
        domain: 'Subdomain in <domain>.notion.site.',
    },
    name: 'Public site pages',
    maintainers: ['DIYgod'],
    description: 'Lists direct child pages and their public top-level text. No Notion token is required. Private pages and database collections are not included.',
    radar: [{ source: ['notion.notion.site'], target: '/site/notion' }],
    handler,
};

function getText(block: PublicBlock) {
    return block.properties?.title?.map(([text]) => text).join('') ?? '';
}

function unwrapBlocks(recordMap): Record<string, PublicBlock> {
    return Object.fromEntries(
        Object.entries(recordMap.block ?? {}).flatMap(([id, record]) => {
            const entry = record as { value?: PublicBlock | { value?: PublicBlock } };
            const value = entry.value;
            const block = value && ('id' in value ? value : value.value);
            return block?.alive ? [[id, block]] : [];
        })
    );
}

async function resolveBlocks(baseUrl: string, response) {
    const fanouts = await Promise.all(
        (response.fanoutData ?? []).map(async (fanout) => {
            const data = await ofetch(`${baseUrl}/api/v3/syncRecordValuesSpaceFanout`, { method: 'POST', headers: fanout.headers, body: fanout.request });
            return unwrapBlocks(data.recordMap);
        })
    );
    return Object.assign(unwrapBlocks(response.recordMap), ...fanouts);
}

async function fetchBlocks(baseUrl: string, ids: string[], spaceId: string) {
    const response = await ofetch(`${baseUrl}/api/v3/syncRecordValuesSpaceInitial`, {
        method: 'POST',
        body: { requests: ids.map((id) => ({ pointer: { table: 'block', id, spaceId }, version: -1 })), spacePointer: { table: 'space', id: spaceId } },
    });
    return resolveBlocks(baseUrl, response);
}

function renderBlock(block: PublicBlock) {
    const text = getText(block);
    switch (block.type) {
        case 'header':
            return <h2>{text}</h2>;
        case 'sub_header':
            return <h3>{text}</h3>;
        case 'sub_sub_header':
            return <h4>{text}</h4>;
        case 'code':
            return <pre>{text}</pre>;
        case 'quote':
            return <blockquote>{text}</blockquote>;
        case 'text':
        case 'bulleted_list':
        case 'numbered_list':
        case 'callout':
        case 'to_do':
            return <p>{text}</p>;
        default:
            return;
    }
}

async function handler(ctx) {
    const domain = ctx.req.param('domain');
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(domain)) {
        throw new InvalidParameterError('Use the public notion.site subdomain from its URL.');
    }
    const baseUrl = `https://${domain}.notion.site`;
    const link = `${baseUrl}/`;
    const publicPage = await ofetch(`${baseUrl}/api/v3/getPublicPageDataForDomain`, {
        method: 'POST',
        body: { type: 'block-space', name: 'page', slug: '', spaceDomain: domain, requestedOnPublicDomain: true },
    });
    if (publicPage.requireLogin || !publicPage.pageId || !publicPage.publicAccessRole) {
        throw new Error('This Notion page is not publicly readable. Publish the page and its child pages before subscribing.');
    }
    const { spaceId, pageId } = publicPage;
    const rootBlocks = await fetchBlocks(baseUrl, [pageId], spaceId);
    const root = rootBlocks[pageId] as PublicBlock | undefined;
    if (!root?.content) {
        throw new Error('Notion did not return the public page content.');
    }
    const children = await fetchBlocks(baseUrl, root.content, spaceId);
    const pages = root.content.map((id) => children[id]).filter((block) => block?.type === 'page');
    const limit = Number(ctx.req.query('limit')) || 20;
    const items = await pMap(
        pages.slice(0, limit),
        (child) =>
            cache.tryGet(`notion:public:${domain}:${child.id}:${child.last_edited_time}`, async () => {
                const blocks = child.content?.length ? await fetchBlocks(baseUrl, child.content.slice(0, 100), spaceId) : {};
                return {
                    title: getText(child),
                    link: `${baseUrl}/${child.format?.slug ?? child.id.replaceAll('-', '')}`,
                    pubDate: child.created_time ? parseDate(child.created_time) : undefined,
                    updated: child.last_edited_time ? parseDate(child.last_edited_time) : undefined,
                    description: renderToString(<>{child.content?.map((id) => blocks[id] && renderBlock(blocks[id]))}</>),
                };
            }),
        { concurrency: 3 }
    );
    return { title: `Notion - ${getText(root)}`, link, item: items };
}
