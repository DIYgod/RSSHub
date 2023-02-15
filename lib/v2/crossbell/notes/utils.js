module.exports = {
    getItem: (note) => ({
        title: note.metadata?.content?.title || '',
        description: note.metadata?.content?.content,
        link: note.metadata?.content?.external_urls || `https://crossbell.io/notes/${note.characterId}-${note.noteId}`,
        pubDate: note.metadata?.content?.publishedAt,
        updated: note.metadata?.content?.updatedAt,
        author: note.metadata?.content?.authors?.[0] || note.character?.metadata?.content?.name || note.character?.handle,
        guid: `${note.characterId}-${note.noteId}`,
        category: [...(note.metadata?.content?.sources || []), ...(note.metadata?.content?.tags || [])],
    }),
};
