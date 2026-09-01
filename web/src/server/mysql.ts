import mysql, { type Pool } from "mysql2/promise";

type MySqlConfig = {
  DATABASE_URL?: string;
  MYSQL_HOST?: string;
  MYSQL_PORT?: string;
  MYSQL_DATABASE?: string;
  MYSQL_USER?: string;
  MYSQL_PASSWORD?: string;
  MYSQL_SSL?: string;
};

let pool: Pool | undefined;
let poolKey: string | undefined;

function getConfig(env: unknown): MySqlConfig {
  const runtimeEnv = env as MySqlConfig | undefined;
  const localEnv = typeof process === "undefined" ? undefined : process.env;
  return {
    DATABASE_URL: runtimeEnv?.DATABASE_URL ?? localEnv?.DATABASE_URL,
    MYSQL_HOST: runtimeEnv?.MYSQL_HOST ?? localEnv?.MYSQL_HOST,
    MYSQL_PORT: runtimeEnv?.MYSQL_PORT ?? localEnv?.MYSQL_PORT,
    MYSQL_DATABASE: runtimeEnv?.MYSQL_DATABASE ?? localEnv?.MYSQL_DATABASE,
    MYSQL_USER: runtimeEnv?.MYSQL_USER ?? localEnv?.MYSQL_USER,
    MYSQL_PASSWORD: runtimeEnv?.MYSQL_PASSWORD ?? localEnv?.MYSQL_PASSWORD,
    MYSQL_SSL: runtimeEnv?.MYSQL_SSL ?? localEnv?.MYSQL_SSL,
  };
}

/** Retorna um pool MySQL reutilizável, disponível apenas no servidor. */
export function getMySqlPool(env: unknown): Pool | null {
  const config = getConfig(env);
  const hasParts = config.MYSQL_HOST && config.MYSQL_DATABASE && config.MYSQL_USER;
  if (!config.DATABASE_URL && !hasParts) return null;

  const nextKey = config.DATABASE_URL ?? `${config.MYSQL_HOST}:${config.MYSQL_PORT}:${config.MYSQL_DATABASE}:${config.MYSQL_USER}`;
  if (pool && poolKey === nextKey) return pool;

  pool?.end().catch(() => undefined);
  pool = config.DATABASE_URL
    ? mysql.createPool({ uri: config.DATABASE_URL, waitForConnections: true, connectionLimit: 10 })
    : mysql.createPool({
        host: config.MYSQL_HOST,
        port: Number(config.MYSQL_PORT ?? 3306),
        database: config.MYSQL_DATABASE,
        user: config.MYSQL_USER,
        password: config.MYSQL_PASSWORD,
        ssl: config.MYSQL_SSL === "true" ? {} : undefined,
        waitForConnections: true,
        connectionLimit: 10,
      });
  poolKey = nextKey;
  return pool;
}

import { type ResultSetHeader, type RowDataPacket } from "mysql2";

type PreparedStatement = {
  bind: (...values: unknown[]) => PreparedStatement;
  run: () => Promise<{ meta: { changes?: number } }>;
  all: <T>() => Promise<{ results: T[] }>;
  first: <T>() => Promise<T | null>;
};

export type MySqlDatabase = { prepare: (query: string) => PreparedStatement };

/** Adaptador que preserva a API enquanto o banco troca de D1 para MySQL. */
export function getMySqlDatabase(env: unknown): MySqlDatabase | null {
  const connection = getMySqlPool(env);
  if (!connection) return null;

  return {
    prepare(query) {
      let values: unknown[] = [];
      const statement: PreparedStatement = {
        bind(...nextValues) {
          values = nextValues;
          return statement;
        },
        async run() {
          const [result] = await connection.execute<ResultSetHeader>(query, values);
          return { meta: { changes: result.affectedRows } };
        },
        async all<T>() {
          const [rows] = await connection.execute<RowDataPacket[]>(query, values);
          return { results: rows as T[] };
        },
        async first<T>() {
          const [rows] = await connection.execute<RowDataPacket[]>(query, values);
          return (rows[0] as T | undefined) ?? null;
        },
      };
      return statement;
    },
  };
}
