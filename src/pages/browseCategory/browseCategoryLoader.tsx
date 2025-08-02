import { Params } from "react-router";
import { getCategory } from "../../api/queries/categoryApi";
import { CategoryData } from "../../api/types/category";

interface LoaderArgs {
    params: Params
}

export interface BrowseCategoryLoaderResult {
    categoryData: CategoryData;
}

export async function browseCategoryLoader({ params }: LoaderArgs): Promise<BrowseCategoryLoaderResult> {
    const { group, category } = params;
    
    if (!group) {
        throw new Error("Missing required route parameter: group.");
    } else if (!category) {
        throw new Error("Missing required route parameter: category.");
    }

    const categoryData = await getCategory(group, category);


    return {
        categoryData
    }
}