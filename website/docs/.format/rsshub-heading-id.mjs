/**
 * @typedef {import('mdast').Heading} Heading
 */

import { pinyin } from 'pinyin-pro';
import { visit } from 'unist-util-visit';

const slugify = (/** @type {string} */ s) => {
    s = s?.replace(/[#&'()+,./:[\]_|’“”、「」・（）．：｜]/g, '-');
    return encodeURIComponent(
        pinyin(s, {
            nonZh: 'consecutive',
            toneType: 'none',
            type: 'array',
            v: true,
        })
            .join(' ')
            .trim()
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/(^-|-$)/g, '')
    );
};

const findAllHeadings = (tree) => {
    /** @type {Heading[]} */
    const headings = [];
    visit(tree, 'heading', (node) => {
        headings.push(node);
    });
    return headings;
};

const extractIdString = (node) => node.children.map((child) => child?.value ?? '').join('');

export default function remarkRssHubHeadingId(options = { overwrite: false }) {
    return (mdast) => {
        const flatHeadings = findAllHeadings(mdast);
        visit(mdast, 'heading', (node) => {
            if (node.depth === 2) {
                const idString = extractIdString(node);

                node.data ||= {};
                node.data.hProperties ||= {};
                if (options.overwrite) {
                    node.data.id = node.data.hProperties.id = slugify(idString);
                }
            } else if (node.depth > 2) {
                const currentHeadingIndex = flatHeadings.indexOf(node);
                let prevHeading;
                for (let i = currentHeadingIndex - 1; i >= 0; i--) {
                    if (flatHeadings[i].depth < node.depth) {
                        prevHeading = flatHeadings[i];
                        break;
                    }
                }

                const idString = extractIdString(node);

                node.data ||= {};
                node.data.hProperties ||= {};
                if (options.overwrite) {
                    node.data.id = node.data.hProperties.id = slugify(prevHeading?.data?.id + '-' + idString);
                }
            }
        });
    };
}
