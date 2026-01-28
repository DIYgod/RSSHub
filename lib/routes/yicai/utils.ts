import { load } from 'cheerio';

import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { renderDescription } from './templates/description';

const rootUrl = 'https://www.yicai.com';

const ProcessItems = async (apiUrl, tryGet) => {
    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const items = response.data.map((item) => ({
        title: item.NewsTitle,
        link: item.url.startsWith('http') ? item.url : `${rootUrl}${item.AppID === 0 ? `/vip` : ''}${item.url}`,
        author: item.NewsAuthor || item.NewsSource || item.CreaterName,
        pubDate: timezone(parseDate(item.CreateDate), +8),
        category: [item.ChannelName],
        description: renderDescription({
            image: {
                src: item.originPic,
                alt: item.NewsTitle,
            },
            video: {
                src: item.VideoUrl,
                type: item.VideoUrl?.split(/\./).pop() ?? undefined,
            },
            intro: item.NewsNotes,
        }),
    }));

    return Promise.all(fetchFullArticles(items, tryGet));
};
function fetchFullArticles(items, tryGet) {
    return items.map((item) =>
        tryGet(item.link, async () => {
            const detailResponse = await got({
                method: 'get',
                url: item.link,
            });

            const content = load(detailResponse.data);

            if (!item.pubDate) {
                const dataScript = content("script[src='/js/alert.min.js']").next().text() || content('title').next().text();
                const pb = new Map(JSON.parse(dataScript.match(/_pb = (\[.*?]);/)[1].replaceAll("'", '"')));
                item.pubDate = parseDate(`${pb.get('actime')}:00`);
            }

            content('h1').remove();
            content('.u-btn6, .m-smallshare, .topic-hot').remove();

            item.description = (item.description ?? '') + (content('.multiText, #multi-text, .txt').html() ?? '');

            return item;
        })
    );
}
export { fetchFullArticles, ProcessItems, rootUrl };
