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
let vipLearnConfig;
try {
    vipLearnConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
}
catch (e) {
    throw new Error(`Could not load config.json at ${configPath}. Please create it with siteUrl, username, and password.`);
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
const logFilePath = path.resolve(__dirname, '../mcp-status.log');
function logStatus(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    fs.appendFileSync(logFilePath, logMessage);
    console.log(message);
}
// Register a simple status tool
server.tool("vip-learn-mcp-status", "Get the status of the VIP Learn MCP server and check the remote VIP Learn API status.", {}, async () => {
    let remoteStatus = "Unknown";
    let remoteHealthy = false;
    try {
        const url = `${vipLearnConfig.siteUrl}/wp-json/vip-learn/v1/status`;
        const agent = new https.Agent({ rejectUnauthorized: false });
        const response = await axios.get(url, {
            auth: {
                username: vipLearnConfig.username,
                password: vipLearnConfig.password,
            },
            httpsAgent: agent,
        });
        if (response.status === 200 && typeof response.data === 'string' && response.data.trim() === 'OK') {
            remoteStatus = "Remote VIP Learn API is healthy (200 OK, response: 'OK').";
            remoteHealthy = true;
        }
        else {
            remoteStatus = `Remote VIP Learn API returned status ${response.status} and response: ${JSON.stringify(response.data)}`;
        }
    }
    catch (error) {
        remoteStatus = `Error checking remote VIP Learn API: ${error.message}`;
    }
    return {
        content: [
            {
                type: "text",
                text: `I am working.\n${remoteStatus}`,
            },
        ],
        healthy: remoteHealthy,
    };
});
function registerApiTool({ name, description, paramName, paramDescription, endpoint, paramKey }) {
    server.tool(name, {
        [paramName]: z.string().min(1).describe(paramDescription),
    }, async (params) => {
        const url = `${vipLearnConfig.siteUrl}${endpoint}`;
        const agent = new https.Agent({ rejectUnauthorized: false });
        try {
            const response = await axios.get(url, {
                params: { [paramKey]: params[paramName] },
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
        }
        catch (error) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Error: ${error.message}`,
                    },
                ],
            };
        }
    });
}
// Array of tool configs
const apiTools = [
    {
        name: "vip-learn-lesson-search",
        description: "Search for lessons by a query string.",
        paramName: "query",
        paramDescription: "Search term for lessons",
        endpoint: "/wp-json/vip-learn/v1/lesson-search",
        paramKey: "s",
    },
    {
        name: "vip-learn-lesson-details",
        description: "Fetch lesson details by lesson slug.",
        paramName: "query",
        paramDescription: "Lesson details by slug",
        endpoint: "/wp-json/vip-learn/v1/lesson-details",
        paramKey: "slug",
    },
];
// Register all API tools
apiTools.forEach(registerApiTool);
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.log("VIP Learn MCP Server running on stdio log");
}
main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
