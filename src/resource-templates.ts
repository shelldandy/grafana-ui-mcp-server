/**
 * Resource templates implementation for the Model Context Protocol (MCP) server.
 *
 * This file defines resource templates that can be used to dynamically generate
 * resources based on parameters in the URI.
 */

/**
 * Resource template definitions exported to the MCP handler
 * Each template has a name, description, uriTemplate and contentType
 */
export const resourceTemplates = [
  {
    name: "get_grafana_ui_setup_script",
    description:
      "Generate setup script for Grafana UI in a React project based on package manager",
    uriTemplate:
      "resource-template:get_grafana_ui_setup_script?packageManager={packageManager}&framework={framework}",
    contentType: "text/plain",
  },
  {
    name: "get_component_usage_example",
    description:
      "Get usage example for a specific Grafana UI component with import and basic implementation",
    uriTemplate:
      "resource-template:get_component_usage_example?component={component}&typescript={typescript}",
    contentType: "text/plain",
  },
];

// Create a map for easier access in getResourceTemplate
const resourceTemplateMap = {
  get_grafana_ui_setup_script: resourceTemplates[0],
  get_component_usage_example: resourceTemplates[1],
};

/**
 * Extract parameters from URI
 * @param uri URI to extract from
 * @param paramName Name of parameter to extract
 * @returns Parameter value or undefined
 */
function extractParam(uri: string, paramName: string): string | undefined {
  const match = uri.match(new RegExp(`${paramName}=([^&]+)`));
  return match?.[1];
}

/**
 * Gets a resource template handler for a given URI
 * @param uri The URI of the resource template
 * @returns A function that generates the resource
 */
export const getResourceTemplate = (uri: string) => {
  // Grafana UI setup script template
  if (uri.startsWith("resource-template:get_grafana_ui_setup_script")) {
    return async () => {
      try {
        const packageManager = extractParam(uri, "packageManager");
        const framework = extractParam(uri, "framework") || "react";

        if (!packageManager) {
          return {
            content:
              "Missing packageManager parameter. Please specify npm, pnpm, yarn, or bun.",
            contentType: "text/plain",
          };
        }

        // Generate setup script based on package manager and framework
        const installCommand = getInstallCommand(packageManager, "@grafana/ui");
        const devDepsCommand = getInstallCommand(
          packageManager,
          "@types/react @types/react-dom",
          true,
        );

        const setupSteps = [
          "# Grafana UI Setup Script",
          "",
          "# 1. Install Grafana UI and required dependencies",
          installCommand,
          "",
          "# 2. Install TypeScript types (if using TypeScript)",
          devDepsCommand,
          "",
          "# 3. Import and use Grafana UI components in your React app",
          "# Example: import { Button, Alert } from '@grafana/ui';",
          "",
          "# 4. Wrap your app with ThemeProvider (optional but recommended)",
          "# import { ThemeProvider } from '@grafana/ui';",
          "# <ThemeProvider><App /></ThemeProvider>",
          "",
          "# 5. Import Grafana UI CSS (add to your main CSS/index.css)",
          "# @import '~@grafana/ui/dist/index.css';",
        ];

        return {
          content: setupSteps.join("\n"),
          contentType: "text/plain",
        };
      } catch (error) {
        return {
          content: `Error generating setup script: ${error instanceof Error ? error.message : String(error)}`,
          contentType: "text/plain",
        };
      }
    };
  }

  // Component usage example template
  if (uri.startsWith("resource-template:get_component_usage_example")) {
    return async () => {
      try {
        const component = extractParam(uri, "component");
        const typescript = extractParam(uri, "typescript") === "true";

        if (!component) {
          return {
            content:
              "Missing component parameter. Please specify the Grafana UI component name.",
            contentType: "text/plain",
          };
        }

        // Generate usage example for the component
        const examples = getComponentExamples();
        const componentKey = component.toLowerCase();
        const example = examples[componentKey] || examples.default;

        const fileExtension = typescript ? "tsx" : "jsx";
        const importStatement = `import { ${example.componentName} } from '@grafana/ui';`;

        const usageExample = [
          `// ${example.componentName} Usage Example`,
          "",
          importStatement,
          "",
          typescript ? "interface Props {}" : "",
          typescript ? "" : "",
          typescript
            ? `const MyComponent: React.FC<Props> = () => {`
            : "const MyComponent = () => {",
          "  return (",
          "    <div>",
          `      ${example.usage}`,
          "    </div>",
          "  );",
          "};",
          "",
          "export default MyComponent;",
        ]
          .filter((line) => line !== "")
          .join("\n");

        return {
          content: usageExample,
          contentType: "text/plain",
        };
      } catch (error) {
        return {
          content: `Error generating component usage example: ${error instanceof Error ? error.message : String(error)}`,
          contentType: "text/plain",
        };
      }
    };
  }

  return undefined;
};

/**
 * Helper function to generate install commands based on package manager
 */
function getInstallCommand(
  packageManager: string,
  packages: string,
  isDev = false,
): string {
  const devFlag = isDev ? " -D" : "";

  switch (packageManager.toLowerCase()) {
    case "npm":
      return `npm install${devFlag} ${packages}`;
    case "pnpm":
      return `pnpm add${devFlag} ${packages}`;
    case "yarn":
      return `yarn add${devFlag} ${packages}`;
    case "bun":
      return `bun add${devFlag} ${packages}`;
    default:
      return `npm install${devFlag} ${packages}`;
  }
}

/**
 * Helper function to get component usage examples
 */
function getComponentExamples(): Record<
  string,
  { componentName: string; usage: string }
> {
  return {
    button: {
      componentName: "Button",
      usage: `<Button variant="primary" size="md" onClick={() => console.log('clicked')}>\n        Click me\n      </Button>`,
    },
    alert: {
      componentName: "Alert",
      usage: `<Alert title="Success" severity="success">\n        Operation completed successfully!\n      </Alert>`,
    },
    input: {
      componentName: "Input",
      usage: `<Input\n        placeholder="Enter text..."\n        value={inputValue}\n        onChange={(e) => setInputValue(e.target.value)}\n      />`,
    },
    card: {
      componentName: "Card",
      usage: `<Card>\n        <Card.Heading>Card Title</Card.Heading>\n        <Card.Description>\n          This is a card description with some content.\n        </Card.Description>\n      </Card>`,
    },
    table: {
      componentName: "Table",
      usage: `<Table width="100%" height={400}>\n        <thead>\n          <tr>\n            <th>Name</th>\n            <th>Value</th>\n          </tr>\n        </thead>\n        <tbody>\n          <tr>\n            <td>Item 1</td>\n            <td>Value 1</td>\n          </tr>\n        </tbody>\n      </Table>`,
    },
    default: {
      componentName: "Button",
      usage: `<Button variant="primary">\n        Default Example\n      </Button>`,
    },
  };
}
