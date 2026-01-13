import { AlertTriangle, ShoppingCart } from "lucide-react";
import Link from "next/link";

interface LowStockItem {
    id: string;
    name: string;
    baseUnit: string;
    fixedBuyQty: string | null;
    totalInStock: string;
}

export const LowStockAlert = ({ items }: { items: LowStockItem[] }) => {
    if (items.length === 0) return null;

    return (
        <div className="">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="text-destructive" size={22} />
                Running Low
            </h2>
            <div className="grid grid-cols-1 gap-4">
                {items.map((item) => {
                    const totalInStock = parseFloat(item.totalInStock);
                    const fixedQty = parseFloat(item.fixedBuyQty || "0");
                    const percentage = fixedQty > 0 ? (totalInStock / fixedQty) * 100 : 0;

                    return (
                        <div key={item.id} className="bg-sidebar rounded-lg p-4 border-l-4 border-destructive shadow-sm transition-all hover:shadow-md">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-foreground">
                                        {item.name}
                                    </span>
                                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                                        Stock Level: {percentage.toFixed(0)}%
                                    </span>
                                </div>
                                <Link href="/pantry">
                                    <button className="p-2 hover:bg-destructive/10 rounded-full text-destructive transition-colors">
                                        <ShoppingCart size={16} />
                                    </button>
                                </Link>
                            </div>

                            <div className="space-y-2">
                                <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-destructive rounded-full"
                                        style={{ width: `${Math.max(percentage, 5)}%` }}
                                    />
                                </div>
                                <div className="flex justify-between items-center text-[11px]">
                                    <span className="font-medium text-destructive">
                                        {totalInStock} {item.baseUnit} left
                                    </span>
                                    <span className="text-muted-foreground italic">
                                        of {fixedQty} {item.baseUnit}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
