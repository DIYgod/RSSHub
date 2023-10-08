module.exports = {
    'ppy.sh': {
        _name: 'osu!',
        osu: [
            {
                title: 'Beatmap Pack',
                docs: 'https://docs.rsshub.app/routes/game#osu-beatmap-packs',
                source: '/beatmaps/packs',
                target: (params, url) => `https://osu.ppy.sh/beatmaps/packs?type=${new URL(url).searchParams.get('type') ?? 'standard'}`,
            },
        ],
    },
};
