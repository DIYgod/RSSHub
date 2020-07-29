const got = require('@/utils/got');
const utils = require('./utils');
const config = require('@/config').value;
const mastodonConfig = config.mastodon;

module.exports = async (ctx) => {
    const getAccountIdByAcct = async (acct) => {
        if (!(mastodonConfig.apiHost && mastodonConfig.accessToken && mastodonConfig.acctDomain)) {
            throw 'this route require api configuration, please check <a href="https://docs.rsshub.app/en/install/#configuration">documentation</a>';
        }

        const site = mastodonConfig.apiHost;

        const search_url = `http://${site}/api/v2/search`;
        const cacheUid = `mastodon_acct_id/${site}/${acct}`;

        return await ctx.cache.tryGet(cacheUid, async () => {
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
    };

    const acct = ctx.params.acct;
    const only_media = ctx.params.only_media ? true : false;

    const site = mastodonConfig.apiHost;
    const account_id = await getAccountIdByAcct(acct);

    const statuses_url = `http://${site}/api/v1/accounts/${account_id}/statuses`;
    const statuses_response = await got({
        method: 'get',
        url: statuses_url,
    });
    let data = statuses_response.data;

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

    if (only_media === true) {
        data = data.filter((item) => item.media_attachments.length !== 0);
    }

    ctx.state.data = {
        title: `${account_data.display_name} (@${account_data.acct})`,
        link: `${account_data.url}`,
        description: `${account_data.note}`,
        item: utils.ProcessFeed(data),
        allowEmpty: true,
    };
};
