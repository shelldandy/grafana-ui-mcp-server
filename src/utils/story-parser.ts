/**
 * Story parser for Grafana UI Storybook files
 * Extracts stories, examples, metadata, and arg types from .story.tsx files
 */

export interface StoryDefinition {
  name: string;
  args?: Record<string, any>;
  parameters?: Record<string, any>;
  source: string;
  description?: string;
}

export interface StorybookMeta {
  title: string;
  component: string;
  stories: StoryDefinition[];
  argTypes?: Record<string, any>;
  parameters?: Record<string, any>;
  decorators?: string[];
}

export interface StoryMetadata {
  componentName: string;
  meta: StorybookMeta;
  totalStories: number;
  hasInteractiveStories: boolean;
  hasExamples: boolean;
}

/**
 * Parse Storybook story file and extract all metadata
 * @param componentName Name of the component
 * @param storyCode TypeScript story source code
 * @returns StoryMetadata object
 */
export function parseStoryMetadata(
  componentName: string,
  storyCode: string,
): StoryMetadata {
  const meta = extractStorybookMeta(storyCode, componentName);
  const stories = extractStories(storyCode);

  return {
    componentName,
    meta: {
      ...meta,
      stories,
    },
    totalStories: stories.length,
    hasInteractiveStories: stories.some(
      (story) => story.args && Object.keys(story.args).length > 0,
    ),
    hasExamples: stories.length > 0,
  };
}

/**
 * Extract Storybook meta configuration from story file
 * @param storyCode TypeScript story source code
 * @param componentName Name of the component
 * @returns StorybookMeta object
 */
function extractStorybookMeta(
  storyCode: string,
  componentName: string,
): Omit<StorybookMeta, "stories"> {
  const meta: Omit<StorybookMeta, "stories"> = {
    title: "",
    component: componentName,
    argTypes: undefined,
    parameters: undefined,
    decorators: undefined,
  };

  // Find default export (meta configuration)
  const defaultExportRegex = /export\s+default\s*\{([^}]*)\}/s;
  const metaMatch = storyCode.match(defaultExportRegex);

  if (metaMatch) {
    const metaContent = metaMatch[1];

    // Extract title
    const titleMatch = metaContent.match(/title:\s*['"`]([^'"`]+)['"`]/);
    if (titleMatch) {
      meta.title = titleMatch[1];
    }

    // Extract component reference
    const componentMatch = metaContent.match(/component:\s*(\w+)/);
    if (componentMatch) {
      meta.component = componentMatch[1];
    }

    // Extract argTypes
    const argTypesMatch = metaContent.match(/argTypes:\s*\{([^}]*)\}/s);
    if (argTypesMatch) {
      meta.argTypes = parseObjectLiteral(argTypesMatch[1]);
    }

    // Extract parameters
    const parametersMatch = metaContent.match(/parameters:\s*\{([^}]*)\}/s);
    if (parametersMatch) {
      meta.parameters = parseObjectLiteral(parametersMatch[1]);
    }
  }

  return meta;
}

/**
 * Extract individual stories from story file
 * @param storyCode TypeScript story source code
 * @returns Array of story definitions
 */
function extractStories(storyCode: string): StoryDefinition[] {
  const stories: StoryDefinition[] = [];

  // Find all named exports that are stories
  const storyRegex = /export\s+const\s+(\w+):\s*StoryFn[^=]*=\s*([^;]+);?/g;
  let match;

  while ((match = storyRegex.exec(storyCode)) !== null) {
    const [fullMatch, storyName, storyContent] = match;

    const story: StoryDefinition = {
      name: storyName,
      source: fullMatch,
      description: extractStoryDescription(storyCode, storyName),
    };

    // Extract args if it's an object story
    const argsMatch = storyContent.match(/\{([^}]*)\}/s);
    if (argsMatch) {
      story.args = parseObjectLiteral(argsMatch[1]);
    }

    stories.push(story);
  }

  // Also look for simpler story definitions
  const simpleStoryRegex =
    /export\s+const\s+(\w+)\s*=\s*\(\)\s*=>\s*\{([^}]*)\}/gs;
  let simpleMatch;

  while ((simpleMatch = simpleStoryRegex.exec(storyCode)) !== null) {
    const [fullMatch, storyName, storyContent] = simpleMatch;

    // Skip if we already found this story
    if (stories.some((s) => s.name === storyName)) {
      continue;
    }

    const story: StoryDefinition = {
      name: storyName,
      source: fullMatch,
      description: extractStoryDescription(storyCode, storyName),
    };

    stories.push(story);
  }

  return stories;
}

/**
 * Extract description comment for a story
 * @param storyCode Full story source code
 * @param storyName Name of the story
 * @returns Description if found
 */
function extractStoryDescription(
  storyCode: string,
  storyName: string,
): string | undefined {
  // Look for JSDoc comment before the story export
  const storyRegex = new RegExp(
    `(/\\*\\*[^*]*\\*/)?\\s*export\\s+const\\s+${storyName}`,
    "s",
  );
  const match = storyCode.match(storyRegex);

  if (match && match[1]) {
    return match[1]
      .replace(/\/\*\*|\*\/|\*/g, "")
      .trim()
      .split("\n")[0]
      .trim();
  }

  return undefined;
}

/**
 * Parse simple object literal from string (basic implementation)
 * @param objectContent Object content as string
 * @returns Parsed object
 */
function parseObjectLiteral(objectContent: string): Record<string, any> {
  const result: Record<string, any> = {};

  // Simple property extraction (not a full parser)
  const propRegex = /(\w+):\s*([^,\n}]+)/g;
  let match;

  while ((match = propRegex.exec(objectContent)) !== null) {
    const [, key, value] = match;

    // Try to parse common value types
    const trimmedValue = value.trim();
    if (trimmedValue.startsWith("'") || trimmedValue.startsWith('"')) {
      // String value
      result[key] = trimmedValue.slice(1, -1);
    } else if (trimmedValue === "true" || trimmedValue === "false") {
      // Boolean value
      result[key] = trimmedValue === "true";
    } else if (!isNaN(Number(trimmedValue))) {
      // Number value
      result[key] = Number(trimmedValue);
    } else {
      // Keep as string for complex values
      result[key] = trimmedValue;
    }
  }

  return result;
}

/**
 * Extract component examples from story file
 * @param storyCode TypeScript story source code
 * @returns Array of example code snippets
 */
export function extractStoryExamples(storyCode: string): string[] {
  const examples: string[] = [];

  // Look for JSX return statements in stories
  const jsxRegex = /return\s*\(\s*([^)]+)\s*\)/gs;
  let match;

  while ((match = jsxRegex.exec(storyCode)) !== null) {
    examples.push(match[1].trim());
  }

  return examples;
}

/**
 * Extract story controls and arg types
 * @param storyCode TypeScript story source code
 * @returns Controls configuration
 */
export function extractStoryControls(storyCode: string): Record<string, any> {
  const controls: Record<string, any> = {};

  // Look for argTypes in default export
  const argTypesRegex = /argTypes:\s*\{([^}]*)\}/s;
  const match = storyCode.match(argTypesRegex);

  if (match) {
    const argTypesContent = match[1];

    // Extract each arg type
    const argRegex = /(\w+):\s*\{([^}]*)\}/g;
    let argMatch;

    while ((argMatch = argRegex.exec(argTypesContent)) !== null) {
      const [, argName, argConfig] = argMatch;
      controls[argName] = parseObjectLiteral(argConfig);
    }
  }

  return controls;
}

/**
 * Check if story file contains interactive features
 * @param storyCode TypeScript story source code
 * @returns True if interactive features are detected
 */
export function hasInteractiveFeatures(storyCode: string): boolean {
  const interactivePatterns = [
    "action(",
    "userEvent",
    "fireEvent",
    "args.",
    "argTypes",
    "controls:",
  ];

  return interactivePatterns.some((pattern) => storyCode.includes(pattern));
}

/**
 * Extract decorators from story file
 * @param storyCode TypeScript story source code
 * @returns Array of decorator names
 */
export function extractDecorators(storyCode: string): string[] {
  const decorators: string[] = [];

  const decoratorRegex = /decorators:\s*\[([^\]]*)\]/s;
  const match = storyCode.match(decoratorRegex);

  if (match) {
    const decoratorContent = match[1];
    const decoratorNames = decoratorContent.split(",").map((d) => d.trim());
    decorators.push(...decoratorNames);
  }

  return decorators;
}
