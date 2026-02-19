/**
 * ESLint 9 plugin to automatically mark NSFW routes with the nsfw flag
 */

const nsfwRoutes = [
    '141jav',
    '141ppv',
    '18comic',
    '2048',
    '7mmtv',
    '8kcos',
    '91porn',
    '95mm',
    'abskoop',
    'asiantolick',
    'asmr-200',
    'booru',
    'chikubi',
    'chub',
    'civitai',
    'cool18',
    'coomer',
    'copymanga',
    'cosplaytele',
    'dlsite',
    'e-hentai',
    'ehentai',
    'everia',
    'fanbox',
    'fansly',
    'fantia',
    'freexcomic',
    'furaffinity',
    'gelbooru',
    'hanime1',
    'iwara',
    'javbus',
    'javdb',
    'javlibrary',
    'javtiful',
    'javtrailers',
    'jpxgmn',
    'kemono',
    'kisskiss',
    'komiic',
    'konachan',
    'koyso',
    'laimanhua',
    'literotica',
    'mangadex',
    'manhuagui',
    'manyvids',
    'missav',
    'netflav',
    'nhentai',
    'olevod',
    'oreno3d',
    'patreon',
    'pixiv',
    'pornhub',
    'rawkuma',
    'sehuatang',
    'shuiguopai',
    'sis001',
    'skeb',
    'skebetter',
    'spankbang',
    't66y',
    'uraaka-joshi',
    'wnacg',
    'xbookcn',
    'xmanhua',
    'xsijishe',
    'yande',
    'zaimanhua',
    'zodgame',
    '4kup',
    'misskon',
    '4khd',
];

// 检查是否是 NSFW 路由文件
function isNsfwRoute(filePath) {
    const normalizedPath = filePath.replaceAll('\\', '/');
    return nsfwRoutes.some((nsfwKey) => {
        const routePattern = `/lib/routes/${nsfwKey}/`;
        return normalizedPath.includes(routePattern);
    });
}

export default {
    meta: {
        name: '@rsshub/nsfw-flag',
        version: '1.0.0',
    },
    configs: {
        recommended: {
            plugins: {
                '@rsshub/nsfw-flag': 'self',
            },
            rules: {
                '@rsshub/nsfw-flag/add-nsfw-flag': 'error',
            },
        },
    },
    rules: {
        'add-nsfw-flag': {
            meta: {
                type: 'problem',
                docs: {
                    description: 'Automatically add nsfw flag to NSFW routes',
                    category: 'Best Practices',
                    recommended: true,
                },
                fixable: 'code',
                schema: [],
                messages: {
                    missingNsfwFlag: 'NSFW route is missing the nsfw flag in features',
                },
            },
            create(context) {
                const filename = context.filename || context.getFilename();

                // 如果不是 NSFW 路由，跳过检查
                if (!isNsfwRoute(filename)) {
                    return {};
                }

                return {
                    ExportNamedDeclaration(node) {
                        // 查找 export const route: Route = {...}
                        if (
                            node.declaration &&
                            node.declaration.type === 'VariableDeclaration' &&
                            node.declaration.declarations &&
                            node.declaration.declarations[0] &&
                            node.declaration.declarations[0].id &&
                            node.declaration.declarations[0].id.name === 'route'
                        ) {
                            const routeDeclaration = node.declaration.declarations[0];
                            const routeObject = routeDeclaration.init;

                            if (routeObject && routeObject.type === 'ObjectExpression') {
                                let featuresProperty = null;
                                let nsfwProperty = null;

                                // 查找 features 属性
                                for (const prop of routeObject.properties) {
                                    if (prop.type === 'Property' && prop.key && prop.key.name === 'features') {
                                        featuresProperty = prop;

                                        // 在 features 中查找 nsfw 属性
                                        if (prop.value && prop.value.type === 'ObjectExpression') {
                                            for (const featureProp of prop.value.properties) {
                                                if (featureProp.type === 'Property' && featureProp.key && featureProp.key.name === 'nsfw') {
                                                    nsfwProperty = featureProp;
                                                    break;
                                                }
                                            }
                                        }
                                        break;
                                    }
                                }

                                // 检查是否需要添加或修复 nsfw 标志
                                if (!featuresProperty) {
                                    // 没有 features 属性，需要添加整个 features 对象
                                    context.report({
                                        node: routeObject,
                                        messageId: 'missingNsfwFlag',
                                        fix(fixer) {
                                            // 在对象的最后添加 features 属性
                                            const lastProperty = routeObject.properties.at(-1);

                                            return lastProperty
                                                ? fixer.insertTextAfter(lastProperty, ',\n    features: {\n        nsfw: true,\n    }')
                                                : // 空对象的情况
                                                  fixer.insertTextAfter(routeObject.properties.length > 0 ? routeObject.properties.at(-1) : routeObject, '\n    features: {\n        nsfw: true,\n    }\n');
                                        },
                                    });
                                } else if (!nsfwProperty) {
                                    // 有 features 属性但没有 nsfw 属性
                                    context.report({
                                        node: featuresProperty.value,
                                        messageId: 'missingNsfwFlag',
                                        fix(fixer) {
                                            const featuresObject = featuresProperty.value;
                                            if (featuresObject.properties.length > 0) {
                                                const lastFeatureProp = featuresObject.properties.at(-1);
                                                return fixer.insertTextAfter(lastFeatureProp, ',\n        nsfw: true');
                                            } else {
                                                // features 是空对象
                                                return fixer.replaceTextRange([featuresObject.range[0] + 1, featuresObject.range[1] - 1], '\n        nsfw: true,\n    ');
                                            }
                                        },
                                    });
                                } else if (nsfwProperty.value && (nsfwProperty.value.type !== 'Literal' || nsfwProperty.value.value !== true)) {
                                    // nsfw 属性存在但不是 true
                                    context.report({
                                        node: nsfwProperty.value,
                                        messageId: 'missingNsfwFlag',
                                        fix(fixer) {
                                            return fixer.replaceText(nsfwProperty.value, 'true');
                                        },
                                    });
                                }
                            }
                        }
                    },
                };
            },
        },
    },
};
