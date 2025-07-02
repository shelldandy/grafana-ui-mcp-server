/**
 * Resources implementation for the Model Context Protocol (MCP) server.
 *
 * This file defines the resources that can be returned by the server based on client requests.
 * Resources are static content or dynamically generated content referenced by URIs.
 */

import { axios } from "./utils/axios.js";

/**
 * Resource definitions exported to the MCP handler
 * Each resource has a name, description, uri and contentType
 */
export const resources = [
  {
    name: "get_grafana_components",
    description:
      "List of available Grafana UI components that can be used in the project",
    uri: "resource:get_grafana_components",
    contentType: "application/json",
  },
  {
    name: "get_grafana_ui_info",
    description:
      "Information about Grafana UI library including version and repository details",
    uri: "resource:get_grafana_ui_info",
    contentType: "application/json",
  },
];

/**
 * Handler for the get_grafana_components resource
 * @returns List of available Grafana UI components from GitHub API
 */
const getGrafanaComponentsList = async () => {
  try {
    // Use existing GitHub API integration to get components dynamically
    const components = await axios.getAvailableComponents();

    return {
      content: JSON.stringify(
        {
          total: components.length,
          components: components,
          source: "@grafana/ui from grafana/grafana repository",
          path: "/packages/grafana-ui/src/components/",
          lastUpdated: new Date().toISOString(),
        },
        null,
        2,
      ),
      contentType: "application/json",
    };
  } catch (error) {
    console.error("Error fetching Grafana UI components list:", error);
    return {
      content: JSON.stringify(
        {
          error: "Failed to fetch Grafana UI components list",
          message: error instanceof Error ? error.message : String(error),
          fallback: [
            "Alert",
            "Button",
            "Card",
            "Drawer",
            "EmptyState",
            "Field",
            "Form",
            "Icon",
            "IconButton",
            "Input",
            "LoadingPlaceholder",
            "Modal",
            "Select",
            "Spinner",
            "Table",
            "Tabs",
            "Text",
            "TextArea",
            "Tooltip",
            "VerticalGroup",
          ],
        },
        null,
        2,
      ),
      contentType: "application/json",
    };
  }
};

/**
 * Handler for the get_grafana_ui_info resource
 * @returns Information about Grafana UI library
 */
const getGrafanaUIInfo = async () => {
  try {
    return {
      content: JSON.stringify(
        {
          name: "@grafana/ui",
          description:
            "React component library for building interfaces that match the Grafana design system",
          repository: "https://github.com/grafana/grafana",
          componentsPath: "/packages/grafana-ui/src/components/",
          documentation: "https://developers.grafana.com/ui/",
          storybook: "https://developers.grafana.com/ui/storybook/",
          npmPackage: "https://www.npmjs.com/package/@grafana/ui",
          features: [
            "Comprehensive React component library",
            "TypeScript support with full type definitions",
            "Consistent design system and theming",
            "Accessibility-focused components",
            "Rich documentation and Storybook examples",
            "Optimized for data visualization and monitoring UIs",
          ],
          installation: {
            npm: "npm install @grafana/ui",
            yarn: "yarn add @grafana/ui",
            pnpm: "pnpm add @grafana/ui",
            bun: "bun add @grafana/ui",
          },
          basicUsage: {
            import: "import { Button, Alert } from '@grafana/ui';",
            example: "<Button variant='primary'>Click me</Button>",
          },
        },
        null,
        2,
      ),
      contentType: "application/json",
    };
  } catch (error) {
    console.error("Error generating Grafana UI info:", error);
    return {
      content: JSON.stringify(
        {
          error: "Failed to generate Grafana UI info",
          message: error instanceof Error ? error.message : String(error),
        },
        null,
        2,
      ),
      contentType: "application/json",
    };
  }
};

/**
 * Map of resource URIs to their handler functions
 * Each handler function returns the resource content when requested
 */
export const resourceHandlers = {
  "resource:get_grafana_components": getGrafanaComponentsList,
  "resource:get_grafana_ui_info": getGrafanaUIInfo,
};
