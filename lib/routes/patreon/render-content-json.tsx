import { renderToString } from 'hono/jsx/dom/server';

interface ContentNode {
    type: string;
    attrs?: Record<string, unknown>;
    content?: ContentNode[];
    text?: string;
    marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
}

const TextNode = ({ node }: { node: ContentNode }) => {
    let content: JSX.Element | string = node.text ?? '';
    for (const mark of node.marks ?? []) {
        if (mark.type === 'bold') {
            content = <strong>{content}</strong>;
        } else if (mark.type === 'link' && mark.attrs?.href) {
            content = <a href={String(mark.attrs.href)}>{content}</a>;
        }
    }
    return <>{content}</>;
};

const ContentNode = ({ node }: { node: ContentNode }) => {
    switch (node.type) {
        case 'doc':
            return (
                <>
                    {node.content?.map((child, index) => (
                        <ContentNode key={index} node={child} />
                    ))}
                </>
            );
        case 'paragraph':
            return (
                <p>
                    {node.content?.map((child, index) => (
                        <ContentNode key={index} node={child} />
                    ))}
                </p>
            );
        case 'text':
            return <TextNode node={node} />;
        case 'hardBreak':
            return <br />;
        case 'heading': {
            const level = Math.min(6, Math.max(1, Number(node.attrs?.level) || 3));
            const Tag = `h${level}` as keyof JSX.IntrinsicElements;
            return (
                <Tag>
                    {node.content?.map((child, index) => (
                        <ContentNode key={index} node={child} />
                    ))}
                </Tag>
            );
        }
        case 'image':
            return node.attrs?.src ? <img src={String(node.attrs.src)} alt={String(node.attrs.alt ?? '')} /> : null;
        case 'bulletList':
            return (
                <ul>
                    {node.content?.map((child, index) => (
                        <ContentNode key={index} node={child} />
                    ))}
                </ul>
            );
        case 'orderedList':
            return (
                <ol>
                    {node.content?.map((child, index) => (
                        <ContentNode key={index} node={child} />
                    ))}
                </ol>
            );
        case 'listItem':
            return (
                <li>
                    {node.content?.map((child, index) => (
                        <ContentNode key={index} node={child} />
                    ))}
                </li>
            );
        case 'horizontalRule':
            return <hr />;
        default:
            return (
                <>
                    {node.content?.map((child, index) => (
                        <ContentNode key={index} node={child} />
                    ))}
                </>
            );
    }
};

export const renderContentJson = (jsonString?: string | null): string => {
    if (!jsonString) {
        return '';
    }
    const doc = JSON.parse(jsonString) as ContentNode;
    return renderToString(<ContentNode node={doc} />);
};
