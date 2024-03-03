// @ts-nocheck
const text_tag = {
    LINE_BREAK: 0,
    INLINE_CODE: 1,
    LEGACY_PUBLISHING_EMPHASIS: 2,
    LIST_ITEM: 3,
    LIST: 4,
    STRIKETHROUGH: 5,
    SUBSCRIPT: 6,
    SUPERSCRIPT: 7,
    UNDERLINE: 8,
    BOLD: 9,
    ITALIC: 10,
    PARAGRAPH: 11,
};

class TreeNode {
    constructor(attr) {
        this.attr = attr;
        this.start = attr.start;
        this.end = attr.start + attr.length;
        this.children = [];
    }
}
class Ucs2Text {
    constructor(text) {
        if (Array.isArray(text)) {
            this.string = null;
            this.codePoints = text;
        } else {
            this.string = text;
            const k = text.length;
            const d = [];

            let l,
                e,
                m = 0;
            while (m < k) {
                l = text.charCodeAt(m++);
                if (l >= 55296 && l <= 56319 && m < k) {
                    e = text.charCodeAt(m++);
                    if (56320 === (64512 & e)) {
                        d.push(((1023 & l) << 10) + (1023 & e) + 65536);
                    } else {
                        d.push(l);
                        m--;
                    }
                } else {
                    d.push(l);
                }
            }

            this.codePoints = d;
        }
        this.length = this.codePoints.length;
    }
    substring(start, end) {
        let _len = this.length,
            _start = start,
            _end = end;
        if (_end === 0) {
            return new Ucs2Text('');
        }
        if (((isNaN(_start) || 0 > _start) && (_start = 0), (isNaN(_end) || 0 > _end) && (_end = _len), _start > _len && (_start = _len), _end > _len && (_end = _len), _end < _start)) {
            _len = [_start, _end];
            _end = _len[0];
            _start = _len[1];
        }
        return new Ucs2Text(_start === _end ? '' : this.codePoints.slice(_start, _end));
    }
    slice(a, b) {
        return this.substring(a, b).toString();
    }
    toString() {
        return null === this.string
            ? this.codePoints
                  .map((a) => {
                      let b = '';
                      return 65535 < a && ((b += String.fromCharCode((((a -= 65536) >>> 10) & 1023) | 55296)), (a = 1023 & (56320 | a))), b + String.fromCharCode(a);
                  })
                  .join('')
            : this.string;
    }
}

const renderSingle = (node) => {
    const style = node?.attr?.detailData?.style;
    switch (style) {
        case 'BOLD':
            return `<b>${node.text}</b>`;
        case 'LINE_BREAK':
            return `<br>`;
        case 'LIST_ITEM':
            return `<li>${node.text}</li>`;
        case 'LIST':
            return `<ul>${node.text}</ul>`;
        case 'INLINE_CODE':
            return `<code>${node.text}</code>`;
        case 'LEGACY_PUBLISHING_EMPHASIS':
            return `<em>${node.text}</em>`;
        case 'STRIKETHROUGH':
            return `<s>${node.text}</s>`;
        case 'SUBSCRIPT':
            return `<sub>${node.text}</sub>`;
        case 'SUPERSCRIPT':
            return `<sup>${node.text}</sup>`;
        case 'UNDERLINE':
            return `<u>${node.text}</u>`;
        case 'ITALIC':
            return `<i>${node.text}</i>`;
        case 'PARAGRAPH':
            return `<p>${node.text}</p>`;
        default:
            return node.text || node;
    }
};

const parseAttr = (description) => {
    const { attributes, text } = description;
    const attrs = [...attributes];
    attrs.sort((b, d) => {
        const f = b.start + b.length,
            e = d.start + d.length;
        return f === e ? text_tag[b.detailData.style] - text_tag[d.detailData.style] : f - e;
    });
    const n = [];
    for (const q of attrs) {
        const p = new TreeNode(q);
        const w = q.start;
        while (0 < n.length && n.at(-1).attr.start >= w) {
            p.children.push(n.pop());
        }
        p.children.reverse();
        n.push(p);
    }

    const m = new Ucs2Text(text);

    const render = (node) => {
        // DFS render
        if (node.children.length === 0) {
            node.text = m.slice(node.start, node.end);
            return renderSingle(node);
        }
        const res = [];
        let s = node.start;
        for (const child of node.children) {
            if (s < child.start) {
                res.push(m.slice(s, child.start)); // added text before 1st child node
            }
            s = child.end;
            res.push(render(child));
        }

        if (s < node.end) {
            res.push(m.slice(s, node.end)); // added text after the last child node
        }
        node.text = res.join('');
        return renderSingle(node);
    };

    const q = [];
    let p = 0;
    for (const e of n) {
        // BFS render
        if (e.start > p) {
            q.push(m.slice(p, e.start));
        }
        p = e.end;
        q.push(render(e));
    }
    if (p < m.length) {
        q.push(m.slice(p, m.length));
    }
    return q.join('');
};

module.exports = {
    parseAttr,
};
