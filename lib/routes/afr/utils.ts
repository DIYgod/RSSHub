import { load } from 'cheerio';
import type { Node } from 'oxc-parser';

import { evaluateScriptData } from '@/utils/evaluate-script';
import ofetch from '@/utils/ofetch';
import { parseScriptSource } from '@/utils/parse-js';

const getProperty = (node: Node | undefined, name: string): Node | undefined => {
    if (node?.type !== 'ObjectExpression') {
        return undefined;
    }
    const property = node.properties.find(
        (property) => property.type === 'Property' && !property.computed && ((property.key.type === 'Literal' && property.key.value === name) || (property.key.type === 'Identifier' && property.key.name === name))
    );
    return property?.type === 'Property' ? property.value : undefined;
};

const getContent = async (source: string) => {
    const { program, errors } = await parseScriptSource(source);
    const assignment = program.body.find(
        (statement) => statement.type === 'ExpressionStatement' && statement.expression.type === 'AssignmentExpression' && statement.expression.left.type === 'Identifier' && statement.expression.left.name === '__REDUX_STATE__'
    );
    const content = assignment?.type === 'ExpressionStatement' && assignment.expression.type === 'AssignmentExpression' ? getProperty(getProperty(assignment.expression.right, 'page'), 'content') : undefined;
    if (errors.length || !content) {
        throw new Error('Article data could not be found in the AFR page.');
    }
    return evaluateScriptData<{ assetType: string; asset: any }>(`content=${source.slice(content.start, content.end)}`, 'content');
};

export const getItem = async (item) => {
    const response = await ofetch(item.link);
    const $ = load(response);

    const content = await getContent($('script#__REDUX_STATE__').text());
    const asset = content.asset;

    switch (content.assetType) {
        case 'liveArticle':
            item.description = asset.posts.map((post) => `<h2>${post.asset.headlines.headline}</h2>${post.asset.body}`).join('');
            break;

        case 'article':
        case 'featureArticle':
            item.description = renderArticle(asset, item.link);
            break;

        case 'video': {
            const video = $('video[data-account][data-player][data-video-id]').first();
            const account = video.attr('data-account');
            const player = video.attr('data-player');
            const videoId = video.attr('data-video-id');
            const description = $('<div>');
            if (asset.about || asset.intro) {
                description.append($('<p>').text(asset.about || asset.intro));
            }
            if (account && player && videoId) {
                const embed = new URL(`https://players.brightcove.net/${account}/${player}_${video.attr('data-embed') || 'default'}/index.html`);
                embed.searchParams.set('videoId', videoId);
                description.append($('<iframe>').attr('src', embed.href).attr('allowfullscreen', ''));
            } else {
                description.append($('<a>').attr('href', item.link).text('Watch this video on AFR'));
            }
            item.description = description.html();
            break;
        }

        default:
            throw new Error(`Unknown asset type: ${content.assetType} in ${item.link}`);
    }

    return item;
};

const renderArticle = (asset, link: string) => {
    const $ = load(asset.body, null, false);
    $('x-placeholder').each((_, el) => {
        const $el = $(el);
        const id = $el.attr('id');
        if (!id) {
            $el.replaceWith('');
            return;
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

            case 'omny':
                $el.replaceWith(`<iframe src="${placeholder.data.src}" allowfullscreen></iframe>`);
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

            case 'youtube': {
                const videoId = new URL(placeholder.data.url).searchParams.get('v');
                $el.replaceWith(videoId ? `<iframe src="https://www.youtube.com/embed/${videoId}" allowfullscreen></iframe>` : `<a href="${placeholder.data.url}">Watch on YouTube</a>`);
                break;
            }

            case 'video':
                $el.replaceWith(`<a href="${link}">Watch this video on AFR</a>`);
                break;

            default:
                throw new Error(`Unknown placeholder type: ${placeholder?.type} in ${link}`);
        }
    });

    return $.html();
};
