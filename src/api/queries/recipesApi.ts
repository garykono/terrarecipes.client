import axiosInstance from '../../utils/axiosConfig';
import { removeEmptyFieldsFromObj } from '../../utils/helpers';
import { logAPI } from '../../utils/logger';
import { Recipe, UnvalidatedRecipe } from '../types/recipe'

const endpointBase = "/recipes";
const endpointLabel = "RECIPES";

interface FetchRecipesProps {
    limit?: number;
    page?: number;
    search?: string;
    searchFields?: string;
    [key: string]: any;
}

// export const fetchRecipes = (params: { [key: string]: string }) => {
export const fetchRecipes = ({limit, page, search, searchFields, ...rest} : FetchRecipesProps) => {
    const p = new URLSearchParams(removeEmptyFieldsFromObj({ limit, page, search, searchFields, ...rest}));

    return (
        axiosInstance
            .get(`${endpointBase}/?${p.toString()}`)
            .then((response) => {
                return {
                    data: response.data.data.data as Recipe[],
                    totalPages: response.data.totalPages as number
                }
            })
            .catch((error) => {
                throw error;
            })
    );
}

export const getRecipeById = (id: string) => {
    return (
        axiosInstance
            .get(`${endpointBase}/${id}`)
            .then((response) => {
                return response.data.data.doc as Recipe;
            })
            .catch((error) => {
                throw error;
            })
    );

}

export const createRecipe = (recipe: UnvalidatedRecipe) => {
    return (
        axiosInstance
            .post(`${endpointBase}/myRecipes`, {...recipe, tungsten: "hi"})
            .then((response) => {
                return response.data.data.doc as Recipe;
            })
            .catch((error) => {
                throw error;
            })
    );
}

export const editRecipeById = (id: string, recipe: UnvalidatedRecipe) => {
    return (
        axiosInstance
            .patch(`${endpointBase}/myRecipes/${id}`, recipe)
            .then((response) => {
                return response.data.data.data as Recipe;
            })
            .catch((error) => {
                throw error;
            })
    );
}

export const deleteRecipeById = (id: string) => {
    return (
        axiosInstance
            .delete(`${endpointBase}/myRecipes/${id}`)
            .then((response) => {
                return response.data;
            })
            .catch((error) => {
                throw error;
            })
    );
}