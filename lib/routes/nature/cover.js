// The content is generateed by undocumentated API of nature journals
// This router has **just** been tested in:
// nature:           Nature
// nbt:              Nature Biotechnology
// neuro:            Nature Neuroscience
// ng:               Nature Genetics
// ni:               Nature Immunology
// nmeth:            Nature Method
// nchem:            Nature Chemistry
// nmat:             Nature Materials
// natmachintell:    Nature Machine Intelligence
// ncb:              Nature Cell Biology
// nplants:          Nature Plants
// natastron:        Nature Astronomy
// nphys             Nature Physics

const got = require('@/utils/got');

module.exports = async (ctx) => {
    const baseURL = 'https://www.nature.com';
    const journalMap = new Map([
        ['nature', { id: '41586', name: 'Nature' }],
        ['nbt', { id: '41587', name: 'Nature Biotechnology' }],
        ['neuro', { id: '41593', name: 'Nature Neuroscience' }],
        ['ng', { id: '41588', name: 'Nature Genetics' }],
        ['ni', { id: '41590', name: 'Nature Immunology' }],
        ['nmeth', { id: '41592', name: 'Nature Methods' }],
        ['nchem', { id: '41590', name: 'Nature Chemistry' }],
        ['nmat', { id: '41563', name: 'Nature Material' }],
        ['natmachintell', { id: '42256', name: 'Nature Machine Intelligence' }],
        ['ncb', { id: '41556', name: 'Nature Cell Biology' }],
        ['nplants', { id: '41477', name: 'Nature Plants' }],
        ['natastron', { id: '41550', name: 'Nature Astronomy' }],
        ['nphys', { id: '41567', name: 'Nature Physics' }],
    ]);
    const journals = [...journalMap.keys()];
    const out = await Promise.all(
        journals.map(async (journal) => {
            // get the lastest volumn and issue id
            const pageURL = `${baseURL}/${journal}/current-issue`;
            const cookieData = await got
                .extend({
                    prefixUrl: 'https://idp.nature.com/authorize',
                    followRedirect: false,
                })
                .get(`?response_type=cookie&client_id=grover&redirect_uri=${encodeURI(pageURL)}`)
                .then((response) => response.headers['set-cookie'].join(' '));
            const issueURL = await got
                .extend({
                    prefixUrl: pageURL,
                    headers: {
                        cookie: cookieData,
                    },
                    followRedirect: false,
                })
                .get('')
                .then((response) => response.headers.location);
            const capturingRegex = /volumes\/(?<volumes>\d+)\/issues\/(?<issues>\d+)/;
            const { volumes, issues } = issueURL.match(capturingRegex).groups;

            const address = `${baseURL}${issueURL}`;
            const cache = await ctx.cache.get(address);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const imgSize = 600;

            const id = journalMap.get(journal).id;
            const imageURL = `https://media.springernature.com/w${imgSize}/springer-static/cover-hires/journal/${id}/${volumes}/${issues}?as=webp`;
            const contents = `<div align="center"><img src="${imageURL}" alt="Volume ${volumes} Issue ${issues}"></div>`;

            const single = {
                title: `${journalMap.get(journal).name} | Volume ${volumes} Issue ${issues}`,
                author: '@yech1990',
                description: contents,
                link: address,
                guid: address,
                pubDate: new Date().toUTCString(),
            };
            ctx.cache.set(address, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );
    ctx.state.data = {
        title: 'Nature Covers Story',
        description: 'Find out the cover story of some Nature journals.',
        link: baseURL,
        item: out,
    };
};
