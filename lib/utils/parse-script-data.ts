import { type AnyNode, parse } from 'acorn';

type DataValue = string | number | boolean | null | undefined | DataValue[] | DataObject | ScriptDataError;
type DataObject = { [key: string]: DataValue };
type Scope = { values: DataObject; parent?: Scope };
type Reference = { object: DataObject | DataValue[]; key: string };

const globalNames = new Set(['window', 'globalThis', 'self']);
const unsafeKeys = new Set(['__proto__', 'prototype', 'constructor']);
const maxScriptLength = 2_000_000;
const maxSteps = 1e5;
const maxDepth = 100;

class ScriptDataError extends Error {}
class UnsafePropertyError extends ScriptDataError {}

const propertyKey = (value: unknown): string => {
    if (typeof value !== 'string' && typeof value !== 'number') {
        throw new ScriptDataError('Script data property keys must be strings or numbers');
    }
    const key = String(value);
    if (unsafeKeys.has(key)) {
        throw new UnsafePropertyError(`Unsafe script data property: ${key}`);
    }
    return key;
};

const staticPath = (node: AnyNode): string[] => {
    if (node.type === 'Identifier') {
        return [propertyKey(node.name)];
    }
    if (node.type === 'MemberExpression' && !node.optional) {
        const key = !node.computed && node.property.type === 'Identifier' ? node.property.name : node.property.type === 'Literal' ? node.property.value : undefined;
        return [...staticPath(node.object), propertyKey(key)];
    }
    throw new ScriptDataError('Script data targets must be static property paths');
};

const normalizePath = (path: string[]) => (globalNames.has(path[0]) ? path.slice(1) : path);

const targetPath = (target: string): string[] => {
    const program = parse(target, { ecmaVersion: 'latest' });
    if (program.body.length !== 1 || program.body[0].type !== 'ExpressionStatement') {
        throw new ScriptDataError('Script data targets must be a single static property path');
    }
    const path = normalizePath(staticPath(program.body[0].expression));
    if (!path.length) {
        throw new ScriptDataError('Script data targets must name a property');
    }
    return path;
};

const isObject = (value: DataValue): value is DataObject | DataValue[] => typeof value === 'object' && value !== null && !(value instanceof ScriptDataError);

const readProperty = (object: DataValue, key: string): DataValue => {
    if (object instanceof ScriptDataError) {
        throw object;
    }
    if (!isObject(object)) {
        throw new ScriptDataError('Cannot read a property of non-object script data');
    }
    return Object.hasOwn(object, key) ? (object as DataObject)[key] : undefined;
};

/** Reads serialized data with a limited AST vocabulary; it never executes JavaScript. */
class ScriptDataReader {
    private root: Scope = { values: Object.create(null) };
    private steps = 0;
    private poisonedAssignments = new WeakSet<AnyNode>();
    private captured = false;
    private callbackValue: DataValue;

    constructor(
        private target: string[],
        private argumentIndex?: number
    ) {}

    private step(depth: number) {
        if (++this.steps > maxSteps || depth > maxDepth) {
            throw new UnsafePropertyError('Script data exceeds the parsing complexity limit');
        }
    }

    private identifier(name: string, scope: Scope): DataValue {
        propertyKey(name);
        for (let current: Scope | undefined = scope; current; current = current.parent) {
            if (Object.hasOwn(current.values, name)) {
                const value = current.values[name];
                if (value instanceof ScriptDataError) {
                    throw value;
                }
                return value;
            }
        }
        if (globalNames.has(name)) {
            return this.root.values;
        }
        if (name === 'undefined') {
            return undefined;
        }
        throw new ScriptDataError(`Unknown script data variable: ${name}`);
    }

    private reference(node: AnyNode, scope: Scope, depth: number): Reference {
        if (node.type === 'Identifier') {
            const key = propertyKey(node.name);
            if (globalNames.has(key)) {
                throw new ScriptDataError('Cannot replace script data global aliases');
            }
            let current = scope;
            while (current.parent && !Object.hasOwn(current.values, key)) {
                current = current.parent;
            }
            return { object: current.values, key };
        }
        if (node.type !== 'MemberExpression' || node.optional) {
            throw new ScriptDataError('Unsupported script data assignment target');
        }
        const object = this.evaluate(node.object, scope, depth + 1);
        const key = propertyKey(!node.computed && node.property.type === 'Identifier' ? node.property.name : this.evaluate(node.property, scope, depth + 1));
        if (!isObject(object)) {
            throw new ScriptDataError('Cannot assign a property of non-object script data');
        }
        if (Array.isArray(object) && (!/^(?:0|[1-9]\d*)$/.test(key) || Number(key) >= maxSteps)) {
            throw new ScriptDataError('Script data arrays require bounded numeric indexes');
        }
        return { object, key };
    }

    private evaluate(node: AnyNode, scope: Scope, depth: number): DataValue {
        this.step(depth);
        switch (node.type) {
            case 'Literal':
                if (node.regex || node.bigint) {
                    break;
                }
                return node.value as string | number | boolean | null;
            case 'Identifier':
                return this.identifier(node.name, scope);
            case 'ArrayExpression':
                return node.elements.map((element) => (element ? this.evaluate(element, scope, depth + 1) : undefined));
            case 'ObjectExpression': {
                const value: DataObject = Object.create(null);
                for (const property of node.properties) {
                    if (property.type !== 'Property' || property.kind !== 'init' || property.method) {
                        throw new ScriptDataError('Only ordinary script data object properties are supported');
                    }
                    const key = propertyKey(!property.computed && property.key.type === 'Identifier' ? property.key.name : this.evaluate(property.key, scope, depth + 1));
                    value[key] = this.evaluate(property.value, scope, depth + 1);
                }
                return value;
            }
            case 'MemberExpression': {
                const key = propertyKey(!node.computed && node.property.type === 'Identifier' ? node.property.name : this.evaluate(node.property, scope, depth + 1));
                return readProperty(this.evaluate(node.object, scope, depth + 1), key);
            }
            case 'UnaryExpression': {
                const value = this.evaluate(node.argument, scope, depth + 1);
                if (node.operator === 'void') {
                    return undefined;
                }
                if (node.operator === '!') {
                    return !value;
                }
                if (typeof value === 'number' && (node.operator === '-' || node.operator === '+')) {
                    return node.operator === '-' ? -value : value;
                }
                break;
            }
            case 'LogicalExpression': {
                const left = this.evaluate(node.left, scope, depth + 1);
                if ((node.operator === '||' && left) || (node.operator === '&&' && !left) || (node.operator === '??' && left !== undefined && left !== null)) {
                    return left;
                }
                return this.evaluate(node.right, scope, depth + 1);
            }
            case 'AssignmentExpression': {
                const { object, key } = this.reference(node.left, scope, depth + 1);
                try {
                    if (node.operator !== '=') {
                        throw new ScriptDataError('Only simple script data assignments are supported');
                    }
                    const value = this.evaluate(node.right, scope, depth + 1);
                    (object as DataObject)[key] = value;
                    return value;
                } catch (error) {
                    if (error instanceof ScriptDataError) {
                        (object as DataObject)[key] = error;
                        this.poisonedAssignments.add(node);
                    }
                    throw error;
                }
            }
            case 'SequenceExpression': {
                let value: DataValue;
                for (const expression of node.expressions) {
                    value = this.evaluate(expression, scope, depth + 1);
                }
                return value;
            }
            case 'CallExpression': {
                if (this.argumentIndex !== undefined && this.matchesCallback(node.callee)) {
                    this.captured = false;
                    this.callbackValue = undefined;
                    const args = node.arguments.map((argument) => this.evaluate(argument, scope, depth + 1));
                    if (this.argumentIndex >= args.length) {
                        throw new ScriptDataError('Script data callback is missing its data argument');
                    }
                    this.callbackValue = args[this.argumentIndex];
                    this.captured = true;
                    return undefined;
                }
                const fn = node.callee;
                if ((fn.type !== 'FunctionExpression' && fn.type !== 'ArrowFunctionExpression') || fn.async || fn.generator) {
                    break;
                }
                const args = node.arguments.map((argument) => this.evaluate(argument, scope, depth + 1));
                const local: Scope = { values: Object.create(null), parent: scope };
                for (const [index, parameter] of fn.params.entries()) {
                    if (parameter.type !== 'Identifier' || globalNames.has(parameter.name)) {
                        throw new ScriptDataError('Script data IIFEs require simple parameters');
                    }
                    const key = propertyKey(parameter.name);
                    local.values[key] = args[index];
                }
                return fn.body.type === 'BlockStatement' ? this.statements(fn.body.body, local, depth + 1, true)?.value : this.evaluate(fn.body, local, depth + 1);
            }
            default:
                break;
        }
        throw new ScriptDataError(`Unsupported script data expression: ${node.type}`);
    }

    private matchesCallback(node: AnyNode): boolean {
        try {
            const path = normalizePath(staticPath(node));
            return path.length === this.target.length && path.every((key, index) => key === this.target[index]);
        } catch (error) {
            if (error instanceof UnsafePropertyError) {
                throw error;
            }
            return false;
        }
    }

    private isCallbackGuard(node: AnyNode): boolean {
        if (this.argumentIndex === undefined || node.type !== 'IfStatement' || node.alternate || node.test.type !== 'UnaryExpression' || node.test.operator !== '!') {
            return false;
        }
        const consequent = node.consequent.type === 'BlockStatement' && node.consequent.body.length === 1 ? node.consequent.body[0] : node.consequent;
        if (consequent.type !== 'ReturnStatement' || consequent.argument) {
            return false;
        }
        const path = normalizePath(staticPath(node.test.argument));
        return path.length > 0 && path.length < this.target.length && path.every((key, index) => key === this.target[index]);
    }

    private referencesKnownData(node: AnyNode, scope: Scope, depth: number): boolean {
        this.step(depth);
        if (node.type === 'Identifier' || node.type === 'MemberExpression') {
            try {
                const path = staticPath(node);
                let value = this.identifier(path[0], scope);
                for (const key of path.slice(1)) {
                    if (!isObject(value) || !Object.hasOwn(value, key)) {
                        return value !== this.root.values;
                    }
                    value = readProperty(value, key);
                }
                return true;
            } catch (error) {
                if (error instanceof UnsafePropertyError) {
                    throw error;
                }
                if (node.type === 'Identifier') {
                    return false;
                }
            }
        }
        return Object.values(node).some((value) => {
            const children = Array.isArray(value) ? value : [value];
            return children.some((child) => child && typeof child === 'object' && typeof child.type === 'string' && this.referencesKnownData(child, scope, depth + 1));
        });
    }

    private statements(nodes: AnyNode[], scope: Scope, depth: number, strict: boolean): { value: DataValue } | undefined {
        for (const node of nodes) {
            this.step(depth);
            try {
                switch (node.type) {
                    case 'VariableDeclaration':
                        for (const declaration of node.declarations) {
                            if (declaration.id.type !== 'Identifier' || globalNames.has(declaration.id.name)) {
                                throw new ScriptDataError('Script data declarations require simple variable names');
                            }
                            const key = propertyKey(declaration.id.name);
                            try {
                                if (declaration.init || !Object.hasOwn(scope.values, key)) {
                                    scope.values[key] = declaration.init ? this.evaluate(declaration.init, scope, depth + 1) : undefined;
                                }
                            } catch (error) {
                                if (strict || !(error instanceof ScriptDataError) || error instanceof UnsafePropertyError || (declaration.init && this.referencesKnownData(declaration.init, scope, depth + 1))) {
                                    throw error;
                                }
                                scope.values[key] = error;
                            }
                        }
                        break;
                    case 'ExpressionStatement':
                        this.evaluate(node.expression, scope, depth + 1);
                        break;
                    case 'ReturnStatement':
                        return { value: node.argument ? this.evaluate(node.argument, scope, depth + 1) : undefined };
                    case 'EmptyStatement':
                        break;
                    default:
                        if (!this.isCallbackGuard(node)) {
                            throw new ScriptDataError(`Unsupported script data statement: ${node.type}`);
                        }
                }
            } catch (error) {
                // Ignore unrelated top-level application code; serializer IIFEs must be entirely supported.
                if (strict || !(error instanceof ScriptDataError) || error instanceof UnsafePropertyError) {
                    throw error;
                }
                // Failed simple assignments already poison their destination. Other unsupported code
                // must not silently leave stale data when it references a known serialized value.
                const isPoisonedAssignment =
                    node.type === 'ExpressionStatement' && node.expression.type === 'AssignmentExpression' && this.poisonedAssignments.has(node.expression) && !this.referencesKnownData(node.expression.right, scope, depth + 1);
                if (!isPoisonedAssignment && this.referencesKnownData(node, scope, depth + 1)) {
                    throw error;
                }
            }
        }
        return undefined;
    }

    private validate(value: DataValue, ancestors = new Set<DataValue>(), depth = 0): void {
        this.step(depth);
        if (value instanceof ScriptDataError) {
            throw value;
        }
        if (isObject(value)) {
            if (ancestors.has(value)) {
                throw new ScriptDataError('Cyclic script data is not supported');
            }
            ancestors.add(value);
            for (const child of Object.values(value)) {
                this.validate(child, ancestors, depth + 1);
            }
            ancestors.delete(value);
        }
    }

    read(source: string): DataValue {
        if (source.length > maxScriptLength) {
            throw new ScriptDataError('Script data source exceeds the size limit');
        }
        this.statements(parse(source, { ecmaVersion: 'latest' }).body, this.root, 0, false);
        let value: DataValue = this.root.values;
        if (this.argumentIndex === undefined) {
            for (const key of this.target) {
                if (!isObject(value) || !Object.hasOwn(value, key)) {
                    if (value instanceof ScriptDataError) {
                        throw value;
                    }
                    throw new ScriptDataError('Script data target was not found');
                }
                value = readProperty(value, key);
            }
        } else {
            if (!this.captured) {
                throw new ScriptDataError('Script data callback was not found or could not be parsed');
            }
            value = this.callbackValue;
        }
        this.validate(value);
        return value;
    }
}

export const parseScriptData = <T = unknown>(source: string, target: string): T => new ScriptDataReader(targetPath(target)).read(source) as T;

/** Extracts a serialized callback argument without invoking the callback or any external function. */
export const parseScriptCallback = <T = unknown>(source: string, callbackPath: string, argumentIndex = 2): T => {
    if (!Number.isSafeInteger(argumentIndex) || argumentIndex < 0) {
        throw new ScriptDataError('Script data callback argument index must be a non-negative integer');
    }
    return new ScriptDataReader(targetPath(callbackPath), argumentIndex).read(source) as T;
};
