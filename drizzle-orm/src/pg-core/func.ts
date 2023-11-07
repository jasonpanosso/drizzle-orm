import { entityKind } from '~/entity.ts';
import { Func, type FuncConfig as FunctionConfig } from '~/func.ts';
import type { PgColumnBuilderBase } from './index.ts';

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
	TReturnTypeDefinition extends Record<string, PgColumnBuilderBase>,
>(
	name: TFunctionName,
	callSig: TCallSigDefinition,
	_returns: TReturnTypeDefinition,
	schema: TSchemaName,
	baseName = name,
): (funcCallArgs: TFunctionParameters) => PgFunction<{
	name: TFunctionName;
	schema: TSchemaName;
	functionParameters: TFunctionParameters;
	callSignature: TCallSigDefinition;
	returnType: TReturnTypeDefinition;
	dialect: 'pg';
}> {
	const func = new PgFunction<{
		name: TFunctionName;
		schema: TSchemaName;
		functionParameters: TFunctionParameters;
		callSignature: TCallSigDefinition;
		returnType: TReturnTypeDefinition;
		dialect: 'pg';
	}>(name, schema, baseName);
	func[Func.Symbol.CallSignature] = callSig;

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
		TReturnTypeDefinition extends Record<string, PgColumnBuilderBase>,
	>(
		name: TFunctionName,
		callSig: TCallSigDefinition,
		returns: TReturnTypeDefinition,
	): (funcCallArgs: TFunctionParameters) => PgFunction<{
		name: TFunctionName;
		schema: undefined;
		functionParameters: TFunctionParameters;
		callSignature: TCallSigDefinition;
		returnType: TReturnTypeDefinition;
		dialect: 'pg';
	}>;
}

export const pgFunction: PgFunctionFn = (name, callSig, returns) => {
	return pgFunctionWithSchemaBuilder(name, callSig, returns, undefined);
};
