import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PantryBoard } from "./items/PantryBoard"
import { GroceryBoard } from "./grocery/GroceryBoard"
import { GroceryListItem, PantryItemSelect } from "@/types"

export const PantryTab = ({
    items,
    groceryItems,
    cycleId
}: {
    items: PantryItemSelect[],
    groceryItems: GroceryListItem[],
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
                <GroceryBoard groceryItems={groceryItems} cycleId={cycleId} />
            </TabsContent>
            <TabsContent className="w-full flex items-center justify-center" value="stock">
                <PantryBoard pantryItems={items} />
            </TabsContent>
            <TabsContent className="w-full flex items-center justify-center" value="items">
                <PantryBoard pantryItems={items} />
            </TabsContent>
        </Tabs>
    )
}
