/**
 * Prompts implementation for the Grafana UI Model Context Protocol (MCP) server.
 *
 * This file defines prompts that guide the AI model's responses for Grafana UI development.
 * Prompts help to direct the model on how to build observability interfaces, dashboards,
 * and data visualization components using Grafana's design system.
 */

/**
 * List of prompts metadata available in this Grafana UI MCP server
 * Each prompt must have a name, description, and arguments if parameters are needed
 */
export const prompts = {
  "build-grafana-dashboard": {
    name: "build-grafana-dashboard",
    description:
      "Generate a comprehensive monitoring dashboard using Grafana UI components",
    arguments: [
      {
        name: "dashboardType",
        description:
          "Type of dashboard (monitoring, analytics, infrastructure, application, business)",
        required: true,
      },
      {
        name: "panels",
        description:
          "Dashboard panels needed (time-series, stat, table, gauge, logs)",
      },
      {
        name: "layout",
        description:
          "Layout preference (grid, rows, single-column, responsive)",
      },
      {
        name: "theme",
        description: "Theme preference (light, dark, auto)",
      },
    ],
  },
  "create-grafana-form": {
    name: "create-grafana-form",
    description:
      "Create forms and configuration interfaces using Grafana UI components",
    arguments: [
      {
        name: "formType",
        description:
          "Type of form (authentication, settings, data-source, alert, user-management)",
        required: true,
      },
      {
        name: "fields",
        description:
          "Form fields needed (input, select, switch, textarea, file-upload)",
      },
      {
        name: "validation",
        description: "Validation features (required, format, async, real-time)",
      },
    ],
  },
  "optimize-grafana-component": {
    name: "optimize-grafana-component",
    description:
      "Optimize or enhance existing Grafana UI components with best practices",
    arguments: [
      {
        name: "component",
        description: "Grafana UI component name to optimize",
        required: true,
      },
      {
        name: "optimization",
        description:
          "Type of optimization (performance, accessibility, responsive, theming)",
      },
      {
        name: "useCase",
        description: "Specific use case (dashboard, admin, mobile, embedded)",
      },
    ],
  },
  "create-data-visualization": {
    name: "create-data-visualization",
    description:
      "Create data tables and visualizations with Grafana UI components",
    arguments: [
      {
        name: "visualizationType",
        description:
          "Type of visualization (table, list, tree, timeline, graph, stat-panel)",
        required: true,
      },
      {
        name: "dataSource",
        description:
          "Data source type (time-series, logs, metrics, traces, json)",
      },
      {
        name: "features",
        description:
          "Visualization features (sorting, filtering, pagination, search, export)",
      },
    ],
  },
  "build-admin-interface": {
    name: "build-admin-interface",
    description: "Create admin interfaces following Grafana's design patterns",
    arguments: [
      {
        name: "interfaceType",
        description:
          "Type of interface (user-management, plugin-config, org-settings, data-sources)",
        required: true,
      },
      {
        name: "navigation",
        description: "Navigation style (sidebar, tabs, breadcrumbs, wizard)",
      },
      {
        name: "permissions",
        description:
          "Permission features (role-based, org-scoped, resource-scoped)",
      },
    ],
  },
};

/**
 * Map of prompt names to their handler functions
 * Each handler generates the actual prompt content with the provided parameters
 */
export const promptHandlers = {
  "build-grafana-dashboard": ({
    dashboardType,
    panels = "time-series,stat,table",
    layout = "grid",
    theme = "auto",
  }: {
    dashboardType: string;
    panels?: string;
    layout?: string;
    theme?: string;
  }) => {
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Create a comprehensive ${dashboardType} dashboard using Grafana UI components.

REQUIREMENTS:
- Dashboard Type: ${dashboardType}
- Panels: ${panels}
- Layout: ${layout}
- Theme: ${theme}

INSTRUCTIONS:
1. Use the MCP tools to explore available Grafana UI components:
   - Use 'grafana_ui' with action 'list_components' to see available components
   - Use 'grafana_ui' with action 'get_component' to fetch specific component implementations
   - Use 'grafana_ui' with action 'get_demo' to see component demos and examples
   - Use 'grafana_ui' with action 'get_documentation' for usage guidelines
   - Use 'grafana_ui' with action 'get_stories' to see interactive examples
   - Use 'grafana_ui' with action 'get_metadata' for component props and dependencies

2. Build the dashboard following these principles:
   - Use Grafana UI components as building blocks
   - Implement responsive design with CSS Grid/Flexbox
   - Follow Grafana's design system and accessibility guidelines
   - Use proper TypeScript types from @grafana/ui
   - Include proper ARIA labels and roles

3. For ${dashboardType} dashboards specifically:
   ${getDashboardTypeSpecificInstructions(dashboardType)}

4. Dashboard Structure:
   - Create a main dashboard container component
   - Implement panel components for each visualization
   - Include proper data fetching and state management
   - Add loading states and error handling
   - Implement refresh and time range controls

5. Theming and Styling:
   - Use 'grafana_ui' with action 'get_theme_tokens' to access Grafana's design tokens
   - Implement ${theme} theme support
   - Ensure proper contrast and readability
   - Follow Grafana's spacing and typography patterns

6. Data Visualization:
   - Create mock data appropriate for ${dashboardType}
   - Implement time-series data handling
   - Add proper units and formatting
   - Include interactive features (zoom, hover, selection)

Please provide complete, production-ready code with proper @grafana/ui imports and TypeScript types.`,
          },
        },
      ],
    };
  },

  "create-grafana-form": ({
    formType,
    fields = "input,select,switch",
    validation = "required,format",
  }: {
    formType: string;
    fields?: string;
    validation?: string;
  }) => {
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Create a comprehensive ${formType} form using Grafana UI components.

REQUIREMENTS:
- Form Type: ${formType}
- Fields: ${fields}
- Validation: ${validation}

INSTRUCTIONS:
1. Use the MCP tools to explore available Grafana UI form components:
   - Use 'grafana_ui' with action 'search' and query="form" to find form-related components
   - Use 'grafana_ui' with action 'get_component' to fetch Input, Select, Switch, Button components
   - Use 'grafana_ui' with action 'get_demo' to see form component examples
   - Use 'grafana_ui' with action 'get_documentation' for form usage guidelines
   - Use 'grafana_ui' with action 'get_stories' to see form component examples
   - Use 'grafana_ui' with action 'get_metadata' for component props and validation patterns

2. Build the form following these principles:
   - Use Grafana UI form components (Input, Select, Switch, etc.)
   - Implement proper form validation and error states
   - Follow Grafana's form design patterns and accessibility guidelines
   - Use proper TypeScript types from @grafana/ui
   - Include loading states and success/error feedback

3. For ${formType} forms specifically:
   ${getFormTypeSpecificInstructions(formType)}

4. Form Structure:
   - Create a main form container with proper layout
   - Implement field components with proper labels and help text
   - Add form validation with clear error messaging
   - Include submit/cancel actions with loading states
   - Implement proper focus management

5. Validation Features:
   ${validation
     .split(",")
     .map((v) => `- ${v.trim()}: Implement ${v.trim()} validation`)
     .join("\n   ")}

6. Accessibility and UX:
   - Use 'grafana_ui' with action 'get_theme_tokens' to access proper spacing and colors
   - Implement proper ARIA labels and descriptions
   - Add keyboard navigation support
   - Include clear validation feedback
   - Follow Grafana's form interaction patterns

Provide complete form implementation with proper @grafana/ui imports and TypeScript types.`,
          },
        },
      ],
    };
  },

  "optimize-grafana-component": ({
    component,
    optimization = "performance",
    useCase = "dashboard",
  }: {
    component: string;
    optimization?: string;
    useCase?: string;
  }) => {
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Optimize the ${component} Grafana UI component for ${optimization} and ${useCase} use case.

REQUIREMENTS:
- Component: ${component}
- Optimization Focus: ${optimization}
- Use Case: ${useCase}

INSTRUCTIONS:
1. First, analyze the current component:
   - Use 'grafana_ui' with action 'get_component' to fetch the ${component} source code
   - Use 'grafana_ui' with action 'get_demo' to see component demos and usage examples
   - Use 'grafana_ui' with action 'get_documentation' to understand usage guidelines
   - Use 'grafana_ui' with action 'get_stories' to see current examples
   - Use 'grafana_ui' with action 'get_metadata' to understand props and interfaces
   - Use 'grafana_ui' with action 'get_dependencies' to understand the dependency tree
   - Use 'grafana_ui' with action 'get_tests' to see existing test patterns

2. Optimization Strategy for ${optimization}:
   ${getOptimizationInstructions(optimization)}

3. Use Case Specific Enhancements for ${useCase}:
   - Analyze how ${component} is typically used in ${useCase} scenarios
   - Identify common patterns and performance bottlenecks
   - Consider Grafana's design system requirements
   - Optimize for observability and monitoring contexts

4. Implementation:
   - Provide optimized component code with @grafana/ui imports
   - Include performance benchmarks or considerations
   - Add proper TypeScript types and interfaces
   - Follow Grafana's coding standards and patterns
   - Include usage examples demonstrating improvements

5. Grafana-Specific Considerations:
   - Use 'grafana_ui' with action 'get_theme_tokens' to access design system tokens
   - Ensure compatibility with Grafana's theming system
   - Consider plugin development requirements
   - Optimize for real-time data visualization contexts

6. Testing and Validation:
   - Suggest test cases for the optimized component
   - Include accessibility testing recommendations
   - Performance testing guidelines specific to Grafana contexts
   - Consider cross-browser compatibility

Provide the optimized component code with detailed explanations of improvements made and how they benefit Grafana UI development.`,
          },
        },
      ],
    };
  },

  "create-data-visualization": ({
    visualizationType,
    dataSource = "time-series",
    features = "sorting,filtering,pagination",
  }: {
    visualizationType: string;
    dataSource?: string;
    features?: string;
  }) => {
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Create an advanced ${visualizationType} visualization for ${dataSource} data using Grafana UI components.

REQUIREMENTS:
- Visualization Type: ${visualizationType}
- Data Source: ${dataSource}
- Features: ${features}

INSTRUCTIONS:
1. Explore visualization components:
   - Use 'grafana_ui' with action 'search' and query="table" or "chart" to find relevant components
   - Use 'grafana_ui' with action 'get_component' for Table, List, or other visualization components
   - Use 'grafana_ui' with action 'get_demo' to see component examples and usage patterns
   - Use 'grafana_ui' with action 'get_documentation' for data handling guidelines
   - Use 'grafana_ui' with action 'get_stories' to see data visualization examples
   - Use 'grafana_ui' with action 'get_metadata' for component props and data interfaces

2. Visualization Structure:
   - Create a reusable ${visualizationType} component
   - Define proper TypeScript interfaces for ${dataSource} data
   - Implement responsive design for different screen sizes
   - Add proper loading and error states

3. Data Handling for ${dataSource}:
   ${getDataSourceSpecificInstructions(dataSource)}

4. Features Implementation:
   ${features
     .split(",")
     .map((feature) => {
       const featureInstructions: Record<string, string> = {
         sorting: "- Column/field sorting with visual indicators",
         filtering: "- Real-time filtering and search capabilities",
         pagination: "- Efficient pagination for large datasets",
         search: "- Global search across all fields",
         export: "- Data export functionality (CSV, JSON)",
         selection: "- Row/item selection with bulk actions",
       };
       return (
         featureInstructions[feature.trim()] ||
         `- ${feature.trim()}: Implement ${feature.trim()} functionality`
       );
     })
     .join("\n   ")}

5. Grafana-Specific Features:
   - Use 'grafana_ui' with action 'get_theme_tokens' to access proper colors and spacing
   - Implement time-based filtering (if applicable)
   - Add drill-down capabilities
   - Include proper data formatting and units
   - Support for Grafana's theming system

6. Performance Considerations:
   - Implement virtual scrolling for large datasets
   - Use proper memoization for expensive calculations
   - Add debounced search and filtering
   - Optimize re-renders with React best practices

7. Accessibility and UX:
   - Implement proper ARIA labels and roles
   - Add keyboard navigation support
   - Include loading skeletons and empty states
   - Provide clear visual feedback for interactions

Provide complete data visualization implementation with proper @grafana/ui imports, mock data, and usage examples.`,
          },
        },
      ],
    };
  },

  "build-admin-interface": ({
    interfaceType,
    navigation = "sidebar",
    permissions = "role-based",
  }: {
    interfaceType: string;
    navigation?: string;
    permissions?: string;
  }) => {
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Create a comprehensive ${interfaceType} admin interface using Grafana UI components.

REQUIREMENTS:
- Interface Type: ${interfaceType}
- Navigation: ${navigation}
- Permissions: ${permissions}

INSTRUCTIONS:
1. Use the MCP tools to explore available Grafana UI components:
   - Use 'grafana_ui' with action 'search' and query="nav" or "menu" for navigation components
   - Use 'grafana_ui' with action 'get_component' to fetch Button, Card, Modal, and other UI components
   - Use 'grafana_ui' with action 'get_demo' to see component usage examples
   - Use 'grafana_ui' with action 'get_documentation' for admin interface patterns
   - Use 'grafana_ui' with action 'get_stories' to see component combinations
   - Use 'grafana_ui' with action 'get_metadata' for component props and interfaces

2. Build the admin interface following these principles:
   - Use Grafana UI components for consistent design
   - Implement ${navigation} navigation pattern
   - Follow Grafana's admin interface conventions
   - Include proper loading states and error handling
   - Use proper TypeScript types from @grafana/ui

3. For ${interfaceType} interfaces specifically:
   ${getInterfaceTypeSpecificInstructions(interfaceType)}

4. Navigation Implementation:
   - Create a ${navigation} navigation structure
   - Include breadcrumb navigation for deep sections
   - Add search functionality for quick access
   - Implement proper route handling
   - Include user context and logout functionality

5. Permission System (${permissions}):
   - Implement ${permissions} access control
   - Add proper authorization checks
   - Include permission-based UI rendering
   - Add audit logging considerations
   - Handle permission errors gracefully

6. Admin Interface Features:
   - Create responsive layouts for different screen sizes
   - Implement bulk operations where applicable
   - Add data export and import functionality
   - Include system health and status indicators
   - Add proper form validation and feedback

7. Grafana-Specific Considerations:
   - Use 'grafana_ui' with action 'get_theme_tokens' to access proper styling
   - Follow Grafana's admin panel design patterns
   - Include plugin management considerations (if applicable)
   - Add organization-scoped features
   - Implement proper data source management patterns

8. User Experience:
   - Include clear visual hierarchy
   - Add contextual help and documentation links
   - Implement progressive disclosure for complex features
   - Include keyboard shortcuts for power users
   - Add proper accessibility support

Provide complete admin interface implementation with proper @grafana/ui imports, routing, and permission handling.`,
          },
        },
      ],
    };
  },
};

/**
 * Helper function to get dashboard type specific instructions
 */
function getDashboardTypeSpecificInstructions(dashboardType: string): string {
  const instructions = {
    monitoring: `
   - Focus on infrastructure metrics and system health
   - Include CPU, memory, disk, and network panels
   - Add alert status indicators and notification panels
   - Implement time-based filtering and zoom capabilities
   - Create drill-down functionality for detailed views`,

    analytics: `
   - Emphasize data analysis and business intelligence
   - Include trend analysis and comparative visualizations
   - Add data export and report generation features
   - Implement custom date range selection
   - Create interactive charts with filtering capabilities`,

    infrastructure: `
   - Focus on server, container, and service monitoring
   - Include topology views and dependency mapping
   - Add service health indicators and uptime tracking
   - Implement real-time data updates
   - Create hierarchical navigation for different infrastructure layers`,

    application: `
   - Focus on application performance and user experience
   - Include error tracking and performance metrics
   - Add user journey and funnel analysis
   - Implement feature flag and deployment tracking
   - Create contextual debugging information panels`,

    business: `
   - Focus on KPIs and business metrics
   - Include revenue, conversion, and growth tracking
   - Add goal tracking and performance indicators
   - Implement comparative analysis and benchmarking
   - Create executive summary and reporting views`,
  };

  return (
    instructions[dashboardType as keyof typeof instructions] ||
    "Focus on creating a comprehensive dashboard with relevant metrics and visualizations for the specified use case."
  );
}

/**
 * Helper function to get form type specific instructions
 */
function getFormTypeSpecificInstructions(formType: string): string {
  const instructions = {
    authentication: `
   - Implement secure login and registration forms
   - Add password strength validation and two-factor authentication
   - Include social authentication options where applicable
   - Add proper error handling and user feedback
   - Implement session management and logout functionality`,

    settings: `
   - Create organized settings panels with proper categorization
   - Add form validation with real-time feedback
   - Implement save/cancel functionality with confirmation dialogs
   - Include import/export capabilities for configuration
   - Add proper help text and documentation links`,

    "data-source": `
   - Create connection forms for various data sources
   - Add connection testing and validation
   - Implement secure credential handling
   - Include data source specific configuration options
   - Add troubleshooting and debugging information`,

    alert: `
   - Create alert rule configuration forms
   - Add condition builders with visual query editors
   - Implement notification channel configuration
   - Include alert testing and preview functionality
   - Add proper validation for alert conditions`,

    "user-management": `
   - Create user profile and permission management forms
   - Add role-based access control configuration
   - Implement organization and team management
   - Include user invitation and onboarding flows
   - Add audit logging and activity tracking`,
  };

  return (
    instructions[formType as keyof typeof instructions] ||
    "Focus on creating a well-structured form with proper validation and user experience."
  );
}

/**
 * Helper function to get data source specific instructions
 */
function getDataSourceSpecificInstructions(dataSource: string): string {
  const instructions = {
    "time-series": `
   - Implement time-based data handling with proper time zone support
   - Add time range selection and zoom functionality
   - Include data aggregation and downsampling options
   - Implement real-time data updates and streaming
   - Add proper time axis formatting and labeling`,

    logs: `
   - Implement log parsing and structured data extraction
   - Add log level filtering and severity indicators
   - Include full-text search and regex filtering
   - Implement log context and correlation features
   - Add proper log formatting and syntax highlighting`,

    metrics: `
   - Implement metric aggregation and mathematical operations
   - Add unit conversion and formatting options
   - Include threshold and alert condition visualization
   - Implement metric correlation and comparison
   - Add proper metric metadata and labeling`,

    traces: `
   - Implement distributed tracing visualization
   - Add span timeline and dependency mapping
   - Include trace search and filtering capabilities
   - Implement error highlighting and root cause analysis
   - Add proper trace context and service mapping`,

    json: `
   - Implement flexible JSON data parsing and visualization
   - Add dynamic field detection and type inference
   - Include nested object navigation and flattening
   - Implement custom data transformation options
   - Add proper JSON schema validation and documentation`,
  };

  return (
    instructions[dataSource as keyof typeof instructions] ||
    "Focus on creating appropriate data handling and visualization for the specified data source type."
  );
}

/**
 * Helper function to get interface type specific instructions
 */
function getInterfaceTypeSpecificInstructions(interfaceType: string): string {
  const instructions = {
    "user-management": `
   - Create user profile management with role assignment
   - Add organization and team management interfaces
   - Implement user invitation and onboarding workflows
   - Include user activity tracking and audit logs
   - Add proper permission management and access control`,

    "plugin-config": `
   - Create plugin installation and configuration interfaces
   - Add plugin marketplace and discovery features
   - Implement plugin update and version management
   - Include plugin health monitoring and troubleshooting
   - Add proper plugin security and permission controls`,

    "org-settings": `
   - Create organization-wide configuration interfaces
   - Add branding and customization options
   - Implement billing and subscription management
   - Include security policies and compliance settings
   - Add proper backup and restore functionality`,

    "data-sources": `
   - Create data source configuration and management
   - Add connection testing and health monitoring
   - Implement data source discovery and auto-configuration
   - Include query editor and data exploration tools
   - Add proper data source security and access controls`,
  };

  return (
    instructions[interfaceType as keyof typeof instructions] ||
    "Focus on creating a comprehensive admin interface with proper navigation and management capabilities."
  );
}

/**
 * Helper function to get optimization specific instructions
 */
function getOptimizationInstructions(optimization: string): string {
  const instructions = {
    performance: `
   - Implement React.memo for preventing unnecessary re-renders in data-heavy components
   - Use useMemo and useCallback hooks for expensive calculations and event handlers
   - Optimize bundle size with code splitting and lazy loading
   - Implement virtual scrolling for large time-series datasets
   - Minimize DOM manipulations in real-time data scenarios
   - Use Web Workers for heavy data processing in monitoring contexts`,

    accessibility: `
   - Add proper ARIA labels and roles for dashboard panels and charts
   - Ensure keyboard navigation support for all interactive elements
   - Implement focus management for modal dialogs and dropdowns
   - Add screen reader compatibility for data visualizations
   - Ensure color contrast compliance for Grafana's theme system
   - Support high contrast mode and reduced motion preferences`,

    responsive: `
   - Implement mobile-first design approach for dashboard panels
   - Use CSS Grid and Flexbox for flexible panel layouts
   - Add proper breakpoints for tablet and mobile dashboard viewing
   - Optimize touch interactions for mobile monitoring interfaces
   - Ensure readable chart labels and data points on small screens
   - Implement responsive navigation patterns for admin interfaces`,

    theming: `
   - Implement proper theme token usage from Grafana's design system
   - Add support for light/dark theme switching
   - Ensure component works with custom organization themes
   - Implement proper color inheritance for data visualizations
   - Add theme-aware animation and transition effects
   - Support high contrast and accessibility themes`,
  };

  return (
    instructions[optimization as keyof typeof instructions] ||
    "Focus on general code quality improvements and Grafana UI best practices implementation."
  );
}
