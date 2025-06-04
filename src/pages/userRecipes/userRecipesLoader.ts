import { useRouteLoaderData, type Params } from 'react-router-dom';
import type { Recipe } from '../../api/types/recipe';

const NUM_RESULTS = 20;

interface LoaderArgs {
    params: Params
}

export interface UserRecipesLoaderResult {
    userRecipes?: Recipe[];
    totalPages?: number;
    page?: number;
    search?: string;
    numResults: number;
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
        numResults: NUM_RESULTS,
    }
}