import { entityKind } from './entity.ts';
import type { PgColumnBuilderBase } from './pg-core/index.ts';
import { SQL, type SQLWrapper } from './sql/index.ts';

export interface FuncConfig<
	TCallSigDefinition extends Record<string, PgColumnBuilderBase> = Record<string, PgColumnBuilderBase>,
	TFunctionParameters extends { [K in keyof TCallSigDefinition]: TCallSigDefinition[K]['_']['data'] } = {
		[K in keyof TCallSigDefinition]: TCallSigDefinition[K]['_']['data'];
	},
	TReturnTypeDefinition extends Record<string, PgColumnBuilderBase> = Record<string, PgColumnBuilderBase>,
> {
	name: string;
	schema: string | undefined;
	dialect: string;
	functionParameters: TFunctionParameters;
	callSignature: TCallSigDefinition;
	returnType: TReturnTypeDefinition;
}

/** @internal */
export const FuncName = Symbol.for('drizzle:Name');

/** @internal */
export const Schema = Symbol.for('drizzle:Schema');

/** @internal */
export const CallSignature = Symbol.for('drizzle:CallSignature');

/** @internal */
export const FunctionParameters = Symbol.for('drizzle:FunctionParameters');

/** @internal */
export const ReturnType = Symbol.for('drizzle:ReturnType');

/** @internal */
export const OriginalName = Symbol.for('drizzle:OriginalName');

/** @internal */
export const BaseName = Symbol.for('drizzle:BaseName');

/** @internal */
export const IsAlias = Symbol.for('drizzle:IsAlias');

/** @internal */
export const ExtraConfigBuilder = Symbol.for('drizzle:ExtraConfigBuilder');

const IsDrizzleFunc = Symbol.for('drizzle:IsDrizzleFunc');

export class Func<T extends FuncConfig = FuncConfig> implements SQLWrapper {
	static readonly [entityKind]: string = 'Func';

	declare readonly _: {
		readonly brand: 'Func';
		readonly config: T;
		readonly name: T['name'];
		readonly schema: T['schema'];
		readonly callSignature: T['callSignature'];
		readonly functionParameters: T['functionParameters'];
		readonly returnType: T['returnType'];
	};

	/** @internal */
	static readonly Symbol = {
		Name: FuncName as typeof FuncName,
		Schema: Schema as typeof Schema,
		OriginalName: OriginalName as typeof OriginalName,
		CallSignature: CallSignature as typeof CallSignature,
		FunctionParameters: FunctionParameters as typeof FunctionParameters,
		ReturnType: ReturnType as typeof ReturnType,
		BaseName: BaseName as typeof BaseName,
		IsAlias: IsAlias as typeof IsAlias,
		ExtraConfigBuilder: ExtraConfigBuilder as typeof ExtraConfigBuilder,
	};

	/**
	 * @internal
	 * Can be changed if the func is aliased.
	 */
	[FuncName]: string;

	/**
	 * @internal
	 * Used to store the original name of the func, before any aliasing.
	 */
	[OriginalName]: string;

	/** @internal */
	[Schema]: string | undefined;

	/** @internal */
	[CallSignature]!: T['callSignature'];

	/** @internal */
	[FunctionParameters]!: T['functionParameters'];

	/** @internal */
	[ReturnType]!: T['returnType'];

	/**
	 *  @internal
	 * Used to store the func name before the transformation via the `funcCreator` functions.
	 */
	[BaseName]: string;

	/** @internal */
	[IsAlias] = false;

	/** @internal */
	[ExtraConfigBuilder]: ((self: any) => Record<string, unknown>) | undefined = undefined;

	[IsDrizzleFunc] = true;

	constructor(name: string, schema: string | undefined, baseName: string) {
		this[FuncName] = this[OriginalName] = name;
		this[Schema] = schema;
		this[BaseName] = baseName;
	}

	getSQL(): SQL<unknown> {
		return new SQL([this]);
	}
}

export type InferFunctionReturnType<T extends Func> = T extends Func<infer TConfig>
	? { [K in keyof TConfig['returnType']]: TConfig['returnType'][K]['_']['data'] }
	: never;

export function isFunc(func: unknown): func is Func {
	return typeof func === 'object' && func !== null && IsDrizzleFunc in func;
}

export function getFuncName<T extends Func>(func: T): T['_']['name'] {
	return func[FuncName];
}
