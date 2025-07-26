import axiosInstance from '../../utils/axiosConfig';
import { removeEmptyFieldsFromObj } from '../../utils/helpers';
import { Recipe, UnvalidatedRecipe } from '../types/recipe'

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
            .get(`/recipes/?${p.toString()}`)
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
            .get(`/recipes/${id}`)
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
            .post('/recipes/myRecipes', recipe)
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
            .patch(`/recipes/myRecipes/${id}`, recipe)
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
            .delete(`/recipes/myRecipes/${id}`)
            .then((response) => {
                return response.data;
            })
            .catch((error) => {
                throw error;
            })
    );
}