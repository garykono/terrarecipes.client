import { useState, useContext, useEffect, Ref } from 'react';
import { useNavigate, useLoaderData, useRouteLoaderData, useRevalidator } from 'react-router-dom';
import { useForm, useFieldArray, RegisterOptions, ChangeHandler, UseFieldArrayRemove, UseFormRegister, FieldValues } from 'react-hook-form';
import { GoXCircleFill, GoArrowUp, GoArrowDown } from 'react-icons/go';
import { createRecipe, editRecipeById } from '../../api/queries/recipesApi';
import TagList from '../../components/TagList'
import FormMessage from '../../components/FormMessage';
import GlobalErrorDisplay from '../../components/GlobalErrorDisplay';
import { ErrorMessageSetter, useSetError } from '../../hooks/form-submit-error-handling';
import { RecipeEditLoaderResult } from './recipeEditLoader';
import { Recipe, RecipeFieldWithSection, UnvalidatedRecipe } from '../../api/types/recipe';
import { RootLoaderResult } from '../root/rootLoader';

function RecipeEditPage() {
    const navigate = useNavigate();
    const revalidator = useRevalidator();
    const { user } = useRouteLoaderData('root') as RootLoaderResult;
    const { loadedRecipe } = useLoaderData() as RecipeEditLoaderResult;
    
    interface FormData {
        name: string;
        description: string;
        image: string;
        ingredients: RecipeFieldWithSection[];
        directions: RecipeFieldWithSection[];
        tag: string;
        tags: { value: string }[];
    }

    const { register, control, handleSubmit, getValues, setValue, setError, clearErrors, setFocus, formState: { errors } } = useForm<FormData>({
        defaultValues: {
            name: loadedRecipe? loadedRecipe.name : "",
            description: loadedRecipe? loadedRecipe.description : "",
            image: loadedRecipe? loadedRecipe.image : "",
            // Format the loaded recipe into objects { text: '', isSection: false }, which are how we will manage an ingredient
            // in useFieldArray
            ingredients: loadedRecipe? loadedRecipe.ingredients : [
                { 
                    text: '', 
                    isSection: false
                },
                { 
                    text: '', 
                    isSection: false
                },
                { 
                    text: '', 
                    isSection: false
                },
            ],
            directions: loadedRecipe? loadedRecipe.directions : [
                { 
                    text: '', 
                    isSection: false
                },
                { 
                    text: '', 
                    isSection: false
                },
            ],
            tag: "",
            tags: loadedRecipe? loadedRecipe.tags.map(tag => ({ value: tag })) : []
        }
    });

    const { fields: ingredientsField, 
            append: appendIngredient, 
            remove: removeIngredient,
            swap: swapIngredients } 
            = useFieldArray({ 
                control, 
                name: "ingredients",
                rules: {
                    validate: {
                        required:
                            (ingredients) => {
                                if (ingredients.filter(ingredient => {
                                        return !ingredient.isSection && ingredient.text.trim() !== ''
                                    }).length < 1) {
                                    return 'A recipe must have at least 1 ingredient.'
                                }
                            }
                    }
                }
            });

    const { fields: directionsField, 
            append: appendDirection, 
            remove: removeDirection,
            swap: swapDirections } 
            = useFieldArray({ 
                control, 
                name: "directions"
            });

    const { fields: tagsField, 
            append: appendTag, 
            remove: removeTag } 
            = useFieldArray({ 
                control, 
                // There is a nasty bug that can happen here where typescript can't locate the name in the FormData interface if it's
                // an array of primitives, so when using useFieldArray, wrap primitives in an object
                name: "tags",
                rules: {
                    validate: {
                        lastTagMinLength:
                            (tags) => {
                                if (tags.length > 0 && tags[tags.length - 1].value.trim().length < 3) {
                                    return 'A tag must be at least 3 characters.';
                                }
                            },
                        lastTagMaxLength:
                            (tags) => {
                                if (tags.length > 0 && tags[tags.length - 1].value.trim().length > 15) {
                                    return 'A tag must be 15 characters or less.';
                                }
                            }
                    }
                }
            });

    // Reload previous image if cancel button for image url is pressed
    const handleCancelImageUrl = () => {
        if(loadedRecipe === null) {
            setValue("image", "");
        } else {
            setValue("image", loadedRecipe.image);
        }
    }

    const handleAddTag = async () => {
        const tagValue = getValues('tag');
        if (tagValue.trim().length < 3) {
            setError('tag', { message: 'Tags must be at least 3 characters.'})
            return;
        } else if (tagValue.trimEnd().length > 15) {
            setError('tag', { message: 'Tags must be 15 characters or less.'})
            return;
        } else {
            appendTag({ value: tagValue });
            clearErrors('tag');
            setValue('tag', "");
        }
    }

    const onSubmit = async (data: FormData) => {
        if(!user) {
            setError('root.general', { message: 'You must be logged in to create a recipe.' })
            return;
        }

        // If this is a new recipe
        const recipe = buildRecipe(data);
        if (!loadedRecipe) {
            createRecipe(recipe)
                .then(resRecipe => {
                    // Also update the user's recipes
                    revalidator.revalidate();
                    navigate(`/recipe/${resRecipe._id}`);
                })
                .catch(err => {
                    useSetError(err, setError as ErrorMessageSetter);
                })
        } else {
            editRecipeById(loadedRecipe._id, recipe)
                .then(resRecipe => {
                    revalidator.revalidate();
                    navigate(`/recipe/${resRecipe._id}`)
                })
                .catch(err => {
                    useSetError(err, setError as ErrorMessageSetter)
                })
        }
    }

    function buildRecipe({ name, description, image, ingredients, directions, tags }: FormData) {
        return {
            name,
            description,
            image,
            ingredients: ingredients.filter(ingredient => ingredient.text !== ""),
            directions: directions.filter(direction => direction.text !== ""),
            //Add no duplicates in future and sort before it goes in database
            tags: tags.map(tagObj => tagObj.value).filter((tag) => {
                return tag !== "";
            }).sort((a, b) => {
                return a.localeCompare(b);
            })
        } as UnvalidatedRecipe;
    }

    const onCancel = () => {
        if(loadedRecipe) {
            navigate(`/recipe/${loadedRecipe._id}`);
        } else {
            navigate('/recipes')
        }
    }

    interface FieldArrayListProps {
        fieldArrayName: keyof FormData;
        title: string;
        isInput: boolean;
        field: {
            text: string;
            isSection: boolean;
        }[];
        register: UseFormRegister<FormData>;
        append: ({ text, isSection}: { text: string, isSection: boolean}) => void;
        remove: UseFieldArrayRemove;
        swap: (i1: number, i2: number) => void;
    }

    function FieldArrayList({ fieldArrayName, title, isInput, field, register, append, remove, swap }: FieldArrayListProps) {
        const fieldArray = getValues(fieldArrayName) as typeof field;

        return (
            <>
                <ul>
                    {field.map((item, index) => {
                        // const isSection = fieldArray[index].startsWith('section:');
                        const isSection = fieldArray[index].isSection;
                        // setValue(`${fieldArrayName}.${index}.text`, fieldArray[index].replace('section:', ''))
                        
                        return (
                            <li key={index} className="py-1 is-flex is-align-items-center">
                                <div className="">
                                    <button
                                        type="button" 
                                        onClick={() => swap(index, index - 1)} 
                                        disabled={index === 0}
                                    >
                                        <GoArrowUp />
                                    </button>
                                    <button
                                        type="button" 
                                        onClick={() => swap(index, index + 1)} 
                                        disabled={index === field.length - 1}
                                    >
                                        <GoArrowDown />
                                    </button>
                                </div>
                                
                                {isSection && <div className='has-text-black mr-2'>Section:</div>}
                                {isInput?
                                    <input
                                        className="input"
                                        {...register(`${fieldArrayName}.${index}.text` as keyof FormData)}
                                    />
                                    : <textarea
                                        className="textarea"
                                        rows={2}
                                        {...register(`${fieldArrayName}.${index}.text` as keyof FormData)}
                                    />
                                }
                                <button 
                                    type="button" 
                                    onClick={() => remove(index)}
                                >
                                    <GoXCircleFill className="px-2" />
                                </button>
                            </li>
                        )
                    })}
                </ul>   
                <div className="field is-grouped my-3">
                    <button className="button" type="button" onClick={() => append({ text: "" , isSection: false}) }>
                        Add {title}
                    </button>
                    {/* <button className="button" type="button" onClick={() => append("section:") }> */}
                    <button className="button" type="button" onClick={() => append({ text: "" , isSection: true}) }>
                        Add Section
                    </button>
                </div>
                </>
        )
    }

    if (!user) {
        const e = new Error();
        e.name = 'NotLoggedIn';
        return <GlobalErrorDisplay error={e} />
    }

    if (errors.root?.other) {
        return <GlobalErrorDisplay error={errors.root.other} />;
    }
    
    return (
        <form className="container p-3" onSubmit={handleSubmit(onSubmit)}>
            <div className="field mb-4">
                <label className="label">Recipe Name:</label>
                <div className="control">
                    <input 
                        className="input" 
                        placeholder="ex. Beef Stew"
                        type="text"
                        {...register("name", {
                            required: "Recipe must have a name.",
                            minLength: {
                                value: 5,
                                message: "Name must be at least 5 characters."
                            },
                            maxLength: {
                                value: 50,
                                message: "Name must be 50 characters or less."
                            }
                        })}
                    />
                    {errors.name?.message && (
                        <FormMessage message={errors.name.message} danger />
                    )}
                </div>
            </div>
            <div className="field mb-4">
                <label className="label">Recipe Description:</label>
                <div className="control">
                    <textarea
                        className="textarea"  
                        placeholder="Enter a description for this recipe. You could include flavors, taste, inspiration, etc."
                        rows={5}
                        {...register("description", {
                            maxLength: {
                                value: 300,
                                message: "Recipe description must be 300 or less characters."
                            }
                        })}
                    />
                    {errors.description?.message && (
                        <FormMessage message={errors.description.message} danger />
                    )}
                </div>
            </div>

            <div className="field mb-4">
                <label className="label">Recipe Image:</label>
                <div className="column is-3">
                    <div className="image is-square">
                        <img src={getValues('image')? getValues('image') : "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png"} />
                    </div>
                </div>
                <label className="label">Image URL:</label>
                <div className="field is-grouped">
                        <input 
                            className="input" 
                            placeholder={"ex. https://www.cookingclassy.com/wp-content/uploads/2022/07/grilled-steak-15.jpg"} 
                            type="text"
                            {...register("image", {
                                
                            })}
                        />
                        <button className="button" type="button" onClick={handleCancelImageUrl}>Cancel</button>
                </div>
            </div>

            <div className="field mb-4">
                <label className="label">Ingredients:</label>
                <div className="control">
                    <FieldArrayList 
                        fieldArrayName="ingredients"
                        title={"Ingredient"}
                        field={ingredientsField}
                        isInput={true}
                        register={register}
                        append={appendIngredient} 
                        remove={removeIngredient} 
                        swap={swapIngredients} 
                    />
                </div>
                {errors.ingredients?.root?.message && 
                    <FormMessage message={errors.ingredients.root.message}  danger/>
                }
            </div>

            <div className="field mb-4">
                <label className="label">Directions:</label>
                <div className="control">
                    <FieldArrayList 
                        fieldArrayName="directions"
                        title={"Direction"}
                        field={directionsField}
                        isInput={false}
                        register={register}
                        append={appendDirection} 
                        remove={removeDirection} 
                        swap={swapDirections} 
                    />
                </div>
            </div>

            <div className="field mb-4">
                <div className="control">
                    <div className="">
                        <div className="column is-6 is-flex is-align-items-center">
                            <label className="label mr-3">Tag: </label>
                            <input 
                                className="input"  
                                placeholder="ex. breakfast"
                                type="text"
                                // onKeyDown={(event) => event.key === 'Enter' && appendTag(event.target.value)}
                                {...register("tag")}
                            />
                            <button 
                                className="button mx-2" 
                                type="button"
                                onClick={handleAddTag}>
                                    Add Tag
                            </button>
                        </div>
                        {errors.tag?.message && (
                                    <FormMessage className="ml-3 mb-3" message={errors.tag.message} danger />
                                )}
                        <TagList tags={getValues('tags').map(tagObj => tagObj.value)} onDelete={removeTag} />
                        {/* {tagsField.map((item, index) => {
                            return <input 
                                key={index} 
                                type="hidden"
                                {...register(`tags.${index}` as keyof FormData)}
                            />
                        })} */}
                    </div>
                </div>
            </div>

            {/* <p className="mb-3 has-text-weight-bold">{onSubmitStatus ? `${onSubmitStatus}` : ""}</p> */}

            <div className="field is-grouped">
                <div className="control">
                    <button className="button is-link" type="submit">Submit</button>
                </div>
                <div className="control">
                    <button className="button is-link is-light" type="button" onClick={onCancel}>Cancel</button>
                </div>
            </div>
        </form>
    );
}

export default RecipeEditPage;