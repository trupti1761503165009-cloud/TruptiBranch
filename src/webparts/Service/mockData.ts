// Mock data for DMS components
export enum UserRole {
    Admin = "Admin",
    Author = "Author",
    Reviewer = "Reviewer",
    Approver = "Approver",
}
export interface Category {
    id: string;
    name: string;
    description: string;
    templateCount: number;
    createdDate: Date;
}
export interface CTDSubModule {
  id: string;
  name: string;
  description?: string;
}

export interface CTDFolder {
  moduleId: string;
  moduleName: string;
  description?: string;
  subModules: CTDSubModule[];
}

export const mockCTDFolderHierarchy: CTDFolder[] = [
  {
    moduleId: "M1",
    moduleName: "Module 1 - Administrative Information",
    description: "Includes application forms, administrative data, etc.",
    subModules: [
      {
        id: "M1.1",
        name: "Application Form",
        description: "Contains application forms and related documents.",
      },
      {
        id: "M1.2",
        name: "Administrative Information",
        description: "Information related to sponsor, manufacturer, and applicant.",
      },
    ],
  },
  {
    moduleId: "M2",
    moduleName: "Module 2 - CTD Summaries",
    description: "High-level summaries of quality, nonclinical, and clinical data.",
    subModules: [
      {
        id: "M2.1",
        name: "Introduction",
        description: "Overview of the CTD structure and content.",
      },
      {
        id: "M2.2",
        name: "Quality Overall Summary",
        description: "Summary of pharmaceutical quality information.",
      },
    ],
  },
  {
    moduleId: "M3",
    moduleName: "Module 3 - Quality",
    description: "Contains detailed pharmaceutical quality documentation.",
    subModules: [
      {
        id: "M3.1",
        name: "Table of Contents",
        description: "Lists all sections and subsections in Module 3.",
      },
      {
        id: "M3.2",
        name: "Body of Data",
        description: "Detailed manufacturing and quality control data.",
      },
    ],
  },
];

export const mockDashboardMetrics = {
    totalDocuments: 141,
    pendingReviews: 42,
    approvedDocuments: 99,
    activeTemplates: 12,
};

export interface Document {
    id: string;
    title: string;
    category: string;
    module: string;
    subModule?: string;
    status: string;
    lastModified: Date;
    createdDate: Date; // ✅ added
    drug: string; // ✅ added
    author: string;
    version?: string;
    reviewers?: string[];
    approvers: string[];
}
// =======================
// 🔹 Workflow Task Type & Mock Data
// =======================

export interface WorkflowTask {
    id: string;
    taskType: "Review" | "Approval" | "Signature";
    documentTitle: string;
    drug: string;
    priority: "Low" | "Medium" | "High";
    status: "Pending" | "InProgress" | "Completed";
    dueDate: Date;
    comments: string[];
    author?: string;
    approvers?: string[];
    reviewers?: string[];
}

// ✅ Mock Workflow Tasks
export const mockWorkflowTasks: WorkflowTask[] = [
    {
        id: "WT001",
        taskType: "Review",
        documentTitle: "Stability Study Report #1",
        drug: "Drug A",
        priority: "High",
        status: "Pending",
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
        comments: [],
        author: "Michael Brown",
        reviewers: ["Alice Johnson"],
        approvers: ["Dr. Smith"],
    },
    {
        id: "WT002",
        taskType: "Approval",
        documentTitle: "Stability Study Report #2",
        drug: "Drug B",
        priority: "Medium",
        status: "InProgress",
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
        comments: ["Pending signature from Dr. Smith"],
        author: "Michael Brown",
        reviewers: ["Alice Johnson"],
        approvers: ["Dr. Smith", "Dr. Watson"],
    },
    {
        id: "WT003",
        taskType: "Approval",
        documentTitle: "Stability Study Report #3",
        drug: "Drug C",
        priority: "Low",
        status: "Pending",
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        comments: [],
        author: "Michael Brown",
        reviewers: ["Alice Johnson"],
        approvers: ["Dr. Watson"],
    },
];

export const mockDocuments: Document[] = [
    {
        id: "DOC001",
        title: "Stability Study Report #1",
        category: "Quality",
        module: "Module 3",
        status: "Reviewed",
        lastModified: new Date("2025-01-11"),
        createdDate: new Date("2025-01-05"), // ✅ added
        drug: "Drug A", // ✅ added
        author: "Michael Brown",
        version: "1.0",
        reviewers: ["Alice Johnson"],
        approvers: ["Dr. Smith", "Dr. Watson"], // ✅ multiple approvers possible
    },
    {
        id: "DOC002",
        title: "Stability Study Report #2",
        category: "Quality",
        module: "Module 3",
        status: "Reviewed",
        lastModified: new Date("2025-01-12"),
        createdDate: new Date("2025-01-06"),
        drug: "Drug B",
        author: "Michael Brown",
        version: "1.0",
        reviewers: ["Alice Johnson"],
        approvers: ["Dr. Smith"],
    },
    {
        id: "DOC003",
        title: "Stability Study Report #3",
        category: "Quality",
        module: "Module 3",
        status: "Reviewed",
        lastModified: new Date("2025-01-13"),
        createdDate: new Date("2025-01-07"),
        drug: "Drug C",
        author: "Michael Brown",
        version: "1.0",
        reviewers: ["Alice Johnson"],
        approvers: ["Dr. Smith"],
    },
    {
        id: "DOC004",
        title: "Stability Study Report #4",
        category: "Quality",
        module: "Module 3",
        status: "Reviewed",
        lastModified: new Date("2025-01-14"),
        createdDate: new Date("2025-01-08"),
        drug: "Drug D",
        author: "Michael Brown",
        version: "1.0",
        reviewers: ["Alice Johnson"],
        approvers: ["Dr. Smith"],
    },
    {
        id: "DOC005",
        title: "Stability Study Report #5",
        category: "Quality",
        module: "Module 3",
        status: "Reviewed",
        lastModified: new Date("2025-01-15"),
        createdDate: new Date("2025-01-09"),
        drug: "Drug E",
        author: "Michael Brown",
        version: "1.0",
        reviewers: ["Alice Johnson"],
        approvers: ["Dr. Smith"],
    },
];


export const mockCategories = [
    { id: "CAT1", name: "Quality", description: "Quality related documents", templateCount: 5, createdDate: new Date() },
    { id: "CAT2", name: "Clinical", description: "Clinical docs", templateCount: 2, createdDate: new Date() },
];

// export const mockAuditLogs = [
//     { id: "AL001", actor: "Alice Johnson", action: "Created Document", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), details: "Created Stability Study Report #1" },
//     { id: "AL002", actor: "Michael Brown", action: "Submitted for Review", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12), details: "Submitted Stability Study Report #2" },
// ];

export const mockUserRoles = [
    { id: "R1", groupName: "DMS Admins", role: UserRole.Admin, defaultReviewer: "Alice Johnson", defaultApprover: "Dr. Smith" },
    { id: "R2", groupName: "Authors", role: UserRole.Author },
];


// =======================
// 🔹 CTD Module & Template Dummy Data
// =======================

// Define CTDModule type
export interface CTDModule {
    id: string;
    name: string;
    description: string;
    subModules?: {
        id: string;
        name: string;
        description: string;
    }[];
}

// Define Template type
export interface Template {
    id: string;
    name: string;
    category: string;
    module: string;
    version: string;
    status: "Active" | "Inactive";
    createdDate: any;
    lastModified: any;
}

// Mock CTD Modules (Modules 1–5 with submodules)
export const mockCTDModules: CTDModule[] = [
    {
        id: "M1",
        name: "Module 1: Administrative Information",
        description: "Administrative and regional information for the submission.",
        subModules: [
            { id: "M1-1", name: "1.0 Cover Letter", description: "Application cover letter" },
            { id: "M1-2", name: "1.1 Forms", description: "Administrative forms and certificates" },
        ],
    },
    {
        id: "M2",
        name: "Module 2: Summaries",
        description: "Summaries of quality, nonclinical, and clinical information.",
        subModules: [
            { id: "M2-1", name: "2.3 Quality Overall Summary", description: "Summary of quality data" },
        ],
    },
    {
        id: "M3",
        name: "Module 3: Quality",
        description: "Comprehensive quality documentation including stability, validation, and specifications.",
        subModules: [
            { id: "M3-1", name: "3.2.P.8 Stability", description: "Stability studies and data" },
            { id: "M3-2", name: "3.2.P.3 Manufacture", description: "Manufacturing process information" },
            { id: "M3-3", name: "3.2.P.5 Control of Drug Product", description: "Specifications and analytical methods" },
        ],
    },
    {
        id: "M4",
        name: "Module 4: Nonclinical Study Reports",
        description: "Pharmacology, pharmacokinetics, and toxicology study reports.",
        subModules: [
            { id: "M4-1", name: "4.2.1 Pharmacology", description: "Pharmacodynamic studies" },
            { id: "M4-2", name: "4.2.3 Toxicology", description: "Toxicology reports" },
        ],
    },
    {
        id: "M5",
        name: "Module 5: Clinical Study Reports",
        description: "Clinical study reports, protocols, and summaries.",
        subModules: [
            { id: "M5-1", name: "5.3.1 Clinical Study Reports", description: "Clinical trials and safety studies" },
        ],
    },
];

// Mock Templates (linked to Categories and Modules)
export const mockTemplates: Template[] = [
    {
        id: "TPL001",
        name: "Stability Study Template",
        category: "Quality",
        module: "Module 3: Quality",
        version: "1.0",
        status: "Active",
        createdDate: new Date("2025-01-05"),
        lastModified: new Date("2025-01-08"),
    },
    {
        id: "TPL002",
        name: "Validation Protocol Template",
        category: "Quality",
        module: "Module 3: Quality",
        version: "2.1",
        status: "Active",
        createdDate: new Date("2025-01-10"),
        lastModified: new Date("2025-01-11"),
    },
    {
        id: "TPL003",
        name: "Clinical Study Report Template",
        category: "Clinical",
        module: "Module 5: Clinical Study Reports",
        version: "1.2",
        status: "Inactive",
        createdDate: new Date("2025-01-12"),
        lastModified: new Date("2025-01-13"),
    },
    {
        id: "TPL004",
        name: "Nonclinical Pharmacology Template",
        category: "Non-Clinical",
        module: "Module 4: Nonclinical Study Reports",
        version: "1.0",
        status: "Active",
        createdDate: new Date("2025-01-14"),
        lastModified: new Date("2025-01-14"),
    },
    {
        id: "TPL005",
        name: "Regulatory Form Template",
        category: "Regulatory",
        module: "Module 1: Administrative Information",
        version: "3.0",
        status: "Active",
        createdDate: new Date("2025-01-16"),
        lastModified: new Date("2025-01-18"),
    },
];
// =======================
// 🔹 Drug Type & Mock Data
// =======================

export interface Drug {
  id: string;
  name: string;
  strength: string;
  dosageForm: string;
  manufacturer: string;
  createdDate: Date;
  status: "Active" | "Inactive";
}

// ✅ Mock Drugs
export const mockDrugs: Drug[] = [
  {
    id: "DRG001",
    name: "Drug A",
    strength: "500 mg",
    dosageForm: "Tablet",
    manufacturer: "PharmaCorp Ltd.",
    createdDate: new Date("2025-01-05"),
    status: "Active",
  },
  {
    id: "DRG002",
    name: "Drug B",
    strength: "250 mg",
    dosageForm: "Capsule",
    manufacturer: "Medicare Pharma",
    createdDate: new Date("2025-01-07"),
    status: "Active",
  },
  {
    id: "DRG003",
    name: "Drug C",
    strength: "100 mg/mL",
    dosageForm: "Injection",
    manufacturer: "BioHealth Inc.",
    createdDate: new Date("2025-01-08"),
    status: "Active",
  },
  {
    id: "DRG004",
    name: "Drug D",
    strength: "5 mg",
    dosageForm: "Tablet",
    manufacturer: "CureWell Pharmaceuticals",
    createdDate: new Date("2025-01-09"),
    status: "Inactive",
  },
  {
    id: "DRG005",
    name: "Drug E",
    strength: "10 mg/mL",
    dosageForm: "Syrup",
    manufacturer: "Global Remedies",
    createdDate: new Date("2025-01-10"),
    status: "Active",
  },
];
export interface AuditLog {
  id: string;
  actor: string;
  action: string;
  timestamp: Date;
  details: string;
  oldValue?: string;
  newValue?: string;
}

export const mockAuditLogs: AuditLog[] = [
  {
    id: "AL001",
    actor: "Alice Johnson",
    action: "Created Document",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    details: "Created Stability Study Report #1",
    newValue: "Stability Study Report #1",
  },
  {
    id: "AL002",
    actor: "Michael Brown",
    action: "Submitted for Review",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12),
    details: "Submitted Stability Study Report #2",
  },
  {
    id: "AL003",
    actor: "Dr. Smith",
    action: "Approved Document",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    details: "Approved Stability Study Report #2",
  },
];

// export const mockCategories: Category[] = [
//     {
//         id: "CAT001",
//         name: "Quality",
//         description: "Includes Module 3 Quality-related documents such as Stability, Validation, and Specifications.",
//         templateCount: 5,
//         createdDate: new Date("2025-01-10"),
//     },
//     {
//         id: "CAT002",
//         name: "Clinical",
//         description: "Module 5 Clinical Study Reports and Investigator Brochures.",
//         templateCount: 3,
//         createdDate: new Date("2025-01-12"),
//     },
//     {
//         id: "CAT003",
//         name: "Non-Clinical",
//         description: "Module 4 Non-Clinical Study Reports including pharmacology and toxicology data.",
//         templateCount: 2,
//         createdDate: new Date("2025-01-14"),
//     },
//     {
//         id: "CAT004",
//         name: "Regulatory",
//         description: "Module 1 Administrative and Prescribing Information (e.g., Application Forms, Labels, Certificates).",
//         templateCount: 4,
//         createdDate: new Date("2025-01-15"),
//     },
//     {
//         id: "CAT005",
//         name: "CMC Documentation",
//         description: "Chemistry, Manufacturing, and Controls related templates and reports.",
//         templateCount: 6,
//         createdDate: new Date("2025-01-18"),
//     },
//     {
//         id: "CAT006",
//         name: "Bioavailability",
//         description: "Bioavailability/Bioequivalence study documents and related reports.",
//         templateCount: 1,
//         createdDate: new Date("2025-01-20"),
//     },
// ];
