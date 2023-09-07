module.exports = {
    '': ['TonyRL'],
    '/': ['TonyRL'],
    '/:type?': ['TonyRL'], // /info and /report
    '/:type/:id+': ['TonyRL'], // /category/:id+ and /topic/:id
    '/category/:id+': ['TonyRL'],
    '/info': ['TonyRL'],
    '/report': ['TonyRL'],
    '/topic/:id': ['TonyRL'],
};
