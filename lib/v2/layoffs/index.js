const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

const ROW_COUNT = 100;

const WEBSITE_URL = 'https://layoffs.fyi';
const SOURCE_URL = `https://airtable.com/v0.3/view/viwA14Z1pM69YIsaW/readSharedViewData?
stringifiedObjectParams=%7B%22shouldUseNestedResponseFormat%22%3Atrue%7D&
requestId=reqQcci3rVyhkcAyX&accessPolicy=%7B%22allowedActions%22%3A%5B%7B%22
modelClassName%22%3A%22view%22%2C%22modelIdSelector%22%3A%22viwA14Z1pM69YIsaW%22%2C%22
action%22%3A%22readSharedViewData%22%7D%2C%7B%22modelClassName%22%3A%22view%22%2C%22
modelIdSelector%22%3A%22viwA14Z1pM69YIsaW%22%2C%22action%22%3A%22getMetadataForPrinting
%22%7D%2C%7B%22modelClassName%22%3A%22view%22%2C%22modelIdSelector
%22%3A%22viwA14Z1pM69YIsaW%22%2C%22action%22%3A%22readSignedAttachmentUrls
%22%7D%2C%7B%22modelClassName%22%3A%22row%22%2C%22modelIdSelector%22%3A%22
rows%20*%5BdisplayedInView%3DviwA14Z1pM69YIsaW%5D%22%2C%22action%22%3A%22
createBoxDocumentSession%22%7D%2C%7B%22modelClassName%22%3A%22row%22%2C%22
modelIdSelector%22%3A%22rows%20*%5BdisplayedInView%3DviwA14Z1pM69YIsaW%5D%22%2C%22
action%22%3A%22createDocumentPreviewSession%22%7D%5D%2C%22shareId%22%3A%22shrqYt5kSqMzHV9R5%22%2C%22
applicationId%22%3A%22app1PaujS9zxVGUZ4%22%2C%22generationNumber%22%3A0%2C%22
expires%22%3A%222023-02-02T00%3A00%3A00.000Z%22%2C%22
signature%22%3A%22096478e17705ffdac261da07c5b4c025aff6d8c6d86be027533fd248913798de%22%7D`;

/**
 * getMapping can convert either an array or an object
 * of a specific structure into a Map, where the key is
 * the name and the value is the Id. It will only parse
 * entries with 'name' and 'id' in it
 *
 * Inputs:
 *   obj = [{name: 'Apple', id: 1}, {name: 'Peach', id: 2}]
 * Returns:
 *   [{1: 'Apple', 2: 'Peach'}, {Apple: 1, Peach: 2}]
 *
 * Inputs:
 *   obj = {Apple: {name: 'Apple', id: 1}, Peach: {name: 'Peach', id: 2}}
 * Returns:
 *   [{1: 'Apple', 2: 'Peach'}, {Apple: 1, Peach: 2}]
 */
const getMappings = function (obj) {
    const mapping = new Map();
    const reverseMapping = new Map();
    for (const key in obj) {
        if ('name' in obj[key] && 'id' in obj[key]) {
            reverseMapping.set(obj[key].name, obj[key].id);
            mapping.set(obj[key].id, obj[key].name);
        }
    }
    return [mapping, reverseMapping];
};

module.exports = async (ctx) => {
    const headers = {
        'x-airtable-application-id': 'app1PaujS9zxVGUZ4',
        'x-airtable-inter-service-client': 'webClient',
        'x-requested-with': 'XMLHttpRequest',
        'x-time-zone': 'America/Los_Angeles',
    };

    // Get data from data source
    const response = await got({
        method: 'get',
        url: SOURCE_URL,
        headers,
    });
    const data = response.data.data;
    const table = data.table;

    // Columns are represented by special IDs
    const columnReverseMapping = getMappings(table.columns)[1];

    const companyColumnId = columnReverseMapping.get('Company');
    const dateAddedColumnId = columnReverseMapping.get('Date Added');
    const numOfLaidOffColumnId = columnReverseMapping.get('# Laid Off');
    const sourceColumnId = columnReverseMapping.get('Source');
    const countryColumnId = columnReverseMapping.get('Country');
    const countryMapping = getMappings(table.columns.filter((col) => col.name === 'Country')[0].typeOptions.choices)[0];

    const rows = table.rows.slice(0, ROW_COUNT);
    ctx.state.data = {
        title: 'Tech layoff data feed from layoffs.fyi',
        link: WEBSITE_URL,
        description: 'This feed gets tech layoff data from layoffs.fyi and display them in a user friendly way',
        item: rows.map((row) => {
            const rowContent = row.cellValuesByColumnId;

            const company = rowContent[companyColumnId];
            const dateAdded = parseDate(rowContent[dateAddedColumnId]);
            const source = rowContent[sourceColumnId];
            const numOfLaidOff = rowContent[numOfLaidOffColumnId] === undefined ? 'some' : rowContent[numOfLaidOffColumnId];
            const country = countryMapping.get(rowContent[countryColumnId]);

            const title = `${company} Layoffs Happening!`;
            const description = `${company} lays off ${numOfLaidOff} employees in ${country}. For more details, please visit ${source}.`;

            return {
                title,
                description, // the article content
                pubDate: dateAdded, // Data publish date
                link: source, // Laid off source link
            };
        }),
    };
};
