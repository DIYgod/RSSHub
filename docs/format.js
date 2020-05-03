const file = require('./.format/file');
const sgf = require('staged-git-files');
const path = require('path');
const sortByHeading = require('./.format/sortByHeading');
const chineseFormat = require('./.format/chineseFormat');

/**
 * Processors are objects contains two methods:
 * `rules(list)`, and `handler(str)`
 * rules filters required file document object
 * and handler get document string and return formatted document
 */
const processors = [sortByHeading, chineseFormat];

// Helpers
const loopSideBar = (children, type, lang, prefix) =>
    children
        .filter((e) => e !== '')
        .map((x) => ({
            path: path.resolve(__dirname, prefix, `./${x}.md`),
            type,
            lang,
        }));
const loopType = (sidebar, lang, prefix) => loopSideBar(sidebar[0].children, file.GUIDE_TYPE, lang, prefix).concat(loopSideBar(sidebar[1].children, file.ROUTE_TYPE, lang, prefix));

/**
 * Iterate config and build document object:
 * E.g.
 * {
        path: 'docs/en/other.md', <-- full path here
        type: 'route', <--- Defined in file.js
        lang: 'en' <-- Defined in file.js
    }
 */
const buildFileList = async () => {
    const config = require(`./.vuepress/config`);
    let fileList = [];
    Object.keys(config.themeConfig.locales).forEach((key) => {
        const locale = config.themeConfig.locales[key];
        if (locale.hasOwnProperty('sidebar')) {
            if (locale.sidebar['/']) {
                fileList = fileList.concat(loopType(locale.sidebar['/'], file.LANG_CN, ''));
            } else if (locale.sidebar['/en/']) {
                fileList = fileList.concat(loopType(locale.sidebar['/en/'], file.LANG_EN, 'en/'));
            }
        }
    });

    return fileList;
};

/**
 * Select files that only being modified
 * Same format as `buildFileList()`
 */
const buildStagedList = async () => {
    const stagedFiles = await sgf();
    const stagedFileList = [];
    stagedFiles.forEach((e) => {
        if (e.filename.endsWith('.md')) {
            stagedFileList.push(e.filename);
        }
    });
    const fullFileList = await buildFileList();
    const result = [];
    stagedFileList.forEach((e) => {
        const f = fullFileList.find((x) => x.path.indexOf(e) !== -1);
        if (f) {
            result.push(f);
        }
    });

    return result;
};

/** Entry
 * Usage: node format.js --full/--staged
 */
(async () => {
    // Mode
    const flag = process.argv[2] || '--full';
    let fileList = [];
    switch (flag) {
        case '--staged':
            fileList = await buildStagedList();
            break;
        case '--full':
        default:
            fileList = await buildFileList();
    }

    for (const processor of processors) {
        // We don't want to mix up processor
        /* eslint-disable no-await-in-loop */
        await Promise.all(
            processor.rules(fileList).map(async (e) => {
                let formatted = await file.readFile(e.path);
                formatted = await processor.handler(formatted);
                return file.writeFile(e.path, formatted);
            })
        ).catch((err) => {
            // eslint-disable-next-line no-console
            console.log(err);
            process.exit(1);
        });
    }
})();
