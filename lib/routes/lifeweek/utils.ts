import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const articleApiRootUrl = 'https://www.lifeweek.com.cn/api/article';

async function getRssItem(item, articleLink) {
    const articleApiLink = `${articleApiRootUrl}/${item.id}`;
    const { data } = await got(articleApiLink);
    const time = timezone(parseDate(item.pubTime), +8);
    return {
        title: item.title,
        description: data.model.content,
        link: articleLink,
        pubDate: time,
    };
}

export default getRssItem;
