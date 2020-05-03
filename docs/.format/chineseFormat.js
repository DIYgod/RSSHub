const file = require('./file');
const width = require('string-width');
const remark = require('remark');
const pangu = require('remark-pangu');
const frontmatter = require('remark-frontmatter');

const consistent = require('remark-preset-lint-consistent');
const styleGuide = require('remark-preset-lint-markdown-style-guide');
const recommended = require('remark-preset-lint-recommended');
const prettier = require('remark-preset-prettier');

// Helpers

module.exports = {
    rules: (list) => list.filter((e) => e.lang === file.LANG_CN),
    handler: async (doc) => {
        let result = await remark()
            .use(frontmatter)
            .use(pangu)
            .use(consistent)
            .use(styleGuide)
            .use(recommended)
            .use(prettier)
            .use({
                settings: {
                    stringLength: width,
                },
            })
            .process(doc);
        return typeof result === 'string' ? result : typeof result.contents === 'string' ? result.contents : result.result;
    },
};
