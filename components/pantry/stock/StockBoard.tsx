"use client"

import { StockItem, PantryItemSelect } from "@/types"
import { useState, startTransition, useOptimistic } from "react"
import { addStockLotAction, deleteStockLotAction } from "@/app/actions/stockactions"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export const StockBoard = ({
    stockItems,
    pantryItems,
    cycleId
}: {
    stockItems: StockItem[],
    pantryItems: PantryItemSelect[],
    cycleId: string
}) => {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [selectedItemId, setSelectedItemId] = useState<string>("");
    const [quantity, setQuantity] = useState<string>("");
    const [expiryDate, setExpiryDate] = useState<string>("");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<StockItem | null>(null);

    const [optimisticStockItems, updateOptimisticStock] = useOptimistic(
        stockItems,
        (state, action: { type: 'add' | 'delete', item: StockItem }) => {
            if (action.type === 'delete') {
                return state.filter(item => item.pantryItemId !== action.item.pantryItemId);
            }

            const existingIndex = state.findIndex(
                item => item.pantryItemId === action.item.pantryItemId
            );

            if (existingIndex >= 0) {
                const newState = [...state];
                newState[existingIndex] = action.item;
                return newState;
            }

            return [...state, action.item];
        }
    );

    const handleAddStock = async () => {
        if (!selectedItemId || !quantity) return;

        const selectedItem = pantryItems.find(item => item.id === selectedItemId);
        if (!selectedItem) return;

        const qty = parseFloat(quantity);
        const expiry = expiryDate ? new Date(expiryDate) : undefined;

        // Find existing stock item or create new one
        const existingStock = optimisticStockItems.find(
            item => item.pantryItemId === selectedItemId
        );

        const optimisticItem: StockItem = {
            pantryItemId: selectedItemId,
            ingredientName: selectedItem.name,
            baseUnit: selectedItem.baseUnit,
            totalInStock: existingStock ? existingStock.totalInStock + qty : qty,
            lotCount: existingStock ? existingStock.lotCount + 1 : 1,
            earliestExpiry: expiry || existingStock?.earliestExpiry || null,
        };

        startTransition(async () => {
            updateOptimisticStock({ type: 'add', item: optimisticItem });
            const result = await addStockLotAction(selectedItemId, qty, expiry, cycleId);

            if (result.success) {
                setIsAddDialogOpen(false);
                setSelectedItemId("");
                setQuantity("");
                setExpiryDate("");
            } else {
                console.error('Failed to add stock:', result.message);
            }
        });
    };

    const handleDeleteClick = (item: StockItem) => {
        setItemToDelete(item);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!itemToDelete) return;

        startTransition(async () => {
            updateOptimisticStock({ type: 'delete', item: itemToDelete });
            const result = await deleteStockLotAction(itemToDelete.pantryItemId, cycleId);

            if (result.success) {
                setDeleteDialogOpen(false);
                setItemToDelete(null);
            } else {
                console.error('Failed to delete stock:', result.message);
            }
        });
    };

    // Sort stock items by name
    const sortedStock = [...optimisticStockItems].sort((a, b) =>
        a.ingredientName.localeCompare(b.ingredientName)
    );

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Current Stock</h1>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>+ Add Stock</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Stock</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="item">Item</Label>
                                <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                                    <SelectTrigger id="item">
                                        <SelectValue placeholder="Select an item" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {pantryItems.map((item) => (
                                            <SelectItem key={item.id} value={item.id}>
                                                {item.name} ({item.baseUnit})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="quantity">Quantity</Label>
                                <Input
                                    id="quantity"
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    placeholder="Enter quantity"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="expiry">Expiry Date (Optional)</Label>
                                <Input
                                    id="expiry"
                                    type="date"
                                    value={expiryDate}
                                    onChange={(e) => setExpiryDate(e.target.value)}
                                />
                            </div>
                            <Button onClick={handleAddStock} className="w-full">
                                Add Stock
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {sortedStock.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed rounded-lg">
                    <p className="mb-4">No stock items yet.</p>
                    <p className="text-sm text-muted-foreground">
                        Add stock to track your pantry inventory.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sortedStock.map((item) => (
                        <div
                            key={item.pantryItemId}
                            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-lg">{item.ingredientName}</h3>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteClick(item)}
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                    Delete
                                </Button>
                            </div>
                            <div className="space-y-1 text-sm">
                                <p className="text-2xl font-semibold text-primary">
                                    {item.totalInStock} {item.baseUnit}
                                </p>
                                <p className="text-muted-foreground">
                                    {item.lotCount} {item.lotCount === 1 ? 'lot' : 'lots'}
                                </p>
                                {item.earliestExpiry && (
                                    <p className="text-sm text-orange-600">
                                        Expires: {new Date(item.earliestExpiry).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Stock Item</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete all stock for &ldquo;{itemToDelete?.ingredientName}&rdquo;?
                            This will remove {itemToDelete?.totalInStock} {itemToDelete?.baseUnit} from your pantry.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteConfirm}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
