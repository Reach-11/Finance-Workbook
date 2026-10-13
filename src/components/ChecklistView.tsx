import React from 'react';
import {
  CheckSquare,
  RotateCcw,
  Award,
} from 'lucide-react';
import { ActionItem, ActionStatus, Language } from '../types/finance';
import { translations } from '../utils/i18n';
import { DEFAULT_ACTIONS } from '../utils/storage';

interface ChecklistViewProps {
  actions: ActionItem[];
  setActions: (acts: ActionItem[]) => void;
  lang: Language;
}

export const ChecklistView: React.FC<ChecklistViewProps> = ({
  actions,
  setActions,
  lang,
}) => {
  const t = translations[lang];

  const handleStatusChange = (id: string, newStatus: ActionStatus) => {
    setActions(
      actions.map((act) => {
        if (act.id === id) {
          return {
            ...act,
            status: newStatus,
            completedDate:
              newStatus === 'done' ? new Date().toISOString().split('T')[0] : undefined,
          };
        }
        return act;
      })
    );
  };

  const handleResetChecklist = () => {
    if (window.confirm('Reset checklist status for a new month?')) {
      setActions(
        DEFAULT_ACTIONS.map((a) => ({
          ...a,
          status: 'not_started',
          completedDate: undefined,
        }))
      );
    }
  };

  const completedCount = actions.filter((a) => a.status === 'done').length;
  const inProgressCount = actions.filter((a) => a.status === 'in_progress').length;
  const progressPct =
    actions.length > 0 ? Math.round((completedCount / actions.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header and Reset */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            {t.checklist.title}
          </h2>
          <p className="mt-1 text-xs text-slate-500">{t.checklist.subtitle}</p>
        </div>
        <button
          onClick={handleResetChecklist}
          className="flex items-center gap-1.5 self-start rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:border-blue-400 hover:text-blue-600 transition"
        >
          <RotateCcw className="h-4 w-4" />
          <span>{t.checklist.resetMonth}</span>
        </button>
      </div>

      {/* Progress Bar Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">
              {t.checklist.overallProgress}
            </h3>
          </div>
          <span className="font-mono text-sm font-bold text-blue-700">
            {completedCount} / {actions.length} ({progressPct}%)
          </span>
        </div>

        <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-blue-600 transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
          <span>{inProgressCount} in progress</span>
          {progressPct === 100 && (
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-700">
              <Award className="h-4 w-4" /> All Monthly Steps Completed!
            </span>
          )}
        </div>
      </div>

      {/* Action Items List */}
      <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        {actions.map((item, index) => {
          const isDone = item.status === 'done';
          const isInProgress = item.status === 'in_progress';
          const isSkipped = item.status === 'skipped';

          return (
            <div
              key={item.id}
              className={`flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between transition ${
                isDone ? 'bg-slate-50/60' : 'hover:bg-blue-50/30'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-mono font-bold text-slate-500">
                  {index + 1}
                </span>

                <div>
                  <h4
                    className={`text-sm font-semibold ${
                      isDone ? 'text-slate-400 line-through' : 'text-slate-900'
                    }`}
                  >
                    {item.titleKey}
                  </h4>
                  <p className="mt-0.5 text-xs text-slate-500">{item.descriptionKey}</p>
                  {item.completedDate && (
                    <span className="mt-1 inline-block text-[10px] text-emerald-600 font-medium">
                      ✓ Completed on {item.completedDate}
                    </span>
                  )}
                </div>
              </div>

              {/* Status Select */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                <select
                  value={item.status}
                  onChange={(e) => handleStatusChange(item.id, e.target.value as ActionStatus)}
                  className={`rounded-xl border px-3 py-1.5 text-xs font-semibold focus:outline-none transition ${
                    isDone
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                      : isInProgress
                      ? 'border-blue-200 bg-blue-50 text-blue-800'
                      : isSkipped
                      ? 'border-slate-200 bg-slate-100 text-slate-500'
                      : 'border-slate-300 bg-white text-slate-800'
                  }`}
                >
                  <option value="not_started">{t.actionStatuses.not_started}</option>
                  <option value="in_progress">{t.actionStatuses.in_progress}</option>
                  <option value="done">{t.actionStatuses.done}</option>
                  <option value="skipped">{t.actionStatuses.skipped}</option>
                </select>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
