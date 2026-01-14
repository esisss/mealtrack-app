import { AlertCircle, Calendar } from "lucide-react";
import { parseLocalDate, getTodayLocal } from "@/lib/date-utils";

interface ExpiringItem {
    id: string;
    ingredientName: string | null;
    baseUnit: string | null;
    qtyRemaining: string;
    expiresAt: string | null;
}

export const ExpiringStock = ({ items }: { items: ExpiringItem[] }) => {
    if (items.length === 0) return null;

    const formatDateStr = (dateStr: string) => {
        const date = parseLocalDate(dateStr);
        return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
    };

    const getDaysLeft = (dateStr: string) => {
        const expiry = parseLocalDate(dateStr);
        const now = getTodayLocal();
        const diffTime = expiry.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <AlertCircle className="text-amber-500" size={22} />
                Expiring Soon
            </h2>
            <div className="grid grid-cols-1 gap-4">
                {items.map((item) => {
                    const daysLeft = item.expiresAt ? getDaysLeft(item.expiresAt) : null;
                    return (
                        <div key={item.id} className="bg-sidebar rounded-lg p-4 flex items-center justify-between border-l-4 border-amber-500 shadow-sm transition-transform hover:scale-[1.02]">
                            <div className="flex flex-col gap-1">
                                <span className="text-sm font-semibold truncate max-w-[150px]">
                                    {item.ingredientName}
                                </span>
                                <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                                    <Calendar size={12} className="text-amber-500" />
                                    <span>
                                        {daysLeft === 0 ? 'Expires today!' :
                                            daysLeft === 1 ? 'Expires tomorrow' :
                                                `Expires in ${daysLeft} days`}
                                        ({item.expiresAt ? formatDateStr(item.expiresAt) : 'N/A'})
                                    </span>
                                </div>
                            </div>
                            <div className="text-right flex flex-col items-end">
                                <span className="text-xs font-black bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-1 rounded-md">
                                    {item.qtyRemaining} {item.baseUnit}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
