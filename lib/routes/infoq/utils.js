const got = require('@/utils/got');

const ProcessFeed = async (list, cache) => {
    const detailUrl = 'https://www.infoq.cn/public/v1/article/getDetail';

    const items = await Promise.all(
        list.map(async (e) => {
            const uuid = e.uuid;
            const single = await cache.tryGet(uuid, async () => {
                const link = `https://www.infoq.cn/article/${uuid}`;
                const resp = await got({
                    method: 'post',
                    url: detailUrl,
                    headers: {
                        Referer: link,
                    },
                    json: {
                        uuid: uuid,
                    },
                });

                const data = resp.data.data;
                const author = data.author ? data.author.map((p) => p.nickname).join(',') : data.no_author;
                const pubDate = new Date();
                pubDate.setTime(data.publish_time);

                return {
                    title: data.article_title,
                    description: parseContent(data.content),
                    pubDate,
                    author: author,
                    link,
                };
            });

            return Promise.resolve(single);
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
            text: () => i.text,
            heading: () => {
                if (i.content) {
                    const level = i.attrs.level;
                    const text = parseToSimpleText(i.content);
                    return `<h${level}>${text}</h${level}>`;
                } else {
                    return '';
                }
            },
            blockquote: () => {
                const text = parseToSimpleText(i.content);
                return `<blockquote>${text}</blockquote>`;
            },
            image: () => {
                const img = i.attrs.src;
                return `<img src="${img}"></img>`;
            },
            codeblock: () => {
                const lang = i.attrs.lang;
                const code = parseToSimpleText(i.content);
                return `<code lang="${lang}">${code}</code>`;
            },
            link: () => {
                const href = i.attrs.href;
                const text = parseToSimpleText(i.content);
                return `<a href="${href}">${text}</a>"`;
            },
        };

        if (i.type in funcMaps) {
            return funcMaps[i.type]();
        }

        if (!i.content) {
            return '';
        }

        return parseToSimpleText(i.content);
    });

function parseContent(content) {
    const isRichContent = content.startsWith(`{"`);
    if (!isRichContent) {
        return content;
    }

    return parseToSimpleText([JSON.parse(content)]);
}

module.exports = {
    ProcessFeed,
};
