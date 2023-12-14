import { visitParents } from 'unist-util-visit-parents';

export default function remarkRssHub() {
    return (mdast, file) => {
        visitParents(mdast, 'mdxJsxFlowElement', (node, ancestors) => {
            const parentNode = ancestors[ancestors.length - 1];
            const nodeIndex = parentNode.children.indexOf(node);
            const previousNode = parentNode.children[nodeIndex - 1];

            if (node.name === 'Route' && previousNode?.type === 'heading' && previousNode?.depth < 3) {
                file.fail('The heading before the Route tag should be a level 3 heading.', {
                    ancestors: [node],
                    ruleId: 'rsshub-route-level',
                    source: 'rsshub-route-level',
                    place: {
                        start: node.position.start,
                        end: node.position.end,
                    },
                });
            }
        });
    };
}
