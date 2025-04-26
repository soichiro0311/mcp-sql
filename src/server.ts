import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import pkg from "pg";
const { Client } = pkg;

// Postgresクライアント設定
const pgClient = new Client({
  host: "127.0.0.1",
  port: 5432,
  user: "user",
  password: "postgres",
  database: "postgres", // 必要に応じて変更
});

// サーバ起動時にDB接続
pgClient.connect().catch((err) => {
  console.error("Failed to connect to Postgres:", err);
});

// Create server instance
export const server = new McpServer({
  name: "sql-mcp-server",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

// Register execute sql tools
server.tool(
  "execute-sql",
  "SQLを実行します。",
  {
    query: z.string().describe("execute SQL (e.g. SELECT * FROM weather WHERE location = 'New York')"),
  },
  async ({ query }) => {
    try {
      const res = await pgClient.query(query);
      // 結果をテキスト化
      let text = "";
      if (Array.isArray(res.rows) && res.rows.length > 0) {
        text = JSON.stringify(res.rows, null, 2);
      } else if (typeof res.rowCount === "number") {
        text = `Query OK, ${res.rowCount} rows affected.`;
      } else {
        text = "Query executed.";
      }
      return {
        content: [
          {
            type: "text",
            text,
          },
        ],
      };
    } catch (err: any) {
      return {
        content: [
          {
            type: "text",
            text: `Error: ${err.message}`,
          },
        ],
      };
    }
  }
);

