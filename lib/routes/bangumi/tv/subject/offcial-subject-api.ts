import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getLocalName } from './utils';

const getFromAPI = (type) => {
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

    return async (subjectID, showOriginalName) => {
        // 官方提供的条目API文档见 https://github.com/bangumi/api/blob/3f3fa6390c468816f9883d24be488e41f8946159/docs-raw/Subject-API.md
        const url = `https://api.bgm.tv/subject/${subjectID}?responseGroup=large`;
        const { data: subjectInfo } = await got(url);
        return {
            title: `${getLocalName(subjectInfo, showOriginalName)}的 Bangumi ${mapping[type].cn}`,
            link: `https://bgm.tv/subject/${subjectInfo.id}/${mapping[type].en}`,
            item: subjectInfo[type].map((article) => ({
                title: `${article.user.nickname}：${article.title}`,
                description: article.summary || '',
                link: article.url.replace('http:', 'https:'),
                pubDate: parseDate(article.timestamp, 'X'),
                author: article.user.nickname,
            })),
        };
    };
};
export default getFromAPI;
