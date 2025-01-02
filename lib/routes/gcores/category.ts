import InvalidParameterError from '@/errors/types/invalid-parameter';
import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';

export const route: Route = {
    path: '/category/:category',
    categories: ['new-media', 'popular'],
    example: '/gcores/category/news',
    parameters: { category: '分类名' },
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
            source: ['gcores.com/:category'],
        },
    ],
    name: '分类',
    maintainers: ['MoguCloud', 'StevenRCE0'],
    handler,
    description: `| 资讯 | 视频   | 电台   | 文章     |
  | ---- | ------ | ------ | -------- |
  | news | videos | radios | articles |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category');
    const url = `https://www.gcores.com/${category}`;
    const res = await got({
        method: 'get',
        url,
    });
    const data = res.data;
    const $ = load(data);
    const feedTitle = $('title').text();

    let list =
        category === 'news'
            ? $('a.news').map(function () {
                  const item = {
                      url: $(this).attr('href'),
                      title: $(this).find('.news_content>h3').text(),
                  };
                  return item;
              })
            : $('.original.am_card.original-normal').map(function () {
                  const item = {
                      url: $(this).find('.am_card_inner>a').attr('href'),
                      title: $(this).find('h3.am_card_title').text(),
                      category: $(this).find('span.original_category>a').text(),
                  };
                  return item;
              });
    list = list.get();

    if (list.length > 0 && list.every((item) => item.url === undefined)) {
        throw new InvalidParameterError('Article URL not found! Please submit an issue on GitHub.');
    }

    const out = await Promise.all(
        list.map((item) => {
            const articleUrl = `https://www.gcores.com${item.url}`;

            return cache.tryGet(articleUrl, async () => {
                const itemRes = await got({
                    method: 'get',
                    url: articleUrl,
                });

                const itemPage = itemRes.data;
                const $ = load(itemPage);

                const articleRaw = await got(`https://www.gcores.com/gapi/v1${item.url}?include=media,category,user`);
                const articleData = articleRaw.data.data;
                const articleMeta = articleRaw.data.included.find((i) => i.type === 'users' && i.id === articleData.relationships.user.data.id);
                const author = articleMeta.attributes.nickname;

                let cover;
                if (articleData.attributes.cover) {
                    cover = `<img src="https://image.gcores.com/${articleData.attributes.cover}" />`;
                } else if (articleData.attributes.thumb) {
                    cover = `<img src="https://image.gcores.com/${articleData.attributes.thumb}" />`;
                } else {
                    cover = '';
                }

                // replace figure with img
                const articleContent = JSON.parse(articleData.attributes.content);
                const entityRangeMap = {};
                for (const block of articleContent.blocks || []) {
                    if (block.entityRanges.length) {
                        entityRangeMap[block.key] = block.entityRanges;
                    }
                }

                $('figure').each((i, elem) => {
                    const keyAttr = elem.attribs['data-offset-key'];
                    const keyMatch = /^(\w+)-(\d+)-(\d)$/.exec(keyAttr);
                    let actualContent = '';
                    if (keyMatch) {
                        const [, key, index] = keyMatch;
                        if (entityRangeMap[key] && entityRangeMap[key][index]) {
                            const entityKey = entityRangeMap[key] && entityRangeMap[key][index].key;
                            const entity = articleContent.entityMap[entityKey];
                            actualContent = convertEntityToContent(entity);
                        }
                    }

                    if (actualContent) {
                        $(elem).replaceWith(actualContent);
                    }
                });

                // remove editor toolbar img
                $('.md-editor-toolbar').replaceWith('');
                // remove hidden tip block
                $('.story_hidden').replaceWith('');

                const content = $('.story.story-show').html();
                const basicItem = {
                    title: item.title,
                    description: cover + content,
                    link: articleUrl,
                    guid: articleUrl,
                    author,
                    pubDate: new Date(articleData.attributes['published-at']),
                };
                return category === 'news' ? basicItem : { ...basicItem, category: item.category };
            });
        })
    );
    return {
        title: feedTitle,
        link: url,
        item: out,
    };
}

function convertEntityToContent(entity) {
    const { type, data } = entity;
    switch (type) {
        case 'IMAGE':
            return `
<figure>
<img src="https://image.gcores.com/${data.path}" alt="${data.caption || ''}">
${data.caption ? `<figcaption>${data.caption}</figcaption>` : ''}
</figure>`;

        case 'GALLERY':
            return data.images
                .map(
                    (image, i, arr) => `
<figure>
<img src="https://image.gcores.com/${image.path}" alt="${image.caption || ''}">
<figcaption>${data.caption || ''} (${i + 1}/${arr.length}) ${image.caption || ''}</figcaption>
</figure>
            `
                )
                .join('');

        default:
            return '';
    }
}
