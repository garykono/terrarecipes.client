import { ParsedIngredient } from "../../utils/parseIngredientLine";

/**
 * A constructed recipe is a recipe with all recipe (/api/types/recipe) fields specified and is ready to be sent to the server, but
 * does not contain fields like _id and author (because server handles creating/assigning these)
 */
export interface Ingredient {
    text: string;
    isSection: boolean;
    parsed?: ParsedIngredient[]
}

export interface Direction {
    text: string;
    isSection: boolean;
}

export interface UnvalidatedRecipe {
    name: string;
    description: string;
    image: string;
    servings: number;
    prepTimeMin: number;
    cookTimeMin: number;
    restTimeMin: number;
    totalTimeMin: number;
    ingredients: Ingredient[];
    directions: Direction[];
    tags: string[];
    difficulty: "easy" | "medium" | "hard";
    credit: string | undefined;
}

export interface Recipe extends UnvalidatedRecipe {
    totalTimeMin: number;
    _id: string;
    author: {
        _id: string;
        username: string;
    };
}

export interface RecipeWithMarkForDelete extends Recipe {
    markForDelete: boolean;
}