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
            return (node.content ?? []).map(renderNode).join('');
        case 'paragraph':
            return `<p>${(node.content ?? []).map(renderNode).join('')}</p>`;
        case 'text':
            return renderText(node);
        case 'hardBreak':
            return '<br>';
        case 'heading': {
            const level = Math.min(6, Math.max(1, Number(node.attrs?.level) || 3));
            return `<h${level}>${(node.content ?? []).map(renderNode).join('')}</h${level}>`;
        }
        case 'image': {
            const src = node.attrs?.src ? escapeHtml(String(node.attrs.src)) : '';
            const alt = node.attrs?.alt ? escapeHtml(String(node.attrs.alt)) : '';
            return src ? `<img src="${src}" alt="${alt}">` : '';
        }
        case 'bulletList':
            return `<ul>${(node.content ?? []).map(renderNode).join('')}</ul>`;
        case 'orderedList':
            return `<ol>${(node.content ?? []).map(renderNode).join('')}</ol>`;
        case 'listItem':
            return `<li>${(node.content ?? []).map(renderNode).join('')}</li>`;
        case 'horizontalRule':
            return '<hr>';
        default:
            return (node.content ?? []).map(renderNode).join('');
    }
};

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
