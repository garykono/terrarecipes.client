import { Params } from "react-router";
import { getCategory } from "../../api/queries/categoryApi";
import { CategoryData } from "../../api/types/category";
import { createAppError } from "../../utils/errors/factory";
import { AppErrorCodes } from "../../utils/errors/codes";

interface LoaderArgs {
    params: Params
}

export interface BrowseCoreCategoryLoaderResult {
    categoryData: CategoryData;
}

export async function browseCoreCategoryLoader({ params }: LoaderArgs): Promise<BrowseCoreCategoryLoaderResult> {
    const { category } = params;
    
    if (!category) {
        throw createAppError({ 
            code: AppErrorCodes.MISSING_PARAMETERS, 
            message: "Missing required route parameter: category."
        });
    }

    const categoryData = await getCategory("core", category);


    return {
        categoryData
    }
}