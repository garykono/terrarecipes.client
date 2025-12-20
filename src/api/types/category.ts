import { Recipe } from "./recipe";

export interface CategoryData {
    categoryInfo: {
        title: string;
        slug: string;
        icon: string;
        description: string;
        searchTags: string[];
        recipeIds?: string[];
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
    recipes: {
        [key: string]: {
            results: Recipe[],
            totalCount: number,
            totalPages: number;
        }
    }
}

export type HomeCategoryResult = Record<string, SingleHomeCategoryResult>;

export interface SingleHomeCategoryResult {
    categoryInfo: {
        title: string;
        slug: string;
        icon: string;
        description: string;
        searchTags?: string[];
        recipeIds?: string[];
        relatedCategories?: string[];
    },
    recipes: {
        results: Recipe[],
        totalCount: number,
        totalPages: number;
    }
}