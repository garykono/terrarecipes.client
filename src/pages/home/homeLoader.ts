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
    // const { page } = params;
    // let pageNum = Number(page);
    // if (page && isNaN(pageNum)) {
    //     throw new Error('Param error: Page must be an integer.');
    // } else if (pageNum < 1) {
    //     pageNum = 1;
    // }

    let data: Recipe[] = []
    let totalPages = 1;

    await fetchRecipes({
        //limit: RESULTS_COLS * RESULTS_ROWS,
        // page: pageNum
    })
    .then(response => {
        data = response.data;
        totalPages = response.totalPages;
    })
    .catch(error => {

    })

    return {
        recipes: data,
        totalPages,
        // page: page ? pageNum : 1,
        // numCols: RESULTS_COLS,
        // numRows: RESULTS_ROWS
    }
}