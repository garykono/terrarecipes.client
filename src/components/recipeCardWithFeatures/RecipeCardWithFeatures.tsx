import styles from './RecipeCardWithFeatures.module.css';
import { useState, useEffect, useContext, Fragment } from 'react';
import { Link, useNavigate, useRevalidator } from 'react-router-dom';
import { MdEdit, MdDelete, MdOutlineAddCircle, MdOutlineRemoveCircle } from "react-icons/md";
import { deleteRecipeById } from '../../api/queries/recipesApi';
import RecipeCard from '../recipeCard/RecipeCard'
import Modal from '../modal/Modal'
import { Recipe, RecipeWithMarkForDelete } from '../../api/types/recipe';
import Button from '../buttons/Button';


interface RecipeCardWithFeaturesProps {
    recipe: Recipe;
    markForDelete?: boolean;
    key: string;
    editMode?: boolean; 
    collectionMode?: boolean;
    onRemove?: (recipe_id: string) => void;
    setError?: (err: Error | null) => void;
    setDeletedRecipeName?: (recipeName: string) => void;
    className?: string;
}

export default function RecipeCardWithFeatures({ 
    recipe, 
    markForDelete,
    editMode = false, 
    collectionMode = false, 
    onRemove = () => undefined, 
    setError = () => undefined, 
    setDeletedRecipeName = () => undefined,
    className
    }: RecipeCardWithFeaturesProps
) {
    const revalidator = useRevalidator();
    const [showModal, setShowModal] = useState(false);
    const [recipeIdToDelete, setRecipeIdToDelete] = useState("");

    // Delete recipes
    const deleteRecipe = (recipeId: string) => {
        deleteRecipeById(recipeId)
            .then(() => {
                setError(null);
                setDeletedRecipeName(recipe.name)
                revalidator.revalidate();
            })
            .catch(error => {
                console.log(error);
                setError(error);
                setDeletedRecipeName("");
            })
            .finally(() => {
                setShowModal(false);
            });
    }

    const handleDeleteRecipeButtonClick = async (recipeId: string) => {
        setRecipeIdToDelete(recipeId);
        setShowModal(true);
    }

    const handleModalClose = () => {
        setShowModal(false);
    }

    function getManagementButtons(recipeId: string) {
        return (
            <div className={`${styles.managementButtons}`}>
                <Link to={`/editRecipe/${recipeId}`}>
                    <MdEdit className={styles.managementIcon} />
                </Link>
                <MdDelete 
                    className={`${styles.managementIcon} js-modal-trigger`}
                    onClick={() => handleDeleteRecipeButtonClick(recipeId)}>
                </MdDelete>
            </div>
        );
    }

    return (
        <div className={`${styles.recipeCardWithFeatures} ${className}`} key={recipe._id} >
            <div className={styles.options}>
                {collectionMode &&
                    (markForDelete ? 
                        <MdOutlineAddCircle onClick={() => onRemove(recipe._id)} className={styles.managementIcon} /> 
                        : <MdOutlineRemoveCircle onClick={() => onRemove(recipe._id)} className={styles.managementIcon} /> 
                    )
                }
                {editMode && getManagementButtons(recipe._id)}
            </div>
            <Link to={`/recipe/${recipe._id}`}>
                <RecipeCard recipe={recipe}/>
            </Link>
            {showModal && 
                <Modal 
                    onClose={handleModalClose} 
                    windowTitle='Delete recipe?'
                    danger>
                    Are you sure you want to delete this recipe?
                    <div className="buttons">
                        <Button
                            onClick={() => setShowModal(false)}
                            type="button"
                        >
                            Cancel
                        </Button>
                        <Button type="button" 
                            className={`${styles.deleteCollectionModalButton}`}
                            danger 
                            onClick={() => deleteRecipe(recipeIdToDelete)}
                        >
                            Delete
                        </Button>
                    </div>
                </Modal>
            }
        </div>
        
        
    )
}
