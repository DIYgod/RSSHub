import { escapeAttribute, escapeText } from 'entities';

import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const processFeed = async (list, cache) => {
    const detailUrl = 'https://www.infoq.cn/public/v1/article/getDetail';

    const items = await Promise.all(
        list.map(async (e) => {
            const uuid = e.uuid;
            const single = await cache.tryGet(uuid, async () => {
                const link = `https://www.infoq.cn/article/${uuid}`;
                const resp = await got.post(detailUrl, {
                    headers: {
                        Referer: link,
                    },
                    json: {
                        uuid,
                    },
                });

                const data = resp.data.data;
                const author = data.author ? data.author.map((p) => p.nickname).join(',') : data.no_author;
                const category = [...e.topic.map((t) => t.name), ...e.label.map((l) => l.name)];
                const content = data.content_url ? (await got(data.content_url)).body : data.content;
                const description = addCoverToDescription(parseContent(content), data.article_cover);

                const date = ([undefined, null, ''] as unknown[]).includes(e.publish_time) ? undefined : parseDate(e.publish_time, 'x');

                return {
                    title: data.article_title,
                    description,
                    pubDate: date && Number.isFinite(date.getTime()) ? date : undefined,
                    category,
                    author,
                    link,
                };
            });

            return single;
        })
    );

    return items;
};

const parseToSimpleText = (content) => parseToSimpleTexts(content).join('');
const parseToSimpleTexts = (content) =>
    content.map((i) => {
        const funcMaps = {
            doc: () =>
                parseToSimpleTexts(i.content)
                    .map((v) => `<p>${v}</p>`)
                    .join(''),
            text: () => escapeText(i.text ?? ''),
            heading: () => {
                if (i.content) {
                    const level = i.attrs.level;
                    const text = parseToSimpleText(i.content);
                    return `<h${level}>${text}</h${level}>`;
                }
                return '';
            },
            blockquote: () => {
                if (i.content) {
                    const text = parseToSimpleText(i.content);
                    return `<blockquote>${text}</blockquote>`;
                }
                return '';
            },
            image: () => {
                const img = escapeAttribute(i.attrs.src);
                return `<img src="${img}"></img>`;
            },
            codeblock: () => {
                if (i.content) {
                    const lang = escapeAttribute(i.attrs.lang ?? '');
                    const code = parseToSimpleText(i.content);
                    return `<code lang="${lang}">${code}</code>`;
                }
                return '';
            },
            link: () => {
                const href = escapeAttribute(i.attrs.href);
                const text = i.content ? parseToSimpleText(i.content) : '';
                return `<a href="${href}">${text}</a>`;
            },
        };

        if (Object.hasOwn(funcMaps, i.type)) {
            return funcMaps[i.type]();
        }

        if (!i.content) {
            return '';
        }

        return parseToSimpleText(i.content);
    });

function addCoverToDescription(content, cover) {
    return cover ? `<p><img src="${escapeAttribute(cover)}"></p>${content}` : content;
}

function parseContent(content) {
    const isRichContent = content.startsWith('{"');
    if (!isRichContent) {
        return content;
    }

    return parseToSimpleText([JSON.parse(content)]);
}

export default { processFeed };
