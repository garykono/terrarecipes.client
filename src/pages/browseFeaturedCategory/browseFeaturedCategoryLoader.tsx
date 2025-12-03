import { Params } from "react-router";
import { getCategory } from "../../api/queries/categoryApi";
import { CategoryData } from "../../api/types/category";
import { createAppError } from "../../utils/errors/factory";
import { AppErrorCodes } from "../../utils/errors/codes";

interface LoaderArgs {
    params: Params
}

export interface BrowseFeaturedCategoryLoaderResult {
    categoryData: CategoryData;
}

export async function browseFeaturedCategoryLoader({ params }: LoaderArgs): Promise<BrowseFeaturedCategoryLoaderResult> {
    const { category } = params;
    
    if (!category) {
        throw createAppError({ 
            code: AppErrorCodes.MISSING_PARAMETERS, 
            message: "Missing required route parameter: category."
        });
    }

    const categoryData = await getCategory("featured", category);


    return {
        categoryData
    }
}