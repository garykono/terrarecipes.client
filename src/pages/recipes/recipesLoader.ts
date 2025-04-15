import type { Params } from 'react-router-dom';
import type { Recipe } from '../../api/types/recipe';
import { fetchRecipes } from '../../api/queries/recipesApi';

const RESULTS_COLS = 5;
const RESULTS_ROWS = 4;

interface LoaderArgs {
    params: Params
}

export interface RecipesLoaderResult {
    recipes: Recipe[];
    totalPages: number;
    page: number;
    search?: string;
    numCols: number;
    numRows: number;
}

export async function recipesLoader({ params }: LoaderArgs): Promise<RecipesLoaderResult> {
    const { page } = params;
    const { search } = params;

    let pageNum = Number(page);
    if (page) {
        if (isNaN(pageNum)) {
            throw new Error('Param error: Page must be an integer.');
        } else if (pageNum < 1) {
            pageNum = 1;
        } 
    } else {
        pageNum = 1;
    }

    const { data, totalPages } = await fetchRecipes({
        limit: RESULTS_COLS * RESULTS_ROWS,
        page: pageNum,
        search
    });

    return {
        recipes: data,
        totalPages,
        page: page ? pageNum : 1,
        search,
        numCols: RESULTS_COLS,
        numRows: RESULTS_ROWS
    }
}