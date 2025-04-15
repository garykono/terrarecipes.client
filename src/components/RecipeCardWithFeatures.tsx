import { useState, useEffect, useContext, Fragment } from 'react';
import { Link, useNavigate, useRevalidator } from 'react-router-dom';
import { MdEdit, MdDelete, MdOutlineAddCircle, MdOutlineRemoveCircle } from "react-icons/md";
import { deleteRecipeById } from '../api/queries/recipesApi';
import RecipeCard from './RecipeCard'
import Modal from './Modal'
import { Recipe, RecipeWithMarkForDelete } from '../api/types/recipe';


interface RecipeCardWithFeaturesProps {
    recipe: Recipe;
    markForDelete?: boolean;
    key: string;
    editMode?: boolean; 
    collectionMode?: boolean;
    onRemove?: (recipe_id: string) => void;
    setError?: (err: Error | null) => void;
    setDeletedRecipeName?: (recipeName: string) => void;
}

export default function RecipeCardWithFeatures({ 
    recipe, 
    markForDelete,
    editMode = false, 
    collectionMode = false, 
    onRemove = () => undefined, 
    setError = () => undefined, 
    setDeletedRecipeName = () => undefined
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
            <div className="is-flex is-flex-direction-row">
                <Link to={`/editRecipe/${recipeId}`}>
                    <MdEdit />
                </Link>
                <MdDelete 
                    className="js-modal-trigger"
                    onClick={() => handleDeleteRecipeButtonClick(recipeId)}>
                </MdDelete>
            </div>
        );
    }

    return (
        <Fragment key={recipe._id} >
            <div className="is-flex is-flex-direction-row is-justify-content-space-between">
                {collectionMode &&
                    (markForDelete ? 
                        <MdOutlineAddCircle onClick={() => onRemove(recipe._id)} className="mb-1" /> 
                        : <MdOutlineRemoveCircle onClick={() => onRemove(recipe._id)} className="mb-1" /> 
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
                    onConfirm={() => deleteRecipe(recipeIdToDelete)} 
                    title='Delete recipe?'
                    submitButtonText='Delete'
                    danger>
                    Are you sure you want to delete this recipe?
                </Modal>
            }
        </Fragment>
        
        
    )
}
