"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    PlusCircle,
    Calendar,
    ShoppingCart,
    Package,
    ChefHat
} from "lucide-react";
import Link from "next/link";

export const QuickActions = () => {
    const actions = [
        {
            title: "Add Recipe",
            icon: <PlusCircle className="h-5 w-5" />,
            href: "/recipes",
            description: "Register a new recipe",
            color: "text-blue-500",
            bg: "bg-blue-50"
        },
        {
            title: "Plan Meals",
            icon: <Calendar className="h-5 w-5" />,
            href: "/planner",
            description: "Organize your week",
            color: "text-green-500",
            bg: "bg-green-50"
        },
        {
            title: "Stock",
            icon: <Package className="h-5 w-5" />,
            href: "/pantry",
            description: "Check your pantry",
            color: "text-orange-500",
            bg: "bg-orange-50"
        },
        {
            title: "Groceries",
            icon: <ShoppingCart className="h-5 w-5" />,
            href: "/pantry",
            description: "View shopping list",
            color: "text-purple-500",
            bg: "bg-purple-50"
        }
    ];

    return (
        <section className="mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {actions.map((action) => (
                    <Link href={action.href} key={action.title}>
                        <Card className="hover:shadow-md transition-shadow cursor-pointer border-none shadow-sm dark:bg-gray-800/50">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className={`p-3 rounded-full ${action.bg} dark:bg-gray-700`}>
                                    <div className={action.color}>
                                        {action.icon}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-medium text-sm">{action.title}</h3>
                                    <p className="text-xs text-muted-foreground">{action.description}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </section>
    );
};
