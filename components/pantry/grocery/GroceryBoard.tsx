"use client"

import { GroceryListItem } from "@/types"
import { startTransition, useOptimistic } from "react"
import { toggleGroceryItemStatusAction } from "@/app/actions/groceryactions"
import { Checkbox } from "@/components/ui/checkbox"

export const GroceryBoard = ({ groceryItems, cycleId }: { groceryItems: GroceryListItem[], cycleId: string }) => {

    const [optimisticGroceryItems, updateOptimisticItem] = useOptimistic(
        groceryItems,
        (state, updatedItem: GroceryListItem) => {
            return state.map(item =>
                item.id === updatedItem.id ? updatedItem : item
            );
        }
    );

    const handleToggle = async (item: GroceryListItem) => {
        const newStatus = item.status === 'bought' ? 'pending' : 'bought';
        const optimisticItem = { ...item, status: newStatus as 'pending' | 'bought' | 'skipped' };

        startTransition(() => {
            updateOptimisticItem(optimisticItem);
        });

        const result = await toggleGroceryItemStatusAction(item.id, item.status);

        if (!result.success) {
            console.error('Failed to update item status:', result.message);
        }
    };

    // Separate items by status
    const pendingItems = optimisticGroceryItems.filter(item => item.status === 'pending');
    const boughtItems = optimisticGroceryItems.filter(item => item.status === 'bought');

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Grocery List</h1>
                <p className="text-sm text-muted-foreground">
                    {pendingItems.length} items to buy
                </p>
            </div>

            {optimisticGroceryItems.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed rounded-lg">
                    <p className="mb-4">No groceries needed for this cycle!</p>
                    <p className="text-sm text-muted-foreground">
                        Either you have everything in stock or no meals are planned yet.
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Pending Items */}
                    {pendingItems.length > 0 && (
                        <div>
                            <h2 className="text-lg font-semibold mb-3">To Buy</h2>
                            <div className="space-y-2">
                                {pendingItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent transition-colors"
                                    >
                                        <Checkbox
                                            checked={false}
                                            onCheckedChange={() => handleToggle(item)}
                                        />
                                        <div className="flex-1">
                                            <p className="font-medium">{item.ingredientName}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {item.toBuyQty} {item.baseUnit}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Bought Items */}
                    {boughtItems.length > 0 && (
                        <div>
                            <h2 className="text-lg font-semibold mb-3 text-muted-foreground">
                                Bought ({boughtItems.length})
                            </h2>
                            <div className="space-y-2">
                                {boughtItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50"
                                    >
                                        <Checkbox
                                            checked={true}
                                            onCheckedChange={() => handleToggle(item)}
                                        />
                                        <div className="flex-1 opacity-60">
                                            <p className="font-medium line-through">{item.ingredientName}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {item.toBuyQty} {item.baseUnit}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
