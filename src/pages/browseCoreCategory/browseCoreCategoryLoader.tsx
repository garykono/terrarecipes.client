import { Params } from "react-router";
import { getCategory } from "../../api/queries/categoryApi";
import { CategoryData } from "../../api/types/category";

interface LoaderArgs {
    params: Params
}

export interface BrowseCoreCategoryLoaderResult {
    categoryData: CategoryData;
}

export async function browseCoreCategoryLoader({ params }: LoaderArgs): Promise<BrowseCoreCategoryLoaderResult> {
    const { category } = params;
    
    if (!category) {
        throw new Error("Missing required route parameter: category.");
    }

    const categoryData = await getCategory("core", category);


    return {
        categoryData
    }
}