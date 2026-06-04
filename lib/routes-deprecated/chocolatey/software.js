const got = require('@/utils/got');
const cheerio = require('cheerio');

async function get_software_raw_html(link) {
    const response = await got({
        method: 'get',
        url: link,
    });
    return response.body;
}

function pick_versions(raw_html) {
    const $ = cheerio.load(raw_html);
    const items = [];
    $('#versionhistory table tbody tr').each((_row_index, row) => {
        const software = {};
        $('td', row).each((col_index, col) => {
            if ($(col).hasClass('version')) {
                const href = $('a', col).attr('href');
                let version = '';
                if (href) {
                    version = href.split('/').at(-1);
                }
                software.version = version;
            }
            if (col_index === 0) {
                software.software = $(col).text().trim();
            }
            if (col_index === 2) {
                software.time = $(col).text();
            }
        });
        items.push(software);
    });
    return items;
}

module.exports = async (ctx) => {
    const software_name = ctx.params.name;

    const software_link = `https://chocolatey.org/packages/${software_name}`;
    const raw = await get_software_raw_html(software_link);
    const items = pick_versions(raw);

    const rsshub_object = {
        title: software_name,
        link: software_link,
        item: items.map((i) => {
            const link = `https://chocolatey.org/packages/${software_name}/${i.version}`;
            const ret = { title: i.software, link, description: `update_time: ${i.time}` };
            return ret;
        }),
    };
    ctx.state.data = rsshub_object;
};
