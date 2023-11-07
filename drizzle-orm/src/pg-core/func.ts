import { entityKind } from "~/entity.ts";
import { Func, type FuncConfig as FuncConfigBase } from "~/func.ts";
import type {
  PgColumnBuilder,
  PgColumn,
  PgColumnBuilderBase,
} from "./index.ts";
import type { PgTable } from "./table.ts";
import type { BuildColumns } from "~/index.ts";

export type FunctionConfig = FuncConfigBase<PgColumn<any>>;

export class PgFunction<
  T extends FunctionConfig = FunctionConfig,
> extends Func<T> {
  static readonly [entityKind]: string = "PgFunction";

  /** @internal */
  static override readonly Symbol = Object.assign({}, Func.Symbol);
}

/** @internal */
export function pgFunctionWithSchema<
  TSchemaName extends string | undefined,
  TFunctionName extends string,
  TParamsMap extends Record<string, PgColumnBuilderBase>,
  TReturnType extends PgTable | PgColumn,
>(
  name: TFunctionName,
  params: TParamsMap,
  _returns: TReturnType,
  schema: TSchemaName,
  baseName = name,
): PgFunctionWithParameters<{
  name: TFunctionName;
  schema: TSchemaName;
  parameters: BuildColumns<TFunctionName, TParamsMap, "pg">;
  dialect: "pg";
}> {
  const rawFunction = new PgFunction<{
    name: TFunctionName;
    schema: TSchemaName;
    parameters: BuildColumns<TFunctionName, TParamsMap, "pg">;
    dialect: "pg";
  }>(name, schema, baseName);

  const builtParams = Object.fromEntries(
    Object.entries(params).map(([name, colBuilderBase]) => {
      const colBuilder = colBuilderBase as PgColumnBuilder;
      const column = colBuilder.build(rawFunction as unknown as PgTable);
      return [name, column];
    }),
  ) as unknown as BuildColumns<TFunctionName, TParamsMap, "pg">;

  const func = Object.assign(rawFunction, builtParams);

  func[Func.Symbol.Parameters] = builtParams;

  return func;
}

export type PgFunctionWithParameters<T extends FunctionConfig> =
  PgFunction<T> & {
    [Key in keyof T["parameters"]]: T["parameters"][Key];
  };

export interface PgFunctionFn {
  <
    TFunctionName extends string,
    TParams extends Record<string, PgColumnBuilderBase>,
    TReturnType extends PgTable<any> | PgColumn<any>,
  >(
    name: TFunctionName,
    args: TParams,
    returns: TReturnType,
    // extraConfig?: (self: BuildColumns<TTableName, TColumnsMap, 'pg'>) => PgTableExtraConfig,
  ): PgFunction;
}

export const pgFunction: PgFunctionFn = (name, args, returns) => {
  return pgFunctionWithSchema(name, args, returns, undefined);
};
