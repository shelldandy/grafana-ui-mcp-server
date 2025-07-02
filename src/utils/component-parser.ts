/**
 * Component parser for Grafana UI TypeScript components
 * Extracts metadata, props, imports, exports, and dependencies from component source code
 */

export interface ComponentMetadata {
  name: string;
  description?: string;
  props: PropDefinition[];
  exports: ExportDefinition[];
  imports: ImportDefinition[];
  dependencies: string[];
  hasTests: boolean;
  hasStories: boolean;
  hasDocumentation: boolean;
}

export interface PropDefinition {
  name: string;
  type: string;
  required: boolean;
  description?: string;
  defaultValue?: string;
}

export interface ExportDefinition {
  name: string;
  type: "component" | "type" | "function" | "const";
  isDefault?: boolean;
}

export interface ImportDefinition {
  module: string;
  imports: string[];
  isDefault?: boolean;
  isNamespace?: boolean;
}

/**
 * Parse TypeScript component code and extract all metadata
 * @param componentName Name of the component
 * @param code TypeScript source code
 * @returns ComponentMetadata object
 */
export function parseComponentMetadata(
  componentName: string,
  code: string,
): ComponentMetadata {
  const imports = extractImportsFromCode(code);
  const exports = extractExportsFromCode(code);
  const dependencies = extractDependencies(code);

  // Try to find props interface - look for ComponentProps pattern
  const propsInterfaceName = findPropsInterface(code, componentName);
  const props = propsInterfaceName
    ? extractPropsFromCode(code, propsInterfaceName)
    : [];

  // Extract description from JSDoc comments
  const description = extractComponentDescription(code, componentName);

  return {
    name: componentName,
    description,
    props,
    exports: parseExports(exports),
    imports: parseImports(code),
    dependencies,
    hasTests: false, // Will be set by caller based on file structure
    hasStories: false, // Will be set by caller based on file structure
    hasDocumentation: false, // Will be set by caller based on file structure
  };
}

/**
 * Extract external dependencies from import statements
 * @param code TypeScript source code
 * @returns Array of external dependency names
 */
export function extractImportsFromCode(code: string): string[] {
  const dependencies: string[] = [];

  // Match import statements
  const importRegex = /import\s+.*?\s+from\s+['"]([@\w\/\-\.]+)['"]/g;
  let match;

  while ((match = importRegex.exec(code)) !== null) {
    const dep = match[1];
    // Only include external dependencies (not relative imports)
    if (
      !dep.startsWith("./") &&
      !dep.startsWith("../") &&
      !dep.startsWith("@/")
    ) {
      dependencies.push(dep);
    }
  }

  return [...new Set(dependencies)]; // Remove duplicates
}

/**
 * Extract exported identifiers from code
 * @param code TypeScript source code
 * @returns Array of exported names
 */
export function extractExportsFromCode(code: string): string[] {
  const exports: string[] = [];

  // Match export statements
  const exportRegexes = [
    /export\s+(?:type|interface)\s+(\w+)/g,
    /export\s+(?:const|let|var)\s+(\w+)/g,
    /export\s+(?:function)\s+(\w+)/g,
    /export\s+(?:class)\s+(\w+)/g,
    /export\s+\{([^}]+)\}/g, // Named exports
  ];

  exportRegexes.forEach((regex) => {
    let match;
    while ((match = regex.exec(code)) !== null) {
      if (regex.source.includes("\\{")) {
        // Handle named exports
        const namedExports = match[1]
          .split(",")
          .map((exp) => exp.trim().split(" as ")[0]);
        exports.push(...namedExports);
      } else {
        exports.push(match[1]);
      }
    }
  });

  return [...new Set(exports)]; // Remove duplicates
}

/**
 * Extract props from a TypeScript interface or type definition
 * @param code TypeScript source code
 * @param interfaceName Name of the interface to extract props from
 * @returns Array of prop definitions
 */
export function extractPropsFromCode(
  code: string,
  interfaceName: string,
): PropDefinition[] {
  const props: PropDefinition[] = [];

  // Find the interface definition
  const interfaceRegex = new RegExp(
    `(?:type|interface)\\s+${interfaceName}\\s*=?\\s*\\{([^}]*)\\}`,
    "s",
  );
  const match = code.match(interfaceRegex);

  if (!match) {
    return props;
  }

  const interfaceBody = match[1];

  // Extract each property
  const propRegex = /(\/\*\*\s*(.*?)\s*\*\/\s*)?(\w+)(\?)?:\s*([^;,\n]+)/g;
  let propMatch;

  while ((propMatch = propRegex.exec(interfaceBody)) !== null) {
    const [, , comment, name, optional, type] = propMatch;

    props.push({
      name,
      type: type.trim(),
      required: !optional,
      description: comment ? comment.trim() : undefined,
      defaultValue: undefined, // Could be extracted from default props or function parameters
    });
  }

  // Also try simpler property extraction without JSDoc
  if (props.length === 0) {
    const simplePropRegex = /(\w+)(\?)?:\s*([^;,\n]+)/g;
    let simplePropMatch;

    while ((simplePropMatch = simplePropRegex.exec(interfaceBody)) !== null) {
      const [, name, optional, type] = simplePropMatch;

      // Check if there's a comment above this property
      const lines = interfaceBody.split("\n");
      const propLineIndex = lines.findIndex((line) =>
        line.includes(`${name}:`),
      );
      let description: string | undefined;

      if (propLineIndex > 0) {
        const prevLine = lines[propLineIndex - 1].trim();
        if (
          prevLine.startsWith("/**") ||
          prevLine.startsWith("*") ||
          prevLine.startsWith("//")
        ) {
          description = prevLine.replace(/\/\*\*|\*\/|\*|\/\//g, "").trim();
        }
      }

      props.push({
        name,
        type: type.trim(),
        required: !optional,
        description,
        defaultValue: undefined,
      });
    }
  }

  return props;
}

/**
 * Find the props interface name for a component
 * @param code TypeScript source code
 * @param componentName Name of the component
 * @returns Props interface name if found
 */
function findPropsInterface(
  code: string,
  componentName: string,
): string | null {
  // Common patterns for props interfaces
  const patterns = [
    `${componentName}Props`,
    `I${componentName}Props`,
    `${componentName}Properties`,
    "CommonProps", // Fallback for some components
  ];

  for (const pattern of patterns) {
    if (
      code.includes(`type ${pattern}`) ||
      code.includes(`interface ${pattern}`)
    ) {
      return pattern;
    }
  }

  return null;
}

/**
 * Extract component description from JSDoc comments
 * @param code TypeScript source code
 * @param componentName Name of the component
 * @returns Component description if found
 */
function extractComponentDescription(
  code: string,
  componentName: string,
): string | undefined {
  // Look for JSDoc comment before component definition
  const componentRegex = new RegExp(
    `/\\*\\*([^*]|\\*(?!/))*\\*/\\s*export\\s+const\\s+${componentName}`,
    "s",
  );
  const match = code.match(componentRegex);

  if (match) {
    return match[0]
      .replace(/\/\*\*|\*\/|\*|/g, "")
      .trim()
      .split("\n")[0]
      .trim();
  }

  return undefined;
}

/**
 * Parse imports into structured format
 * @param code TypeScript source code
 * @returns Array of import definitions
 */
function parseImports(code: string): ImportDefinition[] {
  const imports: ImportDefinition[] = [];
  const importRegex =
    /import\s+((?:\w+,\s*)?(?:\{[^}]*\}|\*\s+as\s+\w+|\w+))\s+from\s+['"]([^'"]+)['"]/g;

  let match;
  while ((match = importRegex.exec(code)) !== null) {
    const [, importSpec, module] = match;

    if (importSpec.includes("* as ")) {
      // Namespace import
      const namespaceMatch = importSpec.match(/\*\s+as\s+(\w+)/);
      if (namespaceMatch) {
        imports.push({
          module,
          imports: [namespaceMatch[1]],
          isNamespace: true,
        });
      }
    } else if (importSpec.includes("{")) {
      // Named imports
      const namedImports = importSpec
        .replace(/[{}]/g, "")
        .split(",")
        .map((imp) => imp.trim())
        .filter(Boolean);

      imports.push({
        module,
        imports: namedImports,
      });
    } else {
      // Default import
      imports.push({
        module,
        imports: [importSpec.trim()],
        isDefault: true,
      });
    }
  }

  return imports;
}

/**
 * Parse exports into structured format
 * @param exportNames Array of export names
 * @returns Array of export definitions
 */
function parseExports(exportNames: string[]): ExportDefinition[] {
  return exportNames.map((name) => ({
    name,
    type: inferExportType(name), // Simple heuristic-based type inference
    isDefault: false, // We don't handle default exports in this simple version
  }));
}

/**
 * Infer export type based on naming conventions
 * @param name Export name
 * @returns Inferred export type
 */
function inferExportType(name: string): ExportDefinition["type"] {
  if (
    name.endsWith("Props") ||
    name.endsWith("Type") ||
    name.endsWith("Interface")
  ) {
    return "type";
  }
  if (name[0] === name[0].toUpperCase() && !name.includes("_")) {
    return "component";
  }
  if (name.includes("_") || name.toUpperCase() === name) {
    return "const";
  }
  return "function";
}

/**
 * Extract external dependencies for the component
 * @param code TypeScript source code
 * @returns Array of external dependency names
 */
function extractDependencies(code: string): string[] {
  return extractImportsFromCode(code);
}
