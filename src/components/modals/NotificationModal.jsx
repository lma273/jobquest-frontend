export default function NotificationModal({ open, onClose, notifications = [] }) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />

            <div className="relative w-[92%] max-w-lg rounded-xl bg-slate-800 text-white border border-white/10 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Thông báo</h2>
                    <button type="button" onClick={onClose} className="text-white/60 hover:text-white">✕</button>
                </div>

                {notifications.length === 0 ? (
                    <p className="text-white/70">Chưa có thông báo mới.</p>
                ) : (
                    <div className="space-y-3 max-h-72 overflow-auto pr-1">
                        {notifications.map((n, i) => (
                            <div key={i} className="rounded-lg bg-slate-700/60 p-3">
                                <div className="font-semibold">{n.title}</div>
                                <div className="text-white/70 text-sm">{n.body}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
