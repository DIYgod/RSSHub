import got from '@/utils/got';
import { parseDate } from '@/utils/time';

const articleApiRootUrl = 'https://www.lifeweek.com.cn/api/article';

export const getRssItem = async (item, articleLink) => {
    const articleApiLink = `${articleApiRootUrl}/${item.id}`;
    const { data } = await got(articleApiLink);
    const time = ([undefined, null, ''] as unknown[]).includes(item.pubTime) ? undefined : parseDate(item.pubTime, 8);
    return {
        title: item.title,
        description: data.model.content,
        link: articleLink,
        pubDate: time,
    };
};
