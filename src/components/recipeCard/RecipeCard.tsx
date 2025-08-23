import { RecipeWithMarkForDelete } from "../../api/types/recipe";
import Card from '../card/Card';

interface RecipeCardProps {
    recipe: RecipeWithMarkForDelete;
    size?: 'lean' | 'rich';
    className?: string;
}

export default function RecipeCard({ recipe, size = 'lean', className }: RecipeCardProps) {
    const metaDataItems = size === 'lean' 
        ? [
                {
                    icon: "⭐",
                    value: "4.8"
                },
                {
                    icon: "⏱",
                    value: "35 min"
                }
            ]
        : [
                {
                    icon: "⭐",
                    value: "4.8"
                },
                {
                    icon: "⏱",
                    value: "35 min"
                },
                {
                    icon: "🔥",
                    value: "Medium"
                }

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
        />
    )
}