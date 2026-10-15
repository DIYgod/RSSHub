import { parseDate } from '@/utils/parse-date';

import { renderGoods } from './templates/goods';

const parseModule = (floors, moduleKey) => floors.find((floor) => floor.module_key === moduleKey);

const parseGoodsDate = (value) => {
    if (!['number', 'string'].includes(typeof value) || (typeof value === 'string' && !value.trim())) {
        return;
    }
    const timestamp = Number(value);
    if (!Number.isFinite(timestamp)) {
        return;
    }
    const date = parseDate(timestamp * 1000);
    return Number.isFinite(date.getTime()) ? date : undefined;
};

const parseFloorItem = (floor) =>
    floor.data.items.map((item) => {
        const i = item.item;
        return {
            title: i.name,
            link: i.jump_url,
            guid: `xiaomiyoupin:${i.gid}`,
            description: renderGoods(i),
            pubDate: parseGoodsDate(i.start || i.start_time)?.getTime(),
        };
    });

export { parseFloorItem, parseGoodsDate, parseModule };
