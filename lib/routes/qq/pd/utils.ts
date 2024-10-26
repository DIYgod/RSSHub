// Description: QQ PD utils

import { Feed, FeedImage, FeedPattern, FeedFontProps, FeedPatternData } from './types';

const patternTypeMap = {
    1: 'text',
    2: 'emoji',
    5: 'link',
    6: 'image',
    9: 'newline',
};

const textAlignmentMap = {
    0: 'left',
    1: 'center',
    2: 'right',
};

function parseText(text: string, props: FeedFontProps | undefined): string {
    if (props === undefined) {
        return text;
    }
    let style = '';
    if (props.fontWeight === 700) {
        style += 'font-weight: bold;';
    }
    if (props.italic) {
        style += 'font-style: italic;';
    }
    if (props.underline) {
        style += 'text-decoration: underline;';
    }
    if (style === '') {
        return text;
    }
    return `<span style="${style}">${text}</span>`;
}

function parseDataItem(item: FeedPatternData, texts: string[], images: { [id: string]: FeedImage }): string {
    let imageId = '';
    switch (patternTypeMap[item.type] || undefined) {
        case 'text':
            return parseText(texts.shift() ?? '', item.props);
        case 'newline':
            texts.shift();
            return '<br />';
        case 'link':
            return `<a href="${item.href ?? '#'}" target="_blank">${item.desc ?? ''}</a>`;
        case 'image':
            imageId = item.fileId || item.taskId || '';
            return `<img src="${images[imageId].picUrl}" style="max-width: 100%; width: ${images[imageId].width}px;"><br />`;
        default:
            return '';
    }
}

function parseArticle(feed: Feed, texts: string[], images: { [id: string]: FeedImage }): string {
    let result = '';
    if (feed.patternInfo === undefined || feed.patternInfo === null || feed.patternInfo === '') {
        feed.patternInfo = '[]';
    }
    const patterns: FeedPattern[] = JSON.parse(feed.patternInfo);
    for (const pattern of patterns) {
        if (pattern.props === undefined) {
            continue;
        }
        const textAlign = pattern.props.textAlignment || 0;
        result += '<p style="text-align: ' + textAlignmentMap[textAlign] + ';">';
        for (const item of pattern.data) {
            result += parseDataItem(item, texts, images);
        }
        result += '</p>';
    }
    return result;
}

function parsePost(feed: Feed, texts: string[], images: { [id: string]: FeedImage }): string {
    for (const content of feed.contents.contents) {
        if (content.text_content) {
            texts.push(content.text_content.text);
        }
    }
    let result = '';
    for (const text of texts) {
        result += text;
    }
    for (const image of Object.values(images)) {
        result += '<p style="text-align: center">';
        result += `<img src="${image.picUrl}" style="max-width: 100%; width: ${image.width}px;">`;
        result += '</p>';
    }
    return result;
}

export function parseFeed(feed: Feed): string {
    const texts: string[] = [];
    const images: { [id: string]: FeedImage } = {};
    for (const content of feed.contents.contents) {
        if (content.text_content) {
            texts.push(content.text_content.text);
        }
    }
    for (const image of feed.images) {
        images[image.picId] = {
            picId: image.picId,
            picUrl: image.picUrl,
            width: image.width,
            height: image.height,
        };
    }
    if (feed.feed_type === 1) {
        // post: text and attachments
        return parsePost(feed, texts, images);
    } else if (feed.feed_type === 2) {
        // article: pattern info
        return parseArticle(feed, texts, images);
    }
    return '';
}
