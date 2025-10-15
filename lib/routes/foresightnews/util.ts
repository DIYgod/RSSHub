import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';
import zlib from 'node:zlib';

const constants = {
    labelHot: '热门',
    labelImportant: '重要消息',
    defaultType: 'article',
};

const params = {
    article: 'article',
    event: 'timeline',
    news: 'news',
};

const rootUrl = 'https://foresightnews.pro';
const apiRootUrl = 'https://api.foresightnews.pro';
const imgRootUrl = 'https://img.foresightnews.pro';

const icon = new URL('foresight.ico', rootUrl).href;
const image = new URL('vertical_logo.png', imgRootUrl).href;

const processItems = async (apiUrl, limit, ...parameters) => {
    let searchParams = {
        size: limit,
    };
    for (const param of parameters) {
        searchParams = {
            ...searchParams,
            ...param,
        };
    }

    const info = {
        column: '',
    };

    const { data: response } = await got(apiUrl, {
        searchParams,
    });

    let items = JSON.parse(String(zlib.inflateSync(Buffer.from(response.data?.list ?? response.data, 'base64'))));

    items = (items?.list ?? items).slice(0, limit).map((item) => {
        const sourceType = item.source_type ?? (item.source_link ? (item.column?.title ? 'article' : 'news') : item.event_type ? 'event' : constants.defaultType);

        item = item.source_type ? item[item.source_type] : item;

        const column = item.column?.title;
        info.column = info.column || column;

        const categories = [
            column,
            item.event_type,
            item.is_hot ? constants.labelHot : undefined,
            item.is_important ? (item.important_tag?.name ?? constants.labelImportant) : '',
            item.label,
            ...(item.tags?.map((c) => c.name) ?? []),
        ].filter((v, index, self) => v && self.indexOf(v) === index);

        const link = new URL(`${params[sourceType]}/detail/${item.id}`, rootUrl).href;

        return {
            title: item.title,
            link,
            description: art(path.join(__dirname, 'templates/description.art'), {
                image: item.img.split('?')[0],
                description: item.content ?? item.brief,
                source: item.source_link,
            }),
            author: item.column?.title ?? item.author?.username ?? undefined,
            category: categories,
            guid: `foresightnews-${sourceType}#${item.id}`,
            pubDate: item.published_at ? parseDate(item.published_at * 1000) : undefined,
            updated: item.last_update_at ? parseDate(item.last_update_at * 1000) : undefined,
        };
    });

    return { items, info };
};

export { icon, image, rootUrl, apiRootUrl, imgRootUrl, processItems };
