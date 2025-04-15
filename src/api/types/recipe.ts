/**
 * A constructed recipe is a recipe with all recipe (/api/types/recipe) fields specified and is ready to be sent to the server, but
 * does not contain fields like _id and author (because server handles creating/assigning these)
 */
export interface RecipeFieldWithSection {
    text: string;
    isSection: boolean;
}

export interface UnvalidatedRecipe {
    name: string;
    description: string;
    image: string;
    ingredients: RecipeFieldWithSection[];
    directions: RecipeFieldWithSection[];
    tags: string[];
}

export interface Recipe extends UnvalidatedRecipe {
    _id: string;
    author: {
        _id: string;
        username: string;
    };
}

export interface RecipeWithMarkForDelete extends Recipe {
        markForDelete: boolean;
    }