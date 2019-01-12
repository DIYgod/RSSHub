const axios = require('../../utils/axios');

module.exports = {
    getPatchnameFromID: async (ctx, id) => {
        const key = 'patchwork-kernel-org-patchname-from-id-' + id;
        let name = await ctx.cache.get(key);
        if (!name) {
            const patchDetail = await axios({
                method: 'get',
                url: `https://patchwork.kernel.org/api/patches/${id}/`,
            });
            name = patchDetail.data.name;
            ctx.cache.set(key, name, 24 * 60 * 60);
        }
        return name;
    },
};
