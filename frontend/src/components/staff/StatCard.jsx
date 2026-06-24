const StatCard = ({ icon: Icon, label, value, helper }) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
          {label}
        </p>
        <p className="mt-1 text-2xl font-black text-slate-900">{value}</p>
        {helper && <p className="mt-1 text-[11px] text-slate-500">{helper}</p>}
      </div>
      {Icon && (
        <div className="rounded-lg border border-slate-200 bg-white p-2 text-primary-600">
          <Icon size={18} />
        </div>
      )}
    </div>
  </div>
);

export default StatCard;
