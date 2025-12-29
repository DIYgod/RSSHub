import { renderGoods } from './templates/goods';

const parseModule = (floors, module_key) => floors.find((floor) => floor.module_key === module_key);

const parseFloorItem = (floor) =>
    floor.data.items.map((item) => {
        const i = item.item;
        return {
            title: i.name,
            link: i.jump_url,
            guid: `xiaomiyoupin:${i.gid}`,
            description: renderGoods(i),
            pubDate: (i.start || i.start_time) * 1000,
        };
    });

export { parseFloorItem, parseModule };
