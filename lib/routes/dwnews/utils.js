const ProcessFeed = (data) => {
    let description = '';

    const genFigure = (source) => `<figure>
        <img src="${source.cdnUrl}" alt="${source.caption}">
        <figcaption>${source.caption}</figcaption>
        </figure><br>`;

    let hasBold = false;

    data.blocks.forEach((b) => {
        switch (b.blockType) {
            case 'summary':
                description += `<blockquote>${b.summary.join('<br>')}</blockquote>`;
                break;
            case 'text':
                b.htmlTokens.forEach((t) => {
                    t.forEach((tt) => {
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
                    });
                });
                break;
            case 'image':
                description += genFigure(b.image);
                break;

            case 'gallery':
                b.images.forEach((t) => {
                    description += genFigure(t);
                });
                break;

            default:
                break;
        }
    });
    return {
        title: data.title,
        link: data.publishUrl,
        author: data.authors[0].publishName,
        description,
        pubDate: new Date(data.publishTime * 1000).toUTCString(),
    };
};

module.exports = {
    ProcessFeed,
};
