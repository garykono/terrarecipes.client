import { type Params } from 'react-router-dom';
import type { Recipe } from '../../api/types/recipe';
import { createAppError } from '../../utils/errors/factory';
import { AppErrorCodes } from '../../utils/errors/codes';
import { fetchMyRecipes } from '../../api/queries/recipesApi';

const RESULTS_COLS = 5;
const RESULTS_ROWS = 4;

interface LoaderArgs {
    params: Params
}

export interface UserRecipesLoaderResult {
    userRecipes: Recipe[];
    totalPages: number;
    page: number;
    search?: string;
    numCols: number;
    numRows: number;
}

export async function userRecipesLoader({ params }: LoaderArgs): Promise<UserRecipesLoaderResult> {
    const { page } = params;
        const { search } = params;
    
        let pageNum = Number(page);
        if (page) {
            if (isNaN(pageNum)) {
                throw createAppError({ 
                    code: AppErrorCodes.INVALID_PARAMETERS, 
                    message: 'Param error: Page must be an integer.'
                });
            } else if (pageNum < 1) {
                pageNum = 1;
            } 
        } else {
            pageNum = 1;
        }
    
        const { data, totalPages } = await fetchMyRecipes({
            limit: RESULTS_COLS * RESULTS_ROWS,
            page: pageNum,
            search
        });
    
        return {
            userRecipes: data,
            totalPages,
            page: page ? pageNum : 1,
            search,
            numCols: RESULTS_COLS,
            numRows: RESULTS_ROWS
        }
}