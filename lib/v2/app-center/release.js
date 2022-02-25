const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');
const MarkdownIt = require('markdown-it');

module.exports = async (ctx) => {
    const user = ctx.params.user;
    const app = ctx.params.app;
    const distribution_group = ctx.params.distribution_group;

    const baseUrl = 'https://install.appcenter.ms/api/v0.1/apps';
    const apiUrl = `${baseUrl}/${user}/${app}/distribution_groups/${distribution_group}`;
    const releasesListUrl = `${apiUrl}/public_releases?scope=tester`;
    // const releaseUrl = `${apiUrl}/releases/${release_id}?is_install_page=true`;
    const link = `https://install.appcenter.ms/users/${user}/apps/${app}/distribution_groups/${distribution_group}`;

    const response = await got(releasesListUrl);
    let items = response.data.map((item) => ({
        // item:
        // {
        //     "id": 504,
        //     "short_version": "8.5.0.0",
        //     "version": "18558",
        //     "origin": "appcenter",
        //     "uploaded_at": "2022-02-02T11:36:06.044Z",
        //     "mandatory_update": false,
        //     "enabled": true,
        //     "is_external_build": false
        // }

        pubDate: parseDate(item.uploaded_at),
        link: `${apiUrl}/releases/${item.id}?is_install_page=true`,
    }));

    // Release info examples:
    // Android: https://install.appcenter.ms/api/v0.1/apps/rafalense-70ux/plus-release/distribution_groups/public/releases/42?is_install_page=true
    // iOS: https://install.appcenter.ms/api/v0.1/apps/gameonline/baitomobile/distribution_groups/baito/releases/26?is_install_page=true
    // Windows: https://install.appcenter.ms/api/v0.1/apps/remitano/remitano-windows/distribution_groups/beta/releases/5?is_install_page=true
    // macOS: https://install.appcenter.ms/api/v0.1/apps/rdmacios-k2vy/microsoft-remote-desktop-for-mac/distribution_groups/all-users-of-microsoft-remote-desktop-for-mac/releases/635?is_install_page=true

    const md = new MarkdownIt();
    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const releaseResponse = await got(item.link);
                const releaseInfo = releaseResponse.data;

                const userName = releaseInfo.owner.display_name;
                const appOS = releaseInfo.app_os;
                const shortVersion = releaseInfo.short_version; // will be an empty string for Windows
                const versionCode = releaseInfo.version;
                const isExternalBuild = releaseInfo.is_external_build;
                const isMandatoryUpdate = releaseInfo.mandatory_update;
                // const isLatest = releaseInfo.is_latest;  // this is not representing the latest release, but the latest version of a certain release
                const sizeInMBytes = (releaseInfo.size / (1024 * 1024)).toFixed(2);
                const releaseDate = releaseInfo.uploaded_at; // use original text here because it is already an ISO 8601 time
                const fingerprint = releaseInfo.fingerprint;
                const minOS = releaseInfo.min_os; // `null` for Windows
                const androidMinApiLevel = releaseInfo.android_min_api_level; // only for Android
                const deviceFamily = releaseInfo.device_family; // only for iOS, `null` for others
                const bundleId = releaseInfo.bundle_identifier; // can be a hash or a package name
                const releaseNotes = releaseInfo.release_notes; // markdown, can be an empty string
                const downloadUrl = releaseInfo.download_url;
                const installUrl = releaseInfo.install_url;
                const fileExtension = releaseInfo.fileExtension;

                // workaround: cache feed title and icon
                const appName = releaseInfo.app_display_name;
                const distributionGroupId = releaseInfo.distribution_group_id;
                const distributionGroupName = releaseInfo.distribution_groups.filter((group) => group.id === distributionGroupId)[0].display_name;
                item._feed_title = `${appName} (${distributionGroupName}) for ${appOS} by ${userName} - App Center Releases`;
                item._feed_icon = releaseInfo.app_icon_url;

                const version = shortVersion && versionCode ? `${shortVersion} (${versionCode})` : shortVersion || versionCode;

                item.title =
                    `${appName}: ` +
                    (isMandatoryUpdate ? '[Mandatory]' : '') +
                    // + (isLatest ? "[Latest]" : "")
                    (isExternalBuild ? '[External Build]' : '') +
                    `Version ${version}`;
                item.link = link; // replace the link with the release page
                item.author = userName;
                item.description = art(
                    path.join(__dirname, 'templates/description.art'),
                    {
                        releaseDate,
                        sizeInMBytes,
                        minOS,
                        deviceFamily,
                        androidMinApiLevel,
                        bundleId,
                        downloadUrl,
                        installUrl,
                        fingerprint,
                        appOS,
                        fileExtension,
                        releaseNotes: releaseNotes && md.render(releaseNotes),
                    },
                    { minimize: true }
                );
                item.guid = fingerprint;

                return item;
            })
        )
    );

    const icon = items && items[0]._feed_icon; // if it is an empty feed, would not raise an error here
    const title = items && items[0]._feed_title;

    ctx.state.data = {
        title,
        link,
        description: title,
        image: icon,
        item: items,
    };
};
