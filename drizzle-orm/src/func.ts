import { entityKind } from "./entity.ts";
import type { Column } from "./index.ts";
import { SQL, type SQLWrapper } from "./sql/index.ts";

export interface FuncConfig<TParam extends Column = Column<any>> {
  name: string;
  schema: string | undefined;
  dialect: string;
  parameters: Record<string, TParam>;
}

/** @internal */
export const FuncName = Symbol.for("drizzle:Name");

/** @internal */
export const Schema = Symbol.for("drizzle:Schema");

/** @internal */
export const Parameters = Symbol.for("drizzle:Parameters");

/** @internal */
export const OriginalName = Symbol.for("drizzle:OriginalName");

/** @internal */
export const BaseName = Symbol.for("drizzle:BaseName");

/** @internal */
export const IsAlias = Symbol.for("drizzle:IsAlias");

/** @internal */
export const ExtraConfigBuilder = Symbol.for("drizzle:ExtraConfigBuilder");

const IsDrizzleFunc = Symbol.for("drizzle:IsDrizzleFunc");

export class Func<T extends FuncConfig = FuncConfig> implements SQLWrapper {
  static readonly [entityKind]: string = "Func";

  declare readonly _: {
    readonly brand: "Func";
    readonly config: T;
    readonly name: T["name"];
    readonly schema: T["schema"];
    readonly parameters: T["parameters"];
    // readonly inferSelect: InferSelectModel<Func<T>>;
    // readonly inferInsert: InferInsertModel<Func<T>>;
  };

  // declare readonly $inferSelect: InferSelectModel<Func<T>>;
  // declare readonly $inferInsert: InferInsertModel<Func<T>>;

  /** @internal */
  static readonly Symbol = {
    Name: FuncName as typeof FuncName,
    Schema: Schema as typeof Schema,
    OriginalName: OriginalName as typeof OriginalName,
    Parameters: Parameters as typeof Parameters,
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
  [Parameters]!: T["parameters"];

  /**
   *  @internal
   * Used to store the func name before the transformation via the `funcCreator` functions.
   */
  [BaseName]: string;

  /** @internal */
  [IsAlias] = false;

  /** @internal */
  [ExtraConfigBuilder]: ((self: any) => Record<string, unknown>) | undefined =
    undefined;

  [IsDrizzleFunc] = true;

  constructor(name: string, schema: string | undefined, baseName: string) {
    this[FuncName] = this[OriginalName] = name;
    this[Schema] = schema;
    this[BaseName] = baseName;
    // TODO: Params
  }

  getSQL(): SQL<unknown> {
    return new SQL([this]);
  }
}

export function isFunc(func: unknown): func is Func {
  return typeof func === "object" && func !== null && IsDrizzleFunc in func;
}

export function getFuncName<T extends Func>(func: T): T["_"]["name"] {
  return func[FuncName];
}

// export type MapColumnName<
//   TName extends string,
//   // TColumn extends Column,
//   TDBColumNames extends boolean,
// > = TDBColumNames extends true ? TColumn["_"]["name"] : TName;
//
// export type InferModelFromColumns<
//   // TColumns extends Record<string, Column>,
//   TInferMode extends "select" | "insert" = "select",
//   TConfig extends { dbColumnNames: boolean } = { dbColumnNames: false },
// > = Simplify<
//   TInferMode extends "insert"
//     ? {
//         [Key in keyof TColumns & string as RequiredKeyOnly<
//           MapColumnName<Key, TColumns[Key], TConfig["dbColumnNames"]>,
//           TColumns[Key]
//         >]: GetColumnData<TColumns[Key], "query">;
//       } & {
//         [Key in keyof TColumns & string as OptionalKeyOnly<
//           MapColumnName<Key, TColumns[Key], TConfig["dbColumnNames"]>,
//           TColumns[Key]
//         >]?: GetColumnData<TColumns[Key], "query">;
//       }
//     : {
//         [Key in keyof TColumns & string as MapColumnName<
//           Key,
//           TColumns[Key],
//           TConfig["dbColumnNames"]
//         >]: GetColumnData<TColumns[Key], "query">;
//       }
// >;

// export type InferSelectModel<
//   TFunc extends Func,
//   TConfig extends { dbColumnNames: boolean } = { dbColumnNames: false },
// > = InferModelFromColumns<TFunc["_"]["columns"], "select", TConfig>;
//
// export type InferInsertModel<
//   TFunc extends Func,
//   TConfig extends { dbColumnNames: boolean } = { dbColumnNames: false },
// > = InferModelFromColumns<TFunc["_"]["columns"], "insert", TConfig>;
