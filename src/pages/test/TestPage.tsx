import './TestPage.css';
import RecipeCard from '../../components/recipeCard/RecipeCard';

export default function TestPage() {
    return (
        <div className="test-page">
            <div className="recipe-grid container">
                {/* <RecipeCard recipe={testRecipe} />
                <RecipeCard recipe={testRecipe} />
                <RecipeCard recipe={testRecipe} />
                <RecipeCard recipe={testRecipe} /> */}
            </div>
        </div>
    );
}


const testRecipe = {
    name: "Beef Stew",
    description: "A hearty, warm meal to eat on a cozy day indoors.",
    image: 'https://downshiftology.com/wp-content/uploads/2023/09/Beef-Stew-main-500x500.jpg',
    ingredients: [
        {
            text: "Onions",
            isSection: false
        }
    ],
    directions: [],
    tags: ['warm', 'hearty', 'dinner'],
    markForDelete: false
}