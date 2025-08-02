import axiosInstance from "../../utils/axiosConfig";
import { CategoryData } from "../types/category";

export const getCategory = async (group: string, category: string) => {
    return (
        axiosInstance
            .get(`/category?group=${group}&slug=${category}`)
            .then((response) => {
                return response.data.data as CategoryData;
            })
    );      
}