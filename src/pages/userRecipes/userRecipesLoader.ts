import { useRouteLoaderData, type Params } from 'react-router-dom';
import type { Recipe } from '../../api/types/recipe';

const RESULTS_COLS = 4;
const RESULTS_ROWS = 4;

interface LoaderArgs {
    params: Params
}

export interface UserRecipesLoaderResult {
    userRecipes?: Recipe[];
    totalPages?: number;
    page?: number;
    search?: string;
    numCols: number;
    numRows: number;
}

export async function userRecipesLoader({ params }: LoaderArgs): Promise<UserRecipesLoaderResult> {
    const { page, search } = params;
    let pageNum = Number(page);
    if (page && isNaN(pageNum)) {
        throw new Error('Param error: Page must be an integer.');
    } else if (pageNum < 1) {
        pageNum = 1;
    }
    

    return {
        page: page ? pageNum : 1,
        search,
        numCols: RESULTS_COLS,
        numRows: RESULTS_ROWS
    }
}