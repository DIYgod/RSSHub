import file from './file.mjs';
import stringWidth from 'string-width';
import { heading } from './handle/heading.mjs';
import { read } from 'to-vfile';
import { remark } from 'remark';
import { remarkHeadingId } from 'remark-custom-heading-id';
import remarkDirective from 'remark-directive';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkMdx from 'remark-mdx';
import remarkPangu from 'remark-pangu';
import remarkPrettier from 'remark-preset-prettier';
import rssHubHeadingId from './rsshub-heading-id.mjs';
import rssHubNoDupeAttrs from './rsshub-no-dupe-attrs.mjs';
import rssHubRouteLevel from './rsshub-route-level.mjs';

export default {
    rules: (list) => list.filter((e) => e.lang === file.LANG_EN && e.type === file.ROUTE_TYPE),
    handler: async (_doc, path) => {
        const result = await remark()
            // remark-stringify settings
            .data('settings', {
                bullet: '-',
                ruleSpaces: true,
                handlers: {
                    heading: (node, parent, state, info) => heading(node, parent, state, info),
                },
            })
            .use(remarkMdx)
            .use(remarkFrontmatter)
            .use(remarkHeadingId)
            .use(remarkDirective)
            .use(remarkPangu, {
                inlineCode: false,
                link: false,
            })
            .use(remarkPrettier)
            .use(remarkGfm, {
                stringLength: stringWidth,
            })
            .use(rssHubHeadingId, {
                overwrite: true,
            })
            .use(rssHubNoDupeAttrs)
            .use(rssHubRouteLevel)
            .process(await read(path));
        return String(result);
    },
};
