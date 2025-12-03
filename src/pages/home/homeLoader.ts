import type { Params } from 'react-router-dom';
import type { Recipe } from '../../api/types/recipe';
import { fetchRecipes } from '../../api/queries/recipesApi';

interface LoaderArgs {
    params: Params
}

export interface HomeLoaderResult {
    recipes: Recipe[];
    totalPages: number;
    page?: number;
    numCols?: number;
    numRows?: number;
}

export async function homeLoader({ params }: LoaderArgs): Promise<HomeLoaderResult> {

    const { data, totalPages } = await fetchRecipes({});

    return {
        recipes: data,
        totalPages
    }
}