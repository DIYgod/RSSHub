import { z } from 'zod';

// Article

const ArticleSchema = z.object({
    title: z.string(),
    url: z.string(),
    date: z.number(),
});

export const ArticleResponseSchema = z.object({
    articles: z.array(ArticleSchema),
});

export type Article = z.infer<typeof ArticleSchema>;

// Option

const GkmlptCategorySchema = z.object({
    id: z.string(),
    title: z.string(),
});

export type GkmlptCategory = z.infer<typeof GkmlptCategorySchema>;
