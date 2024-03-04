// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { config } from '@/config';

const allowSiteList = ['mastodon.social', 'pawoo.net', config.mastodon.apiHost];

const apiHeaders = (site) => {
    const { accessToken, apiHost } = config.mastodon;
    // avoid sending API token to other sites
    return accessToken && site === apiHost ? { Authorization: `Bearer ${accessToken}` } : {};
};

const mediaParse = (media_attachments) =>
    media_attachments
        .map((item) => {
            const selectedUrl = item.remote_url ?? item.url;
            const description = item.description ?? '';
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

const parseStatuses = (data) =>
    data.map((item) => {
        // docs on: https://docs.joinmastodon.org/entities/status/

        const accountRepostedBy = item.reblog ? item.account : null;
        item = item.reblog ?? item;

        const content = item.content ? item.content.replaceAll(/<span.*?>|<\/span.*?>/gm, '') : '';
        const contentRemovedHtml = content.replaceAll(/<(?:.|\n)*?>/gm, '\n');

        const author = `${item.account.display_name} (@${item.account.acct})`;
        const link = item.url;
        const media = mediaParse(item.media_attachments);

        const titleAuthor = accountRepostedBy ? `Re @${accountRepostedBy.username}` : `@${item.account.username}`;
        const titleText = item.sensitive === true ? `(CW) ${item.spoiler_text}` : contentRemovedHtml;
        const title = `${titleAuthor}: "${titleText}"`;

        return {
            title,
            author,
            description: item.spoiler_text + '<hr />' + content + media,
            pubDate: parseDate(item.created_at),
            link,
            guid: item.uri,
        };
    });

async function getAccountStatuses(site, account_id, only_media) {
    const statuses_url = `https://${site}/api/v1/accounts/${account_id}/statuses?only_media=${only_media}`;
    const statuses_response = await got({
        method: 'get',
        url: statuses_url,
        headers: apiHeaders(site),
    });
    const data = statuses_response.data;

    let account_data;
    if (data.length !== 0 && data[0].account !== null) {
        account_data = data[0].account;
    } else {
        const account_url = `https://${site}/api/v1/accounts/${account_id}`;
        const account_response = await got({
            method: 'get',
            url: account_url,
            headers: apiHeaders(site),
        });
        account_data = account_response.data;
    }

    return { account_data, data };
}

async function getAccountIdByAcct(acct) {
    const mastodonConfig = config.mastodon;

    // acctHost is from the acct param of the request, and acctDomain is from either acctHost or the config
    const acctHost = acct.split('@').filter(Boolean)[1];
    const site = mastodonConfig.apiHost || acctHost;
    const acctDomain = mastodonConfig.acctDomain || acctHost;
    if (!(site && acctDomain)) {
        throw new Error('Mastodon RSS is disabled due to the lack of <a href="https://docs.rsshub.app/en/install/#configuration-route-specific-configurations">relevant config</a>');
    }

    const search_url = `https://${site}/api/v2/search`;
    const cacheUid = `mastodon_acct_id/${site}/${acct}`;

    const account_id = await cache.tryGet(cacheUid, async () => {
        const search_response = await got({
            method: 'get',
            url: search_url,
            headers: apiHeaders(site),
            searchParams: {
                q: acct,
                type: 'accounts',
            },
        });
        const [acctUser, acctHost] = acct.split('@').filter(Boolean);
        let acctOnServer;

        if (acctHost) {
            acctOnServer = acctHost === acctDomain ? acctUser : acctUser + '@' + acctHost;
        } else {
            acctOnServer = acctUser;
        }

        const accountData = search_response.data.accounts.filter((item) => item.acct === acctOnServer);

        if (accountData.length === 0) {
            throw new Error(`acct ${acct} not found`);
        }
        return accountData[0].id;
    });
    return { site, account_id };
}

module.exports = {
    apiHeaders,
    parseStatuses,
    getAccountStatuses,
    getAccountIdByAcct,
    allowSiteList,
};
