import axiosInstance from "../../utils/axiosConfig";
import { GroceryList } from "../types/groceryList";

const endpointBase = "/grocery-list";

export const previewGroceryList = ({ recipeId, collectionId }: { recipeId?: string; collectionId?: string }) => {
    return (
        axiosInstance
            .post(`${endpointBase}/preview`, {
                recipeId,
                collectionId
            })
            .then((response) => {
                return response.data.data as GroceryList;
            })
            .catch((error) => {
                throw error;
            })
    );

}