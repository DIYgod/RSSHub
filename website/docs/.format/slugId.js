const file = require('./file');
const { pinyin } = require('pinyin-pro');

const slugify = (s) =>
    encodeURIComponent(
        pinyin(s, {
            nonZh: 'consecutive',
            toneType: 'none',
            type: 'array',
        })
            .join(' ')
            .trim()
            .toLowerCase()
            .replace(/\s+/g, '-')
    );

module.exports = {
    rules: (list) => list.filter((e) => e.type === file.ROUTE_TYPE && e.lang === file.LANG_CN),
    handler: async (data) => {
        const content = data.split('\n');
        let lastH2 = '';

        for (let i = 0; i < content.length; i++) {
            if (content[i].startsWith('## ')) {
                lastH2 = content[i].match(`## (([^{])*)`)?.[1].trim();

                content[i] = `## ${lastH2} {#${slugify(lastH2)}}`;
            } else if (content[i].startsWith('### ')) {
                const title = content[i].match(`### (([^{])*)`)?.[1].trim();

                content[i] = `### ${title} {#${slugify(lastH2)}-${slugify(title)}}`;
            }
        }

        return Promise.resolve(content.join('\n'));
    },
};
