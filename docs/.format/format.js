const file = require('./file');
const sgf = require('staged-git-files');
const path = require('path');
const sortByHeading = require('./sortByHeading');
const chineseFormat = require('./chineseFormat');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

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
            path: path.resolve(__dirname, '..', prefix, `./${x}.md`),
            type,
            lang,
        }));
const loopNav = (nav, lang) =>
    nav.flatMap((e) => {
        if (e.items) {
            return loopNav(e.items, lang);
        }
        if (e.link.endsWith('/')) {
            return {
                path: path.resolve(__dirname, '..', e.link.slice(1), 'README.md'),
                type: file.NAV_TYPE,
                lang,
            };
        } else {
            return {
                path: path.resolve(__dirname, '..', `${e.link}.md`),
                type: file.NAV_TYPE,
                lang,
            };
        }
    });
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
    const config = require(`../.vuepress/config`);
    let fileList = [];
    Object.keys(config.themeConfig.locales).forEach((key) => {
        const locale = config.themeConfig.locales[key];
        const key_path = key.slice(1);
        if (locale.hasOwnProperty('sidebar')) {
            fileList = fileList.concat(loopType(locale.sidebar[key], locale.lang, key_path));
        }
        if (locale.hasOwnProperty('nav')) {
            fileList = fileList.concat(loopNav(locale.nav, locale.lang));
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
    // console.log(fileList);
    // return

    const stagedFiles = await sgf();
    for (const processor of processors) {
        for (const e of processor.rules(fileList)) {
            let formatted = await file.readFile(e.path);
            formatted = await processor.handler(formatted);
            await file.writeFile(e.path, formatted);
            if (stagedFiles.find((x) => e.path.indexOf(x.filename) !== -1)) {
                await exec(`git add ${e.path}`);
            }
        }
    }
})();
