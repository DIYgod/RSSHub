export default async (router, { createImport }) => {
    const imp = createImport(import.meta.url);
    router.get('/:do?/:keyword?', await imp('./index'));
};
