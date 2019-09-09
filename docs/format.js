const fs = require('fs');
const pinyin = require('pinyin');
const path = require('path');
const isASCII = (str) => /^[\x00-\x7F]*$/.test(str);

const sortByHeading = async (filePath) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return Promise.reject(err);
        }
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
                    return pinyin.compare(a.title, b.title);
                }
            })
            .map((x) => x.content.join('\n'))
            .join('\n');
        if (newContent) {
            h1.push(newContent);
        }
        newContent = h1.join('\n');

        fs.writeFile(filePath, newContent, 'utf8', (err) => {
            if (err) {
                return Promise.reject(err);
            } else {
                return Promise.resolve(newContent);
            }
        });
    });
};

(async () => {
    const config = require(`./.vuepress/config`);

    let fileList = Object.keys(config.themeConfig.locales)
        .map((key) => {
            const locale = config.themeConfig.locales[key];
            if (locale.hasOwnProperty('sidebar')) {
                if (locale.sidebar['/']) {
                    return locale.sidebar['/'][1].children.map((x) => path.resolve(__dirname, `./${x}.md`));
                } else if (locale.sidebar['/en/']) {
                    return locale.sidebar['/en/'][1].children.map((x) => path.resolve(__dirname, `./en/${x}.md`));
                }
                return null;
            } else {
                return null;
            }
        })
        .filter((x) => !!x);

    fileList = [].concat.apply([], fileList);

    fileList.forEach((filePath) => {
        sortByHeading(filePath)
            .then(() => {
                // console.log(`Processed ${filePath}`);
            })
            .catch((err) => {
                throw err;
            });
    });
})();
