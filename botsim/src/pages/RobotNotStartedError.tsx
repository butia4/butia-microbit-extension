export function RobotNotStartedError() {
    return (
        <div
            className="butia-screen-transition flex items-center justify-center text-center bg-(--butia-red-25)"
            style={{ width: "100%", height: "100%" }}
        >
            <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-(--butia-red-300) bg-(--butia-red-50) px-8 py-7">
                <svg
                    className="h-10 w-10 text-(--butia-error)"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 8v5" />
                    <circle cx="12" cy="16" r="0.75" fill="currentColor" stroke="none" />
                </svg>
                <p className="m-0 max-w-[220px] font-(--font-body) text-sm text-(--butia-ink-700)">
                    Agregá el bloque &quot;iniciar robot&quot; antes de usar cualquier otro bloque de Butia
                </p>
            </div>
        </div>
    )
}
