interface ContentNode {
    type: string;
    attrs?: Record<string, unknown>;
    content?: ContentNode[];
    text?: string;
    marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
}

const escapeHtml = (text: string) => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

const renderText = (node: ContentNode): string => {
    let html = escapeHtml(node.text ?? '');
    for (const mark of node.marks ?? []) {
        if (mark.type === 'bold') {
            html = `<strong>${html}</strong>`;
        } else if (mark.type === 'link' && mark.attrs?.href) {
            const href = escapeHtml(String(mark.attrs.href));
            html = `<a href="${href}">${html}</a>`;
        }
    }
    return html;
};

const renderNode = (node: ContentNode): string => {
    switch (node.type) {
        case 'doc':
            return renderChildren(node.content);
        case 'paragraph':
            return `<p>${renderChildren(node.content)}</p>`;
        case 'text':
            return renderText(node);
        case 'hardBreak':
            return '<br>';
        case 'heading': {
            const level = Math.min(6, Math.max(1, Number(node.attrs?.level) || 3));
            return `<h${level}>${renderChildren(node.content)}</h${level}>`;
        }
        case 'image': {
            const src = node.attrs?.src ? escapeHtml(String(node.attrs.src)) : '';
            const alt = node.attrs?.alt ? escapeHtml(String(node.attrs.alt)) : '';
            return src ? `<img src="${src}" alt="${alt}">` : '';
        }
        case 'bulletList':
            return `<ul>${renderChildren(node.content)}</ul>`;
        case 'orderedList':
            return `<ol>${renderChildren(node.content)}</ol>`;
        case 'listItem':
            return `<li>${renderChildren(node.content)}</li>`;
        case 'horizontalRule':
            return '<hr>';
        default:
            return renderChildren(node.content);
    }
};

const renderChildren = (nodes?: ContentNode[]) => (nodes ?? []).map((child) => renderNode(child)).join('');

export const renderContentJson = (jsonString?: string | null): string => {
    if (!jsonString) {
        return '';
    }
    try {
        const doc = JSON.parse(jsonString) as ContentNode;
        return renderNode(doc);
    } catch {
        return '';
    }
};
