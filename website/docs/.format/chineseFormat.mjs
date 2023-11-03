import file from './file.mjs';
import width from 'string-width';
import { remark } from 'remark';
import pangu from 'remark-pangu';
import frontmatter from 'remark-frontmatter';
import remarkDirective from 'remark-directive';
import stringify from 'remark-stringify';
import gfm from 'remark-gfm';
import prettier from 'remark-preset-prettier';
import remarkMdx from 'remark-mdx';

export default {
    rules: (list) => list.filter((e) => e.lang === file.LANG_EN),
    handler: async (doc) => {
        const result = await remark()
            .use(remarkMdx)
            .use(frontmatter)
            .use(remarkDirective)
            .use(pangu, {
                inlineCode: false,
                link: false,
            })
            .use(stringify, {
                bullet: '-',
                ruleSpaces: true,
            })
            .use(prettier)
            .use(gfm, {
                stringLength: width,
            })
            .process(doc);
        return String(result);
    },
};
