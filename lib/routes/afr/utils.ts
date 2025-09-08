import * as cheerio from 'cheerio';
import ofetch from '@/utils/ofetch';

export const getItem = async (item) => {
    const response = await ofetch(item.link);
    const $ = cheerio.load(response);

    const reduxState = JSON.parse($('script#__REDUX_STATE__').text().replaceAll(':undefined', ':null').match('__REDUX_STATE__=(.*);')?.[1] || '{}');

    const content = reduxState.page.content;
    const asset = content.asset;

    switch (content.assetType) {
        case 'liveArticle':
            item.description = asset.posts.map((post) => `<h2>${post.asset.headlines.headline}</h2>${post.asset.body}`).join('');
            break;

        case 'article':
        case 'featureArticle':
            item.description = renderArticle(asset, item.link);
            break;

        default:
            throw new Error(`Unknown asset type: ${content.assetType} in ${item.link}`);
    }

    return item;
};

const renderArticle = (asset, link: string) => {
    const $ = cheerio.load(asset.body, null, false);
    $('x-placeholder').each((_, el) => {
        const $el = $(el);
        const id = $el.attr('id');
        if (!id) {
            $el.replaceWith('');
        }

        const placeholder = asset.bodyPlaceholders[id!];
        switch (placeholder?.type) {
            case 'callout':
            case 'relatedStory':
                $el.replaceWith('');
                break;

            case 'iframe':
                $el.replaceWith(`<iframe src="${placeholder.data.url}" frameborder="0" allowfullscreen></iframe>`);
                break;

            case 'image':
                $el.replaceWith(`<img src="https://static.ffx.io/images/${placeholder.data.fileName}" alt="${placeholder.data.altText}" />`);
                break;

            case 'linkArticle':
                $el.replaceWith(placeholder.data.text);
                break;

            case 'linkExternal':
                $el.replaceWith(`<a href="${placeholder.data.url}" target="_blank" rel="noopener">${placeholder.data.text}</a>`);
                break;

            case 'quote':
                $el.replaceWith(placeholder.data.markup);
                break;

            case 'scribd':
                $el.replaceWith(`<a href="${placeholder.data.url}" target="_blank" rel="noopener">View on Scribd</a>`);
                break;

            case 'twitter':
                $el.replaceWith(`<a href="${placeholder.data.url}">${placeholder.data.url}</a>`);
                break;

            default:
                throw new Error(`Unknown placeholder type: ${placeholder?.type} in ${link}`);
        }
    });

    return $.html();
};
