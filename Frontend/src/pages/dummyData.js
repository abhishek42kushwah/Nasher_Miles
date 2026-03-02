export const getModuleConfig = (type) => {
  switch (type) {
    case "attendance":
      return {
        title: "Attendance Management",
        stats: [
          {
            title: "Present Today",
            value: "1,145",
            icon: "how_to_reg",
            trend: "92%",
            trendLabel: "Daily Average",
            color: "green",
          },
          {
            title: "Absent",
            value: "45",
            icon: "person_off",
            trend: "+2%",
            trendLabel: "vs Yesterday",
            color: "red",
          },
          {
            title: "Late Arrivals",
            value: "23",
            icon: "timer_off",
            trend: "-5%",
            trendLabel: "Improving",
            color: "orange",
          },
          {
            title: "On Leave",
            value: "37",
            icon: "flight_takeoff",
            trend: "Normal",
            trendLabel: "Planned",
            color: "blue",
          },
        ],
        tableHeaders: [
          "Employee",
          "Department",
          "Check In",
          "Check Out",
          "Status",
        ],
        tableData: [
          {
            col1: "John Doe",
            col2: "Engineering",
            col3: "09:00 AM",
            col4: "06:00 PM",
            col5: "Present",
            statusColor: "text-green-600 bg-green-100",
          },
          {
            col1: "Jane Smith",
            col2: "HR",
            col3: "09:15 AM",
            col4: "06:15 PM",
            col5: "Late",
            statusColor: "text-orange-600 bg-orange-100",
          },
          {
            col1: "Robert Key",
            col2: "Finance",
            col3: "-",
            col4: "-",
            col5: "Absent",
            statusColor: "text-red-600 bg-red-100",
          },
          {
            col1: "Emily Davis",
            col2: "Marketing",
            col3: "08:50 AM",
            col4: "05:50 PM",
            col5: "Present",
            statusColor: "text-green-600 bg-green-100",
          },
        ],
      };
    case "salary":
      return {
        title: "Payroll & Salary",
        stats: [
          {
            title: "Total Payroll",
            value: "$1.2M",
            icon: "payments",
            trend: "+1.5%",
            trendLabel: "vs Last Month",
            color: "blue",
          },
          {
            title: "Pending Process",
            value: "12",
            icon: "pending",
            trend: "Urgent",
            trendLabel: "Action Required",
            color: "orange",
          },
          {
            title: "Avg Salary",
            value: "$45k",
            icon: "currency_exchange",
            trend: "Stable",
            trendLabel: "Yearly",
            color: "purple",
          },
          {
            title: "Bonuses Paid",
            value: "$125k",
            icon: "celebration",
            trend: "+12%",
            trendLabel: "Q4 Performance",
            color: "green",
          },
        ],
        tableHeaders: ["Employee", "Role", "Base Salary", "Bonus", "Status"],
        tableData: [
          {
            col1: "Michael Brown",
            col2: "Senior Dev",
            col3: "$95,000",
            col4: "$5,000",
            col5: "Processed",
            statusColor: "text-emerald-600 bg-emerald-100",
          },
          {
            col1: "Sarah Wilson",
            col2: "Designer",
            col3: "$72,000",
            col4: "$2,000",
            col5: "Pending",
            statusColor: "text-amber-600 bg-amber-100",
          },
          {
            col1: "David Lee",
            col2: "Manager",
            col3: "$110,000",
            col4: "$15,000",
            col5: "Processed",
            statusColor: "text-emerald-600 bg-emerald-100",
          },
          {
            col1: "Lisa Ray",
            col2: "QA Lead",
            col3: "$88,000",
            col4: "$4,000",
            col5: "Processing",
            statusColor: "text-blue-600 bg-blue-100",
          },
        ],
      };
    case "fms":
      return {
        title: "File Management System",
        stats: [
          {
            title: "Total Files",
            value: "45.2k",
            icon: "folder_open",
            trend: "+120",
            trendLabel: "New this week",
            color: "blue",
          },
          {
            title: "Storage Used",
            value: "1.2TB",
            icon: "cloud_queue",
            trend: "82%",
            trendLabel: "Capacity",
            color: "purple",
          },
          {
            title: "Recent Uploads",
            value: "145",
            icon: "upload_file",
            trend: "Active",
            trendLabel: "Today",
            color: "green",
          },
          {
            title: "Shared Files",
            value: "3,200",
            icon: "share",
            trend: "Stable",
            trendLabel: "Internal",
            color: "orange",
          },
        ],
        tableHeaders: ["File Name", "Owner", "Size", "Last Modified", "Type"],
        tableData: [
          {
            col1: "Project_Specs.pdf",
            col2: "Alice Green",
            col3: "2.4 MB",
            col4: "2 hours ago",
            col5: "PDF",
            statusColor: "text-red-500 bg-red-50",
          },
          {
            col1: "Budget_2025.xlsx",
            col2: "Finance Team",
            col3: "450 KB",
            col4: "Yesterday",
            col5: "Excel",
            statusColor: "text-green-600 bg-green-50",
          },
          {
            col1: "Logo_Assets.zip",
            col2: "Design Team",
            col3: "150 MB",
            col4: "Jan 15, 2025",
            col5: "Archive",
            statusColor: "text-purple-600 bg-purple-50",
          },
          {
            col1: "Meeting_Notes.docx",
            col2: "John Doe",
            col3: "25 KB",
            col4: "Jan 12, 2025",
            col5: "Word",
            statusColor: "text-blue-600 bg-blue-50",
          },
        ],
      };
    case "todo":
      return {
        title: "Task Management (TODO)",
        stats: [
          {
            title: "My Tasks",
            value: "18",
            icon: "assignment",
            trend: "4 Due",
            trendLabel: "Today",
            color: "blue",
          },
          {
            title: "Completed",
            value: "145",
            icon: "task_alt",
            trend: "+12",
            trendLabel: "This Week",
            color: "green",
          },
          {
            title: "Overdue",
            value: "3",
            icon: "warning",
            trend: "Action",
            trendLabel: "High Priority",
            color: "red",
          },
          {
            title: "Team Tasks",
            value: "62",
            icon: "group_work",
            trend: "Active",
            trendLabel: "Ongoing",
            color: "purple",
          },
        ],
        tableHeaders: ["Task", "Project", "Due Date", "Priority", "Status"],
        tableData: [
          {
            col1: "Update Homepage UI",
            col2: "Website Revamp",
            col3: "Today",
            col4: "High",
            col5: "In Progress",
            statusColor: "text-blue-600 bg-blue-100",
          },
          {
            col1: "Fix Login Bug",
            col2: "App Maintenance",
            col3: "Tomorrow",
            col4: "Critical",
            col5: "Pending",
            statusColor: "text-red-600 bg-red-100",
          },
          {
            col1: "Draft Q1 Report",
            col2: "Quarterly Review",
            col3: "Jan 25",
            col4: "Medium",
            col5: "Not Started",
            statusColor: "text-slate-600 bg-slate-100",
          },
          {
            col1: "Team Sync",
            col2: "Operations",
            col3: "Jan 26",
            col4: "Low",
            col5: "Done",
            statusColor: "text-emerald-600 bg-emerald-100",
          },
        ],
      };
    case "ims":
      return {
        title: "Inventory Management",
        stats: [
          {
            title: "Total Stock",
            value: "8,450",
            icon: "inventory_2",
            trend: "Good",
            trendLabel: "Stock Level",
            color: "blue",
          },
          {
            title: "Low Stock",
            value: "12",
            icon: "production_quantity_limits",
            trend: "Ordered",
            trendLabel: "Replenishing",
            color: "orange",
          },
          {
            title: "Incoming",
            value: "500",
            icon: "local_shipping",
            trend: "Tomorrow",
            trendLabel: "Expected",
            color: "purple",
          },
          {
            title: "Damaged",
            value: "0.5%",
            icon: "broken_image",
            trend: "Low",
            trendLabel: "Quality Control",
            color: "green",
          },
        ],
        tableHeaders: ["Item Name", "Category", "SKU", "Stock Qty", "Status"],
        tableData: [
          {
            col1: "Office Chair V2",
            col2: "Furniture",
            col3: "FUR-001",
            col4: "145",
            col5: "In Stock",
            statusColor: "text-emerald-600 bg-emerald-100",
          },
          {
            col1: 'Dell Monitor 24"',
            col2: "Electronics",
            col3: "ELE-552",
            col4: "12",
            col5: "Low Stock",
            statusColor: "text-amber-600 bg-amber-100",
          },
          {
            col1: "Wireless Mouse",
            col2: "Electronics",
            col3: "ELE-883",
            col4: "350",
            col5: "In Stock",
            statusColor: "text-emerald-600 bg-emerald-100",
          },
          {
            col1: "USB-C Cable",
            col2: "Accessories",
            col3: "ACC-102",
            col4: "0",
            col5: "Out of Stock",
            statusColor: "text-red-600 bg-red-100",
          },
        ],
      };
    case "hrms":
      return {
        title: "HR Management System",
        stats: [
          {
            title: "Total Staff",
            value: "1,250",
            icon: "badge",
            trend: "+5",
            trendLabel: "New Hires",
            color: "blue",
          },
          {
            title: "Open Positions",
            value: "8",
            icon: "person_search",
            trend: "Hiring",
            trendLabel: "Active",
            color: "purple",
          },
          {
            title: "Reviews Due",
            value: "24",
            icon: "rate_review",
            trend: "Q1",
            trendLabel: "Performance",
            color: "orange",
          },
          {
            title: "Satisfaction",
            value: "4.8",
            icon: "sentiment_satisfied",
            trend: "High",
            trendLabel: "eNPS Score",
            color: "green",
          },
        ],
        tableHeaders: [
          "Candidate / Employee",
          "Position",
          "Department",
          "Date",
          "Status",
        ],
        tableData: [
          {
            col1: "Alex Johnson",
            col2: "Senior Dev",
            col3: "Engineering",
            col4: "Joined Today",
            col5: "Onboarding",
            statusColor: "text-blue-600 bg-blue-100",
          },
          {
            col1: "Maria Garcia",
            col2: "Sales Lead",
            col3: "Sales",
            col4: "Interviewing",
            col5: "Round 2",
            statusColor: "text-purple-600 bg-purple-100",
          },
          {
            col1: "Sam Wilson",
            col2: "Product Manager",
            col3: "Product",
            col4: "Offered",
            col5: "Pending",
            statusColor: "text-amber-600 bg-amber-100",
          },
          {
            col1: "Chris Evans",
            col2: "Designer",
            col3: "Design",
            col4: "Rejected",
            col5: "Closed",
            statusColor: "text-slate-600 bg-slate-100",
          },
        ],
      };
    default:
      return {
        title: "Module",
        stats: [],
        tableHeaders: [],
        tableData: [],
      };
  }
};

export const formatTime12h = (time) => {
  if (!time) return "--";

  const [hours, minutes] = time.split(":").map(Number);

  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;

  return `${hour12}:${minutes.toString().padStart(2, "0")} ${period}`;
};
