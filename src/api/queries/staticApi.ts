import axiosInstance from "../../utils/axiosConfig"
import { Categories, IngredientForms, IngredientPreparations, StandardIngredients, StandardIngredientsGroupedByCategory, StandardLookupTable, StandardMeasurements, Tags } from "../types/standardized";

export interface StaticFilesData {
    standardIngredients: StandardIngredients;
    standardMeasurements: StandardMeasurements;
    standardIngredientsLookupTable: StandardLookupTable;
    standardMeasurementsLookupTable: StandardLookupTable;
    standardIngredientsGroupedByCategory: StandardIngredientsGroupedByCategory;
    ingredientForms: IngredientForms;
    ingredientPreparations: IngredientPreparations;
    categories: Categories;
    tags: Tags;
}

export const getStaticFiles = () => {
    return (
        axiosInstance
            .get(`/static`)
            .then((response) => {
                return response.data.data as StaticFilesData;
            })
            .catch((error) => {
                throw error;
            })
    );
}