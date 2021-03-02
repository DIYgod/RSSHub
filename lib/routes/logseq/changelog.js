const got = require('@/utils/got');

module.exports = async (ctx) => {
    const rootUrl = 'https://logseq.com';
    const currentUrl = `${rootUrl}/blog/changelog`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const data = response.data.split('<p class="footer">')[0];

    const list = [],
        versionsIndices = [];
    const versions = data.match(
        /<div class="block"><div id=""><span class="page-reference"><a class="page-ref" href="[a-z]{3}%20\d+[a-z]{2}%2C%20\d{4}">[a-zA-Z]{3} \d+[a-z]{2}, \d{4}<\/a><\/span><\/div><p><b>Version \d\.\d\.\d\.\d/g
    );

    for (const version of versions) {
        versionsIndices.push(data.indexOf(version));
    }

    for (let i = 0; i < versionsIndices.length; i++) {
        list.push(data.slice(versionsIndices[i], versionsIndices[i + 1]));
    }

    const items = list.map((item, index) => {
        const version = versions[index];
        return {
            link: currentUrl,
            description: item,
            title: version.match(/Version \d\.\d\.\d\.\d/)[0],
            pubDate: new Date(version.match(/[a-zA-Z]{3} \d+[a-z]{2}, \d{4}/)[0].replace(/st|nd|rd|th/, '')).toUTCString(),
        };
    });

    ctx.state.data = {
        title: 'Changelog - Logseq',
        link: currentUrl,
        item: items,
    };
};
