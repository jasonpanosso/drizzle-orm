import { entityKind } from '~/entity.ts';
import { Func, type FuncConfig as FunctionConfig } from '~/func.ts';
import type { BuildColumns } from '~/index.ts';
import type { PgColumnBuilder, PgColumnBuilderBase, PgTable } from './index.ts';

export class PgFunction<T extends FunctionConfig = FunctionConfig> extends Func<T> {
	static readonly [entityKind]: string = 'PgFunction';

	/** @internal */
	static override readonly Symbol = Object.assign({}, Func.Symbol);
}

/** @internal */
export function pgFunctionWithSchemaBuilder<
	TSchemaName extends string | undefined,
	TFunctionName extends string,
	TCallSigDefinition extends Record<string, PgColumnBuilderBase>,
	TFunctionParameters extends { [K in keyof TCallSigDefinition]: TCallSigDefinition[K]['_']['data'] },
	TReturnTypeDefinition extends PgColumnBuilderBase,
>(
	name: TFunctionName,
	callSig: TCallSigDefinition,
	returnType: TReturnTypeDefinition,
	schema: TSchemaName,
	baseName = name,
): (funcCallArgs: TFunctionParameters) => PgFunction<{
	name: TFunctionName;
	schema: TSchemaName;
	functionParameters: TFunctionParameters;
	callSignature: BuildColumns<TFunctionName, TCallSigDefinition, 'pg'>;
	returnType: TReturnTypeDefinition;
	dialect: 'pg';
}> {
	const func = new PgFunction<{
		name: TFunctionName;
		schema: TSchemaName;
		functionParameters: TFunctionParameters;
		callSignature: BuildColumns<TFunctionName, TCallSigDefinition, 'pg'>;
		returnType: TReturnTypeDefinition;
		dialect: 'pg';
	}>(name, schema, baseName);

	const builtCallSig = Object.fromEntries(
		Object.entries(callSig).map(([name, colBuilderBase]) => {
			const colBuilder = colBuilderBase as PgColumnBuilder;
			const column = colBuilder.build(func as unknown as PgTable);
			return [name, column];
		}),
	) as unknown as BuildColumns<TFunctionName, TCallSigDefinition, 'pg'>;

	func[Func.Symbol.CallSignature] = builtCallSig;
	func[Func.Symbol.ReturnType] = returnType;

	return (args) => {
		func[Func.Symbol.FunctionParameters] = args;
		return func;
	};
}

export interface PgFunctionFn {
	<
		TFunctionName extends string,
		TCallSigDefinition extends Record<string, PgColumnBuilderBase>,
		TFunctionParameters extends { [K in keyof TCallSigDefinition]: TCallSigDefinition[K]['_']['data'] },
		TReturnTypeDefinition extends PgColumnBuilderBase,
	>(
		name: TFunctionName,
		callSig: TCallSigDefinition,
		returnType: TReturnTypeDefinition,
	): (funcCallArgs: TFunctionParameters) => PgFunction<{
		name: TFunctionName;
		schema: undefined;
		functionParameters: TFunctionParameters;
		callSignature: BuildColumns<TFunctionName, TCallSigDefinition, 'pg'>;
		returnType: TReturnTypeDefinition;
		dialect: 'pg';
	}>;
}

export const pgFunction: PgFunctionFn = (name, callSig, returnType) => {
	return pgFunctionWithSchemaBuilder(name, callSig, returnType, undefined);
};
