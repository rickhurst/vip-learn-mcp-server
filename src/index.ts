import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import axios from "axios";
import https from "https";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load config from config.json
const configPath = path.resolve(__dirname, "../config.json");
let vipLearnConfig: { siteUrl: string; username: string; password: string };
try {
  vipLearnConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
} catch (e) {
  throw new Error(
    `Could not load config.json at ${configPath}. Please create it with siteUrl, username, and password.`
  );
}

// Create server instance
const server = new McpServer({
  name: "vip-learn-mcp",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

// Register a simple status tool
server.tool(
  "vip-learn-mcp-status",
  "Get the status of the VIP Learn MCP server",
  {},
  async () => {
    return {
      content: [
        {
          type: "text",
          text: "I am working",
        },
      ],
    }
  }
);

// Register the lesson search tool
server.tool(
  "vip-learn-lesson-search",
  {
    query: z.string().min(1).describe("Search term for lessons"),
  },
  async ({ query }) => {
    const url = `${vipLearnConfig.siteUrl}/wp-json/vip-learn/v1/lesson-search`;
    const agent = new https.Agent({ rejectUnauthorized: false });
    try {
      const response = await axios.get(url, {
        params: { s: query },
        auth: {
          username: vipLearnConfig.username,
          password: vipLearnConfig.password,
        },
        httpsAgent: agent,
      });
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response.data, null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text",
            text: `Error: ${error.message}`,
          },
        ],
      };
    }
  }
);

// Register the lesson details
server.tool(
  "vip-learn-lesson-details",
  {
    query: z.string().min(1).describe("Lesson details by slug"),
  },
  async ({ query }) => {
    const url = `${vipLearnConfig.siteUrl}/wp-json/vip-learn/v1/lesson-details`;
    const agent = new https.Agent({ rejectUnauthorized: false });
    try {
      const response = await axios.get(url, {
        params: { slug: query },
        auth: {
          username: vipLearnConfig.username,
          password: vipLearnConfig.password,
        },
        httpsAgent: agent,
      });
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response.data, null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text",
            text: `Error: ${error.message}`,
          },
        ],
      };
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("VIP Learn MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});