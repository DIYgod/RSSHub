import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { decode } from 'entities';

interface MediaItem {
    ID: string;
    TITLE: string;
    PUBLISH_DATE: string;
    META_DESCRIPTION: string;
    MEDIA_CD: string;
    MEDIA_TYPES: string;
}

interface TagItem {
    TAG_ID: string;
    TAG_NAME: string;
}

export const route: Route = {
    path: '/news/:lang',
    categories: ['university'],
    example: '/isct/news/ja',
    parameters: { lang: 'language, could be ja or en' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.isct.ac.jp/:lang/news'],
            target: '/news/:lang',
        },
    ],
    name: 'News',
    maintainers: ['catyyy'],
    handler: async (ctx) => {
        const { lang = 'ja' } = ctx.req.param();
        const get_media_list = await ofetch(`https://www.isct.ac.jp/expansion/get_media_list_json.php?lang_cd=${lang}`);
        const get_tag_list = await ofetch(`https://www.isct.ac.jp/expansion/get_tag_list_json.php?lang_cd=${lang}`);

        const media_data = JSON.parse(decode(get_media_list));
        const tag_data = JSON.parse(decode(get_tag_list));

        const itemsArray: MediaItem[] = Object.values(media_data);
        const tagArray: TagItem[] = Object.values(tag_data);

        const tagIdNameMapping: { [key: string]: string } = {};

        for (const item of Object.values(tagArray)) {
            tagIdNameMapping[item.TAG_ID] = item.TAG_NAME;
        }

        const items = itemsArray.map((item) => ({
            // 文章标题
            title: item.TITLE,
            // 文章链接
            link: 'news/' + item.MEDIA_CD,
            // 文章正文
            description: item.META_DESCRIPTION,
            // 文章发布日期
            pubDate: parseDate(item.PUBLISH_DATE),
            // 如果有的话，文章作者
            // author: item.user.login,
            // 如果有的话，文章分类
            category: [tagIdNameMapping[Number.parseInt(item.MEDIA_TYPES.replaceAll('"', ''), 10)]],
        }));
        return {
            // 源标题
            title: `ISCT News - ${lang}`,
            // 源链接
            link: `https://www.isct.ac.jp/${lang}/news`,
            // 源文章
            item: items,
        };
    },
};
