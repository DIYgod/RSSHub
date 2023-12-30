const { art } = require('@/utils/render');
const { parseDate } = require('@/utils/parse-date');
const path = require('path');

const allowSiteList = ['misskey.io', 'madost.one', 'mk.nixnet.social'];

// docs on: https://misskey-hub.net/docs/api/entity/note.html
const parseNotes = (data, site) =>
    data.map((item) => {
        const host = item.user.host === null ? site : item.user.host;
        const author = `${item.user.name} (@${item.user.username}@${host})`;
        const description = art(path.join(__dirname, 'templates/note.art'), {
            text: item.text,
            files: item.files,
        });
        const title = `${author}: "${description}"`;
        const link = `https://${host}/notes/${item.id}`;
        const pubDate = parseDate(item.createdAt);
        return {
            title,
            description,
            pubDate,
            link,
            author,
        };
    });

module.exports = {
    parseNotes,
    allowSiteList,
};
