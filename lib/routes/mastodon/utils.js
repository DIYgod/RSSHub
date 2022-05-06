const got = require('@/utils/got');

const parseStatuses = (data) =>
    data.map((item) => {
        const content = item.content ? item.content.replace(/<span.*?>|<\/span.*?>/gm, '') : '';
        const contentRemovedHtml = content.replace(/<(?:.|\n)*?>/gm, '\n');

        const mediaParse = (media_attachments) =>
            media_attachments
                .map((item) => {
                    const selectedUrl = item.remote_url ? item.remote_url : item.url;
                    const description = item.description ? item.description : '';
                    switch (item.type) {
                        case 'gifv':
                            return `<br><video src="${selectedUrl}" autoplay loop>gif ${description}</video>`;
                        case 'video':
                            return `<br><video src="${selectedUrl}" controls loop>video ${description}</video>`;
                        case 'image':
                            return `<br><img src="${selectedUrl}" alt="image ${description}">`;
                        case 'audio':
                            return `<br><audio controls src="${selectedUrl}">audio ${description}</audio>`;
                        case 'unknown':
                        default:
                            return `<br><a href="${selectedUrl}">media ${description}</a>`;
                    }
                })
                .join('');

        let author, link, titleAuthor, media;
        if (item.reblog !== null) {
            author = `${item.reblog.account.display_name} (@${item.reblog.account.acct})`;
            link = item.reblog.url;
            titleAuthor = `Re @${item.reblog.account.username}`;
            media = mediaParse(item.reblog.media_attachments);
        } else {
            author = `${item.account.display_name} (@${item.account.acct})`;
            link = item.url;
            titleAuthor = `@${item.account.username}`;
            media = mediaParse(item.media_attachments);
        }
        const titleText = item.sensitive === true ? `(CW) ${item.spoiler_text}` : contentRemovedHtml;

        return {
            title: `${titleAuthor}: "${titleText}"`,
            author,
            description: item.spoiler_text + '<hr />' + content + media,
            pubDate: new Date(item.created_at).toUTCString(),
            link,
            guid: item.uri,
        };
    });

async function getAccountStatuses(site, account_id, only_media) {
    const statuses_url = `http://${site}/api/v1/accounts/${account_id}/statuses?only_media=${only_media}`;
    const statuses_response = await got({
        method: 'get',
        url: statuses_url,
    });
    const data = statuses_response.data;

    let account_data;
    if (data.length !== 0 && data[0].account !== null) {
        account_data = data[0].account;
    } else {
        const account_url = `http://${site}/api/v1/accounts/${account_id}`;
        const account_response = await got({
            method: 'get',
            url: account_url,
        });
        account_data = account_response.data;
    }

    return { account_data, data };
}

async function getAccountIdByAcct(acct, ctx) {
    const config = require('@/config').value;
    const mastodonConfig = config.mastodon;

    if (!(mastodonConfig.apiHost && mastodonConfig.accessToken && mastodonConfig.acctDomain)) {
        throw 'this route require api configuration, please check <a href="https://docs.rsshub.app/en/install/#configuration">documentation</a>';
    }

    const site = mastodonConfig.apiHost;

    const search_url = `http://${site}/api/v2/search`;
    const cacheUid = `mastodon_acct_id/${site}/${acct}`;

    const account_id = await ctx.cache.tryGet(cacheUid, async () => {
        const search_response = await got({
            method: 'get',
            url: search_url,
            headers: {
                Authorization: `Bearer ${mastodonConfig.accessToken}`,
            },
            searchParams: {
                q: acct,
                type: 'accounts',
            },
        });
        const [acctUser, acctHost] = acct.split('@').filter((e) => e);
        let acctOnServer;

        if (acctHost) {
            if (acctHost === mastodonConfig.acctDomain) {
                acctOnServer = acctUser;
            } else {
                acctOnServer = acctUser + '@' + acctHost;
            }
        } else {
            acctOnServer = acctUser;
        }

        const accountData = search_response.data.accounts.filter((item) => item.acct === acctOnServer);

        if (accountData.length === 0) {
            throw `acct ${acct} not found`;
        }
        return accountData[0].id;
    });
    return { site, account_id };
}

module.exports = {
    parseStatuses,
    getAccountStatuses,
    getAccountIdByAcct,
};
