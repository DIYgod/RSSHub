const file = require('./.format/file');
const path = require('path');
const sortByHeading = require('./.format/sortByHeading');
const chineseFormat = require('./.format/chineseFormat');

const processors = [sortByHeading, chineseFormat];

const loopSideBar = (children, type, lang) =>
    children
        .filter((e) => e !== '')
        .map((x) => ({
            path: path.resolve(__dirname, `./${x}.md`),
            type,
            lang,
        }));

const loopType = (sidebar, lang) => loopSideBar(sidebar[0].children, file.GUIDE_TYPE, lang).concat(loopSideBar(sidebar[1].children, file.ROUTE_TYPE, lang));

const buildFileList = () => {
    const config = require(`./.vuepress/config`);
    let fileList = [];
    Object.keys(config.themeConfig.locales).forEach((key) => {
        const locale = config.themeConfig.locales[key];
        if (locale.hasOwnProperty('sidebar')) {
            if (locale.sidebar['/']) {
                fileList = fileList.concat(loopType(locale.sidebar['/'], file.LANG_CN));
            } else if (locale.sidebar['/en/']) {
                fileList = fileList.concat(loopType(locale.sidebar['/en/'], file.LANG_EN));
            }
        }
    });

    return fileList;
};

// Entry
(async () => {
    const fileList = buildFileList();
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
