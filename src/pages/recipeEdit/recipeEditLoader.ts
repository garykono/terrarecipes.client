import type { Params } from 'react-router-dom';
import type { Recipe } from '../../api/types/recipe';
import { getRecipeById } from '../../api/queries/recipesApi';

interface LoaderArgs {
    params: Params
}

export interface RecipeEditLoaderResult {
    loadedRecipe: Recipe | null
}

export async function recipeEditLoader({ params }: LoaderArgs): Promise<RecipeEditLoaderResult> {
    const { id } = params;

    let loadedRecipe = null;
    
    if(id) {
        loadedRecipe = await getRecipeById(id);
    }

    return {
        loadedRecipe
    }
}