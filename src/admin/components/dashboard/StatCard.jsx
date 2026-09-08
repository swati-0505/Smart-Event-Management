function StatCard({ label, value, note }) {
  return (
    <article className="admin-metric px-5 py-5 sm:px-6 sm:py-6">
      <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/35">
        {label}
      </p>

      <div className="mt-5 flex items-end justify-between gap-4">
        <h3 className="text-[30px] font-semibold tracking-[-0.04em] text-white sm:text-[34px]">
          {value}
        </h3>

        <span className="pb-1 text-right text-[10px] font-medium text-[#d7a63a]">
          {note}
        </span>
      </div>
    </article>
  );
}

export default StatCard;