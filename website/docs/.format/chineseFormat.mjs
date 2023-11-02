// const file = require('./file');
// const width = require('string-width');
// const remark = require('remark');
// const pangu = require('remark-pangu');
// const frontmatter = require('remark-frontmatter');
// const stringify = require('remark-stringify');
// const gfm = require('remark-gfm');
// const prettier = require('remark-preset-prettier');

// module.exports = {
//     rules: (list) => list.filter((e) => e.lang === file.LANG_CN),
//     handler: async (doc) => {
//         let result = await remark()
//             .use(frontmatter)
//             .use(pangu, {
//                 inlineCode: false,
//                 link: false,
//             })
//             .use(stringify, {
//                 bullet: '-',
//                 ruleSpaces: true,
//             })
//             .use(prettier)
//             .use(gfm, {
//                 stringLength: width,
//             })
//             .process(doc);
//         return typeof result === 'string' ? result : typeof result.contents === 'string' ? result.contents : result.result;
//     },
// };

import file from './file.mjs';
import stringWidth from 'string-width';
import { remark } from 'remark';
import remarkMdx from 'remark-mdx';
import { remarkHeadingId } from 'remark-custom-heading-id';
// import remarkParse from 'remark-parse';
import remarkPangu from 'remark-pangu';
import remarkFrontmatter from 'remark-frontmatter';
import remarkDirective from 'remark-directive';
import remarkStringify from 'remark-stringify';
import remarkGfm from 'remark-gfm';
import remarkPresetPrettier from 'remark-preset-prettier';

export default {
    rules: (list) => list.filter((e) => e.lang === file.LANG_EN),
    handler: async (doc) => {
        // console.log(doc);
        let result = await remark()
            // .use(remarkParse)
            .use(remarkMdx)
            .use(remarkFrontmatter)
            // .use(remarkHeadingId)
            .use(remarkPangu, {
                inlineCode: false,
                link: false,
            })
            .use(remarkDirective)
            .use(remarkStringify, {
                bullet: '-',
                rule: '-',
                ruleSpaces: true,
                tightDefinitions: true,
            })
            // .use(remarkPresetPrettier)
            .use(remarkGfm, {
                stringLength: stringWidth,
            })
            .process(doc);
        // return typeof result === 'string' ? result : typeof result.contents === 'string' ? result.contents : result.result;
        // console.log(String(result));
        return String(result);
    },
};
