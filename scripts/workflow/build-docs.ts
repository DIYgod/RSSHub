import fs from 'node:fs';
import path from 'node:path';

import { config } from '../../lib/config';
import { namespaces } from '../../lib/registry';
import { getCurrentPath } from '../../lib/utils/helpers';
import { categories } from './data';

const fullTests = await (await fetch('https://cdn.jsdelivr.net/gh/DIYgod/RSSHub@gh-pages/build/test-full-routes.json')).json();
const testResult = fullTests.testResults[0].assertionResults;

const foloAnalysis = await (
    await fetch('https://raw.githubusercontent.com/RSSNext/rsshub-docs/refs/heads/main/rsshub-analytics.json', {
        headers: {
            'user-agent': config.trueUA,
        },
    })
).json();
const foloAnalysisResult = foloAnalysis.data as Record<string, { subscriptionCount: number; topFeeds: any[] }>;
const foloAnalysisTop100 = Object.entries(foloAnalysisResult)
    .sort((a, b) => b[1].subscriptionCount - a[1].subscriptionCount)
    .slice(0, 150);

const __dirname = getCurrentPath(import.meta.url);

// Build namespace-centric data structure
interface NamespaceData {
    name: string;
    url?: string;
    description?: string;
    zh?: {
        name?: string;
        description?: string;
    };
    categories: string[];
    heat: number;
    routes: Record<string, RouteData>;
}

interface RouteData {
    path: string | string[];
    name: string;
    url?: string;
    maintainers: string[];
    example: string;
    parameters?: Record<string, any>;
    description?: string;
    categories?: string[];
    features?: Record<string, any>;
    radar?: any[];
    view?: number;
    location?: string;
    heat: number;
    topFeeds: any[];
    zh?: {
        name?: string;
        description?: string;
        parameters?: Record<string, any>;
    };
    test?: {
        code: number;
        message?: string;
    };
}

const namespacesData: Record<string, NamespaceData> = {};

// First pass: build namespace data with all routes
for (const namespace in namespaces) {
    const nsData = namespaces[namespace];

    // Determine default category
    let defaultCategory = nsData.categories?.[0];
    if (!defaultCategory) {
        for (const routePath in nsData.routes) {
            if (nsData.routes[routePath].categories) {
                defaultCategory = nsData.routes[routePath].categories[0];
                break;
            }
        }
    }
    if (!defaultCategory) {
        defaultCategory = 'other';
    }

    // Collect all categories for this namespace
    const nsCategories = new Set<string>(nsData.categories || []);

    // Initialize namespace data
    namespacesData[namespace] = {
        name: nsData.name === 'Unknown' ? namespace : nsData.name,
        url: nsData.url,
        description: nsData.description,
        zh: nsData.zh
            ? {
                  name: nsData.zh.name,
                  description: nsData.zh.description,
              }
            : undefined,
        categories: [],
        heat: 0,
        routes: {},
    };

    // Process routes
    const processedPaths = new Set<string>();

    for (const routePath in nsData.routes) {
        const realPath = `/${namespace}${routePath}`;
        const routeData = nsData.routes[routePath];

        // Skip duplicate array paths
        if (Array.isArray(routeData.path)) {
            if (processedPaths.has(routeData.path[0])) {
                continue;
            }
            processedPaths.add(routeData.path[0]);
        }

        // Determine route categories
        const routeCategories = routeData.categories || nsData.categories || [defaultCategory];

        // Check if popular
        const isPopular = foloAnalysisTop100.some(([p]) => p === realPath);
        if (isPopular && !routeCategories.includes('popular')) {
            routeCategories.push('popular');
        }

        // Add categories to namespace
        for (const cat of routeCategories) {
            nsCategories.add(cat);
        }

        // Get test result
        const test = testResult.find((t) => t.title === realPath);
        const parsedTest = test
            ? {
                  code: test.status === 'passed' ? 0 : 1,
                  message: test.failureMessages?.[0],
              }
            : undefined;

        const heat = foloAnalysisResult[realPath]?.subscriptionCount || 0;

        // Build route data
        namespacesData[namespace].routes[realPath] = {
            path: routeData.path,
            name: routeData.name,
            url: routeData.url,
            maintainers: routeData.maintainers,
            example: routeData.example,
            parameters: routeData.parameters,
            description: routeData.description,
            categories: routeCategories,
            features: routeData.features,
            radar: routeData.radar,
            view: routeData.view,
            location: routeData.location,
            heat,
            topFeeds: foloAnalysisResult[realPath]?.topFeeds || [],
            zh: routeData.zh
                ? {
                      name: routeData.zh.name,
                      description: routeData.zh.description,
                      parameters: routeData.zh.parameters,
                  }
                : undefined,
            test: parsedTest,
        };

        namespacesData[namespace].heat += heat;
    }

    namespacesData[namespace].categories = [...nsCategories];
}

// Generate JSON output
fs.mkdirSync(path.join(__dirname, '../../assets/build/docs'), { recursive: true });
fs.writeFileSync(path.join(__dirname, '../../assets/build/docs/routes.json'), JSON.stringify(namespacesData, null, 2));

// Generate categories data
const categoriesData = categories.map((cat) => ({
    id: cat.link.replace('/routes/', ''),
    icon: cat.icon,
    en: cat.en,
    zh: cat.zh,
}));
fs.writeFileSync(path.join(__dirname, '../../assets/build/docs/categories.json'), JSON.stringify(categoriesData, null, 2));
