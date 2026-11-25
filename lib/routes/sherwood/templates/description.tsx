import type { Child } from 'hono/jsx';
import { renderToString } from 'hono/jsx/dom/server';

import type { MediaFields, NewsletterEntry, NewsletterSection, PostEntry, RichTextMark, RichTextNode } from '../utils';
import { extractMediaImage, toSafeUrl } from '../utils';

type ChildNode = Child | null;

const applyMark = (content: ChildNode, mark: RichTextMark): ChildNode => {
    switch (mark.type) {
        case 'bold':
            return <strong>{content}</strong>;
        case 'italic':
            return <em>{content}</em>;
        case 'underline':
            return <u>{content}</u>;
        case 'code':
            return <code>{content}</code>;
        case 'strikethrough':
            return <s>{content}</s>;
        case 'subscript':
            return <sub>{content}</sub>;
        case 'superscript':
            return <sup>{content}</sup>;
        default:
            return content;
    }
};

const renderTextNode = (node: RichTextNode, key: string): ChildNode => {
    const text = node.value ?? '';
    if (!text) {
        return null;
    }
    let output: ChildNode = text;
    const marks = node.marks ?? [];
    for (const mark of marks) {
        output = applyMark(output, mark);
    }
    return <span key={key}>{output}</span>;
};

const renderInlineEntry = (node: RichTextNode, key: string): ChildNode => {
    const fields = node.data?.target?.fields;
    if (!fields) {
        return null;
    }
    const label = fields.title?.trim() || fields.name?.trim();
    const ticker = fields.shortCode?.trim();
    if (!label && !ticker) {
        return null;
    }
    if (label && ticker) {
        return (
            <span key={key}>
                {label} (<code>{ticker}</code>)
            </span>
        );
    }
    return <span key={key}>{label || ticker}</span>;
};

const renderMediaFigure = (media: { fields?: MediaFields } | undefined, key: string): ChildNode => {
    const img = extractMediaImage(media);
    if (!img) {
        return null;
    }
    return (
        <figure key={key}>
            <img src={img.src} alt={img.alt} />
            {img.caption && <figcaption>{img.caption}</figcaption>}
        </figure>
    );
};

const renderChildren = (nodes: RichTextNode[] | undefined, prefix: string): ChildNode[] => (nodes ?? []).map((child, index) => renderNode(child, `${prefix}-${index}`));

const isBlankParagraph = (node: RichTextNode): boolean => {
    const children = node.content ?? [];
    if (!children.length) {
        return true;
    }
    return children.every((child) => child.nodeType === 'text' && !(child.value ?? '').trim());
};

const renderHeading = (nodeType: string, children: ChildNode[], key: string): ChildNode => {
    switch (nodeType) {
        case 'heading-1':
            return <h1 key={key}>{children}</h1>;
        case 'heading-2':
            return <h2 key={key}>{children}</h2>;
        case 'heading-3':
            return <h3 key={key}>{children}</h3>;
        case 'heading-4':
            return <h4 key={key}>{children}</h4>;
        case 'heading-5':
            return <h5 key={key}>{children}</h5>;
        default:
            return <h6 key={key}>{children}</h6>;
    }
};

const renderHyperlink = (node: RichTextNode, key: string): ChildNode => {
    const href = toSafeUrl(node.data?.uri, true);
    const children = renderChildren(node.content, key);
    if (!href) {
        return <span key={key}>{children}</span>;
    }
    return (
        <a key={key} href={href}>
            {children}
        </a>
    );
};

const renderContainerNode = (node: RichTextNode, key: string): ChildNode => {
    const children = renderChildren(node.content, key);
    switch (node.nodeType) {
        case 'document':
            return <>{children}</>;
        case 'paragraph':
            return isBlankParagraph(node) ? null : <p key={key}>{children}</p>;
        case 'blockquote':
            return <blockquote key={key}>{children}</blockquote>;
        case 'unordered-list':
            return <ul key={key}>{children}</ul>;
        case 'ordered-list':
            return <ol key={key}>{children}</ol>;
        case 'list-item':
            return <li key={key}>{children}</li>;
        case 'table':
            return (
                <table key={key}>
                    <tbody>{children}</tbody>
                </table>
            );
        case 'table-row':
            return <tr key={key}>{children}</tr>;
        case 'table-header-cell':
            return <th key={key}>{children}</th>;
        case 'table-cell':
            return <td key={key}>{children}</td>;
        default:
            return children.length ? <div key={key}>{children}</div> : null;
    }
};

const renderNode = (node: RichTextNode | undefined, key: string): ChildNode => {
    if (!node?.nodeType) {
        return null;
    }
    if (node.nodeType === 'text') {
        return renderTextNode(node, key);
    }
    if (node.nodeType === 'hr') {
        return <hr key={key} />;
    }
    if (node.nodeType === 'hyperlink') {
        return renderHyperlink(node, key);
    }
    if (node.nodeType === 'embedded-entry-inline') {
        return renderInlineEntry(node, key);
    }
    if (node.nodeType === 'embedded-entry-block' || node.nodeType === 'embedded-asset-block') {
        return renderMediaFigure(node.data?.target, key);
    }
    if (node.nodeType.startsWith('heading-')) {
        return renderHeading(node.nodeType, renderChildren(node.content, key), key);
    }
    return renderContainerNode(node, key);
};

const EARNINGS_DAYS: ReadonlyArray<readonly [keyof Pick<NonNullable<NewsletterSection['fields']>, 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday'>, string]> = [
    ['monday', 'Monday'],
    ['tuesday', 'Tuesday'],
    ['wednesday', 'Wednesday'],
    ['thursday', 'Thursday'],
    ['friday', 'Friday'],
];

const renderEarningsSection = (section: NewsletterSection, key: string): ChildNode => {
    const fields = section.fields;
    if (!fields) {
        return null;
    }
    const rows = EARNINGS_DAYS.flatMap(([dayKey, label]) => {
        const doc = fields[dayKey];
        if (!doc) {
            return [];
        }
        return [
            <li key={`${key}-${dayKey}`}>
                <strong>{label}: </strong>
                {renderNode(doc, `${key}-${dayKey}`)}
            </li>,
        ];
    });
    if (!rows.length) {
        return null;
    }
    return (
        <section key={key}>
            <h2>{fields.title?.trim() || "This week's earnings"}</h2>
            <ul>{rows}</ul>
        </section>
    );
};

const renderSnackFactSection = (section: NewsletterSection, key: string): ChildNode => {
    const fields = section.fields;
    if (!fields?.fact) {
        return null;
    }
    const sourceUrl = toSafeUrl(fields.url);
    return (
        <blockquote key={key}>
            <p>
                <strong>Snack Fact</strong>
            </p>
            {renderNode(fields.fact, `${key}-fact`)}
            {sourceUrl && (
                <p>
                    <a href={sourceUrl}>Source</a>
                </p>
            )}
        </blockquote>
    );
};

const renderNewsletterSection = (section: NewsletterSection, index: number): ChildNode => {
    const key = section.sys?.id || `sec-${index}`;
    const type = section.sys?.contentType?.sys?.id;
    if (type === 'newsletterSnackFact') {
        return renderSnackFactSection(section, key);
    }
    if (type === 'newsletterThisWeeksEarnings') {
        return renderEarningsSection(section, key);
    }
    const fields = section.fields;
    if (!fields?.body) {
        return null;
    }
    return (
        <section key={key}>
            {fields.title?.trim() && <h2>{fields.title.trim()}</h2>}
            {renderNode(fields.body, `${key}-body`)}
        </section>
    );
};

export const renderNewsletterDescription = (entry: NewsletterEntry): string => {
    const fields = entry.fields;
    if (!fields) {
        return '';
    }
    return renderToString(
        <>
            {renderMediaFigure(fields.openingAssetMedia, 'opening-media')}
            {fields.openingWordsRichText && renderNode(fields.openingWordsRichText, 'opening-words')}
            {(fields.sections ?? []).map((section, index) => renderNewsletterSection(section, index))}
        </>
    );
};

export const renderPostDescription = (entry: PostEntry): string => {
    const fields = entry.fields;
    if (!fields) {
        return '';
    }
    const articleFields = fields.article?.fields;
    const heroMedia = articleFields?.image ?? articleFields?.assetMedia;
    const aboveTheFold = articleFields?.bodyContentAboveTheFold;
    const body = articleFields?.bodyContent ?? fields.bodyContent;
    const belowTheFold = articleFields?.bodyContentBelowTheFold;
    const hasBody = Boolean(aboveTheFold || body || belowTheFold);
    const dek = fields.dek?.trim();
    return renderToString(
        <>
            {renderMediaFigure(heroMedia, 'article-hero')}
            {aboveTheFold && renderNode(aboveTheFold, 'article-above')}
            {body && renderNode(body, 'article-body')}
            {belowTheFold && renderNode(belowTheFold, 'article-below')}
            {!hasBody && dek && <p>{dek}</p>}
        </>
    );
};
