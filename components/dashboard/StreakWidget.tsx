import { Flame } from "lucide-react";

export const StreakWidget = ({ streak }: { streak: number }) => {
    return (
        <div className="my-2">

            <h2 className="text-xl font-semibold mb-4"><Flame className="text-primary inline" size={22} /> Current Streak</h2>
            <div className="h-full bg-linear-to-br from-emerald-500 to-cyan-800 rounded-2xl p-4 text-white shadow-lg overflow-hidden relative group transition-all hover:scale-[1.02] hover:shadow-xl">
                {/* Background Decoration */}
                <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-125 transition-transform duration-500">
                    <Flame size={120} />
                </div>

                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <h3 className="text-orange-100 font-bold text-[10px] uppercase tracking-wider mb-1">
                            Current Streak
                        </h3>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-black">{streak}</span>
                            <span className="text-sm font-bold opacity-80">Days</span>
                        </div>
                    </div>

                    <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm border border-white/30">
                        <Flame className={streak > 0 ? "text-white animate-pulse" : "text-white/40"} size={28} />
                    </div>
                </div>

                <p className="mt-3 text-[11px] font-medium text-orange-50/80 leading-tight">
                    {streak === 0 ? (
                        "Start your meal plan today to begin your streak!"
                    ) : streak < 3 ? (
                        "Nice start! Keep consuming your planned meals."
                    ) : streak < 7 ? (
                        "You're on fire! Almost a full week."
                    ) : (
                        "Legendary consistency! You're a master planner."
                    )}
                </p>
            </div>
        </div>
    );
};
