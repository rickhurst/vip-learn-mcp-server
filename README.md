# VIP Learn MCP

This project implements a Model Context Protocol (MCP) server for interacting with the VIP Learn platform. It provides tools to search for lessons and fetch lesson details from a WordPress-based VIP Learn site via custom REST API endpoints.

## Features

- **MCP Server**: Exposes tools for lesson search and lesson details retrieval.
- **WordPress Integration**: Connects to a VIP Learn WordPress site using credentials and site URL from a config file.
- **Secure API Access**: Uses HTTP Basic Auth for API requests.

## Prerequisites

- Node.js (v18 or later recommended)
- npm (comes with Node.js)
- Access to a VIP Learn WordPress site with the required API endpoints enabled

## Installation

1. **Clone the repository:**
   ```sh
   git clone <your-repo-url>
   cd vip-learn-mcp
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Configure the connection:**
   - Create `config.json` file in the project root:
     ```json
     {
       "siteUrl": "https://your-vip-learn-site",
       "username": "your-username",
       "password": "your-application-password"
     }
     ```
   - Replace the values with your actual site URL and credentials.

4. **Build the project:**
   ```sh
   npm run build
   ```

## Usage

Start the MCP server:

```sh
npm start
```

The server will run and listen for MCP requests via stdio. It exposes the following tools:

- `vip-learn-mcp-status`: Returns a simple status message.
- `vip-learn-lesson-search`: Search for lessons by a query string.
- `vip-learn-lesson-details`: Fetch lesson details by lesson slug.

These tools are intended to be used by an MCP-compatible client.

## Development

- Source code is in the `src/` directory (TypeScript).
- Build output is in the `build/` directory.
- TypeScript configuration is in `tsconfig.json`.

## Scripts

- `npm run build` — Compile TypeScript to JavaScript.
- `npm start` — Start the server (must be built first).

## License

MIT