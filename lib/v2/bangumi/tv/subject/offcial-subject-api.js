const got = require('@/utils/got');

module.exports = (type) => {
    const mapping = {
        blog: {
            en: 'reviews',
            cn: '评论',
        },
        topic: {
            en: 'board',
            cn: '讨论',
        },
    };

    return async (subjectID) => {
        // 官方提供的条目API文档见https://github.com/bangumi/api/blob/master/docs-raw/Subject-API.md
        const url = `https://api.bgm.tv/subject/${subjectID}?responseGroup=large`;
        const subjectInfo = (await got.get(url)).data;
        return {
            title: `${subjectInfo.name_cn || subjectInfo.name}的Bangumi${mapping[type].cn}`,
            link: `https://bgm.tv/subject/${subjectInfo.id}/${mapping[type].en}`,
            item: subjectInfo[type].map((article) => ({
                title: `${article.user.nickname}：${article.title}`,
                description: article.summary || '',
                link: article.url,
                pubDate: new Date(article.timestamp * 1000).toUTCString(),
            })),
        };
    };
};
