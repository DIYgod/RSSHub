const { MeiliSearch } = require('meilisearch');

module.exports = async ({ core }, host, apiKey) => {
    const client = new MeiliSearch({
        host,
        apiKey,
    });
    core.info('Updating displayed attributes');
    const displayed = await client
        .index('rsshub')
        .updateDisplayedAttributes([
            'hierarchy_radio_lvl1',
            'hierarchy_radio_lvl2',
            'hierarchy_radio_lvl3',
            'hierarchy_radio_lvl4',
            'hierarchy_radio_lvl5',
            'hierarchy_lvl0',
            'hierarchy_lvl1',
            'hierarchy_lvl2',
            'hierarchy_lvl3',
            'hierarchy_lvl4',
            'hierarchy_lvl5',
            'hierarchy_lvl6',
            'anchor',
            'url',
            'content',
        ]);
    core.info(displayed);

    core.info('Updating searchable attributes');
    const searchable = await client
        .index('rsshub')
        .updateSearchableAttributes([
            'hierarchy_radio_lvl1',
            'hierarchy_radio_lvl2',
            'hierarchy_radio_lvl3',
            'hierarchy_radio_lvl4',
            'hierarchy_radio_lvl5',
            'hierarchy_lvl0',
            'hierarchy_lvl1',
            'hierarchy_lvl2',
            'hierarchy_lvl3',
            'hierarchy_lvl4',
            'hierarchy_lvl5',
            'hierarchy_lvl6',
            'anchor',
            'content',
        ]);
    core.info(searchable);

    core.info('Updating sortable attributes');
    const sortable = await client.index('rsshub').updateSortableAttributes(['anchor']);
    core.info(sortable);
};
