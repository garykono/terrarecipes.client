import { Recipe } from "./recipe";

export interface CategoryData {
    categoryInfo: {
        title: string;
        slug: string;
        icon: string;
        description: string;
        searchTags: string[];
        subCategories: {
            [key: string]: {
                title: string;
                description: string;
                searchCriteria: {
                    tags: string[];
                }
            }
        },
        relatedCategories: string[];
    },
    recipes: Recipe[]
}