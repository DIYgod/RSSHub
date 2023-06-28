/* refer to: ./tag.js (author: @StevenREC0) */
const got = require('@/utils/got');

module.exports = async (ctx) => {
    // get params
    const { collection } = ctx.params;

    // feed info
    const baseUrl = `https://www.gcores.com/gapi/v1/collections/${collection}`;
    const baseRes = await got(baseUrl);
    const feedTitle = baseRes.data.data.attributes.title;
    const feedUrl = `https://www.gcores.com/collections/${collection}`;

    // resolve articles
    const dataUrl = `${baseUrl}/articles?sort=-published-at`;
    const res = await got(dataUrl);
    const list = res.data.data;

    const items = list.map((item) => {
        const articleUrl = `https://www.gcores.com/${item.type}/${item.id}`;
        return ctx.cache.tryGet(articleUrl, () => {
            let cover = '';
            if (item.attributes.cover) {
                cover = `<img src="https://image.gcores.com/${item.attributes.cover}" />`;
            } else if (item.attributes.thumb) {
                cover = `<img src="https://image.gcores.com/${item.attributes.thumb}" />`;
            }

            const contentBlocks = JSON.parse(item.attributes.content);
            const { blocks, entityMap } = contentBlocks;

            function wrapInlineTag(strArr, startIdx, endIdx, preString, sufString) {
                if (startIdx === endIdx - 1) {
                    strArr[startIdx] = `${preString}${strArr[startIdx]}${sufString}`;
                } else {
                    strArr[startIdx] = `${preString}${strArr[startIdx]}`;
                    strArr[endIdx - 1] = `${strArr[endIdx - 1]}${sufString}`;
                }
            }

            function convertBlockToContent(block) {
                const { type, text, entityRanges, inlineStyleRanges } = block;
                let formattedText = text;
                if (entityRanges.length || inlineStyleRanges.length) {
                    // split string and insert HTML tag
                    const strArr = text.split('');
                    let isMedia = false;
                    if (entityRanges.length) {
                        entityRanges.forEach((entityRange) => {
                            const { key, offset, length } = entityRange;
                            const startIdx = offset,
                                endIdx = offset + length;
                            const { data, type } = entityMap[key];
                            switch (type) {
                                case 'LINK':
                                    wrapInlineTag(strArr, startIdx, endIdx, `<a href="${data.url || data.href}" target="${data.target || '_blank'}">`, `</a>`);
                                    break;
                                case 'IMAGE':
                                    formattedText = `<figure><img src="https://image.gcores.com/${data.path}" width="${data.width}" height="${data.height}"/>${data.caption ? `<figcaption>${data.caption}</figcaption>` : ''}</figure>`;
                                    isMedia = true;
                                    break;
                                case 'EMBED':
                                    formattedText = `<figure>${data.content}${data.caption ? `<figcaption>${data.caption}</figcaption>` : ''}</figure>`;
                                    isMedia = true;
                                    break;
                                case 'GALLERY':
                                    formattedText = `<figure>${data.images.map((image) => `<div><img src="https://image.gcores.com/${image.path}" width="${image.width}" height="${image.height}"/></div>`).join('')}</figure>`;
                                    isMedia = true;
                                    break;
                                default:
                                    break;
                            }
                        });
                    }
                    if (inlineStyleRanges.length) {
                        inlineStyleRanges.forEach((inlineStyleRange) => {
                            const { style, offset, length } = inlineStyleRange;
                            const startIdx = offset,
                                endIdx = offset + length;
                            switch (style) {
                                case 'BOLD':
                                    wrapInlineTag(strArr, startIdx, endIdx, `<b>`, `</b>`);
                                    break;
                                case 'UNDERLINE':
                                    wrapInlineTag(strArr, startIdx, endIdx, `<span style="text-decoration:underline">`, `</span>`);
                                    break;
                                case 'ITALIC':
                                    wrapInlineTag(strArr, startIdx, endIdx, `<i>`, `</i>`);
                                    break;
                                default:
                                    break;
                            }
                        });
                    }
                    formattedText = isMedia ? formattedText : strArr.join('');
                }

                /* 未兼容列表，仅展示为段落，有兴趣可以补全：unordered-list-item、ordered-list-item */
                switch (type) {
                    case 'unstyled':
                        return `<p>${formattedText}</p>`;
                    case 'header-one':
                        return `<h1>${formattedText}</h1>`;
                    case 'header-two':
                        return `<h2>${formattedText}</h2>`;
                    case 'header-three':
                        return `<h3>${formattedText}</h3>`;
                    case 'header-four':
                        return `<h4>${formattedText}</h4>`;
                    case 'header-five':
                        return `<h5>${formattedText}</h5>`;
                    case 'header-six':
                        return `<h6>${formattedText}</h6>`;
                    case 'atomic':
                        return formattedText;
                    default:
                        return `<p>${formattedText}</p>`;
                }
            }
            const content = blocks.map((block) => convertBlockToContent(block));

            return {
                title: item.attributes.title,
                description: cover + content.join(''),
                link: articleUrl,
            };
        });
    });

    // return data
    ctx.state.data = {
        title: feedTitle,
        link: feedUrl,
        item: items,
    };
};
