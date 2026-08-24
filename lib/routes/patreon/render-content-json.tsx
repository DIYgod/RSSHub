import { renderToString } from 'hono/jsx/dom/server';
import type { JSX } from 'hono/jsx/jsx-runtime';

interface NodeAttrs {
    href?: string;
    level?: number;
    src?: string;
    alt?: string | null;
}

interface ContentNode {
    type: string;
    attrs?: NodeAttrs;
    content?: ContentNode[];
    text?: string;
    marks?: Array<{ type: string; attrs?: NodeAttrs }>;
}

const headingTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const;

const blockTags = { paragraph: 'p', bulletList: 'ul', orderedList: 'ol', listItem: 'li' } as const;

const TextNode = ({ node }: { node: ContentNode }) => {
    let content: JSX.Element | string = node.text ?? '';
    const marks = node.marks ?? [];
    for (const mark of marks) {
        if (mark.type === 'bold') {
            content = <strong>{content}</strong>;
        } else if (mark.type === 'link' && mark.attrs?.href) {
            content = <a href={mark.attrs.href}>{content}</a>;
        }
    }
    return <>{content}</>;
};

const Content = ({ node }: { node: ContentNode }) => {
    switch (node.type) {
        case 'text':
            return <TextNode node={node} />;
        case 'hardBreak':
            return <br />;
        case 'horizontalRule':
            return <hr />;
        case 'image':
            return node.attrs?.src ? <img src={node.attrs.src} alt={node.attrs.alt ?? ''} /> : null;
        case 'heading':
        case 'paragraph':
        case 'bulletList':
        case 'orderedList':
        case 'listItem': {
            const Tag = node.type === 'heading' ? headingTags[Math.min(6, Math.max(1, node.attrs?.level ?? 3)) - 1] : blockTags[node.type];
            return (
                <Tag>
                    {node.content?.map((child, index) => (
                        <Content key={index} node={child} />
                    ))}
                </Tag>
            );
        }
        default:
            return (
                <>
                    {node.content?.map((child, index) => (
                        <Content key={index} node={child} />
                    ))}
                </>
            );
    }
};

export const renderContentJson = (jsonString?: string | null): string => {
    if (!jsonString) {
        return '';
    }
    const doc: ContentNode = JSON.parse(jsonString);
    return renderToString(<Content node={doc} />);
};
