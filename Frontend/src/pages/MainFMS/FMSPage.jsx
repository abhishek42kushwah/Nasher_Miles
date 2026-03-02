import { useState, useMemo } from "react";
import MainLayout from "../../components/layout/MainLayout";
import FMSTabs from "./FMSTabs";
import DataTable from "./DataTable";
import TablePagination from "./TablePagination";
import TableFilters from "./TableFilters";
import { FMS_TABS } from "./FMS.data.js";

const ITEMS_PER_PAGE = 5;

const Delegation = () => {
  const [activeTab, setActiveTab] = useState(FMS_TABS[0].key);
  const [page, setPage] = useState(1);

  const [search, setSearch] = useState({
    firm: "",
    buyer: "",
    item: "",
    uid: "",
  });

  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });

  /* ------------------ CURRENT TAB ------------------ */
  const currentTab = useMemo(
    () => FMS_TABS.find((t) => t.key === activeTab),
    [activeTab],
  );

  /* ------------------ FILTER + SORT ------------------ */
  const filteredData = useMemo(() => {
    let data = [...currentTab.data];

    // Search (generic: checks all values)
    Object.values(search).forEach((value) => {
      if (!value) return;
      data = data.filter((row) =>
        Object.values(row).some((cell) =>
          String(cell).toLowerCase().includes(value.toLowerCase()),
        ),
      );
    });

    // Sorting
    if (sortConfig.key) {
      data.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key])
          return sortConfig.direction === "asc" ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key])
          return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return data;
  }, [currentTab.data, search, sortConfig]);

  /* ------------------ PAGINATION ------------------ */
  const paginatedData = filteredData.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  return (
    <MainLayout title="FMS">
      {/* Filters */}
      <TableFilters values={search} onChange={setSearch} />

      {/* Tabs */}
      <FMSTabs
        tabs={FMS_TABS}
        activeTab={activeTab}
        onChange={(key) => {
          setActiveTab(key);
          setPage(1);
        }}
      />

      {/* Table */}
      <DataTable
        columns={currentTab.columns}
        data={paginatedData}
        sortConfig={sortConfig}
        onSort={(key) =>
          setSortConfig((prev) => ({
            key,
            direction:
              prev.key === key && prev.direction === "asc" ? "desc" : "asc",
          }))
        }
      />

      {/* Pagination */}
      <TablePagination
        page={page}
        setPage={setPage}
        total={filteredData.length}
        limit={ITEMS_PER_PAGE}
      />
    </MainLayout>
  );
};

export default Delegation;
