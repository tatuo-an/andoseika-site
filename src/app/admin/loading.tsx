export default function Loading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-stone-50">
            <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-sm text-stone-500">読み込んでいます…</p>
            </div>
        </div>
    );
}
