const ProcessFeed = (data) =>
    data.map((item) => {
        const content = item.content
            ? item.content
                  .replace(/<span.*?>|<\/span.*?>/gm, '')
                  .replace(/<(?:.|\n)*?>/gm, '\n')
                  .split('\n')
                  .filter((s) => s !== '')[0]
            : '';

        const media = item.media_attachments
            .map((item) => {
                switch (item.type) {
                    case 'gifv':
                        return `<br><video src="${item.url}" autoplay loop>GIF</video>`;
                    case 'video':
                        return `<br><video src="${item.url}" controls loop>Video</video>`;
                    case 'image':
                        return `<br><img src="${item.url}">`;
                    default:
                        return '';
                }
            })
            .join('');

        let author, link, titleAuthor;
        if (item.reblog !== null) {
            author = `${item.reblog.account.display_name} (@${item.reblog.account.acct})`;
            link = item.reblog.url;
            titleAuthor = `Re @${item.reblog.account.username}`;
        } else {
            author = `${item.account.display_name} (@${item.account.acct})`;
            link = item.url;
            titleAuthor = `@${item.account.username}`;
        }
        const titleText = item.sentitive === true ? `(CW) ${item.spoiler_text}` : content;

        return {
            title: `${titleAuthor}: "${titleText}"`,
            author: author,
            description: content + media,
            pubDate: new Date(item.created_at).toUTCString(),
            link: link,
            guid: item.uri,
        };
    });

module.exports = {
    ProcessFeed: ProcessFeed,
};
