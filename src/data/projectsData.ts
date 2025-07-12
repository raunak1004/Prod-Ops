// Shared data structure that can easily map to backend tables
// This structure supports the Resource table concept with Employee, Project, Product relationships

export interface Employee {
  id: number;
  name: string;
  department: string;
  role: string;
}

export interface Project {
  id: number;
  name: string;
  type: "Projects" | "Products"; // This maps to your Project vs Product table distinction
  status: "green" | "amber" | "red";
  progress: number;
  dueDate: string;
  department: string;
  lead: string; // Will reference Employee table in backend
  deliverables: number;
  completedDeliverables: number;
  blockers: number;
  teamSize: number;
  hoursAllocated: number;
  hoursUsed: number;
  lastCallDate: string;
  pmStatus: "green" | "amber" | "red";
  opsStatus: "green" | "amber" | "red";
  healthTrend: "improving" | "declining" | "constant";
  monthlyDeliverables: Array<{
    id: number;
    task: string;
    dueDate: string;
    comments: string;
    description: string;
    type: string;
    assignee: string;
    department: string;
    status: "green" | "amber" | "red" | "de-committed" | "done";
    flagged?: boolean;
  }>;
  pastWeeksStatus: Array<{
    week: string;
    status: "green" | "amber" | "red";
  }>;
}

// Unified projects and products data - easily mappable to backend Resource table
export const projectsAndProducts: Project[] = [
  // Projects Category
  {
    id: 1,
    name: "HUNT",
    type: "Projects",
    status: "green",
    progress: 85,
    dueDate: "2024-07-15",
    department: "Projects",
    lead: "Sarah Johnson",
    deliverables: 8,
    completedDeliverables: 7,
    blockers: 0,
    teamSize: 6,
    hoursAllocated: 480,
    hoursUsed: 380,
    lastCallDate: "2024-07-08",
    pmStatus: "green",
    opsStatus: "green",
    healthTrend: "improving",
    monthlyDeliverables: [
      { 
        id: 1, 
        task: "UI/UX Design Completion", 
        dueDate: "2024-07-15", 
        comments: "Final review in progress",
        description: "Complete the final UI/UX design review",
        type: "new-feature",
        assignee: "John Doe",
        department: "Design",
        status: "green"
      },
      { 
        id: 2, 
        task: "Backend API Integration", 
        dueDate: "2024-07-20", 
        comments: "On track",
        description: "Integrate backend APIs with frontend",
        type: "feature-request",
        assignee: "Jane Smith",
        department: "Development",
        status: "green"
      },
      { 
        id: 3, 
        task: "Testing Phase", 
        dueDate: "2024-07-25", 
        comments: "Waiting for development completion",
        description: "Comprehensive testing of all features",
        type: "adhoc",
        assignee: "Mike Johnson",
        department: "QA",
        status: "amber"
      }
    ],
    pastWeeksStatus: [
      { week: "Week-1", status: "green" },
      { week: "Week-2", status: "green" },
      { week: "Week-3", status: "amber" },
      { week: "Week-4", status: "green" }
    ]
  },
  {
    id: 2,
    name: "MarketTime",
    type: "Projects",
    status: "amber",
    progress: 70,
    dueDate: "2024-07-10",
    department: "Projects",
    lead: "Michael Chen",
    deliverables: 12,
    completedDeliverables: 8,
    blockers: 2,
    teamSize: 4,
    hoursAllocated: 600,
    hoursUsed: 520,
    lastCallDate: "2024-07-05",
    pmStatus: "amber",
    opsStatus: "red",
    healthTrend: "declining",
    monthlyDeliverables: [
      { 
        id: 1, 
        task: "Database Schema Migration", 
        dueDate: "2024-07-12", 
        comments: "Delayed due to complexity",
        description: "Migrate database schema to new version",
        type: "bug",
        assignee: "Alex Chen",
        department: "Development",
        status: "red"
      },
      { 
        id: 2, 
        task: "Third-party API Testing", 
        dueDate: "2024-07-18", 
        comments: "Dependencies blocking progress",
        description: "Test integration with third-party APIs",
        type: "feature-request",
        assignee: "Sarah Wilson",
        department: "QA",
        status: "amber"
      },
      { 
        id: 3, 
        task: "Security Audit", 
        dueDate: "2024-07-22", 
        comments: "Scheduled for next week",
        description: "Comprehensive security audit",
        type: "adhoc",
        assignee: "David Kim",
        department: "PM",
        status: "green"
      }
    ],
    pastWeeksStatus: [
      { week: "Week-1", status: "amber" },
      { week: "Week-2", status: "red" },
      { week: "Week-3", status: "red" },
      { week: "Week-4", status: "amber" }
    ]
  },
  {
    id: 3,
    name: "Abbvie",
    type: "Projects",
    status: "red",
    progress: 45,
    dueDate: "2024-06-30",
    department: "Projects",
    lead: "Emily Rodriguez",
    deliverables: 10,
    completedDeliverables: 4,
    blockers: 4,
    teamSize: 5,
    hoursAllocated: 400,
    hoursUsed: 350,
    lastCallDate: "2024-07-07",
    pmStatus: "red",
    opsStatus: "red",
    healthTrend: "constant",
    monthlyDeliverables: [
      { 
        id: 1, 
        task: "Data Pipeline Setup", 
        dueDate: "2024-07-14", 
        comments: "Major technical challenges",
        description: "Set up data pipeline infrastructure",
        type: "new-feature",
        assignee: "Emily Rodriguez",
        department: "Development",
        status: "red"
      },
      { 
        id: 2, 
        task: "Report Generation Module", 
        dueDate: "2024-07-21", 
        comments: "Waiting for data pipeline",
        description: "Develop report generation functionality",
        type: "feature-request",
        assignee: "Tom Brown",
        department: "Development",
        status: "red"
      },
      { 
        id: 3, 
        task: "User Interface Development", 
        dueDate: "2024-07-28", 
        comments: "Resource constraints",
        description: "Build user interface components",
        type: "new-feature",
        assignee: "Lisa Chen",
        department: "Design",
        status: "amber"
      }
    ],
    pastWeeksStatus: [
      { week: "Week-1", status: "red" },
      { week: "Week-2", status: "red" },
      { week: "Week-3", status: "red" },
      { week: "Week-4", status: "red" }
    ]
  },
  {
    id: 4,
    name: "EIP",
    type: "Projects",
    status: "green",
    progress: 90,
    dueDate: "2024-07-20",
    department: "Projects",
    lead: "David Park",
    deliverables: 6,
    completedDeliverables: 5,
    blockers: 0,
    teamSize: 3,
    hoursAllocated: 320,
    hoursUsed: 280,
    lastCallDate: "2024-07-06",
    pmStatus: "green",
    opsStatus: "green",
    healthTrend: "improving",
    monthlyDeliverables: [
      { 
        id: 1, 
        task: "Security Policy Updates", 
        dueDate: "2024-07-16", 
        comments: "Nearly complete",
        description: "Update security policies and procedures",
        type: "adhoc",
        assignee: "David Park",
        department: "PM",
        status: "green"
      },
      { 
        id: 2, 
        task: "Vulnerability Assessment", 
        dueDate: "2024-07-19", 
        comments: "Scheduled for this week",
        description: "Conduct vulnerability assessment",
        type: "adhoc",
        assignee: "Security Team",
        department: "QA",
        status: "green"
      },
      { 
        id: 3, 
        task: "Compliance Documentation", 
        dueDate: "2024-07-24", 
        comments: "Ready for review",
        description: "Prepare compliance documentation",
        type: "feature-request",
        assignee: "Compliance Team",
        department: "PM",
        status: "green"
      }
    ],
    pastWeeksStatus: [
      { week: "Week-1", status: "green" },
      { week: "Week-2", status: "green" },
      { week: "Week-3", status: "green" },
      { week: "Week-4", status: "green" }
    ]
  },
  // Products Category
  {
    id: 5,
    name: "InsureTrek",
    type: "Products",
    status: "green",
    progress: 88,
    dueDate: "2024-07-12",
    department: "Products",
    lead: "Jessica Wu",
    deliverables: 9,
    completedDeliverables: 8,
    blockers: 0,
    teamSize: 4,
    hoursAllocated: 360,
    hoursUsed: 280,
    lastCallDate: "2024-07-04",
    pmStatus: "green",
    opsStatus: "green",
    healthTrend: "improving",
    monthlyDeliverables: [
      { 
        id: 1, 
        task: "Email Campaign Builder", 
        dueDate: "2024-07-17", 
        comments: "Feature complete, testing needed",
        description: "Build email campaign creation tool",
        type: "new-feature",
        assignee: "Jessica Wu",
        department: "Development",
        status: "amber"
      },
      { 
        id: 2, 
        task: "Analytics Dashboard", 
        dueDate: "2024-07-23", 
        comments: "UI development in progress",
        description: "Create analytics dashboard",
        type: "feature-request",
        assignee: "Marketing Team",
        department: "Design",
        status: "amber"
      },
      { 
        id: 3, 
        task: "Integration Testing", 
        dueDate: "2024-07-26", 
        comments: "Planned after feature completion",
        description: "Test system integrations",
        type: "adhoc",
        assignee: "QA Team",
        department: "QA",
        status: "green"
      }
    ],
    pastWeeksStatus: [
      { week: "Week-1", status: "green" },
      { week: "Week-2", status: "amber" },
      { week: "Week-3", status: "amber" },
      { week: "Week-4", status: "amber" }
    ]
  },
  {
    id: 6,
    name: "Vigil",
    type: "Products",
    status: "amber",
    progress: 75,
    dueDate: "2024-07-18",
    department: "Products",
    lead: "Alex Thompson",
    deliverables: 7,
    completedDeliverables: 5,
    blockers: 1,
    teamSize: 3,
    hoursAllocated: 280,
    hoursUsed: 220,
    lastCallDate: "2024-07-06",
    pmStatus: "amber",
    opsStatus: "green",
    healthTrend: "constant",
    monthlyDeliverables: [
      { 
        id: 1, 
        task: "Monitoring Dashboard", 
        dueDate: "2024-07-19", 
        comments: "UI refinements needed",
        description: "Build monitoring dashboard interface",
        type: "new-feature",
        assignee: "Alex Thompson",
        department: "Design",
        status: "amber"
      },
      { 
        id: 2, 
        task: "Alert System", 
        dueDate: "2024-07-25", 
        comments: "Backend complete",
        description: "Implement alert notification system",
        type: "feature-request",
        assignee: "Backend Team",
        department: "Development",
        status: "green"
      },
      { 
        id: 3, 
        task: "Integration Testing", 
        dueDate: "2024-07-28", 
        comments: "Waiting for dashboard",
        description: "Test system integrations",
        type: "adhoc",
        assignee: "QA Team",
        department: "QA",
        status: "amber"
      }
    ],
    pastWeeksStatus: [
      { week: "Week-1", status: "green" },
      { week: "Week-2", status: "amber" },
      { week: "Week-3", status: "amber" },
      { week: "Week-4", status: "amber" }
    ]
  },
  {
    id: 7,
    name: "Notiflow",
    type: "Products",
    status: "green",
    progress: 92,
    dueDate: "2024-07-22",
    department: "Products",
    lead: "Rachel Kim",
    deliverables: 8,
    completedDeliverables: 7,
    blockers: 0,
    teamSize: 5,
    hoursAllocated: 400,
    hoursUsed: 350,
    lastCallDate: "2024-07-07",
    pmStatus: "green",
    opsStatus: "green",
    healthTrend: "improving",
    monthlyDeliverables: [
      { 
        id: 1, 
        task: "Notification Engine", 
        dueDate: "2024-07-20", 
        comments: "Complete",
        description: "Build notification delivery engine",
        type: "new-feature",
        assignee: "Rachel Kim",
        department: "Development",
        status: "green"
      },
      { 
        id: 2, 
        task: "User Interface Polish", 
        dueDate: "2024-07-24", 
        comments: "Final touches",
        description: "Polish user interface components",
        type: "feature-request",
        assignee: "Design Team",
        department: "Design",
        status: "green"
      },
      { 
        id: 3, 
        task: "Load Testing", 
        dueDate: "2024-07-26", 
        comments: "Scheduled",
        description: "Performance and load testing",
        type: "adhoc",
        assignee: "QA Team",
        department: "QA",
        status: "green"
      }
    ],
    pastWeeksStatus: [
      { week: "Week-1", status: "green" },
      { week: "Week-2", status: "green" },
      { week: "Week-3", status: "green" },
      { week: "Week-4", status: "green" }
    ]
  },
  {
    id: 8,
    name: "DDS",
    type: "Products",
    status: "amber",
    progress: 65,
    dueDate: "2024-07-25",
    department: "Products",
    lead: "Tom Wilson",
    deliverables: 11,
    completedDeliverables: 7,
    blockers: 2,
    teamSize: 6,
    hoursAllocated: 520,
    hoursUsed: 380,
    lastCallDate: "2024-07-08",
    pmStatus: "amber",
    opsStatus: "amber",
    healthTrend: "declining",
    monthlyDeliverables: [
      { 
        id: 1, 
        task: "Data Migration", 
        dueDate: "2024-07-26", 
        comments: "Complex schema issues",
        description: "Migrate legacy data to new system",
        type: "new-feature",
        assignee: "Tom Wilson",
        department: "Development",
        status: "red"
      },
      { 
        id: 2, 
        task: "API Development", 
        dueDate: "2024-07-30", 
        comments: "Depends on migration",
        description: "Develop data access APIs",
        type: "feature-request",
        assignee: "API Team",
        department: "Development",
        status: "amber"
      },
      { 
        id: 3, 
        task: "Frontend Updates", 
        dueDate: "2024-08-02", 
        comments: "Waiting for API",
        description: "Update frontend to use new APIs",
        type: "feature-request",
        assignee: "Frontend Team",
        department: "Development",
        status: "amber"
      }
    ],
    pastWeeksStatus: [
      { week: "Week-1", status: "green" },
      { week: "Week-2", status: "amber" },
      { week: "Week-3", status: "amber" },
      { week: "Week-4", status: "amber" }
    ]
  },
  {
    id: 9,
    name: "FS Zoo",
    type: "Products",
    status: "green",
    progress: 80,
    dueDate: "2024-07-28",
    department: "Products",
    lead: "Lisa Chen",
    deliverables: 9,
    completedDeliverables: 7,
    blockers: 0,
    teamSize: 4,
    hoursAllocated: 350,
    hoursUsed: 290,
    lastCallDate: "2024-07-09",
    pmStatus: "green",
    opsStatus: "green",
    healthTrend: "improving",
    monthlyDeliverables: [
      { 
        id: 1, 
        task: "Animal Management System", 
        dueDate: "2024-07-29", 
        comments: "Core features complete",
        description: "Build animal tracking and management system",
        type: "new-feature",
        assignee: "Lisa Chen",
        department: "Development",
        status: "green"
      },
      { 
        id: 2, 
        task: "Visitor Portal", 
        dueDate: "2024-08-01", 
        comments: "Design approved",
        description: "Create visitor information portal",
        type: "feature-request",
        assignee: "Design Team",
        department: "Design",
        status: "green"
      },
      { 
        id: 3, 
        task: "Reporting Module", 
        dueDate: "2024-08-05", 
        comments: "Development started",
        description: "Build reporting and analytics module",
        type: "new-feature",
        assignee: "Analytics Team",
        department: "Development",
        status: "amber"
      }
    ],
    pastWeeksStatus: [
      { week: "Week-1", status: "green" },
      { week: "Week-2", status: "green" },
      { week: "Week-3", status: "green" },
      { week: "Week-4", status: "green" }
    ]
  }
];

// Helper functions for backend integration
export const getProjectById = (id: number): Project | undefined => {
  return projectsAndProducts.find(project => project.id === id);
};

export const getProjectsByType = (type: "Projects" | "Products"): Project[] => {
  return projectsAndProducts.filter(project => project.type === type);
};

export const getProjectsByDepartment = (department: string): Project[] => {
  return projectsAndProducts.filter(project => project.department === department);
};

// This structure will easily map to your backend Resource table concept:
// Resource Table: Contains shared fields (id, name, type, status, etc.)
// Employee Table: Contains user/lead information
// Project Table: Contains project-specific fields and references Resource
// Product Table: Contains product-specific fields and references Resource