import { Params } from "react-router";
import { getRecipeById } from "../../api/queries/recipesApi";
import { Recipe } from "../../api/types/recipe";
import { Collection } from "../../api/types/collection";
import { getCollectionById } from "../../api/queries/collectionApi";

interface LoaderArgs {
    params: Params
}

export interface GroceryListLoaderResult {
    name: string | null;
    recipes: Recipe[] | null;
}

export async function groceryListLoader({ params }: LoaderArgs): Promise<GroceryListLoaderResult> {
    const { recipeId, collectionId } = params;

    let name = null;
    let recipes = null;

    if (recipeId) {
        const recipe = await getRecipeById(recipeId);
        name = recipe.name;
        recipes = [recipe]
    } 
    else if (collectionId) {
        const collection = await getCollectionById(collectionId);
        name = collection.name;
        recipes = collection.recipes
    };
    
    return {
        name,
        recipes
    }

}