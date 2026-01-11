"use client"

import { GroceryListItem } from "@/types"
import { startTransition, useOptimistic, useState } from "react"
import { toggleGroceryItemStatusAction, deleteGroceryItemAction } from "@/app/actions/groceryactions"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

export const GroceryBoard = ({ groceryItems }: { groceryItems: GroceryListItem[], }) => {
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [itemToUncheck, setItemToUncheck] = useState<GroceryListItem | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<GroceryListItem | null>(null);

    const [optimisticGroceryItems, updateOptimisticItem] = useOptimistic(
        groceryItems,
        (state, update: GroceryListItem | { id: string; deleted: true }) => {
            // Handle deletion
            if ('deleted' in update && update.deleted) {
                return state.filter(item => item.id !== update.id);
            }
            // Handle status update
            return state.map(item =>
                item.id === update.id ? update as GroceryListItem : item
            );
        }
    );

    const handleToggle = async (item: GroceryListItem, removeFromStock?: boolean) => {
        const newStatus = item.status === 'bought' ? 'pending' : 'bought';
        const optimisticItem = { ...item, status: newStatus as 'pending' | 'bought' | 'skipped' };

        startTransition(() => {
            updateOptimisticItem(optimisticItem);
        });

        const result = await toggleGroceryItemStatusAction(item.id, item.status, removeFromStock);

        if (!result.success) {
            console.error('Failed to update item status:', result.message);
        }
    };

    const handleCheckboxChange = (item: GroceryListItem) => {
        // If unchecking a bought item, show confirmation dialog
        console.log(item)
        if (item.status === 'bought') {
            setItemToUncheck(item);
            setConfirmDialogOpen(true);
        } else {
            // If checking (marking as bought), just toggle
            handleToggle(item);
        }
    };

    const handleConfirmUncheck = async (removeFromStock: boolean) => {
        if (!itemToUncheck) return;

        await handleToggle(itemToUncheck, removeFromStock);
        setConfirmDialogOpen(false);
        setItemToUncheck(null);
    };

    const handleDeleteClick = (item: GroceryListItem) => {
        setItemToDelete(item);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;

        // Optimistically remove the item from the UI
        startTransition(() => {
            updateOptimisticItem({ id: itemToDelete.id, deleted: true });
        });

        const result = await deleteGroceryItemAction(itemToDelete.id);

        if (!result.success) {
            console.error('Failed to delete item:', result.message);
        }

        setDeleteDialogOpen(false);
        setItemToDelete(null);
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
                                            onCheckedChange={() => handleCheckboxChange(item)}
                                        />
                                        <div className="flex-1">
                                            <p className="font-medium">{item.ingredientName}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {item.toBuyQty} {item.baseUnit}
                                            </p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDeleteClick(item)}
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
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
                                            onCheckedChange={() => handleCheckboxChange(item)}
                                        />
                                        <div className="flex-1 opacity-60">
                                            <p className="font-medium line-through">{item.ingredientName}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {item.toBuyQty} {item.baseUnit}
                                            </p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDeleteClick(item)}
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-60"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Uncheck Confirmation Dialog */}
            <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Remove from Stock?</DialogTitle>
                        <DialogDescription>
                            Do you want to remove &ldquo;{itemToUncheck?.ingredientName}&rdquo; from your stock as well?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex-col sm:flex-row gap-2">
                        <Button
                            variant="outline"
                            onClick={() => handleConfirmUncheck(false)}
                            className="w-full sm:w-auto"
                        >
                            Keep in Stock
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => handleConfirmUncheck(true)}
                            className="w-full sm:w-auto"
                        >
                            Remove from Stock
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Item?</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete &ldquo;{itemToDelete?.ingredientName}&rdquo; from your grocery list?
                            If you delete it and its needed by  a scheduled recipe, you will need to add it by hand in stock tab.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex-col sm:flex-row gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(false)}
                            className="w-full sm:w-auto"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleConfirmDelete}
                            className="w-full sm:w-auto"
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
