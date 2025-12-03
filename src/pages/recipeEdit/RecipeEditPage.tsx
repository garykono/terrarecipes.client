import clsx from 'clsx';
import { useEffect } from 'react';
import { useNavigate, useLoaderData, useRouteLoaderData, useRevalidator } from 'react-router-dom';
import { useForm, useFieldArray, useWatch, FormProvider, Controller } from 'react-hook-form';
import styles from './RecipeEditPage.module.css';
import { RootLoaderResult } from '../root/rootLoader';
import { RecipeEditLoaderResult } from './recipeEditLoader';
import { createRecipe, editRecipeById } from '../../api/queries/recipesApi';
import { Ingredient, Direction, UnvalidatedRecipe } from '../../api/types/recipe';
import { ErrorMessageSetter, useSetError } from '../../hooks/form-submit-error-handling';
import FormMessage from '../../components/formMessage/FormMessage';
import GlobalErrorDisplay from '../../components/globalErrorDisplay/GlobalErrorDisplay';
import BasicHero from '../../components/basicHero/BasicHero';
import { CollapsibleSection } from '../../components/collapsibleSection/CollapsibleSection';
import { CustomTagsInput } from '../../components/customTagsInput/CustomTagsInput';
import { TERM_TO_ID } from '../../components/customTagsInput/TermToIdMap';
import RecipePreviewPane from '../../components/recipePreviewPane/RecipePreviewPane';
import { toIntOrNull } from '../../utils/helpers';
import { getPrefix } from '../../utils/tagHelpers';
import { AppErrorCodes } from '../../utils/errors/codes';
import { createAppError } from '../../utils/errors/factory';
import { FieldArrayList } from './fieldArrayList/FieldArrayList';
import { TagSection } from './tagSection/TagSection';

const FACET_KEYS = [
    "meal",
    "course",
    "theme",
    "difficulty",
    "dishType",
    "ingredientGroup",
    "diet",
    "occasion",
    "cuisine",
    "season",
    "temperature",
    "method",
    "appliance",
    "flavor",
] as const;

export type FacetKey = typeof FACET_KEYS[number];
export type FacetPath<K extends FacetKey> = `tags.facets.${K}`;
export const facetPath = <K extends FacetKey>(k: K) => `tags.facets.${k}` as FacetPath<K>;
export type FacetValues = Partial<Record<FacetKey, string[]>>;

export interface FormData {
    name: string;
    description: string;
    image: string;
    servings: number;
    prepTimeMin: number;
    cookTimeMin: number;
    restTimeMin: number;
    ingredients: Ingredient[];
    directions: Direction[];
    tag: string;
    tags: {
        facets: FacetValues;
        custom: string[];
    };
    credit: string | null;
}

export default function RecipeEditPage({ mode }: { mode: 'create' | 'edit' }) {
    const navigate = useNavigate();
    const revalidator = useRevalidator();
    const { user, tags } 
        = useRouteLoaderData('root') as RootLoaderResult;
    const { loadedRecipe } = mode === 'edit' ? useLoaderData() as RecipeEditLoaderResult : { loadedRecipe: null};

    useEffect(() => {
        if (user && !user.verifiedAt) {
            navigate('/verificationRequired', { state: { email: user.email, fromLogin: false } })
        }
    }, [])

    const essentialTagIds = ["meal", "course", "theme", "ingredientGroup", "difficulty"] as FacetKey[];
    const styleAndIdentityTagIds = ["dishType", "diet", "occasion", "cuisine"] as FacetKey[];
    const moreTagIds = [ "season", "temperature", "method", "appliance", "flavor"] as FacetKey[];

    const formMethods = useForm<FormData>({
        defaultValues: {
            name: loadedRecipe? loadedRecipe.name : "",
            description: loadedRecipe? loadedRecipe.description : "",
            image: loadedRecipe? loadedRecipe.image : "",
            servings: loadedRecipe? loadedRecipe.servings : undefined,
            prepTimeMin: loadedRecipe? loadedRecipe.prepTimeMin : undefined,
            cookTimeMin: loadedRecipe? loadedRecipe.cookTimeMin : undefined,
            restTimeMin: loadedRecipe? loadedRecipe.restTimeMin : undefined,
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
            tags: 
            loadedRecipe 
                ? loadedRecipe.tags
                : {
                    facets: Object.fromEntries(FACET_KEYS.map((key) => [key, []])),
                    custom: []
                },
            credit: loadedRecipe? loadedRecipe.credit : undefined,
        }
    });
    const { register, control, handleSubmit, getValues, setValue, setError, clearErrors, setFocus, formState: { errors } } = formMethods;

    const prep = useWatch({ control, name: "prepTimeMin", defaultValue: 0 }) ?? 0;
    const cook = useWatch({ control, name: "cookTimeMin", defaultValue: 0 }) ?? 0;
    const rest = useWatch({ control, name: "restTimeMin", defaultValue: 0 }) ?? 0;

    const total = (prep ?? 0) + (cook ?? 0) + (rest ?? 0);
    const displayTotal = total || (loadedRecipe ? loadedRecipe.totalTimeMin : 0);

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

    // Reload previous image if cancel button for image url is pressed
    const handleCancelImageUrl = () => {
        if(loadedRecipe === null) {
            setValue("image", "");
        } else {
            setValue("image", loadedRecipe.image);
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

    function buildRecipe({ 
        name, 
        description, 
        image, 
        servings,
        prepTimeMin,
        cookTimeMin,
        restTimeMin,
        ingredients, 
        directions, 
        tags,
        credit,
    }: FormData) {
        // let totalMin = 0;
        // [prepTimeMin, cookTimeMin, restTimeMin].forEach(time => totalMin = (time ? time : 0))

        return {
            name,
            description,
            image,
            servings,
            prepTimeMin: toIntOrNull(prepTimeMin),
            cookTimeMin: toIntOrNull(cookTimeMin),
            restTimeMin: toIntOrNull(restTimeMin),
            ingredients: ingredients.filter(ingredient => ingredient.text !== ""),
            directions: directions.filter(direction => direction.text !== ""),
            // Tags -- Add no duplicates in future and sort before it goes in database
            tags,
            credit,
        } as UnvalidatedRecipe;
    }

    const onCancel = () => {
        if(loadedRecipe) {
            navigate(`/recipe/${loadedRecipe._id}`);
        } else {
            navigate('/recipes')
        }
    }

    if (!user) {
        return <GlobalErrorDisplay error={createAppError({ code: AppErrorCodes.NOT_LOGGED_IN })} /> 
    }

    if (!tags) {
        const e = createAppError({ 
            code: AppErrorCodes.MISSING_LOADER_DATA,
            message: 'Could not properly load required data: tags'
        });
        return <GlobalErrorDisplay error={e} /> 
    }

    if (errors.root?.other) {
        return <GlobalErrorDisplay error={errors.root.other} />;
    }
    
    return (
        <div className="page-edit-recipe">
            <BasicHero title={loadedRecipe? "Edit Recipe" : "Build a Recipe"} />

            <section className="page-top section">
                <div className="container">
                    <div className={styles.pageWrapper}>
                        <FormProvider {...formMethods}>
                            <form 
                                className={clsx(
                                    "form",
                                    "card",
                                    "card--form",
                                    styles.formEditRecipe
                                )} 
                                onSubmit={handleSubmit(onSubmit)}
                            >
                                <div className="field">
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
                                            <FormMessage className="form-message" message={errors.name.message} danger />
                                        )}
                                    </div>
                                </div>
                                <div className="field">
                                    <label className="label">Recipe Description:</label>
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
                                        <FormMessage className="form-message" message={errors.description.message} danger />
                                    )}
                                </div>

                                <div className="field">
                                    {/* <label className="label">Recipe Image:</label> */}
                                    <div className={clsx(
                                        "image",
                                        "is-square",
                                        styles.imageContainer
                                    )}>
                                        <img 
                                            src={getValues('image')? getValues('image') : "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png"} 
                                            className={styles.recipeImage}
                                        />
                                    </div>
                                    <label className="label">Image URL:</label>
                                    <div className={clsx(
                                        "field",
                                        styles.fieldGroup
                                    )}>
                                            <input 
                                                className="input" 
                                                placeholder={"ex. https://www.cookingclassy.com/wp-content/uploads/2022/07/grilled-steak-15.jpg"} 
                                                type="text"
                                                {...register("image", {
                                                })}
                                            />
                                            <button className="button button--secondary-frequent" type="button" onClick={handleCancelImageUrl}>Cancel</button>
                                    </div>
                                </div>

                                <div className={styles.firstMeta}>
                                    <div className="field">
                                        <label className="label">Servings:</label>
                                        <div className={clsx(
                                            "control",
                                            styles.metaInputControl
                                        )}>
                                            <input 
                                                className="input" 
                                                placeholder="0"
                                                type="number"
                                                {...register("servings", {
                                                    valueAsNumber: true,
                                                    required: "Please enter the servings required.",
                                                    min: {
                                                        value: 1,
                                                        message: "Recipe must make at least 1 serving."
                                                    },
                                                    max: {
                                                        value: 1000,
                                                        message: "Recipe cannot exceed 1000 servings."
                                                    }
                                                })}
                                            />
                                            {errors.servings?.message && (
                                                <FormMessage className="form-message" message={errors.servings.message} danger />
                                            )}
                                        </div>
                                    </div>
                                    <div className={styles.metaTimeWrapper}>
                                        <div className={styles.metaTimeGroup}>
                                            <div className="field">
                                                <label className="label">{"Prep Time (mins):"}</label>
                                                <div className={`control ${styles.metaInputControl}`}>
                                                    <input 
                                                        className="input" 
                                                        placeholder="0"
                                                        type="number"
                                                        {...register("prepTimeMin", {
                                                            valueAsNumber: true,
                                                            min: {
                                                                value: 0,
                                                                message: "Time must be more than 0 min."
                                                            },
                                                            max: {
                                                                value: 1000,
                                                                message: "Recipe cannot exceed 1000 mins."
                                                            }
                                                        })}
                                                    />
                                                    {errors.prepTimeMin?.message && (
                                                        <FormMessage className="form-message" message={errors.prepTimeMin.message} danger />
                                                    )}
                                                </div>
                                            </div>
                                            <div className="field">
                                                <label className="label">{"Cook Time (mins):"}</label>
                                                <div className={`control ${styles.metaInputControl}`}>
                                                    <input 
                                                        className="input" 
                                                        placeholder="0"
                                                        type="number"
                                                        {...register("cookTimeMin", {
                                                            valueAsNumber: true,
                                                            min: {
                                                                value: 0,
                                                                message: "Time must be more than 0 min."
                                                            },
                                                            max: {
                                                                value: 1000,
                                                                message: "Recipe cannot exceed 1000 mins."
                                                            }
                                                        })}
                                                    />
                                                    {errors.cookTimeMin?.message && (
                                                        <FormMessage className="form-message" message={errors.cookTimeMin.message} danger />
                                                    )}
                                                </div>
                                            </div>
                                            <div className="field">
                                                <label className="label">{"Rest Time (mins):"}</label>
                                                <div className={clsx(
                                                    "control",
                                                    styles.metaInputControl
                                                )}>
                                                    <input 
                                                        className="input" 
                                                        placeholder="0"
                                                        type="number"
                                                        {...register("restTimeMin", {
                                                            valueAsNumber: true,
                                                            min: {
                                                                value: 0,
                                                                message: "Time must be more than 0 min."
                                                            },
                                                            max: {
                                                                value: 1000,
                                                                message: "Recipe cannot exceed 1000 mins."
                                                            }
                                                        })}
                                                    />
                                                    {errors.restTimeMin?.message && (
                                                        <FormMessage className="form-message" message={errors.restTimeMin.message} danger />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className={styles.totalTime}>
                                            <p className={"text"}>Total Time: </p>
                                            <p className={"subsection-title"}>{displayTotal} min</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="field">
                                    <label className="label">Ingredients</label>
                                    <div className="control">
                                        <FieldArrayList 
                                            fieldArrayName={"ingredients"}
                                            title={"Ingredient"}
                                            field={ingredientsField}
                                            getValues={getValues}
                                            isInput={true}
                                            register={register}
                                            append={appendIngredient} 
                                            remove={removeIngredient} 
                                            swap={swapIngredients}
                                        />
                                    </div>
                                    {errors.ingredients?.root?.message && 
                                        <FormMessage className="form-message" message={errors.ingredients.root.message} danger/>
                                    }
                                </div>

                                <div className="field">
                                    <label className="label">Directions:</label>
                                    <FieldArrayList 
                                        fieldArrayName="directions"
                                        title={"Direction"}
                                        field={directionsField}
                                        getValues={getValues}
                                        isInput={false}
                                        register={register}
                                        append={appendDirection} 
                                        remove={removeDirection} 
                                        swap={swapDirections} 
                                    />
                                </div>

                                <div className={styles.collapsibleBody}>
                                    {essentialTagIds.map(id => (
                                        <TagSection tags={tags} id={id} control={control} key={`facet-section-${id}`}/>
                                    ))}
                                </div>

                                <CollapsibleSection
                                    title={
                                        <h2 className="section-title">{"Style and Identity"}</h2>
                                    }
                                >
                                    <div className={styles.collapsibleBody}>
                                        {styleAndIdentityTagIds.map(id => (
                                            <TagSection tags={tags} id={id} control={control} key={`facet-section-${id}`}/>
                                        ))}
                                    </div>
                                </CollapsibleSection>

                                <CollapsibleSection
                                    title={
                                        <h2 className="section-title">{"More Tags"}</h2>
                                    }
                                >
                                    <div className={styles.collapsibleBody}>
                                        {moreTagIds.map(id => (
                                            <TagSection tags={tags} id={id} control={control} key={`facet-section-${id}`}/>
                                        ))}
                                    </div>
                                </CollapsibleSection>

                                <Controller
                                    name="tags.custom"
                                    control={control}
                                    render={({ field: { value = [], onChange } }) => (
                                        <CustomTagsInput
                                            title={<h2 className="section-title">{"Custom Tags"}</h2>}
                                            value={value}
                                            onChange={onChange}
                                            // Optional: auto-promote known labels to facet IDs
                                            tryPromoteLabelToFacetId={(raw) => TERM_TO_ID.get(raw.trim().toLowerCase()) ?? null}
                                            onPromoteFacetId={(id) => {
                                                const prefix = getPrefix(id) as FacetKey;
                                                const tagInfo = tags.facets[prefix];
                                                if (!tagInfo) return; // unknown facet prefix → ignore; let it fall back to custom if you want

                                                // Read current array from RHF (default to empty array)
                                                const pathInRHF = facetPath(prefix as FacetKey)
                                                const current = (getValues(pathInRHF) ?? []) as string[];

                                                let next: string[];

                                                if (tagInfo.multi) {
                                                    // Multi: add if not present
                                                    next = current.includes(id) ? current : [...current, id];
                                                } else {
                                                    // Single: replace with just this id
                                                    next = current.length === 1 && current[0] === id ? current : [id];
                                                }

                                                setValue(pathInRHF, next, { shouldDirty: true, shouldValidate: true });
                                            }}
                                        />
                                    )}
                                />

                                <div className="field">
                                    <label className="label"><span>{"Credit (if applicable):"}</span></label>
                                    <div className="control">
                                        <input 
                                            className="input" 
                                            placeholder="Website URL, author, etc."
                                            type="text"
                                            {...register("credit", {
                                                maxLength: {
                                                    value: 200,
                                                    message: "Credit source can't exceed 200 chars."
                                                }
                                            })}
                                        />
                                        {errors.credit?.message && (
                                            <FormMessage className="form-message" message={errors.credit.message} danger />
                                        )}
                                    </div>
                                </div>

                                {/* <p className="mb-3 has-text-weight-bold">{onSubmitStatus ? `${onSubmitStatus}` : ""}</p> */}

                                <div className="field">
                                    <div className={styles.submitButtons}>
                                        {loadedRecipe && 
                                            <button className="button button--secondary" type="button" onClick={onCancel}>
                                                Cancel
                                            </button>
                                        }
                                        <button 
                                            className="button button--primary" 
                                            type="submit">
                                                {loadedRecipe? 'Save' : 'Submit Recipe'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                            <aside className={styles.previewAside}>
                                <RecipePreviewPane fallback={loadedRecipe} />
                            </aside>
                        </FormProvider>
                    </div>
                </div>
            </section>
        </div>
    );
}