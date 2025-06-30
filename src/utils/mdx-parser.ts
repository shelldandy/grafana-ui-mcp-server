/**
 * MDX parser for Grafana UI documentation files
 * Extracts structured content, examples, and metadata from .mdx files
 */

export interface MDXContent {
  title: string;
  content: string;
  sections: MDXSection[];
  examples: CodeExample[];
  metadata: Record<string, any>;
  imports: string[];
  components: string[];
}

export interface MDXSection {
  title: string;
  level: number;
  content: string;
  examples: CodeExample[];
  startLine?: number;
  endLine?: number;
}

export interface CodeExample {
  code: string;
  language?: string;
  title?: string;
  description?: string;
  type: "code" | "component" | "example-frame";
  props?: Record<string, any>;
}

export interface MDXMetadata {
  componentName: string;
  title: string;
  description?: string;
  sections: number;
  examples: number;
  hasProps: boolean;
  hasUsageGuidelines: boolean;
  hasAccessibilityInfo: boolean;
}

/**
 * Parse MDX documentation file and extract all content
 * @param componentName Name of the component
 * @param mdxCode MDX source code
 * @returns MDXContent object
 */
export function parseMDXContent(
  componentName: string,
  mdxCode: string,
): MDXContent {
  const metadata = extractFrontmatter(mdxCode);
  const imports = extractImports(mdxCode);
  const components = extractComponentReferences(mdxCode);
  const title = extractTitle(mdxCode) || componentName;
  const sections = extractSections(mdxCode);
  const examples = extractAllExamples(mdxCode);

  return {
    title,
    content: mdxCode,
    sections,
    examples,
    metadata,
    imports,
    components,
  };
}

/**
 * Extract frontmatter metadata from MDX file
 * @param mdxCode MDX source code
 * @returns Metadata object
 */
function extractFrontmatter(mdxCode: string): Record<string, any> {
  const frontmatterRegex = /^---\n(.*?)\n---/s;
  const match = mdxCode.match(frontmatterRegex);

  if (!match) {
    return {};
  }

  const frontmatter = match[1];
  const metadata: Record<string, any> = {};

  // Simple YAML-like parsing
  const lines = frontmatter.split("\n");
  for (const line of lines) {
    const colonIndex = line.indexOf(":");
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      const value = line
        .substring(colonIndex + 1)
        .trim()
        .replace(/^['"]|['"]$/g, "");
      metadata[key] = value;
    }
  }

  return metadata;
}

/**
 * Extract import statements from MDX file
 * @param mdxCode MDX source code
 * @returns Array of imported modules
 */
function extractImports(mdxCode: string): string[] {
  const imports: string[] = [];
  const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;

  let match;
  while ((match = importRegex.exec(mdxCode)) !== null) {
    imports.push(match[1]);
  }

  return imports;
}

/**
 * Extract component references from MDX content
 * @param mdxCode MDX source code
 * @returns Array of component names used
 */
function extractComponentReferences(mdxCode: string): string[] {
  const components: string[] = [];

  // Find JSX components in the content
  const componentRegex = /<([A-Z]\w+)/g;
  let match;

  while ((match = componentRegex.exec(mdxCode)) !== null) {
    components.push(match[1]);
  }

  return [...new Set(components)]; // Remove duplicates
}

/**
 * Extract main title from MDX content
 * @param mdxCode MDX source code
 * @returns Title string if found
 */
function extractTitle(mdxCode: string): string | null {
  // Look for main heading (# Title)
  const titleRegex = /^#\s+(.+)$/m;
  const match = mdxCode.match(titleRegex);

  if (match) {
    return match[1].trim();
  }

  // Fallback to Meta title
  const metaTitleRegex = /<Meta\s+title="([^"]+)"/;
  const metaMatch = mdxCode.match(metaTitleRegex);

  if (metaMatch) {
    return metaMatch[1];
  }

  return null;
}

/**
 * Extract sections from MDX content
 * @param mdxCode MDX source code
 * @returns Array of sections
 */
function extractSections(mdxCode: string): MDXSection[] {
  const sections: MDXSection[] = [];
  const lines = mdxCode.split("\n");

  let currentSection: Partial<MDXSection> | null = null;
  let currentContent: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);

    if (headingMatch) {
      // Save previous section
      if (currentSection) {
        currentSection.content = currentContent.join("\n").trim();
        currentSection.examples = extractExamplesFromContent(
          currentSection.content,
        );
        currentSection.endLine = i - 1;
        sections.push(currentSection as MDXSection);
      }

      // Start new section
      const level = headingMatch[1].length;
      const title = headingMatch[2].trim();

      currentSection = {
        title,
        level,
        content: "",
        examples: [],
        startLine: i,
      };
      currentContent = [];
    } else if (currentSection) {
      currentContent.push(line);
    }
  }

  // Save last section
  if (currentSection) {
    currentSection.content = currentContent.join("\n").trim();
    currentSection.examples = extractExamplesFromContent(
      currentSection.content,
    );
    currentSection.endLine = lines.length - 1;
    sections.push(currentSection as MDXSection);
  }

  return sections;
}

/**
 * Extract all code examples from MDX content
 * @param mdxCode MDX source code
 * @returns Array of code examples
 */
function extractAllExamples(mdxCode: string): CodeExample[] {
  const examples: CodeExample[] = [];

  // Extract ExampleFrame components
  const exampleFrameRegex = /<ExampleFrame[^>]*>(.*?)<\/ExampleFrame>/gs;
  let match;

  while ((match = exampleFrameRegex.exec(mdxCode)) !== null) {
    const content = match[1].trim();
    examples.push({
      code: content,
      type: "example-frame",
      language: "jsx",
      description: "Interactive example",
    });
  }

  // Extract code blocks
  const codeBlockRegex = /```(\w+)?\n(.*?)\n```/gs;
  let codeMatch;

  while ((codeMatch = codeBlockRegex.exec(mdxCode)) !== null) {
    const language = codeMatch[1] || "text";
    const code = codeMatch[2];

    examples.push({
      code,
      language,
      type: "code",
      description: `${language} code example`,
    });
  }

  // Extract inline JSX examples
  const jsxRegex = /<(\w+)[^>]*>.*?<\/\1>/gs;
  let jsxMatch;

  while ((jsxMatch = jsxRegex.exec(mdxCode)) !== null) {
    const componentName = jsxMatch[0].match(/<(\w+)/)?.[1];

    // Only include component examples, not HTML elements
    if (componentName && componentName[0] === componentName[0].toUpperCase()) {
      examples.push({
        code: jsxMatch[0],
        type: "component",
        language: "jsx",
        description: `${componentName} usage example`,
      });
    }
  }

  return examples;
}

/**
 * Extract examples from a content section
 * @param content Section content
 * @returns Array of code examples in this section
 */
function extractExamplesFromContent(content: string): CodeExample[] {
  return extractAllExamples(content);
}

/**
 * Parse MDX file and extract metadata summary
 * @param componentName Name of the component
 * @param mdxCode MDX source code
 * @returns MDXMetadata object
 */
export function parseMDXMetadata(
  componentName: string,
  mdxCode: string,
): MDXMetadata {
  const content = parseMDXContent(componentName, mdxCode);

  return {
    componentName,
    title: content.title,
    description: extractDescription(mdxCode),
    sections: content.sections.length,
    examples: content.examples.length,
    hasProps: hasPropsSection(content.sections),
    hasUsageGuidelines: hasUsageSection(content.sections),
    hasAccessibilityInfo: hasAccessibilitySection(content.sections),
  };
}

/**
 * Extract description from MDX content
 * @param mdxCode MDX source code
 * @returns Description string if found
 */
function extractDescription(mdxCode: string): string | undefined {
  // Look for first paragraph after the title
  const lines = mdxCode.split("\n");
  let foundTitle = false;

  for (const line of lines) {
    if (line.match(/^#\s+/)) {
      foundTitle = true;
      continue;
    }

    if (
      foundTitle &&
      line.trim() &&
      !line.startsWith("#") &&
      !line.startsWith("<")
    ) {
      return line.trim();
    }
  }

  return undefined;
}

/**
 * Check if documentation has props section
 * @param sections Array of sections
 * @returns True if props section exists
 */
function hasPropsSection(sections: MDXSection[]): boolean {
  return sections.some(
    (section) =>
      section.title.toLowerCase().includes("props") ||
      section.title.toLowerCase().includes("api") ||
      section.content.includes("<ArgTypes"),
  );
}

/**
 * Check if documentation has usage guidelines
 * @param sections Array of sections
 * @returns True if usage section exists
 */
function hasUsageSection(sections: MDXSection[]): boolean {
  return sections.some(
    (section) =>
      section.title.toLowerCase().includes("usage") ||
      section.title.toLowerCase().includes("example") ||
      section.title.toLowerCase().includes("how to"),
  );
}

/**
 * Check if documentation has accessibility information
 * @param sections Array of sections
 * @returns True if accessibility section exists
 */
function hasAccessibilitySection(sections: MDXSection[]): boolean {
  return sections.some(
    (section) =>
      section.title.toLowerCase().includes("accessibility") ||
      section.title.toLowerCase().includes("a11y") ||
      section.content.toLowerCase().includes("screen reader") ||
      section.content.toLowerCase().includes("aria-"),
  );
}

/**
 * Extract usage patterns from documentation
 * @param mdxCode MDX source code
 * @returns Array of usage pattern descriptions
 */
export function extractUsagePatterns(mdxCode: string): string[] {
  const patterns: string[] = [];
  const content = parseMDXContent("", mdxCode);

  // Look for sections that describe usage patterns
  for (const section of content.sections) {
    if (
      section.title.toLowerCase().includes("usage") ||
      section.title.toLowerCase().includes("example") ||
      section.title.toLowerCase().includes("pattern")
    ) {
      // Extract key points from the section
      const sentences = section.content
        .split(/[.!?]+/)
        .map((s) => s.trim())
        .filter(Boolean);
      patterns.push(...sentences.slice(0, 3)); // Take first 3 key points
    }
  }

  return patterns;
}

/**
 * Extract accessibility guidelines from documentation
 * @param mdxCode MDX source code
 * @returns Array of accessibility guidelines
 */
export function extractAccessibilityGuidelines(mdxCode: string): string[] {
  const guidelines: string[] = [];
  const content = parseMDXContent("", mdxCode);

  // Look for accessibility-related content
  for (const section of content.sections) {
    if (hasAccessibilitySection([section])) {
      const sentences = section.content
        .split(/[.!?]+/)
        .map((s) => s.trim())
        .filter(Boolean);
      guidelines.push(...sentences);
    }
  }

  // Also look for inline accessibility mentions
  const a11yRegex =
    /(aria-[\w-]+|role=|screen reader|keyboard|focus|accessible)/gi;
  const matches = mdxCode.match(a11yRegex);
  if (matches) {
    guidelines.push(
      `Includes accessibility features: ${[...new Set(matches)].join(", ")}`,
    );
  }

  return guidelines;
}
