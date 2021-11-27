const got = require('@/utils/got');

const API_BASE_URL = 'https://addons-ecs.forgesvc.net/api/v2/addon';

module.exports = async (ctx) => {
    const { project } = ctx.params;

    const projectAPILink = `${API_BASE_URL}/${project}`;
    const projectFilesAPILink = `${projectAPILink}/files`;

    const [projectDesc, projectFiles] = (await Promise.all([got.get(projectAPILink), got.get(projectFilesAPILink)])).map((resp) => resp.data);

    const projectName = projectDesc.name;
    const projectLink = projectDesc.websiteUrl;
    const author = projectDesc.authors[0].name;

    const item = projectFiles.map((file) => {
        const doc = {};
        doc.link = projectLink;
        doc.author = author;
        doc.title = file.displayName;
        const supportVersions = file.gameVersion;

        doc.description = `${projectName} 发布了新的文件: ${file.displayName}. </br> 支持的版本为: ${supportVersions}`;
        doc.pubDate = new Date(file.fileDate).toUTCString();
        doc.guid = file.id;
        return doc;
    });

    ctx.state.data = {
        title: `CurseForge 更新 - ${projectName}`,
        link: projectLink,
        description: 'CurseForge Mod 更新',
        item,
    };
};
