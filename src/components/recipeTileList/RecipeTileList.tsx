import clsx from 'clsx';
import { Link } from 'react-router';
import { Recipe } from '../../api/types/recipe';
import styles from './RecipeTileList.module.css';

interface RecipeTileListProps {
    list: Recipe[];
    className?: string;
}

export default function RecipeTileList({ list, className }: RecipeTileListProps) {
    return (
        <div 
            className={clsx(
                styles.recipeTileList,
                className
            )}
        >
                {list.filter(recipe => !!recipe.image).map(recipe => (
                    <Link to={`/recipe/${recipe._id}`} className={styles.recipeLink} key={recipe._id}>
                        <img 
                            className={`${styles.img}`}
                            src={recipe.image}
                        />
                    </Link>
                ))}
        </div>
    );
}