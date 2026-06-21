import React, { useState, useEffect, ReactNode } from 'react';
import { X } from 'lucide-react';

// ── Reusable Modal ──
export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className={`bg-[#0a0a0c] border border-[#27272a] rounded-xl shadow-2xl ${wide ? 'w-[800px]' : 'w-[540px]'} max-h-[85vh] flex flex-col`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#27272a]">
          <h3 className="text-sm font-semibold text-gray-200">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

// ── Confirm Dialog ──
export function useConfirm() {
  const [state, setState] = useState<{ open: boolean; message: string; resolve: ((v: boolean) => void) | null }>({ open: false, message: '', resolve: null });

  function confirm(message: string): Promise<boolean> {
    return new Promise(resolve => setState({ open: true, message, resolve }));
  }

  function ConfirmDialog() {
    if (!state.open) return null;
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-[#0a0a0c] border border-[#27272a] rounded-xl shadow-2xl w-[400px] p-5">
          <p className="text-sm text-gray-300 mb-5">{state.message}</p>
          <div className="flex justify-end gap-2">
            <button onClick={() => { state.resolve?.(false); setState({ open: false, message: '', resolve: null }); }} className="px-4 py-2 bg-[#27272a] text-gray-300 text-sm rounded-lg hover:bg-[#3f3f46] transition-colors">Cancel</button>
            <button onClick={() => { state.resolve?.(true); setState({ open: false, message: '', resolve: null }); }} className="px-4 py-2 bg-red-500/80 text-white text-sm rounded-lg hover:bg-red-500 transition-colors">Delete</button>
          </div>
        </div>
      </div>
    );
  }

  return { confirm, ConfirmDialog };
}

// ── Input Component ──
export function Input({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-400 mb-1">{label}</label>
      <input {...props} className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-lg text-sm text-gray-200 focus:border-emerald-500 outline-none transition-colors" />
    </div>
  );
}

// ── Select Component ──
export function Select({ label, options, ...props }: { label: string; options: { value: string; label: string }[] } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-400 mb-1">{label}</label>
      <select {...props} className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-lg text-sm text-gray-200 focus:border-emerald-500 outline-none transition-colors">
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

// ── Textarea Component ──
export function Textarea({ label, ...props }: { label: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-400 mb-1">{label}</label>
      <textarea {...props} className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-lg text-sm text-gray-200 focus:border-emerald-500 outline-none transition-colors resize-none" rows={3} />
    </div>
  );
}

// ── Status Badge ──
export function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    paid: 'text-emerald-400 bg-emerald-500/10',
    sent: 'text-yellow-400 bg-yellow-500/10',
    overdue: 'text-red-400 bg-red-500/10',
    draft: 'text-gray-400 bg-gray-500/10',
    cancelled: 'text-gray-500 bg-gray-500/5',
    active: 'text-emerald-400 bg-emerald-500/10',
    completed: 'text-blue-400 bg-blue-500/10',
  };
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${colors[status] || colors.draft}`}>{status}</span>;
}

// ── Empty State ──
export function EmptyState({ message, icon: Icon }: { message: string; icon: any }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-600">
      <Icon className="w-10 h-10 mb-3 opacity-40" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
