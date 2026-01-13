"use client";

import { RecipeSelect } from "@/types";
import Image from "next/image";
import {
    Clock,
    Users,
    ChevronLeft,
    Heart,
    Share2,
    Printer,
    CalendarPlus,
    CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface RecipeDetailViewProps {
    recipe: any; // Using any for now to handle the enriched data
}

export const RecipeDetailView = ({ recipe }: RecipeDetailViewProps) => {
    const router = useRouter();

    // Calculate total macros
    const totalMacros = recipe.ingredients.reduce((acc: any, ing: any) => {
        const qty = parseFloat(ing.qtyPerServing || "0");
        acc.calories += (parseFloat(ing.kcalPerBaseUnit || "0") * qty);
        acc.protein += (parseFloat(ing.proteinPerBaseUnit || "0") * qty);
        acc.carbs += (parseFloat(ing.carbsPerBaseUnit || "0") * qty);
        return acc;
    }, { calories: 0, protein: 0, carbs: 0 });

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0a110a] text-slate-900 dark:text-slate-100 pb-24">
            {/* Header / Navigation */}
            <div className="container mx-auto p-4 flex justify-between items-center">
                <Button variant="ghost" onClick={() => router.back()} className="gap-2 text-slate-500 hover:text-emerald-500">
                    <ChevronLeft className="h-4 w-4" /> Back to Recipes
                </Button>
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-emerald-500"><Heart className="h-5 w-5" /></Button>
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-emerald-500"><Share2 className="h-5 w-5" /></Button>
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-emerald-500"><Printer className="h-5 w-5" /></Button>
                </div>
            </div>

            <main className="container mx-auto px-4 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                {/* Left Side: Image & Basic Info */}
                <div className="space-y-8">
                    <div className="relative aspect-square lg:aspect-4/5 rounded-[32px] overflow-hidden shadow-2xl border border-white/5">
                        {recipe.imageUrl ? (
                            <Image
                                src={recipe.imageUrl}
                                alt={recipe.name}
                                fill
                                className="object-cover"
                                priority
                            />
                        ) : (
                            <div className="w-full h-full bg-slate-200 dark:bg-emerald-950/20 flex items-center justify-center">
                                <span className="text-slate-400 text-lg">No Image</span>
                            </div>
                        )}

                        {/* Overlay title for mobile/small screens */}
                        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/90 via-black/40 to-transparent p-8 pt-20 lg:hidden">
                            <h1 className="text-4xl font-extrabold text-white mb-2 leading-tight uppercase italic tracking-tighter">
                                {recipe.name}
                            </h1>
                            <div className="flex flex-wrap gap-2">
                                {recipe.tags?.map((tag: string) => (
                                    <Badge key={tag} variant="secondary" className="bg-emerald-500/20 text-emerald-400 border-none uppercase text-[10px] font-bold">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* Info Overlays */}
                        <div className="absolute top-6 left-6 space-y-4">
                            <Card className="bg-black/40 backdrop-blur-xl border border-white/10 text-white w-40 shadow-2xl rounded-2xl overflow-hidden">
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className="bg-emerald-500 p-2.5 rounded-xl shadow-lg shadow-emerald-500/40">
                                        <Clock className="h-4 w-4 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-slate-300 tracking-wider">Cook Time</p>
                                        <p className="font-extrabold text-lg">{recipe.cookTime || "--"} <span className="text-xs font-normal text-slate-400">Min</span></p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-black/40 backdrop-blur-xl border border-white/10 text-white w-40 shadow-2xl rounded-2xl overflow-hidden">
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className="bg-emerald-600 p-2.5 rounded-xl shadow-lg shadow-emerald-600/40">
                                        <Users className="h-4 w-4 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-slate-300 tracking-wider">Servings</p>
                                        <p className="font-extrabold text-lg">{recipe.servings || "1"} <span className="text-xs font-normal text-slate-400">Pers</span></p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    <div className="hidden lg:block space-y-4">
                        <h1 className="text-6xl font-black text-slate-900 dark:text-white leading-[0.9] uppercase italic tracking-tighter">
                            {recipe.name}
                        </h1>
                        <div className="flex flex-wrap gap-2">
                            {recipe.tags?.map((tag: string) => (
                                <Badge key={tag} variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 uppercase text-[10px] font-black tracking-[0.2em] px-4 py-1.5 rounded-full">
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Side: Macros, Ingredients, Steps */}
                <div className="space-y-12 lg:pt-4">
                    {/* Macros Grid */}
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { label: "Calories", value: totalMacros.calories.toFixed(0), sub: "+5% Daily Value", color: "text-emerald-500" },
                            { label: "Protein", value: `${totalMacros.protein.toFixed(1)}G`, sub: "+12% Muscle", color: "text-emerald-500" },
                            { label: "Carbs", value: `${totalMacros.carbs.toFixed(1)}G`, sub: "Energy Boost", color: "text-orange-500" },
                        ].map((macro) => (
                            <Card key={macro.label} className="bg-white dark:bg-[#121812] border border-slate-200 dark:border-emerald-500/5 shadow-sm h-36 flex flex-col justify-center rounded-[24px] hover:border-emerald-500/20 transition-colors">
                                <CardContent className="p-4 text-center space-y-1">
                                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-[0.15em]">{macro.label}</p>
                                    <p className="text-3xl lg:text-4xl font-black tabular-nums">{macro.value}</p>
                                    <p className={`text-[9px] font-bold ${macro.color} uppercase tracking-tighter`}>{macro.sub}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Ingredients Section */}
                    <section>
                        <h2 className="text-xl font-black uppercase italic tracking-tight mb-6 flex items-center gap-3">
                            <span className="w-8 h-[2px] bg-emerald-500" />
                            Ingredients
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {recipe.ingredients.map((ing: any) => (
                                <div key={ing.id} className="flex items-center gap-4 p-4 bg-white dark:bg-[#121812] rounded-2xl border border-slate-100 dark:border-emerald-500/5 group hover:border-emerald-500/20 transition-all">
                                    <div className="h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] group-hover:scale-125 transition-transform" />
                                    <div className="flex-1">
                                        <p className="font-bold text-sm tracking-tight">{ing.name}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{ing.qtyPerServing} {ing.baseUnit}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Preparation Section */}
                    <section className="space-y-8">
                        <h2 className="text-xl font-black uppercase italic tracking-tight mb-6 flex items-center gap-3">
                            <span className="w-8 h-[2px] bg-emerald-500" />
                            Preparation
                        </h2>
                        <div className="space-y-6">
                            {recipe.instructions?.map((step: string, index: number) => (
                                <Card key={index} className="bg-white dark:bg-[#121812] border border-slate-100 dark:border-emerald-500/5 relative overflow-hidden group rounded-[28px] hover:border-emerald-500/20 transition-all">
                                    <div className="absolute right-[-20px] top-[-20px] text-[120px] font-black text-slate-100 dark:text-emerald-500/5 select-none transition-all group-hover:text-emerald-500/10 group-hover:scale-110">
                                        {String(index + 1).padStart(2, '0')}
                                    </div>
                                    <CardContent className="p-8 relative z-10">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="bg-emerald-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                                                Step {index + 1}
                                            </div>
                                        </div>
                                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-base font-medium">
                                            {step}
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                            {(!recipe.instructions || recipe.instructions.length === 0) && (
                                <div className="p-12 text-center border-2 border-dashed border-slate-200 dark:border-emerald-500/10 rounded-3xl">
                                    <p className="text-slate-500 italic text-sm">No instructions provided yet.</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </main>

            {/* Bottom Floating Bar */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 z-50">
                <Card className="bg-slate-900/95 dark:bg-emerald-500/95 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-full p-2">
                    <div className="flex items-center gap-2">
                        <Button className="flex-1 rounded-full h-14 bg-white dark:bg-slate-900 text-black dark:text-white hover:scale-[1.02] active:scale-[0.98] transition-all font-black uppercase italic tracking-tight gap-3 text-sm shadow-xl shadow-black/20">
                            <CalendarPlus className="h-5 w-5" /> Add to Planner
                        </Button>
                        <div className="flex gap-1 pr-2">
                            <Button variant="ghost" size="icon" className="rounded-full h-12 w-12 text-white dark:text-slate-900 hover:bg-white/10 dark:hover:bg-black/10 transition-colors"><Heart className="h-6 w-6" /></Button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};
