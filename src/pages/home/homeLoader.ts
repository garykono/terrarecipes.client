import type { Params } from 'react-router-dom';
import { getHomeCategoryRecipes } from '../../api/queries/categoryApi';
import { HomeCategoryResult } from '../../api/types/category';

interface LoaderArgs {
    params: Params
}

export interface HomeLoaderResult {
    categoryResults: HomeCategoryResult;
}

export async function homeLoader({ params }: LoaderArgs): Promise<HomeLoaderResult> {

    const categoryResults = await getHomeCategoryRecipes();

    return {
        categoryResults
    }
}