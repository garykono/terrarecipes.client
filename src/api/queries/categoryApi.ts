import axiosInstance from "../../utils/axiosConfig";
import { CategoryData, HomeCategoryResult } from "../types/category";

export const getHomeCategoryRecipes = async () => {
    return (
        axiosInstance
            .get(`/category/home`)
            .then((response) => {
                return response.data.data as HomeCategoryResult;
            })
    );      
}

export const getCategory = async (group: string, category: string) => {
    return (
        axiosInstance
            .get(`/category?group=${group}&slug=${category}`)
            .then((response) => {
                return response.data.data as CategoryData;
            })
    );      
}