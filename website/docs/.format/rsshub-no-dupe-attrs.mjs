import { visit } from 'unist-util-visit';

export default function RssHubNoDupeAttrs() {
    return (mdast, file) => {
        visit(mdast, 'mdxJsxFlowElement', (node) => {
            const attributes = node.attributes;
            const attributeNames = attributes.map((attr) => attr.name);
            const uniqueAttributeNames = new Set(attributeNames);
            if (attributeNames.length !== uniqueAttributeNames.size) {
                file.fail(`The attributes of the component "${node.name}" are not unique.`, {
                    ancestors: [node],
                    ruleId: 'rsshub-no-dupe-attrs',
                    source: 'rsshub-no-dupe-attrs',
                    place: {
                        start: node.position.start,
                        end: node.position.end,
                    },
                });
            }
        });
    };
}
