import type { Cheerio } from 'cheerio';
import { load } from 'cheerio';
import type { AnyNode } from 'domhandler';

import type { DataItem } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

// Common roots for the two newspaper systems
export const AMUCSITE_ROOT = 'https://epaper.xmrb.com';
export const HXCB_ROOT = 'https://dzb.sunnews.cn';

// Paper id -> display name
export const paperNames: Record<string, string> = {
    xmrb: '厦门日报',
    xmwb: '厦门晚报',
    csjb: '城市捷报',
    syzk: '双语周刊',
    hxcb: '海西晨报',
};

// Resolve the latest issue URL for an amucsite paper (xmrb / xmwb)
export const fetchAmucsiteListUrl = (id: string): string => `${AMUCSITE_ROOT}/${id}/pc/col/index.html`;

// Resolve the latest issue node URL for hxcb by parsing the META REFRESH on the entry page
export const resolveHxcbNodeUrl = async (): Promise<string> => {
    const html = await ofetch(HXCB_ROOT, { responseType: 'text' });
    const match = html.match(/URL=([^"'\s>]+)/i);
    if (!match) {
        throw new Error('Failed to resolve latest hxcb issue URL: META REFRESH not found');
    }
    return new URL(match[1], HXCB_ROOT).href;
};

// Recursively remove HTML comment nodes (e.g. <!--enpproperty ...-->, <!--/enpcontent-->) from a DOM subtree.
// DOM-based removal is more robust than regex sanitization on serialized output and avoids
// CodeQL "Incomplete multi-character sanitization" warnings (orphan "<!--" could otherwise remain).
const removeCommentNodes = (node: AnyNode): void => {
    if (!('children' in node) || !node.children) {
        return;
    }
    const children = node.children as AnyNode[];
    for (let i = children.length - 1; i >= 0; i--) {
        const child = children[i];
        if (child.type === 'comment') {
            children.splice(i, 1);
        } else {
            removeCommentNodes(child);
        }
    }
};

// Strip metadata noise (founder-content/content wrappers, enpproperty comments, etc.) from a cloned cheerio fragment.
// Also resolves relative image URLs against baseUrl, drops the ".2" thumbnail suffix, and removes non-standard attributes.
const cleanArticleContent = ($content: Cheerio<AnyNode>, baseUrl: string): string => {
    $content.find('founder-content, content').contents().unwrap();
    $content.find('script, style, .art-title, .author, .subtitle, #paperdate, #layout, #copycontent, table[bgcolor]').remove();

    // Resolve relative image URLs to absolute and drop the ".2" thumbnail suffix for full-resolution JPEGs.
    // referrerpolicy is removed because RSSHub middleware handles it per AGENTS.md rule 40.
    $content
        .find('img')
        .attr('src', (_i, src) => (src ? new URL(src.replaceAll(/\.2$/g, ''), baseUrl).href : src))
        .removeAttr('_src referrerpolicy data-toggle data-original-title placement trigger html');

    // Drop HTML comments via DOM traversal before serialization (see removeCommentNodes).
    $content.each((_, node) => removeCommentNodes(node as AnyNode));
    return ($content.html() ?? '').trim();
};

// Fetch and parse a single amucsite article (xmrb / xmwb)
export const fetchAmucsiteArticle = async (link: string): Promise<DataItem> => {
    const html = await ofetch(link, { responseType: 'text' });
    const $ = load(html);

    const title = $('h2#Title').text();
    const author = $('div#Author').text().trim();
    const pubDateText = $('span#paperdate').text().trim();
    const pubDate = pubDateText ? timezone(parseDate(pubDateText, 'YYYY-MM-DD'), 8) : undefined;

    const description = cleanArticleContent($('div#ozoom').clone(), link);

    const item: DataItem = {
        title,
        description,
        link,
    };
    if (author) {
        item.author = author;
    }
    if (pubDate) {
        item.pubDate = pubDate;
    }
    return item;
};

// Fetch and parse a single hxcb article
export const fetchHxcbArticle = async (link: string): Promise<DataItem> => {
    const html = await ofetch(link, { responseType: 'text' });
    const $ = load(html);

    const title = $('td.title1').text().trim();
    const metaText = $('div.new-1_01_title03').text();
    const dateMatch = metaText.match(/(\d{4}年\d{2}月\d{2}日)/);
    const pubDate = dateMatch ? timezone(parseDate(dateMatch[1], 'YYYY年MM月DD日'), 8) : undefined;

    const description = cleanArticleContent($('div#content').clone(), link);

    const item: DataItem = {
        title,
        description,
        link,
    };
    if (pubDate) {
        item.pubDate = pubDate;
    }
    return item;
};
