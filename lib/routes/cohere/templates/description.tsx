import { load } from 'cheerio';
import { raw } from 'hono/html';
import type { Child } from 'hono/jsx';
import { renderToString } from 'hono/jsx/dom/server';

import { resolveSafeUrl, SITE_URL } from '../utils';

export interface SanitySpan {
    _type?: string;
    text?: string;
    body?: string;
    marks?: string[];
}

export interface SanityMarkDef {
    _key: string;
    _type: string;
    href?: string;
    anchorLink?: string;
}

interface SanityCta {
    label?: string;
    url?: string;
}

interface SanityFaqItem {
    question?: string;
    answer?: SanityBlock[];
}

export interface SanityBlock {
    _type: string;
    style?: string;
    listItem?: string;
    level?: number;
    children?: SanitySpan[];
    markDefs?: SanityMarkDef[];
    url?: string;
    alt?: string;
    caption?: string;
    portableCaption?: SanityBlock[];
    code?: string;
    language?: string;
    body?: string;
    html?: string;
    rows?: Array<{ cells?: string[] }>;
    portableQuoteBody?: SanityBlock[];
    portableAuthor?: SanityBlock[];
    posterUrl?: string;
    playbackId?: string;
    audioUrl?: string;
    primaryCta?: SanityCta;
    secondaryCta?: SanityCta;
    title?: string;
    items?: SanityFaqItem[];
}

type Node = Child;

interface ListNode {
    tag: 'ul' | 'ol';
    children: Array<ListItemNode | ListNode>;
}

interface ListItemNode {
    content: Node[];
    children: ListNode[];
}

const HEADING_MAP = {
    h1: 'h2',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
    h5: 'h2',
    h6: 'h3',
} as const;

const DECORATOR_MAP = {
    strong: 'strong',
    em: 'em',
    code: 'code',
    underline: 'u',
    sup: 'sup',
    sub: 'sub',
} as const;

const isHeadingStyle = (style: string): style is keyof typeof HEADING_MAP => Object.hasOwn(HEADING_MAP, style);

const isDecorator = (mark: string): mark is keyof typeof DECORATOR_MAP => Object.hasOwn(DECORATOR_MAP, mark);

const youtubeIdFromUrl = (raw: string): string | undefined => {
    try {
        const parsed = new URL(raw, SITE_URL);
        if (parsed.hostname === 'youtu.be') {
            const id = parsed.pathname.slice(1).split('/', 1)[0];
            return id && /^[\w-]{11}$/.test(id) ? id : undefined;
        }
        const { hostname } = parsed;
        if (hostname === 'youtube.com' || hostname.endsWith('.youtube.com') || hostname === 'youtube-nocookie.com' || hostname.endsWith('.youtube-nocookie.com')) {
            const paramId = parsed.searchParams.get('v');
            if (paramId && /^[\w-]{11}$/.test(paramId)) {
                return paramId;
            }
            const segments = parsed.pathname.split('/').filter(Boolean);
            const idx = segments.findIndex((seg) => ['embed', 'shorts', 'live'].includes(seg));
            const pathId = idx === -1 ? undefined : segments[idx + 1];
            return pathId && /^[\w-]{11}$/.test(pathId) ? pathId : undefined;
        }
    } catch {
        return undefined;
    }
    return undefined;
};

const withLineBreaks = (text: string) => text.split('\n').flatMap((line, index) => (index === 0 ? [line] : [<br />, line]));

const renderSpans = (children: SanitySpan[] = [], markDefs: SanityMarkDef[] = []) => {
    const defMap = new Map(markDefs.map((def) => [def._key, def]));
    const spans = children.filter((child) => child._type === 'span' || child._type === 'latex' || child.text !== undefined);
    const text = spans.map((span) => (span._type === 'latex' ? (span.body?.trim() ?? '') : (span.text ?? ''))).join('');
    const nodes = spans.map((span) => {
        if (span._type === 'latex') {
            const latex = span.body?.trim();
            return latex ? <code>{latex}</code> : '';
        }
        let node: Node = <>{withLineBreaks(span.text ?? '')}</>;
        const spanMarks = span.marks ?? [];
        for (const mark of spanMarks) {
            if (isDecorator(mark)) {
                const Tag = DECORATOR_MAP[mark];
                node = <Tag>{node}</Tag>;
                continue;
            }
            const def = defMap.get(mark);
            if (def?._type === 'link') {
                const href = resolveSafeUrl(def.href);
                if (href) {
                    node = <a href={href}>{node}</a>;
                }
            } else if (def?._type === 'anchor' && def.anchorLink) {
                node = <span id={def.anchorLink}>{node}</span>;
            }
        }
        return node;
    });
    return { nodes, isEmpty: !text.trim() };
};

const TableRow = ({ cells = [], header }: { cells?: string[]; header?: boolean }) => <tr>{cells.map((cell) => (header ? <th>{withLineBreaks(cell)}</th> : <td>{withLineBreaks(cell)}</td>))}</tr>;

const renderTableBlock = (rows: Array<{ cells?: string[] }> = []) => {
    const nonEmptyRows = rows.filter((row) => row.cells?.length);
    if (!nonEmptyRows.length) {
        return null;
    }

    if (nonEmptyRows.length === 1) {
        return (
            <table>
                <tbody>
                    <TableRow cells={nonEmptyRows[0].cells} />
                </tbody>
            </table>
        );
    }
    return (
        <table>
            <thead>
                <TableRow cells={nonEmptyRows[0].cells} header />
            </thead>
            <tbody>
                {nonEmptyRows.slice(1).map((row) => (
                    <TableRow cells={row.cells} />
                ))}
            </tbody>
        </table>
    );
};

const renderEmbedHtml = (rawHtml?: string) => {
    if (!rawHtml) {
        return null;
    }
    const $ = load(rawHtml, null, false);
    $('style, script').remove();
    const html = $.html().trim();
    return html ? raw(html) : null;
};

const renderSpecialBlock = (block: SanityBlock) => {
    switch (block._type) {
        case 'image': {
            const url = resolveSafeUrl(block.url);
            if (!url) {
                return null;
            }
            const caption = block.portableCaption?.length ? renderBlocks(block.portableCaption) : block.caption ? [<p>{block.caption}</p>] : [];
            return (
                <figure>
                    <img src={url} alt={block.alt ?? ''} />
                    {caption.length ? <figcaption>{caption}</figcaption> : null}
                </figure>
            );
        }
        case 'codeBlock':
            return block.code ? (
                <pre>
                    <code class={block.language ? `language-${block.language}` : undefined}>{block.code}</code>
                </pre>
            ) : null;
        case 'latex': {
            const latex = block.body?.trim();
            return latex ? (
                <pre>
                    <code class="language-latex">{latex}</code>
                </pre>
            ) : null;
        }
        case 'tableBlock':
            return renderTableBlock(block.rows);
        case 'embedHTML':
            return renderEmbedHtml(block.html);
        case 'quoteBlock': {
            const quote = renderBlocks(block.portableQuoteBody);
            if (!quote.length) {
                return null;
            }
            const author = renderBlocks(block.portableAuthor);
            return (
                <blockquote>
                    {quote}
                    {author.length ? <cite>{author}</cite> : null}
                </blockquote>
            );
        }
        case 'embeddedVideo': {
            const poster = resolveSafeUrl(block.posterUrl);
            if (block.playbackId) {
                return (
                    <video controls poster={poster}>
                        <source src={`https://stream.mux.com/${block.playbackId}.m3u8`} type="application/x-mpegURL" />
                    </video>
                );
            }
            return poster ? (
                <figure>
                    <img src={poster} alt="" />
                </figure>
            ) : null;
        }
        case 'audioEmbed': {
            const audioUrl = resolveSafeUrl(block.audioUrl);
            return audioUrl ? <audio controls src={audioUrl}></audio> : null;
        }
        case 'youtube': {
            const url = resolveSafeUrl(block.url);
            if (!url) {
                return null;
            }
            const id = youtubeIdFromUrl(url);
            return id ? (
                <iframe src={`https://www.youtube.com/embed/${id}`} allowfullscreen></iframe>
            ) : (
                <p>
                    <a href={url}>{url}</a>
                </p>
            );
        }
        case 'divider':
            return <hr />;
        case 'ctaButtons': {
            const ctas = [block.primaryCta, block.secondaryCta].flatMap((cta) => {
                const href = resolveSafeUrl(cta?.url);
                const label = cta?.label?.trim();
                return href && label ? [<a href={href}>{label}</a>] : [];
            });
            return ctas.length ? <p>{ctas.flatMap((cta, index) => (index === 0 ? [cta] : [' · ', cta]))}</p> : null;
        }
        case 'blogFaqSection': {
            const items = (block.items ?? []).flatMap((faq) => {
                const question = faq.question?.trim();
                const answer = renderBlocks(faq.answer);
                if (!question && !answer.length) {
                    return [];
                }
                return [
                    <>
                        {question ? <h3>{question}</h3> : null}
                        {answer}
                    </>,
                ];
            });
            if (!items.length) {
                return null;
            }
            const heading = block.title?.trim();
            return (
                <>
                    {heading ? <h2>{heading}</h2> : null}
                    {items}
                </>
            );
        }
        default:
            return null;
    }
};

const ListView = ({ list }: { list: ListNode }) => {
    const children = list.children.map((child) =>
        'tag' in child ? (
            <ListView list={child} />
        ) : (
            <li>
                {child.content}
                {child.children.map((sub) => (
                    <ListView list={sub} />
                ))}
            </li>
        )
    );
    return list.tag === 'ol' ? <ol>{children}</ol> : <ul>{children}</ul>;
};

function renderBlocks(blocks: SanityBlock[] = []): Node[] {
    const out: Node[] = [];
    const listStack: Array<{ list: ListNode; level: number }> = [];

    const closeListsTo = (targetLevel: number) => {
        while (listStack.length > 0 && listStack.at(-1)!.level > targetLevel) {
            listStack.pop();
        }
    };

    for (const block of blocks) {
        if (block._type === 'block' && block.listItem) {
            const tag = block.listItem === 'number' ? 'ol' : 'ul';
            const level = Math.max(block.level ?? 1, 1);
            const { nodes } = renderSpans(block.children, block.markDefs);

            closeListsTo(level);

            const currentTop = listStack.at(-1);
            if (currentTop && currentTop.level === level && currentTop.list.tag !== tag) {
                closeListsTo(level - 1);
            }

            while (listStack.length < level) {
                const list: ListNode = { tag, children: [] };
                const parent = listStack.at(-1)?.list;
                if (parent) {
                    const lastChild = parent.children.at(-1);
                    if (lastChild && !('tag' in lastChild)) {
                        lastChild.children.push(list);
                    } else {
                        parent.children.push(list);
                    }
                } else {
                    out.push(<ListView list={list} />);
                }
                listStack.push({ list, level: listStack.length + 1 });
            }

            listStack.at(-1)!.list.children.push({ content: nodes, children: [] });
            continue;
        }

        closeListsTo(0);

        if (block._type === 'block') {
            const { nodes, isEmpty } = renderSpans(block.children, block.markDefs);
            if (isEmpty) {
                continue;
            }
            const style = block.style ?? 'normal';
            const Tag = isHeadingStyle(style) ? HEADING_MAP[style] : 'p';
            out.push(<Tag>{nodes}</Tag>);
            continue;
        }

        const rendered = renderSpecialBlock(block);
        if (rendered) {
            out.push(rendered);
        }
    }

    return out;
}

type SanityDescriptionData = {
    hero?: { url: string; alt?: string | null };
    subtitle?: string;
    keyTakeaways?: SanityBlock[] | null;
    body: SanityBlock[];
};

export const renderSanityDescription = ({ hero, subtitle, keyTakeaways, body }: SanityDescriptionData) => {
    const takeaways = renderBlocks(keyTakeaways ?? []);
    const bodyNodes = renderBlocks(body);
    const html = renderToString(
        <>
            {hero ? (
                <figure>
                    <img src={hero.url} alt={hero.alt ?? ''} />
                </figure>
            ) : null}
            {subtitle ? (
                <p>
                    <em>{subtitle}</em>
                </p>
            ) : null}
            {takeaways.length ? (
                <>
                    <h2>Key takeaways</h2>
                    {takeaways}
                </>
            ) : null}
            {bodyNodes}
        </>
    );
    return { html, hasMainBody: bodyNodes.length > 0 };
};

type GhostDescriptionData = {
    feature?: { url: string; alt?: string | null; caption?: string };
    bodyHtml?: string;
    excerpt?: string;
};

export const renderGhostDescription = ({ feature, bodyHtml, excerpt }: GhostDescriptionData) =>
    renderToString(
        <>
            {feature ? (
                <figure>
                    <img src={feature.url} alt={feature.alt ?? ''} />
                    {feature.caption ? <figcaption>{feature.caption}</figcaption> : null}
                </figure>
            ) : null}
            {bodyHtml ? raw(bodyHtml) : excerpt ? <p>{excerpt}</p> : null}
        </>
    );
