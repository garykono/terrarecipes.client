import styles from './RecipePreviewPane.module.css';
import { useFormContext, useWatch } from "react-hook-form";
import { FormData } from "../../pages/recipeEdit/RecipeEditPage";
import RecipeCard from "../recipeCard/RecipeCard";
import { Direction, Ingredient, Recipe, UnvalidatedRecipe } from "../../api/types/recipe";

export default function RecipePreviewPane({ fallback }: { fallback?: Partial<Recipe> | null }) {
    const { control } = useFormContext<FormData>();

    // watch the whole form (simple) – or list specific names if you want fewer re-renders
    const w = (useWatch({ control }) as Partial<FormData>) || {};

    // numbers (guard against string values)
    const servings = Number(w.servings ?? fallback?.servings ?? 0) || 0;
    const prep     = Number(w.prepTimeMin ?? fallback?.prepTimeMin ?? 0) || 0;
    const cook     = Number(w.cookTimeMin ?? fallback?.cookTimeMin ?? 0) || 0;
    const rest     = Number(w.restTimeMin ?? fallback?.restTimeMin ?? 0) || 0;
    const total    = prep + cook + rest;

    // tags are objects in the form; map to strings for the card
    const tags = (w.tags ?? fallback?.tags ?? [])

    // shape the object your RecipeCard expects
    const recipeForCard = {
        name: w.name ?? fallback?.name ?? "",
        description: w.description ?? fallback?.description ?? "",
        image: w.image ?? fallback?.image ?? "",
        servings,
        prepTimeMin: prep,
        cookTimeMin: cook,
        restTimeMin: rest,
        totalTimeMin: total || Number(fallback?.totalTimeMin ?? 0) || 0,
        ingredients: (w.ingredients ?? fallback?.ingredients ?? []).filter((i: Ingredient) => i?.text?.trim?.()),
        directions: (w.directions ?? fallback?.directions ?? []).filter((d: Direction) => d?.text?.trim?.()),
        tags,
        credit: w.credit ?? fallback?.credit,
    };

    return (
        <div className={styles.previewPane}>
            <h3 className={styles.previewTitle}>Preview</h3>
            <RecipeCard recipe={recipeForCard as UnvalidatedRecipe} />
        </div>
    );
}