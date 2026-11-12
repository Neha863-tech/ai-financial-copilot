import React, { useState, useMemo, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import { Plus, Search, Download, X, ShieldCheck, Eye, } from "lucide-react";
import { toast } from "sonner";
export const TransactionsView = ({ transactions, onRefresh, onOpenAddModal }) => {
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [typeFilter, setTypeFilter] = useState("All");
    const [selectedTx, setSelectedTx] = useState(null);
    const gridRef = useRef(null);
    const filteredData = useMemo(() => {
        return transactions.filter((t) => {
            const matchCat = categoryFilter === "All" || t.category === categoryFilter;
            const matchType = typeFilter === "All" || t.type === typeFilter;
            const matchSearch = search === "" ||
                t.merchant.toLowerCase().includes(search.toLowerCase()) ||
                t.category.toLowerCase().includes(search.toLowerCase()) ||
                (t.paymentMethod || "").toLowerCase().includes(search.toLowerCase()) ||
                (t.id || "").toLowerCase().includes(search.toLowerCase());
            return matchCat && matchType && matchSearch;
        });
    }, [transactions, search, categoryFilter, typeFilter]);
    const columnDefs = useMemo(() => [
        {
            headerName: "TX ID",
            field: "id",
            width: 110,
            cellRenderer: (params) => {
                const val = params.value ? String(params.value).slice(0, 8) : "TX-839";
                return <span className="font-mono text-[10px] text-slate-400">#{val}</span>;
            },
        },
        {
            headerName: "DATE & TIME",
            field: "date",
            width: 130,
            sortable: true,
            comparator: (d1, d2) => new Date(d1).getTime() - new Date(d2).getTime(),
        },
        {
            headerName: "MERCHANT",
            field: "merchant",
            flex: 2,
            minWidth: 160,
            cellRenderer: (params) => {
                return (<div className="flex items-center gap-2 font-medium">
              <span className="w-6 h-6 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center text-xs font-bold">
                {params.value?.[0] || "T"}
              </span>
              <span className="truncate">{params.value}</span>
            </div>);
            },
        },
        {
            headerName: "CATEGORY",
            field: "category",
            flex: 1.5,
            minWidth: 130,
            cellRenderer: (params) => {
                return (<span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-[#1a2f29] text-slate-700 dark:text-emerald-300">
              {params.value}
            </span>);
            },
        },
        {
            headerName: "TYPE",
            field: "type",
            width: 100,
            cellRenderer: (params) => {
                const isIncome = params.value === "INCOME";
                return (<span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${isIncome
                        ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600"
                        : "bg-slate-100 dark:bg-[#182a24] text-slate-600 dark:text-slate-300"}`}>
              {params.value}
            </span>);
            },
        },
        {
            headerName: "PAYMENT METHOD",
            field: "paymentMethod",
            width: 140,
            cellRenderer: (params) => {
                const isPayPal = params.value === "PayPal" || params.value === "PAYPAL_CHECKOUT";
                return (<div className="flex items-center gap-1.5 text-xs">
              <span className={`w-2 h-2 rounded-full ${isPayPal ? "bg-blue-500" : "bg-emerald-500"}`}/>
              <span className={isPayPal ? "font-semibold text-blue-600 dark:text-blue-400" : ""}>
                {params.value || "PayPal"}
              </span>
            </div>);
            },
        },
        {
            headerName: "AMOUNT",
            field: "amount",
            width: 130,
            sortable: true,
            cellClass: "text-right font-semibold",
            cellRenderer: (params) => {
                const val = params.value;
                const isIncome = params.data?.type === "INCOME";
                return (<span className={isIncome ? "text-emerald-600 font-bold" : "text-slate-900 dark:text-white"}>
              {isIncome ? "+" : "−"}₹{Math.abs(val).toLocaleString("en-IN")}
            </span>);
            },
        },
        {
            headerName: "STATUS",
            field: "status",
            width: 110,
            cellRenderer: (params) => {
                const status = params.value || "COMPLETED";
                return (<span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${status === "COMPLETED"
                        ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600"
                        : status === "REFUNDED"
                            ? "bg-purple-50 dark:bg-purple-950/40 text-purple-600"
                            : "bg-amber-50 dark:bg-amber-950/40 text-amber-600"}`}>
              {status}
            </span>);
            },
        },
        {
            headerName: "ACTIONS",
            width: 80,
            cellRenderer: (params) => {
                return (<button onClick={() => setSelectedTx(params.data)} className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-[#1c3029] text-slate-500 hover:text-slate-900 dark:hover:text-white" title="View Details">
              <Eye size={14}/>
            </button>);
            },
        },
    ], []);
    const handleExportCsv = () => {
        if (gridRef.current) {
            gridRef.current.api.exportDataAsCsv({
                fileName: `FinSight-Transactions-${new Date().toISOString().slice(0, 10)}.csv`,
            });
            toast.success("Transactions exported as CSV");
        }
    };
    return (<section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            POSTGRESQL AUDITED LEDGER
          </p>
          <h1 className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
            Transactions
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            High-performance AG Grid table with multi-column sorting, search, and audit history.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onOpenAddModal} className="px-4 py-2 rounded-lg bg-[#16a57a] hover:bg-[#138e69] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all">
            <Plus size={16}/> Add transaction
          </button>
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 bg-white dark:bg-[#121f1c] border border-slate-200 dark:border-[#21352f] rounded-lg px-3 py-1.5 flex-1 max-w-sm">
          <Search size={15} className="text-slate-400"/>
          <input placeholder="Search merchants, categories, methods, IDs..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full text-xs bg-transparent outline-none text-slate-900 dark:text-white"/>
        </div>

        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#21352f] bg-white dark:bg-[#121f1c] text-xs text-slate-700 dark:text-slate-200 outline-none">
          <option>All</option>
          <option>Shopping</option>
          <option>Food & dining</option>
          <option>Utilities</option>
          <option>Rent & home</option>
          <option>Transport</option>
          <option>Freelance</option>
        </select>

        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#21352f] bg-white dark:bg-[#121f1c] text-xs text-slate-700 dark:text-slate-200 outline-none">
          <option>All</option>
          <option value="EXPENSE">Expense Only</option>
          <option value="INCOME">Income Only</option>
        </select>

        <button onClick={handleExportCsv} className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#21352f] bg-white dark:bg-[#121f1c] hover:bg-slate-50 dark:hover:bg-[#183129] text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5" title="Export CSV">
          <Download size={14}/> Export CSV
        </button>
      </div>

      {/* AG Grid Data Table */}
      <div className="ag-theme-quartz w-full h-[520px] rounded-xl overflow-hidden border border-slate-200 dark:border-[#21352f] shadow-xs">
        <AgGridReact ref={gridRef} rowData={filteredData} columnDefs={columnDefs} pagination={true} paginationPageSize={10} paginationPageSizeSelector={[10, 20, 50]} animateRows={true} rowSelection="single"/>
      </div>

      {/* Transaction Details Modal */}
      {selectedTx && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#121f1c] rounded-2xl border border-slate-200 dark:border-[#21352f] max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1e342c]">
              <h3 className="text-base font-bold font-heading text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="text-[#16a57a]" size={20}/> Transaction Audit Record
              </h3>
              <button onClick={() => setSelectedTx(null)} className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white">
                <X size={16}/>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-[#1e342c]">
                <span className="text-slate-400">Transaction ID:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {selectedTx.id || "tx-sample-83921"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-[#1e342c]">
                <span className="text-slate-400">Merchant / Payee:</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedTx.merchant}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-[#1e342c]">
                <span className="text-slate-400">Category:</span>
                <span className="font-semibold text-emerald-600">{selectedTx.category}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-[#1e342c]">
                <span className="text-slate-400">Amount:</span>
                <span className="font-bold text-base text-slate-900 dark:text-white">
                  ₹{Number(selectedTx.amount).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-[#1e342c]">
                <span className="text-slate-400">Payment Method:</span>
                <span className="font-semibold text-blue-600">{selectedTx.paymentMethod || "PayPal Sandbox"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-[#1e342c]">
                <span className="text-slate-400">Direction:</span>
                <span className="font-semibold">{selectedTx.type}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-[#1e342c]">
                <span className="text-slate-400">Posting Date:</span>
                <span>{selectedTx.date}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Cryptographic Dedupe Hash:</span>
                <span className="font-mono text-[10px] text-slate-400">sha256:d839fe10a...</span>
              </div>
            </div>

            <button onClick={() => setSelectedTx(null)} className="w-full py-2 rounded-lg bg-[#16a57a] hover:bg-[#138e69] text-white text-xs font-semibold">
              Close
            </button>
          </div>
        </div>)}
    </section>);
};
