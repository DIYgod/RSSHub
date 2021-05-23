const got = require('@/utils/got');

module.exports = {
    getPatchnameFromID: async (ctx, id) => {
        const key = 'patchwork-kernel-org-patchname-from-id-' + id;
        let name = await ctx.cache.get(key);
        if (!name) {
            const patchDetail = await got({
                method: 'get',
                url: `https://patchwork.kernel.org/api/patches/${id}/`,
            });
            name = patchDetail.data.name;
            ctx.cache.set(key, name);
        }
        return name;
    },
};
