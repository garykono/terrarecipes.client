import { UnvalidatedRecipe, Recipe, RecipeWithMarkForDelete } from "../../api/types/recipe";
import Card from '../card/Card';

interface RecipeCardProps {
    recipe: UnvalidatedRecipe | Recipe | RecipeWithMarkForDelete;
    size?: 'lean' | 'rich';
    hoverable?: boolean;
    className?: string;
}

export default function RecipeCard({ recipe, size = 'lean', hoverable = false, className }: RecipeCardProps) {
    const metaDataItems = size === 'lean' 
        ? [
                // {
                //     icon: "⭐",
                //     value: "4.8"
                // },
                {
                    icon: "🍽",
                    value: recipe.servings ? recipe.servings + "" : undefined
                },
                {
                    icon: "⏱",
                    value: recipe.totalTimeMin ? recipe.totalTimeMin + " min" : undefined
                }
            ]
        : [
                // {
                //     icon: "⭐",
                //     value: "4.8"
                // },
                {
                    icon: "🍽",
                    value: recipe.servings ? recipe.servings + "" : undefined
                },
                {
                    icon: "⏱",
                    value: recipe.totalTimeMin ? recipe.totalTimeMin + " min" : undefined
                },
                // {
                //     icon: "🔥",
                //     value: "Medium"
                // }

            ]
    return (
        <Card
            title={recipe.name}
            headerSubTextIcon="🍲"
            headerSubText="Dinner"
            description={recipe.description}
            metaDataItems={metaDataItems}
            image={recipe.image}
            size={size}
            hoverable={hoverable}
            className={className}
        />
    )
}