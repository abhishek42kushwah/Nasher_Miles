
export const FMS_TABS = [
  {
    key: "APPLIED",
    label: "Applied",
    badge: 52,
    columns: [
      { key: "id", label: "Task ID" },
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "status", label: "Status" },
       { key: "action", label: "Action" }
    ],
    data: [
      { id: 1, name: "Rahul", email: "rahul@gmail.com", status: "Applied" },
      { id: 3, name: "Amit", email: "amit@gmail.com", status: "Applied" },
      { id: 4, name: "Amit", email: "amit@gmail.com", status: "Applied" },
      { id: 5, name: "Amit", email: "amit@gmail.com", status: "Applied" },
      { id: 6, name: "Amit", email: "amit@gmail.com", status: "Applied" },
      { id: 7, name: "Amit", email: "amit@gmail.com", status: "Applied" },

      { id: 8, name: "Amit", email: "amit@gmail.com", status: "Applied" },
      { id: 9, name: "Amit", email: "amit@gmail.com", status: "Applied" },
      { id: 10, name: "Amit", email: "amit@gmail.com", status: "Applied" },
      { id: 11, name: "Amit", email: "amit@gmail.com", status: "Applied" },
    ],
  },

  {
    key: "INTERVIEW",
    label: "Interview",
    badge: 4,
    columns: [
      { key: "id", label: "Candidate ID" },
      { key: "name", label: "Candidate Name" },
      { key: "round", label: "Interview Round" },
      { key: "date", label: "Interview Date" },
    ],
    data: [
      { id: 11, name: "Neha", round: "Tech", date: "2026-01-20" },
      { id: 12, name: "Karan", round: "HR", date: "2026-01-21" },
    ],
  },

  {
    key: "OFFER",
    label: "Offer",
    badge: 2,
    columns: [
      { key: "id", label: "Offer ID" },
      { key: "name", label: "Candidate" },
      { key: "package", label: "Package" },
      { key: "joining", label: "Joining Date" },
    ],
    data: [{ id: 21, name: "Pooja", package: "8 LPA", joining: "1 Feb 2026" }],
  },
];
