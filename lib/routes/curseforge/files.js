const got = require('@/utils/got');
const cheerio = require('cheerio');

const BASE_URL = 'https://minecraft.curseforge.com/';

module.exports = async (ctx) => {
    const { project } = ctx.params;
    const projectLink = `${BASE_URL}/projects/${project}/files`;
    const projectFilesReq = await got.get(projectLink);
    const { data } = projectFilesReq;
    const $ = cheerio.load(data);
    const projectName = $('.project-title span').text();
    const reqs = $('.project-file-name-container > a')
        .get()
        .map(async (item) => {
            const el = $(item);
            const document = {};
            const link = el.attr('href');
            document.link = `${BASE_URL}${link}`;
            const cache = await ctx.cache.get(document.link);

            if (cache) {
                return JSON.parse(cache);
            }

            const itemReq = await got.get(document.link);
            const $item = cheerio.load(itemReq.data);
            const supportVersions = $item('.details-versions li')
                .get()
                .map((item) => $item(item).text())
                .join(', ');
            document.author = $item('.user-tag a').text();
            document.title = $item('.details-header > h3').text();
            document.description = `${projectName} 的 ${document.author} 发布了新的文件: ${document.title}. ` + `</br> 支持的版本为: ${supportVersions}`;

            document.pubDate = new Date(Number($item('.standard-datetime').attr('data-epoch')) * 1000).toUTCString();
            document.guid = $item('.md5').text();

            ctx.cache.set(document.link, JSON.stringify(document));

            return document;
        });

    const item = await Promise.all(reqs);

    ctx.state.data = {
        title: `CurseForge 更新 - ${projectName}`,
        link: projectLink,
        description: 'CurseForge Mod 更新',
        item,
    };
};
