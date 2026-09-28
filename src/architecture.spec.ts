/**
 * Architecture test: enforces the clean-architecture dependency rule on every source file.
 *
 *   presentation → application → domain ← infrastructure
 *
 * - domain:         only other domain code; no third-party packages
 * - application:    domain + application; no infrastructure / presentation / third-party packages
 * - infrastructure: anything but presentation
 * - presentation:   anything but infrastructure
 * - shared never imports from modules; a module never imports another module
 */
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

type Layer = 'domain' | 'application' | 'infrastructure' | 'presentation';

const SRC = dirname(fileURLToPath(import.meta.url));
const LAYERS: Layer[] = ['domain', 'application', 'infrastructure', 'presentation'];

const forbiddenLayers: Record<Layer, Layer[]> = {
	domain: ['application', 'infrastructure', 'presentation'],
	application: ['infrastructure', 'presentation'],
	infrastructure: ['presentation'],
	presentation: ['infrastructure'],
};

/** Layers that must stay framework-free: relative imports only, no packages. */
const pureLayers: Layer[] = ['domain', 'application'];

const layerOf = (path: string): Layer | undefined =>
	LAYERS.find((layer) => path.split('/').includes(layer));

/** `modules/<name>` or `shared` */
const areaOf = (path: string): string | undefined => {
	const parts = path.split('/');
	const i = parts.indexOf('modules');

	if (i >= 0) {
		return `modules/${parts[i + 1]}`;
	}

	return parts.includes('shared') ? 'shared' : undefined;
};

const isModule = (area: string | undefined): area is string => !!area?.startsWith('modules/');

function packageProblems(fromLayer: Layer | undefined, specifier: string): string[] {
	return fromLayer && pureLayers.includes(fromLayer)
		? [`${fromLayer} must not import package '${specifier}'`]
		: [];
}

function layerProblems(from: string, target: string): string[] {
	const fromLayer = layerOf(from);
	const toLayer = layerOf(target);

	return fromLayer && toLayer && forbiddenLayers[fromLayer].includes(toLayer)
		? [`${fromLayer} must not import ${toLayer} (${target})`]
		: [];
}

function areaProblems(from: string, target: string): string[] {
	const fromArea = areaOf(from);
	const toArea = areaOf(target);

	if (!isModule(toArea) || fromArea === toArea) {
		return [];
	}

	return fromArea === 'shared' || isModule(fromArea)
		? [`${fromArea} must not import ${toArea}`]
		: [];
}

/** Returns a description of each rule `specifier` breaks when imported from `file` (src-relative). */
export function checkImport(file: string, specifier: string): string[] {
	if (!specifier.startsWith('.')) {
		return packageProblems(layerOf(file), specifier);
	}

	const target = relative(SRC, resolve(join(SRC, dirname(file)), specifier));

	return [...layerProblems(file, target), ...areaProblems(file, target)];
}

const isChecked = (path: string) =>
	path.endsWith('.ts') &&
	!path.endsWith('.spec.ts') &&
	!path.includes('/testing/') &&
	!path.includes('/generated/');

function sourceFiles(dir = SRC): string[] {
	return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		const path = join(dir, entry.name);

		return entry.isDirectory() ? sourceFiles(path) : isChecked(path) ? [relative(SRC, path)] : [];
	});
}

const IMPORT = /^\s*(?:import|export)\b[^'"]*?from\s+'([^']+)'/gm;

const importsOf = (file: string) =>
	[...readFileSync(join(SRC, file), 'utf8').matchAll(IMPORT)].map((match) => match[1] ?? '');

describe('architecture', () => {
	it('should find source files in every layer', () => {
		const layers = new Set(sourceFiles().map(layerOf));

		expect([...layers]).toEqual(expect.arrayContaining(LAYERS));
	});

	it('should respect the dependency rule in every source file', () => {
		const violations = sourceFiles().flatMap((file) =>
			importsOf(file).flatMap((specifier) =>
				checkImport(file, specifier).map((problem) => `${file}: ${problem}`),
			),
		);

		expect(violations).toEqual([]);
	});

	describe('checkImport', () => {
		it.each([
			['modules/a/domain/x.ts', '../application/y.js', 'domain must not import application'],
			['modules/a/domain/x.ts', 'zod', "domain must not import package 'zod'"],
			[
				'modules/a/application/x.ts',
				'../../../shared/presentation/y.js',
				'application must not import presentation',
			],
			[
				'modules/a/application/x.ts',
				'../infrastructure/y.js',
				'application must not import infrastructure',
			],
			[
				'modules/a/presentation/http/x.ts',
				'../../infrastructure/y.js',
				'presentation must not import infrastructure',
			],
			[
				'modules/a/infrastructure/x.ts',
				'../presentation/y.js',
				'infrastructure must not import presentation',
			],
			['shared/domain/x.ts', '../../modules/a/domain/y.js', 'shared must not import modules/a'],
			['modules/a/domain/x.ts', '../../b/domain/y.js', 'modules/a must not import modules/b'],
		])('should flag %s importing %s', (file, specifier, problem) => {
			expect(checkImport(file, specifier).join('; ')).toContain(problem);
		});

		it.each([
			['modules/a/application/x.ts', '../domain/y.js'],
			['modules/a/application/x.ts', '../../../shared/domain/y.js'],
			['modules/a/infrastructure/x.ts', '../domain/y.js'],
			['modules/a/presentation/http/x.ts', '../../application/y.js'],
			['modules/a/presentation/http/x.ts', 'express'],
			['modules/a/index.ts', './infrastructure/y.js'],
		])('should allow %s importing %s', (file, specifier) => {
			expect(checkImport(file, specifier)).toEqual([]);
		});
	});
});
