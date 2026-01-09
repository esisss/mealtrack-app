import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PantryBoard } from "./items/PantryBoard"
import { GroceryBoard } from "./grocery/GroceryBoard"
import { StockBoard } from "./stock/StockBoard"
import { GroceryListItem, PantryItemSelect, StockItem } from "@/types"

export const PantryTab = ({
    items,
    groceryItems,
    stockItems,
    cycleId
}: {
    items: PantryItemSelect[],
    groceryItems: GroceryListItem[],
    stockItems: StockItem[],
    cycleId: string
}) => {
    return (
        <Tabs defaultValue="groceries" className="w-[calc(100%-400px)] flex items-center justify-center">
            <TabsList className="w-[80%]">
                <TabsTrigger value="groceries">Groceries</TabsTrigger>
                <TabsTrigger value="stock">Stock</TabsTrigger>
                <TabsTrigger value="items">Items</TabsTrigger>
            </TabsList>
            <TabsContent className="w-full flex items-center justify-center" value="groceries">
                <GroceryBoard groceryItems={groceryItems} />
            </TabsContent>
            <TabsContent className="w-full flex items-center justify-center" value="stock">
                <StockBoard stockItems={stockItems} pantryItems={items} cycleId={cycleId} />
            </TabsContent>
            <TabsContent className="w-full flex items-center justify-center" value="items">
                <PantryBoard pantryItems={items} />
            </TabsContent>
        </Tabs>
    )
}
