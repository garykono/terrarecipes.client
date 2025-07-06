import axiosInstance from "../../utils/axiosConfig"
import { StandardIngredients, StandardIngredientsGroupedByCategory, StandardLookupTable, StandardMeasurements } from "../types/standardized";

export interface StaticFilesData {
    standardIngredients: StandardIngredients;
    standardMeasurements: StandardMeasurements;
    standardIngredientsLookupTable: StandardLookupTable;
    standardMeasurementsLookupTable: StandardLookupTable;
    stardardIngredientsGroupedByCategory: StandardIngredientsGroupedByCategory;
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