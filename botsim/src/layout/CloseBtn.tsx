interface Props {
    onOpenSettings: () => void
}

const CloseBtn = ({ onOpenSettings }: Props) => {
  return (
    <button
        type="button"
        className="absolute top-4 right-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-(--butia-green-100) bg-(--butia-green-50) text-2xl leading-none shadow-[0_2px_6px_rgba(0,0,0,0.15)] cursor-pointer transition-transform duration-150 hover:scale-105 hover:bg-(--butia-green-100) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--butia-green-800)"
        onClick={onOpenSettings}
        aria-label="Abrir configuración"
        title="Configuración de sensores"
    >
        ⚙
    </button>
  )
}
export default CloseBtn