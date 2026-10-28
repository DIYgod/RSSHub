import { html, raw } from 'hono/html';

import type { DataItem } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

interface ContentNode {
    type?: string;
    text?: string;
    children?: ContentNode[];
    data?: string[];
    src?: string;
    poster?: string;
    alt?: string;
    bold?: boolean;
    italic?: boolean;
}

interface ContentDetail {
    editor_type: number;
    content: string;
    content_json: string | ContentNode[];
    content_cdn?: string;
    user?: { username?: string };
    updated_at?: number;
}

export const headers = { 'game-alias': 'www', 'device-num': '1' };

const mediaUrl = (url: string) => new URL(url, 'https://www.gamekee.com').href;

function renderNodes(nodes: ContentNode[]): string {
    return nodes.map((node) => renderNode(node)).join('');
}

function renderNode(node: ContentNode): string {
    if (node.type === 'image-album') {
        return (node.data ?? []).map((src) => html`<img src="${mediaUrl(src)}" />`.toString()).join('');
    }
    if (node.type === 'image' && node.src) {
        return html`<img src="${mediaUrl(node.src)}" alt="${node.alt ?? ''}" />`.toString();
    }
    if (node.type === 'video' && node.src) {
        return html`<video controls src="${mediaUrl(node.src)}" ${node.poster ? html`poster="${mediaUrl(node.poster)}"` : ''}></video>`.toString();
    }
    const content = raw(node.children ? renderNodes(node.children) : html`${node.text ?? ''}`.toString());
    if (node.type === 'paragraph') {
        return html`<p>${content}</p>`.toString();
    }
    if (node.type === 'highlight-block') {
        return html`<blockquote>${content}</blockquote>`.toString();
    }
    const boldContent = node.bold ? html`<strong>${content}</strong>` : content;
    return (node.italic ? html`<em>${boldContent}</em>` : boldContent).toString();
}

export async function getDetail(id: number): Promise<Pick<DataItem, 'description' | 'author' | 'updated'>> {
    const url = `https://www.gamekee.com/v1/content/detail/${id}`;
    const response = await ofetch<{ code: number; msg?: string; data: ContentDetail }>(url, { headers });
    if (response.code !== 0) {
        throw new Error(`GameKee article ${id} is unavailable: ${response.msg ?? response.code}. Check ${url}`);
    }
    const detail = response.data;
    const content = detail.content_cdn ? (await ofetch<{ content: string | ContentNode[] }>(detail.content_cdn)).content : detail.editor_type === 0 ? detail.content : detail.content_json;
    const description = detail.editor_type === 0 ? String(content ?? '') : renderNodes(typeof content === 'string' ? JSON.parse(content) : (content ?? []));
    return {
        description,
        author: detail.user?.username,
        updated: detail.updated_at ? parseDate(detail.updated_at, 'X') : undefined,
    };
}
