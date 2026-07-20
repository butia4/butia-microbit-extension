export function Placeholder() {
    return (
        <div
            className="butia-screen-transition flex items-center justify-center text-center"
            style={{ width: "100%", height: "100%" }}
        >
            <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-(--butia-green-300) bg-(--butia-green-50) px-8 py-7">
                <svg
                    className="butia-pulse h-10 w-10 text-(--butia-green-600)"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <rect x="3" y="3" width="18" height="18" rx="3" />
                    <path d="M3 9h18" />
                    <path d="M9 21V9" />
                    <circle cx="6" cy="6" r="0.75" fill="currentColor" stroke="none" />
                </svg>
                <p className="m-0 max-w-[220px] font-(--font-body) text-sm text-(--butia-ink-700)">
                    Agregá el bloque &quot;usar mapa&quot; para ver el simulador
                </p>
            </div>
        </div>
    )
}
