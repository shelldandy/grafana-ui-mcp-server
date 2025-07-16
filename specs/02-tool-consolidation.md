# Tool Consolidation Specification

## Overview

Consolidate the current 11 MCP tools into a single unified `grafana_ui` tool to reduce complexity and improve agent context management.

## Current State

The MCP server currently exposes 11 separate tools:

1. `get_component` - Get component source code
2. `get_component_demo` - Get component stories/examples  
3. `list_components` - List all available components
4. `get_component_metadata` - Get component metadata
5. `get_directory_structure` - Get repository directory structure
6. `get_component_documentation` - Get MDX documentation
7. `get_component_stories` - Get parsed Storybook stories
8. `get_component_tests` - Get test files
9. `search_components` - Search components by name/description
10. `get_theme_tokens` - Get design system tokens
11. `get_component_dependencies` - Get dependency analysis

## Problem Statement

- Too many tools create cognitive overhead for AI agents
- Difficult for agents to maintain context about available functionality
- Complex MCP client configuration
- Maintenance overhead with 11 separate tool definitions

## Proposed Solution

### Single Unified Tool: `grafana_ui`

Replace all 11 tools with one configurable tool that uses an `action` parameter to determine the operation.

### Tool Schema

```typescript
{
  action: "get_component" | "get_demo" | "list_components" | "get_metadata" | 
          "get_directory" | "get_documentation" | "get_stories" | "get_tests" | 
          "search" | "get_theme_tokens" | "get_dependencies",
  
  // Component-specific parameters
  componentName?: string,      // Required for component-specific actions
  
  // Search parameters
  query?: string,              // Required for search action
  includeDescription?: boolean, // Optional for search
  
  // Theme parameters
  category?: string,           // Optional for theme tokens filtering
  
  // Dependency parameters
  deep?: boolean,              // Optional for recursive dependency analysis
  
  // Directory structure parameters
  path?: string,               // Optional path within repository
  owner?: string,              // Optional repository owner
  repo?: string,               // Optional repository name
  branch?: string              // Optional branch name
}
```

### Action Types

| Action | Required Parameters | Optional Parameters | Description |
|--------|-------------------|-------------------|-------------|
| `get_component` | `componentName` | - | Get component source code |
| `get_demo` | `componentName` | - | Get component stories/examples |
| `list_components` | - | - | List all available components |
| `get_metadata` | `componentName` | - | Get component metadata |
| `get_directory` | - | `path`, `owner`, `repo`, `branch` | Get repository directory structure |
| `get_documentation` | `componentName` | - | Get MDX documentation |
| `get_stories` | `componentName` | - | Get parsed Storybook stories |
| `get_tests` | `componentName` | - | Get test files |
| `search` | `query` | `includeDescription` | Search components |
| `get_theme_tokens` | - | `category` | Get design system tokens |
| `get_dependencies` | `componentName` | `deep` | Get dependency analysis |

### Example Usage

```typescript
// Get component source
{ action: "get_component", componentName: "Button" }

// Search components
{ action: "search", query: "input", includeDescription: true }

// Get theme tokens for colors
{ action: "get_theme_tokens", category: "colors" }

// Get directory structure
{ action: "get_directory", path: "packages/grafana-ui/src/components" }
```

## Implementation Plan

### Phase 1: Core Implementation

1. **Update `src/tools.ts`**:
   - Remove 11 individual tool definitions
   - Create single `grafana_ui` tool with comprehensive schema
   - Implement action router that dispatches to existing axios functions
   - Maintain all existing functionality through action parameter

2. **Update `src/handler.ts`**:
   - Replace individual tool schemas with unified schema
   - Simplify validation logic
   - Update `getToolSchema()` function

### Phase 2: Backward Compatibility

3. **Maintain exports**:
   - Keep existing `tools` and `toolHandlers` exports for compatibility
   - Update exports to reference unified tool structure
   - Ensure no breaking changes for existing integrations

### Phase 3: Validation & Testing

4. **Validation**:
   - Comprehensive Zod schema validation for all action types
   - Parameter requirement validation based on action
   - Clear error messages for invalid combinations

5. **Testing**:
   - Update test scripts to use new unified tool
   - Verify all existing functionality works through action parameter
   - Test parameter validation

## Benefits

- **Reduced Complexity**: 1 tool instead of 11
- **Better Agent Context**: Easier for AI agents to understand and use
- **Simplified Configuration**: Single tool in MCP client config
- **Maintainability**: Centralized tool logic
- **Preserved Functionality**: All existing capabilities maintained
- **Future-Proof**: Easy to add new actions without creating new tools

## Migration Strategy

1. Implement unified tool alongside existing tools
2. Update documentation and examples
3. Migrate internal usage to unified tool
4. Deprecate individual tools (keeping for compatibility)
5. Eventually remove deprecated tools in next major version

## Files Modified

- `src/tools.ts` - Main implementation
- `src/handler.ts` - Schema validation updates
- `specs/02-tool-consolidation.md` - This specification

## Success Criteria

- [ ] Single `grafana_ui` tool handles all 11 previous tool functions
- [ ] All existing functionality preserved
- [ ] Comprehensive parameter validation
- [ ] Backward compatibility maintained
- [ ] Test suite passes
- [ ] Documentation updated