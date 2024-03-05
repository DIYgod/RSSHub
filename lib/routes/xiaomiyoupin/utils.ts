// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import { art } from '@/utils/render';
import * as path from 'node:path';

const parseModule = (floors, module_key) => floors.find((floor) => floor.module_key === module_key);

const parseFloorItem = (floor) =>
    floor.data.items.map((item) => {
        const i = item.item;
        return {
            title: i.name,
            link: i.jump_url,
            guid: `xiaomiyoupin:${i.gid}`,
            description: art(path.join(__dirname, 'templates/goods.art'), i),
            pubDate: (i.start || i.start_time) * 1000,
        };
    });

module.exports = {
    parseModule,
    parseFloorItem,
};
