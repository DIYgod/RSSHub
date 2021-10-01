import file from './file';
import width from 'string-width';
import remark from 'remark';
import pangu from 'remark-pangu';
import frontmatter from 'remark-frontmatter';

import prettier from 'remark-preset-prettier';

export default {
    rules: (list) => list.filter((e) => e.lang === file.LANG_CN),
    handler: async (doc) => {
        let result = await remark()
            .use(frontmatter)
            .use(pangu, {
                inlineCode: false,
                link: false,
            })
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
