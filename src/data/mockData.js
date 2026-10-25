// EQUIP - EAST Quick Utility and Inventory Platform
// Initial mock data with realistic EAST Initiative technologies and community projects

export const INITIAL_PROGRAMS = [
  {
    id: "prog-bwest",
    name: "Bentonville West High EAST",
    code: "EQ-7K9B-M4W2",
    status: "approved", // 'approved' | 'draft' | 'pending'
    location: "Centerton, AR (Bentonville School District)",
    campusRoomNumber: "Building B, Room 402 - Innovation & Technology Lab",
    description: "EAST at Bentonville West empowers students to solve real-world community problems through self-directed service learning and advanced industry technology.",
    photo: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200&auto=format&fit=crop&q=80",
    facilitator: {
      id: "fac-1",
      name: "Sarah Jenkins",
      title: "Lead EAST Facilitator & STEM Coordinator",
      email: "sjenkins@bentonvillek12.org",
      phone: "(479) 555-0198",
      officeHours: "Mon-Thu: 8:00 AM - 4:30 PM, Fri: 8:00 AM - 3:45 PM",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
      status: "approved"
    },
    technologies: [
      {
        id: "tech-1",
        name: "Prusa MK4 3D Printer",
        category: "3D Printing & Fabrication",
        status: "working", // 'working' | 'needs-repairs' | 'maintenance' | 'offline'
        assetNumber: "3DP-01",
        photo: "https://images.unsplash.com/photo-1631541909061-71e349d1f203?w=800&auto=format&fit=crop&q=80",
        note: "CRITICAL: Do NOT reformat the high-speed SD card. Active print slicer configurations and City Trail 3D model files are located in /Projects/CityModel/STL.",
        hasSensitiveData: true,
        dataLocation: "SD Card #1: /Projects/CityModel/STL",
        manualUrl: "https://help.prusa3d.com/mk4",
        dateAdded: "2025-08-15",
        lastChecked: "2026-10-18"
      },
      {
        id: "tech-2",
        name: "Bernina 790 PRO Embroidery Machine",
        category: "Textiles & Soft Goods",
        status: "working",
        assetNumber: "EMB-02",
        photo: "https://images.unsplash.com/photo-1605289982774-9a6fef564df8?w=800&auto=format&fit=crop&q=80",
        note: "Digitized military patch vectors for the Veterans Memorial Quilt are stored under machine memory slot 'EXP_VETS_26'. Clean bobbin shuttle after every 4 hours of run time.",
        hasSensitiveData: true,
        dataLocation: "Internal Memory Slot: EXP_VETS_26",
        manualUrl: "https://www.bernina.com/en-US/Machines-US/Series-Overview/BERNINA-7-Series/BERNINA-790-PRO",
        dateAdded: "2025-09-01",
        lastChecked: "2026-10-20"
      },
      {
        id: "tech-3",
        name: "Sony Alpha A7 IV Cinema & Photo Kit",
        category: "Media Production",
        status: "working",
        assetNumber: "CAM-05",
        photo: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80",
        note: "Dual SD Slot 2 contains 4K S-Log3 footage for the Benton County Historical Documentary. DO NOT format card in Slot 2! Return lens cap and UV filter after field checkout.",
        hasSensitiveData: true,
        dataLocation: "V60 SD Card (Slot 2): /DCIM/102DOCUMENTARY",
        manualUrl: "https://www.sony.com/electronics/support/e-mount-body-ilce-7-series/ilce-7m4/manuals",
        dateAdded: "2025-08-20",
        lastChecked: "2026-10-22"
      },
      {
        id: "tech-4",
        name: "Dell Precision 5820 VR Workstation",
        category: "Computing & VR",
        status: "needs-repairs",
        assetNumber: "WS-09",
        photo: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&auto=format&fit=crop&q=80",
        note: "DisplayPort #2 flickering; GPU driver updates required. Unsaved Unreal Engine 5.4 project cache is on D:\\EAST_VR_Lab\\DowntownTour\\ - DO NOT REIMAGE DRIVE.",
        hasSensitiveData: true,
        dataLocation: "Drive D:\\EAST_VR_Lab\\DowntownTour\\",
        manualUrl: "https://www.dell.com/support/home/en-us/product-support/product/precision-5820-workstation/docs",
        dateAdded: "2024-11-10",
        lastChecked: "2026-10-23"
      },
      {
        id: "tech-5",
        name: "Epilog Fusion Pro 36 Laser Cutter & Engraver",
        category: "3D Printing & Fabrication",
        status: "working",
        assetNumber: "LSR-01",
        photo: "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=80",
        note: "Exhaust filtration unit was serviced on Oct 10. Always verify air assist is engaged before cutting acrylic. Laser focus manual tool is kept in drawer 1B.",
        hasSensitiveData: false,
        dataLocation: "None (Network Print Spooler)",
        manualUrl: "https://www.epiloglaser.com/laser-machines/fusion-pro-laser-series/",
        dateAdded: "2025-01-12",
        lastChecked: "2026-10-21"
      },
      {
        id: "tech-6",
        name: "DJI Mavic 3 Enterprise Thermal Drone",
        category: "Aviation & Mapping",
        status: "maintenance",
        assetNumber: "DRN-02",
        photo: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&auto=format&fit=crop&q=80",
        note: "Propeller calibration check in progress. Flight telemetry and FAA Part 107 flight log records are cached on micro-SD card 1. Requires Facilitator checkout signature.",
        hasSensitiveData: true,
        dataLocation: "Micro-SD Card 1: /DJI_LOGS/FLIGHT_2026",
        manualUrl: "https://enterprise.dji.com/mavic-3-enterprise/downloads",
        dateAdded: "2025-03-05",
        lastChecked: "2026-10-24"
      }
    ],
    projects: [
      {
        id: "proj-1",
        name: "Ozark Trail Accessibility & Digital Twin",
        status: "approved", // 'approved' | 'draft' | 'needs-revisions'
        submittedBy: "Caden Miller",
        submissionDate: "2026-09-14",
        approvedDate: "2026-09-16",
        category: "GIS & Community Service",
        description: "Partnering with Arkansas State Parks to scan rough wilderness trails using DJI thermal drone mapping and LiDAR scanners. We are generating 3D digital twins and wheelchair accessibility incline heatmaps for visitors with physical disabilities.",
        photos: [
          "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&auto=format&fit=crop&q=80"
        ],
        teamMembers: [
          { name: "Caden Miller", role: "Team Lead & GIS Analyst", grade: "11th" },
          { name: "Maya Lin", role: "LiDAR Point Cloud Specialist", grade: "12th" },
          { name: "Lucas Scott", role: "UI Designer & Cartographer", grade: "10th" }
        ],
        pastProjectHandlers: [
          "Jordan Vance (EAST Alumni, Class of '25 - Began trail GPS coordinates baseline)",
          "Hannah Meyer (EAST Alumni, Class of '24 - Initial park service outreach)"
        ],
        communicationLogs: [
          {
            date: "2026-10-15",
            author: "Caden Miller",
            contactPerson: "Ranger Dave Sullivan (AR State Parks)",
            type: "Field Meeting & Survey",
            notes: "Reviewed draft elevation map for Mile 1.2 to 2.4. Ranger Dave approved the slope grading metric and requested Braille signage integration at trailhead."
          },
          {
            date: "2026-09-28",
            author: "Maya Lin",
            contactPerson: "Benton County GIS Department",
            type: "Zoom Video Conference",
            notes: "Received official 2025 County LiDAR basemap tiles. Verified coordinate projection systems (NAD83 State Plane Arkansas North)."
          }
        ],
        externalLinks: [
          { label: "ArcGIS Online StoryMap", url: "https://arcgis.com/apps/storymaps" },
          { label: "LiDAR Cloud Preview", url: "https://potree.org" }
        ]
      },
      {
        id: "proj-2",
        name: "Historic Downtown Augmented Reality Walking Tour",
        status: "approved",
        submittedBy: "Sophia Reyes",
        submissionDate: "2026-09-20",
        approvedDate: "2026-09-22",
        category: "Software & Heritage",
        description: "An interactive augmented reality smartphone app built in Unreal Engine 5 that overlays historical photographs and audio oral histories when visitors point their phones at 12 historical downtown buildings.",
        photos: [
          "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=800&auto=format&fit=crop&q=80"
        ],
        teamMembers: [
          { name: "Sophia Reyes", role: "Project Manager & 3D Modeler", grade: "11th" },
          { name: "Aiden Zhang", role: "AR Mobile Developer", grade: "12th" },
          { name: "Elena Gomez", role: "Audio Producer & Historical Researcher", grade: "10th" }
        ],
        pastProjectHandlers: [
          "Evelyn Carter (Alumni '25 - Photographed original architecture archival prints)"
        ],
        communicationLogs: [
          {
            date: "2026-10-08",
            author: "Sophia Reyes",
            contactPerson: "Dr. Walter Higgins (County Historical Society)",
            type: "In-Person Archive Review",
            notes: "Cataloged 24 glass plate negatives from the 1912 Bank Fire. Recorded audio narration for Station #4."
          }
        ],
        externalLinks: [
          { label: "GitHub Repository", url: "https://github.com/bentonville-east/ar-history-tour" }
        ]
      },
      {
        id: "proj-3",
        name: "Community Garden Automated Solar Hydroponics",
        status: "draft", // Pending Facilitator Approval!
        submittedBy: "Liam Davis",
        submissionDate: "2026-10-23",
        approvedDate: null,
        category: "Engineering & Agriculture",
        description: "Designing a modular, solar-powered vertical hydroponics tower for the Centerton Community Food Pantry. Features automated pH dosing and ESP32 IoT moisture telemetry with solar battery backup.",
        photos: [
          "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&auto=format&fit=crop&q=80"
        ],
        teamMembers: [
          { name: "Liam Davis", role: "Embedded Systems Engineer", grade: "11th" },
          { name: "Zoe Henderson", role: "CAD & Structural Fabrication", grade: "10th" }
        ],
        pastProjectHandlers: [],
        communicationLogs: [
          {
            date: "2026-10-22",
            author: "Liam Davis",
            contactPerson: "Maria Flores (Food Pantry Director)",
            type: "Site Inspection",
            notes: "Measured south-facing wall dimensions: 14ft wide x 9ft high. Water hookup verified 20ft away."
          }
        ],
        externalLinks: [
          { label: "Onshape CAD Model", url: "https://cad.onshape.com" }
        ]
      },
      {
        id: "proj-4",
        name: "Adaptive Toy Switch Mod for Special Education",
        status: "draft", // Pending Facilitator Approval!
        submittedBy: "Noah Patel",
        submissionDate: "2026-10-24",
        approvedDate: null,
        category: "Assistive Technology",
        description: "Re-engineering commercial battery-operated toys with 3.5mm mono-jack bypass switches and custom 3D-printed palm triggers so non-verbal and motor-impaired elementary students can independently operate learning toys.",
        photos: [
          "https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=800&auto=format&fit=crop&q=80"
        ],
        teamMembers: [
          { name: "Noah Patel", role: "Electronics & Soldering Lead", grade: "12th" },
          { name: "Emma Brooks", role: "Occupational Therapy Liaison & Ergonomics", grade: "11th" }
        ],
        pastProjectHandlers: [
          "Marcus Reed (Class of '24 - Prototyped first button housing)"
        ],
        communicationLogs: [
          {
            date: "2026-10-18",
            author: "Noah Patel",
            contactPerson: "Mrs. Brenda Clark (District OT Therapist)",
            type: "Demonstration & Testing",
            notes: "Tested 3 bubble machines with student test group. Recommended soft-touch momentary microswitches."
          }
        ],
        externalLinks: [
          { label: "Makers Making Change Guide", url: "https://makersmakingchange.com" }
        ]
      }
    ]
  },
  {
    id: "prog-sonora",
    name: "Sonora Middle School EAST",
    code: "EQ-4N8T-2X6H",
    status: "approved",
    location: "Springdale, AR (Springdale Public Schools)",
    campusRoomNumber: "Main Wing, Innovation Studio 114",
    description: "Middle school innovators solving environmental and school community challenges through robotics, broadcast production, and digital design.",
    photo: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1200&auto=format&fit=crop&q=80",
    facilitator: {
      id: "fac-2",
      name: "Marcus Vance",
      title: "EAST Facilitator",
      email: "mvance@sdale.org",
      phone: "(479) 555-0812",
      officeHours: "Mon-Fri: 7:45 AM - 3:30 PM",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
      status: "approved"
    },
    technologies: [
      {
        id: "tech-s1",
        name: "Bambu Lab X1-Carbon Combo",
        category: "3D Printing & Fabrication",
        status: "working",
        assetNumber: "SMS-3DP-01",
        photo: "https://images.unsplash.com/photo-1631541909061-71e349d1f203?w=800&auto=format&fit=crop&q=80",
        note: "AMS Unit 1 loaded with PLA Matte. Calibration run weekly on Friday afternoons.",
        hasSensitiveData: false,
        dataLocation: "Local SD",
        manualUrl: "https://bambulab.com/en/x1",
        dateAdded: "2025-08-10",
        lastChecked: "2026-10-19"
      }
    ],
    projects: [
      {
        id: "proj-s1",
        name: "Campus Biodiversity QR Trail",
        status: "approved",
        submittedBy: "Chloe Taylor",
        submissionDate: "2026-09-18",
        approvedDate: "2026-09-20",
        category: "Environmental Science",
        description: "Cataloging native trees and pollinator plants on school grounds with laser-etched weather-proof QR code plant markers linking to student-recorded audio field guides.",
        photos: [
          "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80"
        ],
        teamMembers: [
          { name: "Chloe Taylor", role: "Botanical Researcher", grade: "8th" },
          { name: "Mason Wright", role: "Laser Fabrication Lead", grade: "7th" }
        ],
        pastProjectHandlers: [],
        communicationLogs: [
          {
            date: "2026-10-12",
            author: "Chloe Taylor",
            contactPerson: "Mr. Adams (Principal)",
            type: "Grounds Walkthrough",
            notes: "Approved post placements around the science garden."
          }
        ],
        externalLinks: []
      }
    ]
  },
  {
    id: "prog-draft-preview",
    name: "Fayetteville High EAST (Pending Review)",
    code: "EQ-9P3V-5Y7K",
    status: "draft", // Pending Website Manager Approval!
    location: "Fayetteville, AR (Fayetteville School District)",
    campusRoomNumber: "Phase 3 Wing, Room 3105",
    description: "New EAST program draft awaiting website manager signoff before student code enrollment opens.",
    photo: "https://images.unsplash.com/photo-1562774053-701939374585?w=1200&auto=format&fit=crop&q=80",
    facilitator: {
      id: "fac-3",
      name: "David Kim",
      title: "New EAST Facilitator",
      email: "dkim@fayar.net",
      phone: "(479) 555-0341",
      officeHours: "Mon-Thu 8:15 AM - 4:00 PM",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
      status: "approved"
    },
    technologies: [],
    projects: []
  },
  {
    id: "prog-vilonia-hs",
    name: "Vilonia High School EAST",
    code: "EQ-V7HS-K3N9",
    status: "approved",
    location: "Vilonia, AR (Vilonia School District)",
    campusRoomNumber: "Room TBD",
    description: "EAST at Vilonia High School empowers students to solve real community problems through self-directed service learning and technology.",
    photo: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200&auto=format&fit=crop&q=80",
    showTechnologyPublicly: false,
    showProjectsPublicly: false,
    facilitator: {
      id: "prog-vilonia-hs-fac",
      name: "Facilitator TBD",
      title: "EAST Facilitator",
      email: "facilitator@example.org",
      phone: "",
      officeHours: "Mon-Thu 8:00 AM - 4:15 PM",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
      status: "approved"
    },
    technologies: [],
    projects: []
  },
  {
    id: "prog-vilonia-jh",
    name: "Vilonia Junior High School EAST",
    code: "EQ-V4JH-M8Q2",
    status: "approved",
    location: "Vilonia, AR (Vilonia School District)",
    campusRoomNumber: "Room TBD",
    description: "EAST at Vilonia Junior High School introduces students to project-based service learning and technology in their community.",
    photo: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200&auto=format&fit=crop&q=80",
    showTechnologyPublicly: false,
    showProjectsPublicly: false,
    facilitator: {
      id: "prog-vilonia-jh-fac",
      name: "Facilitator TBD",
      title: "EAST Facilitator",
      email: "facilitator@example.org",
      phone: "",
      officeHours: "Mon-Thu 8:00 AM - 4:15 PM",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
      status: "approved"
    },
    technologies: [],
    projects: []
  }
];

export const INITIAL_FACILITATOR_REQUESTS = [
  {
    id: "fac-req-1",
    name: "Emily Thornton",
    email: "ethornton@rogersschools.net",
    school: "Rogers Heritage High School",
    role: "EAST Facilitator Candidate",
    googleAuthId: "google-oauth2|10928374619283",
    submittedAt: "2026-10-23T14:22:00Z",
    status: "pending", // 'pending' | 'approved' | 'rejected'
    notes: "Verified high school faculty directory. Requires Website Manager approval to unlock program creation."
  },
  {
    id: "fac-req-2",
    name: "Robert MacIntyre",
    email: "rmacintyre@bentonschools.org",
    school: "Benton Junior High",
    role: "EAST Facilitator Candidate",
    googleAuthId: "google-oauth2|99887766554433",
    submittedAt: "2026-10-24T09:15:00Z",
    status: "pending",
    notes: "New training cohort graduate."
  }
];

export const DEMO_USERS = {
  facilitatorApproved: {
    id: "fac-1",
    name: "Sarah Jenkins",
    email: "sjenkins@bentonvillek12.org",
    role: "facilitator",
    facilitatorStatus: "approved",
    programId: "prog-bwest",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80"
  },
  facilitatorPending: {
    id: "fac-req-1",
    name: "Emily Thornton",
    email: "ethornton@rogersschools.net",
    role: "facilitator",
    facilitatorStatus: "pending",
    programId: null,
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80"
  },
  studentJoined: {
    id: "stud-1",
    name: "Caden Miller",
    email: "cmiller@students.bentonvillek12.org",
    role: "student",
    programId: "prog-bwest",
    grade: "11th Grade",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80"
  },
  studentNew: {
    id: "stud-2",
    name: "Alex Rivera",
    email: "arivera@students.k12.org",
    role: "student",
    programId: null, // Needs to enter code
    grade: "10th Grade",
    avatar: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=200&auto=format&fit=crop&q=80"
  },
  manager: {
    id: "mgr-1",
    name: "Jordan Hayes",
    email: "jhayes@eastproject.org",
    role: "manager",
    title: "EAST Initiative Network Operations",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80"
  }
};