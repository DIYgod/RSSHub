const ProcessFeed = (data) => {
    let description = '';

    const genFigure = (source) => `<figure>
        <img src="${source.cdnUrl}" alt="${source.caption}">
        <figcaption>${source.caption}</figcaption>
        </figure><br>`;

    let hasBold = false;

    for (const b of data.blocks) {
        switch (b.blockType) {
            case 'summary':
                description += `<blockquote>${b.summary.join('<br>')}</blockquote>`;
                break;
            case 'text':
                for (const t of b.htmlTokens) {
                    for (const tt of t) {
                        switch (tt.type) {
                            case 'text':
                                if (hasBold) {
                                    hasBold = false;
                                    description += `${tt.content}</p>`;
                                } else {
                                    description += `<p>${tt.content}</p>`;
                                }
                                break;
                            case 'boldText':
                                description = description.slice(0, -4);
                                description += `<b>${tt.content}</b>`;
                                hasBold = true;
                                break;

                            default:
                                break;
                        }
                    }
                }
                break;
            case 'image':
                description += genFigure(b.image);
                break;

            case 'gallery':
                for (const t of b.images) {
                    description += genFigure(t);
                }
                break;

            default:
                break;
        }
    }
    return {
        title: data.title,
        link: data.publishUrl,
        author: data.authors[0].publishName,
        description,
        pubDate: new Date(data.publishTime * 1000).toUTCString(),
    };
};

export default {
    ProcessFeed,
};
