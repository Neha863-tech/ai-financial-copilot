import React, { useState, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, CheckCircle2, AlertCircle, Filter, } from "lucide-react";
import { FinSightAPI } from "../../services/finsightApi";
export const FinancialCalendarView = () => {
    const [viewMode, setViewMode] = useState("month");
    const [currentDate, setCurrentDate] = useState(new Date(2024, 9, 1)); // October 2024
    const [events, setEvents] = useState([]);
    const [filterType, setFilterType] = useState("ALL");
    useEffect(() => {
        FinSightAPI.getCalendarEvents().then((evts) => {
            if (evts && evts.length > 0)
                setEvents(evts);
        });
    }, []);
    const handlePrev = () => {
        const next = new Date(currentDate);
        if (viewMode === "month")
            next.setMonth(next.getMonth() - 1);
        else if (viewMode === "week")
            next.setDate(next.getDate() - 7);
        else
            next.setDate(next.getDate() - 1);
        setCurrentDate(next);
    };
    const handleNext = () => {
        const next = new Date(currentDate);
        if (viewMode === "month")
            next.setMonth(next.getMonth() + 1);
        else if (viewMode === "week")
            next.setDate(next.getDate() + 7);
        else
            next.setDate(next.getDate() + 1);
        setCurrentDate(next);
    };
    const filteredEvents = events.filter((e) => {
        if (filterType === "ALL")
            return true;
        if (filterType === "BILLS")
            return e.type === "BILL";
        if (filterType === "RECURRING")
            return e.type === "RECURRING";
        if (filterType === "MILESTONES")
            return e.type === "MILESTONE";
        return true;
    });
    const getStatusBadge = (status) => {
        switch (status) {
            case "COMPLETED":
                return (<span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center gap-1">
            <CheckCircle2 size={11}/> Completed
          </span>);
            case "DUE_SOON":
                return (<span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center gap-1">
            <Clock size={11}/> Due Soon
          </span>);
            case "OVERDUE":
                return (<span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center gap-1">
            <AlertCircle size={11}/> Overdue
          </span>);
            default:
                return (<span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-[#1a2f29] text-slate-600 dark:text-slate-300">
            Planned
          </span>);
        }
    };
    return (<div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            PAYMENT TIMELINE & BRYNTUM SCHEDULER
          </p>
          <h1 className="text-2xl font-bold font-heading text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="text-[#16a57a]" size={26}/> Financial Calendar
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Track bills, renewals, loan EMIs, and savings milestones across dynamic daily, weekly, and monthly horizons.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg p-0.5 bg-slate-100 dark:bg-[#1c3029]">
            {["month", "week", "day"].map((m) => (<button key={m} onClick={() => setViewMode(m)} className={`px-3 py-1.5 text-xs font-semibold rounded-md capitalize transition-all ${viewMode === m
                ? "bg-white dark:bg-[#121f1c] text-[#16a57a] shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}>
                {m}
              </button>))}
          </div>
        </div>
      </div>

      {/* Date Navigation Bar & Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-white dark:bg-[#121f1c] rounded-xl border border-slate-200 dark:border-[#21352f] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button onClick={handlePrev} className="p-1.5 rounded-lg border border-slate-200 dark:border-[#21352f] hover:bg-slate-50 dark:hover:bg-[#182a24] text-slate-600 dark:text-slate-300">
              <ChevronLeft size={16}/>
            </button>
            <button onClick={handleNext} className="p-1.5 rounded-lg border border-slate-200 dark:border-[#21352f] hover:bg-slate-50 dark:hover:bg-[#182a24] text-slate-600 dark:text-slate-300">
              <ChevronRight size={16}/>
            </button>
          </div>

          <h2 className="text-sm font-bold font-heading text-slate-900 dark:text-white">
            {currentDate.toLocaleString("en-US", { month: "long", year: "numeric" })}
          </h2>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-400"/>
          <div className="inline-flex rounded-lg p-0.5 bg-slate-100 dark:bg-[#1c3029]">
            {["ALL", "BILLS", "RECURRING", "MILESTONES"].map((t) => (<button key={t} onClick={() => setFilterType(t)} className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all ${filterType === t
                ? "bg-white dark:bg-[#121f1c] text-[#16a57a] shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}>
                {t}
              </button>))}
          </div>
        </div>
      </div>

      {/* Calendar Grid Representation */}
      <div className="p-5 bg-white dark:bg-[#121f1c] rounded-xl border border-slate-200 dark:border-[#21352f] shadow-xs space-y-4">
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 pb-2 border-b border-slate-100 dark:border-[#1e342c]">
          <span>SUN</span>
          <span>MON</span>
          <span>TUE</span>
          <span>WED</span>
          <span>THU</span>
          <span>FRI</span>
          <span>SAT</span>
        </div>

        {/* Calendar Cells Preview (October 2024 sample) */}
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 35 }).map((_, i) => {
            const dayNum = i - 1; // Oct 1, 2024 is Tuesday (col index 2)
            const isValid = dayNum >= 1 && dayNum <= 31;
            const dayEvents = isValid
                ? filteredEvents.filter((e) => {
                    const d = new Date(e.date).getDate();
                    return d === dayNum;
                })
                : [];
            return (<div key={i} className={`min-h-[90px] p-2 rounded-lg border transition-all ${isValid
                    ? "border-slate-100 dark:border-[#1e342c] bg-slate-50/50 dark:bg-[#15241f]/40 hover:border-[#16a57a]/40"
                    : "border-transparent bg-transparent opacity-30"}`}>
                {isValid && (<>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      {dayNum}
                    </span>
                    <div className="space-y-1">
                      {dayEvents.map((evt) => (<div key={evt.id} className="p-1 rounded bg-white dark:bg-[#1c3029] border border-slate-200 dark:border-[#27453b] text-[10px] shadow-2xs space-y-0.5">
                          <p className="font-bold text-slate-900 dark:text-white truncate">{evt.title}</p>
                          <div className="flex items-center justify-between text-[9px]">
                            <span className="font-semibold text-emerald-600">
                              ₹{evt.amount.toLocaleString("en-IN")}
                            </span>
                            {getStatusBadge(evt.status)}
                          </div>
                        </div>))}
                    </div>
                  </>)}
              </div>);
        })}
        </div>
      </div>

      {/* Detailed Upcoming & Overdue List */}
      <div className="p-5 bg-white dark:bg-[#121f1c] rounded-xl border border-slate-200 dark:border-[#21352f] shadow-xs space-y-3">
        <h3 className="text-sm font-bold font-heading text-slate-900 dark:text-white">
          Event Queue & Status Registry
        </h3>
        <div className="divide-y divide-slate-100 dark:divide-[#1e342c]">
          {filteredEvents.map((evt) => (<div key={evt.id} className="py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-[#16a57a] flex items-center justify-center font-bold text-xs">
                  {new Date(evt.date).getDate()}
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{evt.title}</h4>
                  <p className="text-[10px] text-slate-400">
                    Category: {evt.category} • Scheduled for {new Date(evt.date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  ₹{evt.amount.toLocaleString("en-IN")}
                </span>
                {getStatusBadge(evt.status)}
              </div>
            </div>))}
        </div>
      </div>
    </div>);
};
