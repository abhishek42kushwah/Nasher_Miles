const FMSTabs = ({ tabs, activeTab, onChange }) => {
  return (
    <div className="bg-bg-card mt-6 border border-border-main rounded-xl px-4">
      <div className="flex gap-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`relative py-4 text-sm font-bold transition
              ${
                activeTab === tab.key
                  ? "text-primary"
                  : "text-text-muted hover:text-text-main"
              }`}
          >
            <span className="flex items-center gap-2">
              {tab.label}
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-bg-main">
                {tab.badge}
              </span>
            </span>

            {activeTab === tab.key && (
              <span className="absolute left-0 bottom-0 w-full h-[2px] bg-primary rounded-full" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FMSTabs;
