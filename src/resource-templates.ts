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
    name: "get_install_script_for_component",
    description:
      "Generate installation script for a specific shadcn/ui component based on package manager",
    uriTemplate:
      "resource-template:get_install_script_for_component?packageManager={packageManager}&component={component}",
    contentType: "text/plain",
  },
  {
    name: "get_installation_guide",
    description:
      "Get the installation guide for shadcn/ui based on framework and package manager",
    uriTemplate:
      "resource-template:get_installation_guide?framework={framework}&packageManager={packageManager}",
    contentType: "text/plain",
  },
];

// Create a map for easier access in getResourceTemplate
const resourceTemplateMap = {
  get_install_script_for_component: resourceTemplates[0],
  get_installation_guide: resourceTemplates[1],
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
  // Component installation script template
  if (uri.startsWith("resource-template:get_install_script_for_component")) {
    return async () => {
      try {
        const packageManager = extractParam(uri, "packageManager");
        const component = extractParam(uri, "component");

        if (!packageManager) {
          return {
            content:
              "Missing packageManager parameter. Please specify npm, pnpm, or yarn.",
            contentType: "text/plain",
          };
        }

        if (!component) {
          return {
            content:
              "Missing component parameter. Please specify the component name.",
            contentType: "text/plain",
          };
        }

        // Generate installation script based on package manager
        let installCommand: string;

        switch (packageManager.toLowerCase()) {
          case "npm":
            installCommand = `npx shadcn@latest add ${component}`;
            break;
          case "pnpm":
            installCommand = `pnpm dlx shadcn@latest add ${component}`;
            break;
          case "yarn":
            installCommand = `yarn dlx shadcn@latest add ${component}`;
            break;
          case "bun":
            installCommand = `bunx --bun shadcn@latest add ${component}`;
            break;
          default:
            installCommand = `npx shadcn@latest add ${component}`;
        }

        return {
          content: installCommand,
          contentType: "text/plain",
        };
      } catch (error) {
        return {
          content: `Error generating installation script: ${error instanceof Error ? error.message : String(error)}`,
          contentType: "text/plain",
        };
      }
    };
  }

  // Installation guide template
  if (uri.startsWith("resource-template:get_installation_guide")) {
    return async () => {
      try {
        const framework = extractParam(uri, "framework");
        const packageManager = extractParam(uri, "packageManager");

        if (!framework) {
          return {
            content:
              "Missing framework parameter. Please specify next, vite, remix, etc.",
            contentType: "text/plain",
          };
        }

        if (!packageManager) {
          return {
            content:
              "Missing packageManager parameter. Please specify npm, pnpm, or yarn.",
            contentType: "text/plain",
          };
        }

        // Generate installation guide based on framework and package manager
        const guides = {
          next: {
            description: "Installation guide for Next.js project",
            steps: [
              "Create a Next.js project if you don't have one already:",
              `${packageManager} create next-app my-app`,
              "",
              "Navigate to your project directory:",
              "cd my-app",
              "",
              "Add shadcn/ui to your project:",
              packageManager === "npm"
                ? "npx shadcn-ui@latest init"
                : packageManager === "pnpm"
                  ? "pnpm dlx shadcn-ui@latest init"
                  : packageManager === "yarn"
                    ? "yarn dlx shadcn-ui@latest init"
                    : packageManager === "bun"
                      ? "bunx --bun shadcn-ui@latest init"
                      : "npx shadcn-ui@latest init",
              "",
              "Follow the prompts to select your preferences",
              "",
              "Once initialized, you can add components:",
              packageManager === "npm"
                ? "npx shadcn-ui@latest add button"
                : packageManager === "pnpm"
                  ? "pnpm dlx shadcn-ui@latest add button"
                  : packageManager === "yarn"
                    ? "yarn dlx shadcn-ui@latest add button"
                    : packageManager === "bun"
                      ? "bunx --bun shadcn-ui@latest add button"
                      : "npx shadcn-ui@latest add button",
              "",
              "Now you can use the component in your project!",
            ],
          },
          vite: {
            description: "Installation guide for Vite project",
            steps: [
              "Create a Vite project if you don't have one already:",
              `${packageManager}${packageManager === "npm" ? " create" : ""} vite my-app -- --template react-ts`,
              "",
              "Navigate to your project directory:",
              "cd my-app",
              "",
              "Install dependencies:",
              `${packageManager} ${packageManager === "npm" ? "install" : "add"} -D tailwindcss postcss autoprefixer`,
              "",
              "Initialize Tailwind CSS:",
              "npx tailwindcss init -p",
              "",
              "Add shadcn/ui to your project:",
              packageManager === "npm"
                ? "npx shadcn-ui@latest init"
                : packageManager === "pnpm"
                  ? "pnpm dlx shadcn-ui@latest init"
                  : packageManager === "yarn"
                    ? "yarn dlx shadcn-ui@latest init"
                    : packageManager === "bun"
                      ? "bunx --bun shadcn-ui@latest init"
                      : "npx shadcn-ui@latest init",
              "",
              "Follow the prompts to select your preferences",
              "",
              "Once initialized, you can add components:",
              packageManager === "npm"
                ? "npx shadcn-ui@latest add button"
                : packageManager === "pnpm"
                  ? "pnpm dlx shadcn-ui@latest add button"
                  : packageManager === "yarn"
                    ? "yarn dlx shadcn-ui@latest add button"
                    : packageManager === "bun"
                      ? "bunx --bun shadcn-ui@latest add button"
                      : "npx shadcn-ui@latest add button",
              "",
              "Now you can use the component in your project!",
            ],
          },
          remix: {
            description: "Installation guide for Remix project",
            steps: [
              "Create a Remix project if you don't have one already:",
              `${packageManager === "npm" ? "npx" : packageManager === "pnpm" ? "pnpm dlx" : packageManager === "yarn" ? "yarn dlx" : "bunx"} create-remix my-app`,
              "",
              "Navigate to your project directory:",
              "cd my-app",
              "",
              "Install dependencies:",
              `${packageManager} ${packageManager === "npm" ? "install" : "add"} -D tailwindcss postcss autoprefixer`,
              "",
              "Initialize Tailwind CSS:",
              "npx tailwindcss init -p",
              "",
              "Add shadcn/ui to your project:",
              packageManager === "npm"
                ? "npx shadcn-ui@latest init"
                : packageManager === "pnpm"
                  ? "pnpm dlx shadcn-ui@latest init"
                  : packageManager === "yarn"
                    ? "yarn dlx shadcn-ui@latest init"
                    : packageManager === "bun"
                      ? "bunx --bun shadcn-ui@latest init"
                      : "npx shadcn-ui@latest init",
              "",
              "Follow the prompts to select your preferences",
              "",
              "Once initialized, you can add components:",
              packageManager === "npm"
                ? "npx shadcn-ui@latest add button"
                : packageManager === "pnpm"
                  ? "pnpm dlx shadcn-ui@latest add button"
                  : packageManager === "yarn"
                    ? "yarn dlx shadcn-ui@latest add button"
                    : packageManager === "bun"
                      ? "bunx --bun shadcn-ui@latest add button"
                      : "npx shadcn-ui@latest add button",
              "",
              "Now you can use the component in your project!",
            ],
          },
          default: {
            description: "Generic installation guide",
            steps: [
              "Make sure you have a React project set up",
              "",
              "Add shadcn/ui to your project:",
              packageManager === "npm"
                ? "npx shadcn-ui@latest init"
                : packageManager === "pnpm"
                  ? "pnpm dlx shadcn-ui@latest init"
                  : packageManager === "yarn"
                    ? "yarn dlx shadcn-ui@latest init"
                    : packageManager === "bun"
                      ? "bunx --bun shadcn-ui@latest init"
                      : "npx shadcn-ui@latest init",
              "",
              "Follow the prompts to select your preferences",
              "",
              "Once initialized, you can add components:",
              packageManager === "npm"
                ? "npx shadcn-ui@latest add button"
                : packageManager === "pnpm"
                  ? "pnpm dlx shadcn-ui@latest add button"
                  : packageManager === "yarn"
                    ? "yarn dlx shadcn-ui@latest add button"
                    : packageManager === "bun"
                      ? "bunx --bun shadcn-ui@latest add button"
                      : "npx shadcn-ui@latest add button",
              "",
              "Now you can use the component in your project!",
            ],
          },
        };

        // Select appropriate guide based on framework
        const guide =
          guides[framework.toLowerCase() as keyof typeof guides] ||
          guides.default;

        return {
          content: `# ${guide.description} with ${packageManager}\n\n${guide.steps.join("\n")}`,
          contentType: "text/plain",
        };
      } catch (error) {
        return {
          content: `Error generating installation guide: ${error instanceof Error ? error.message : String(error)}`,
          contentType: "text/plain",
        };
      }
    };
  }

  return undefined;
};
