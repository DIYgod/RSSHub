/**
 * @typedef {import('mdast').Heading} Heading
 */

import { pinyin } from 'pinyin-pro';
// import { visit } from 'unist-util-visit';
import { visitParents } from 'unist-util-visit-parents';

const slugify = (/** @type {string} */ s) => {
    s = s?.replace(/[!"#&'()+,./:[\]_|’“”、「」・（）．：｜]/g, '-');
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

// const findAllHeadings = (tree) => {
//     /** @type {Heading[]} */
//     const headings = [];
//     visit(tree, 'heading', (node) => {
//         headings.push(node);
//     });
//     return headings;
// };

const extractIdString = (node) => node.children.map((child) => child?.value ?? '').join('');

export default function remarkRssHubHeadingId(options = { overwrite: false }) {
    return (mdast) => {
        // const flatHeadings = findAllHeadings(mdast);
        visitParents(mdast, 'heading', (node, ancestors) => {
            if (node.depth === 2) {
                const idString = extractIdString(node);

                node.data ||= {};
                node.data.hProperties ||= {};
                if (options.overwrite) {
                    node.data.id = node.data.hProperties.id = slugify(idString);
                }
            } else if (node.depth > 2) {
                // const currentHeadingIndex = flatHeadings.indexOf(node);
                // let prevHeading;
                // for (let i = currentHeadingIndex - 1; i >= 0; i--) {
                //     if (flatHeadings[i].depth < node.depth) {
                //         prevHeading = flatHeadings[i];
                //         break;
                //     }
                // }
                // Do not add heading ids to headings that are children of JSX elements (i.e. components, details, admonitions, etc.)
                // since they will be parsed as JSX expressions and cause errors.

                const parentNode = ancestors[ancestors.length - 1];
                const nodeIndex = parentNode.children.indexOf(node);
                let prevHeading;

                for (let i = nodeIndex - 1; i >= 0; i--) {
                    if (parentNode.children[i]?.depth < node.depth && parentNode.children[i]?.type === 'heading') {
                        prevHeading = parentNode.children[i];
                        break;
                    }
                }

                if (options.overwrite && prevHeading) {
                    const idString = extractIdString(node);

                    node.data ||= {};
                    node.data.hProperties ||= {};
                    node.data.id = node.data.hProperties.id = prevHeading.data.id + '-' + slugify(idString);
                }
            }
        });
    };
}
