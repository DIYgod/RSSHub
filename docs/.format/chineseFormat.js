const file = require('./file');
const width = require('string-width');
const remark = require('remark');
const pangu = require('remark-pangu');
const frontmatter = require('remark-frontmatter');
const stringify = require('remark-stringify');
const gfm = require('remark-gfm');
const prettier = require('remark-preset-prettier');

module.exports = {
    rules: (list) => list.filter((e) => e.lang === file.LANG_CN),
    handler: async (doc) => {
        let result = await remark()
            .use(frontmatter)
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
        return typeof result === 'string' ? result : typeof result.contents === 'string' ? result.contents : result.result;
    },
};
