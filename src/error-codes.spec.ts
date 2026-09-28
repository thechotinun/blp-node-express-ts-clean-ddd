/**
 * Error-code check. Module codes live in `modules/<name>/domain/*.exception.ts` as an
 * exported `<Name>ErrorCode` table; blocks are reserved in src/error-codes.registry.ts;
 * generic codes live in shared `ErrorCodes`.
 *
 * Rules:
 * - no code is used twice across the whole system
 * - a module with codes must have a reserved block, and all its codes sit in it
 * - no two modules reserve the same block, and no reservation takes a shared block
 */
import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ErrorCodeRegistry } from './error-codes.registry.js';
import { ErrorCodes } from './shared/domain/exceptions/error-codes.constant.js';

interface ErrorCodeSources {
	/** generic codes from shared ErrorCodes */
	shared: number[];
	/** codes each module defines, keyed by module name */
	modules: Record<string, number[]>;
	/** reserved block per module name */
	reservations: Record<string, number>;
}

const SRC = dirname(fileURLToPath(import.meta.url));

const blockOf = (code: number) => Math.floor(code / 100);

function duplicateCodeProblems({ shared, modules }: ErrorCodeSources): string[] {
	const owners = new Map<number, string[]>();
	const add = (owner: string, codes: number[]) =>
		codes.forEach((code) => owners.set(code, [...(owners.get(code) ?? []), owner]));

	add('shared', shared);
	Object.entries(modules).forEach(([name, codes]) => add(name, codes));

	return [...owners]
		.filter(([, users]) => users.length > 1)
		.map(([code, users]) => `code ${code} is used more than once (${users.join(', ')})`);
}

function reservationProblems({ shared, reservations }: ErrorCodeSources): string[] {
	const sharedBlocks = new Set(shared.map(blockOf));
	const reservedBy = new Map<number, string>();
	const problems: string[] = [];

	for (const [name, block] of Object.entries(reservations)) {
		const other = reservedBy.get(block);

		if (other) {
			problems.push(`${name} and ${other} both reserve block ${block}xx`);
		}
		if (sharedBlocks.has(block)) {
			problems.push(`${name} reserves block ${block}xx, which belongs to shared codes`);
		}
		reservedBy.set(block, name);
	}

	return problems;
}

function moduleCodeProblems({ modules, reservations }: ErrorCodeSources): string[] {
	return Object.entries(modules).flatMap(([name, codes]) => {
		const block = reservations[name];

		if (block === undefined) {
			return [`${name} defines error codes but has no block in error-codes.registry.ts`];
		}

		return codes
			.filter((code) => blockOf(code) !== block)
			.map((code) => `${name} code ${code} is outside its reserved block ${block}xx`);
	});
}

/** Returns every rule the error codes break; empty when they are consistent. */
export function findErrorCodeProblems(sources: ErrorCodeSources): string[] {
	return [
		...duplicateCodeProblems(sources),
		...reservationProblems(sources),
		...moduleCodeProblems(sources),
	];
}

const isCodeTable = (value: unknown): value is Record<string, number> =>
	typeof value === 'object' &&
	value !== null &&
	Object.values(value).every((code) => Number.isInteger(code));

/** All codes from the `*ErrorCode` tables a file exports. */
async function codesExportedBy(file: string): Promise<number[]> {
	const exported: Record<string, unknown> = await import(file);

	return Object.entries(exported)
		.filter(([key, value]) => key.endsWith('ErrorCode') && isCodeTable(value))
		.flatMap(([, value]) => Object.values(value as Record<string, number>));
}

/** Codes defined by each module in `modules/<name>/domain/*.exception.ts`. */
async function moduleCodes(): Promise<Record<string, number[]>> {
	const modules: Record<string, number[]> = {};
	const modulesDir = join(SRC, 'modules');

	for (const name of readdirSync(modulesDir)) {
		const domainDir = join(modulesDir, name, 'domain');
		const files = readdirSync(domainDir).filter((file) => file.endsWith('.exception.ts'));
		const codes = (
			await Promise.all(files.map((file) => codesExportedBy(join(domainDir, file))))
		).flat();

		if (codes.length > 0) {
			modules[name] = codes;
		}
	}

	return modules;
}

const sources = (overrides: Partial<ErrorCodeSources>): ErrorCodeSources => ({
	shared: [0, 900000, 900422],
	modules: {},
	reservations: {},
	...overrides,
});

describe('error codes', () => {
	it('should find the error codes of every module', async () => {
		expect(Object.keys(await moduleCodes())).toContain('example');
	});

	it('should be unique and inside the blocks reserved in the registry', async () => {
		const problems = findErrorCodeProblems({
			shared: Object.keys(ErrorCodes).map(Number),
			modules: await moduleCodes(),
			reservations: ErrorCodeRegistry,
		});

		expect(problems).toEqual([]);
	});

	describe('findErrorCodeProblems', () => {
		it('should accept modules whose codes sit in their reserved blocks', () => {
			const result = findErrorCodeProblems(
				sources({
					modules: { a: [100101, 100199], b: [100201] },
					reservations: { a: 1001, b: 1002 },
				}),
			);

			expect(result).toEqual([]);
		});

		it('should accept a block reserved before its module exists', () => {
			expect(findErrorCodeProblems(sources({ reservations: { future: 1003 } }))).toEqual([]);
		});

		it('should flag a code used by two modules', () => {
			const result = findErrorCodeProblems(
				sources({ modules: { a: [100101], b: [100101] }, reservations: { a: 1001, b: 1001 } }),
			);

			expect(result).toContain('code 100101 is used more than once (a, b)');
		});

		it('should flag a code used twice inside one module', () => {
			const result = findErrorCodeProblems(
				sources({ modules: { a: [100101, 100101] }, reservations: { a: 1001 } }),
			);

			expect(result).toContain('code 100101 is used more than once (a, a)');
		});

		it('should flag a module code that clashes with a shared code', () => {
			const result = findErrorCodeProblems(sources({ modules: { a: [900422] } }));

			expect(result).toContain('code 900422 is used more than once (shared, a)');
		});

		it('should flag a module with codes but no reservation', () => {
			const result = findErrorCodeProblems(sources({ modules: { a: [100101] } }));

			expect(result).toContain('a defines error codes but has no block in error-codes.registry.ts');
		});

		it('should flag a code outside the reserved block', () => {
			const result = findErrorCodeProblems(
				sources({ modules: { a: [100101, 100201] }, reservations: { a: 1001 } }),
			);

			expect(result).toContain('a code 100201 is outside its reserved block 1001xx');
		});

		it('should flag two modules reserving the same block', () => {
			const result = findErrorCodeProblems(sources({ reservations: { a: 1001, b: 1001 } }));

			expect(result).toContain('b and a both reserve block 1001xx');
		});

		it('should flag a reservation of a shared block', () => {
			const result = findErrorCodeProblems(sources({ reservations: { a: 9004 } }));

			expect(result).toContain('a reserves block 9004xx, which belongs to shared codes');
		});
	});
});
