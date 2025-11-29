import { Params } from "react-router";
import { previewGroceryList } from "../../api/queries/groceryListApi";
import { GroceryList } from "../../api/types/groceryList";

interface LoaderArgs {
    params: Params
}

export interface GroceryListLoaderResult {
    groceryList: GroceryList;
}

export async function groceryListLoader({ params }: LoaderArgs): Promise<GroceryListLoaderResult> {
    const { recipeId, collectionId } = params;

    const groceryList = await previewGroceryList({ recipeId, collectionId });
    
    return {
        groceryList
    }

}