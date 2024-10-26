// Description: QQ PD utils

// feed: feed info
// - feed_type: 1-post, 2-article

// feed.contents.contents: list of text content
// - text_content.text: text content

// feed.images: list of image info
// - picId: image id
// - picUrl: image url
// - width: image width
// - height: image height

// feed.patternInfo: list of JSON string of pattern
// - props.textAlignment: 0-left, 1-center, 2-right
// - data.type: 1-text, 2-emoji, 5-link, 6-image, 9-newline
// - data.props.fontWeight: 400-normal, 700-bold
// - data.props.italic: false-normal, true-italic
// - data.props.underline: false-normal, true-underline

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

function parseText(text: string, props: any): string {
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

function parseDataItem(item: any, texts: string[], images: any): string {
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
            imageId = item.fileId || item.taskId;
            return `<img src="${images[imageId].picUrl}" style="max-width: 100%; width: ${images[imageId].width}px;"><br />`;
        default:
            return '';
    }
}

function parseArticle(feed: any, texts: string[], images: any): string {
    let result = '';
    if (feed.patternInfo === undefined || feed.patternInfo === null || feed.patternInfo === '') {
        feed.patternInfo = '[]';
    }
    const patterns = JSON.parse(feed.patternInfo);
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

function parsePost(feed: any, texts: string[], images: any): string {
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
        result += `<img src="${(image as any).picUrl}" style="max-width: 100%; width: ${(image as any).width}px;">`;
        result += '</p>';
    }
    return result;
}

export function parseFeed(feed: any): any {
    const texts: string[] = [];
    const images = {};
    for (const content of feed.contents.contents) {
        if (content.text_content) {
            texts.push(content.text_content.text);
        }
    }
    for (const image of feed.images) {
        images[image.picId] = {
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
