import { renderToString } from 'hono/jsx/dom/server';

type ContentNode = {
    nodeType?: string;
    content?: Array<{ value?: string }>;
};

export const renderDirectDescription = (publicId?: string, content?: ContentNode[]) =>
    renderToString(
        <>
            {publicId ? <img src={`https://assets.nintendo.com/image/upload/${publicId}`} /> : null}
            {content?.length ? content.map((node, index) => (node.nodeType === 'paragraph' ? <p key={`${node.nodeType}-${index}`}>{(node.content ?? []).map((part) => part.value).join('')}</p> : null)) : null}
        </>
    );
