import type { Params } from 'react-router-dom';
import type { Recipe } from '../../api/types/recipe';
import { getRecipeById } from '../../api/queries/recipesApi';


interface LoaderArgs {
    params: Params
}

export interface SingleRecipeLoaderResult {
    recipe: Recipe | null
}

export async function singleRecipeLoader({ params }: LoaderArgs): Promise<SingleRecipeLoaderResult> {
    const { id } = params;

    let recipe = null;
    
    if (id) {
        await getRecipeById(id)
        .then((response) => {
            recipe = response;
        })
        .catch(error => {
            throw error;
        })
    }
    

    return {
        recipe
    }
}