const file = require('./file');
const pinyinCompare = new Intl.Collator('zh-Hans-CN-u-co-pinyin').compare;
const isASCII = (str) => /^[\x00-\x7F]*$/.test(str);

module.exports = {
    rules: (list) => list.filter((e) => e.type === file.ROUTE_TYPE),
    handler: async (data) => {
        const content = data.split('\n');
        const blocks = [];
        const h1 = [];

        let i = 0;
        while (i < content.length) {
            const m = /^##\s*(.*)$/.exec(content[i]);
            if (m) {
                const b = {
                    title: m[1],
                    content: [],
                };

                b.content.push(content[i]);
                i++;
                while (i < content.length && !/^##\s.*$/.test(content[i])) {
                    b.content.push(content[i]);
                    i++;
                }
                blocks.push(b);
            } else {
                h1.push(content[i]);
                i++;
            }
        }

        let newContent = blocks
            .sort((a, b) => {
                const ia = isASCII(a.title[0]);
                const ib = isASCII(b.title[0]);
                if (ia && ib) {
                    return a.title.toLowerCase() < b.title.toLowerCase() ? -1 : 1;
                } else if (ia || ib) {
                    return ia > ib ? -1 : 1;
                } else {
                    return pinyinCompare(a.title, b.title);
                }
            })
            .map((x) => x.content.join('\n'))
            .join('\n');
        if (newContent) {
            h1.push(newContent);
        }

        newContent = h1.join('\n');

        return Promise.resolve(newContent);
    },
};
