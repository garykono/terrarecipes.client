import styles from './RecipeEditPage.module.css';
import { useState, useContext, useEffect, useMemo, Ref, useRef } from 'react';
import { useNavigate, useLoaderData, useRouteLoaderData, useRevalidator } from 'react-router-dom';
import { useForm, useFieldArray, useWatch, UseFieldArrayRemove, UseFormRegister, FormProvider, useFormContext, Controller, Path } from 'react-hook-form';
import { GoXCircleFill, GoArrowUp, GoArrowDown } from 'react-icons/go';
import { createRecipe, editRecipeById } from '../../api/queries/recipesApi';
import TagList from '../../components/tagList/TagList'
import FormMessage from '../../components/formMessage/FormMessage';
import GlobalErrorDisplay from '../../components/globalErrorDisplay/GlobalErrorDisplay';
import { ErrorMessageSetter, useSetError } from '../../hooks/form-submit-error-handling';
import { RecipeEditLoaderResult } from './recipeEditLoader';
import { Ingredient, Direction, UnvalidatedRecipe } from '../../api/types/recipe';
import { RootLoaderResult } from '../root/rootLoader';
import BasicHero from '../../components/basicHero/BasicHero';
import DeleteButton from '../../components/buttons/DeleteButton';
import IngredientInput from '../../components/ingredientInput/IngredientInput'
import RecipeCard from '../../components/recipeCard/RecipeCard';
import { FacetChipPicker } from '../../components/facetChipPicker/FacetChipPicker';
import { CollapsibleSection } from '../../components/collapsibleSection/CollapsibleSection';
import { CustomTagsInput } from '../../components/customTagsInput/CustomTagsInput';
import { TERM_TO_ID } from '../../components/customTagsInput/TermToIdMap';
import { toIntOrNull } from '../../utils/helpers';
import { getPrefix } from '../../utils/tagHelpers';

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

type FacetKey = typeof FACET_KEYS[number];
type FacetPath<K extends FacetKey> = `tags.facets.${K}`;
const facetPath = <K extends FacetKey>(k: K) => `tags.facets.${k}` as FacetPath<K>;
type FacetValues = Partial<Record<FacetKey, string[]>>;

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
                <ul className={styles.fieldArrayList}>
                    {field.map((item, index) => {
                        const isSection = fieldArray[index].isSection;
                        const name = `${fieldArrayName}.${index}` as keyof FormData;
                        let textBox;
                        if (isSection) {
                            textBox = 
                                <div className={styles.fieldArraySectionContent}>
                                    <div className={styles.sectionFieldTag}>Section:</div>
                                    <input 
                                        className={'input'}
                                        {...register(`${name}.text` as keyof FormData)}
                                    />
                                </div>
                        } else if (isInput) {
                            textBox =
                                <IngredientInput
                                    name={name}
                                />
                        } else {
                            textBox = 
                                <textarea
                                    className="textarea"
                                    rows={2}
                                    {...register(`${name}.text` as keyof FormData)}
                                />
                        }
                                    
                        
                        return (
                            <li 
                                key={index} 
                                className={`
                                    ${styles.fieldArrayListItem}
                                    ${isSection? styles.fieldArraySection : ''}
                                `}
                            >
                                <div className={styles.moveItemArrows}>
                                    <button
                                        className={styles.moveItemArrow}
                                        type="button" 
                                        onClick={() => swap(index, index - 1)} 
                                        disabled={index === 0}
                                        tabIndex={-1}
                                    >
                                        <GoArrowUp />
                                    </button>
                                    <button
                                        className={styles.moveItemArrow}
                                        type="button" 
                                        onClick={() => swap(index, index + 1)} 
                                        disabled={index === field.length - 1}
                                        tabIndex={-1}
                                    >
                                        <GoArrowDown />
                                    </button>
                                </div>
                                {textBox}
                                
                                <DeleteButton 
                                    className={styles.deleteButton}
                                    type="button"
                                    onClick={() => remove(index)}
                                    tabIndex={-1}
                                />
                            </li>
                        )
                    })}
                </ul>   
                <div className={styles.buttons}>
                    <button className="button button--secondary-frequent" type="button" onClick={() => append({ text: "" , isSection: false}) }>
                        Add {title}
                    </button>
                    {/* <button className="button" type="button" onClick={() => append("section:") }> */}
                    <button className="button button--secondary-frequent" type="button" onClick={() => append({ text: "" , isSection: true}) }>
                        Add Section
                    </button>
                </div>
                </>
        )
    }
    
    function TagSection({
        id
    }: { id: FacetKey}) {
        if (!tags) {
            const e = new Error();
            e.name = 'MissingLoaderData';
            e.message = 'Could not properly load required data: tags';
            setError("root.other", e)
            return;
        }

        const tagInfo = tags?.facets[id];
        let desc = tagInfo.multi ? `Select all that apply. ` : "Select one."
        if (tagInfo.multi && tagInfo.requirement.max) desc += `(Up to ${tagInfo.requirement.max})` 

        return (
            <Controller
                name={facetPath(id)}
                control={control}
                render={({ field, fieldState }) => (
                    <div className="field">
                        <FacetChipPicker
                            title={
                                <label className="label">{tagInfo.label}</label>
                            }
                            description={<p className="text">{desc}</p>}
                            options={tags.facets[id].options}
                            multi={tags.facets[id].multi}
                            value={field.value ?? []}
                            onChange={field.onChange}
                            minSelected={tagInfo.requirement.min || undefined}
                            maxSelected={tagInfo.requirement.max || undefined}
                        />

                        {fieldState.error?.message && (
                            <FormMessage className='form-message' message={fieldState.error.message} danger />
                        )}
                    </div>
                )}
                rules={{
                    validate: (value) => {
                        if (value && tagInfo.requirement.min && value.length < tagInfo.requirement.min) {
                            return "Please select at least one option.";
                        } else if (value && tagInfo.requirement.max && value.length > tagInfo.requirement.max) {
                            return `Please select ${tagInfo.requirement.max} options at most.`;
                        }
                    }
                }}
            />
        )
    }

    if (!user) {
        const e = new Error();
        e.name = 'NotLoggedIn';
        return <GlobalErrorDisplay error={e} />
    }

    if (!tags) {
        const e = new Error();
        e.name = 'MissingLoaderData';
        e.message = 'Could not properly load required data: tags';
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
                            <form className={`form card card--form ${styles.formEditRecipe}`} onSubmit={handleSubmit(onSubmit)}>
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
                                            <FormMessage className='form-message' message={errors.name.message} danger />
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
                                        <FormMessage className='form-message' message={errors.description.message} danger />
                                    )}
                                </div>

                                <div className="field">
                                    {/* <label className="label">Recipe Image:</label> */}
                                    <div className={`image is-square ${styles.imageContainer}`}>
                                        <img 
                                            src={getValues('image')? getValues('image') : "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png"} 
                                            className={styles.recipeImage}
                                        />
                                    </div>
                                    <label className="label">Image URL:</label>
                                    <div className={`field ${styles.fieldGroup}`}>
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
                                        <div className={`control ${styles.metaInputControl}`}>
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
                                                <FormMessage className='form-message' message={errors.servings.message} danger />
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
                                                        <FormMessage className='form-message' message={errors.prepTimeMin.message} danger />
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
                                                        <FormMessage className='form-message' message={errors.cookTimeMin.message} danger />
                                                    )}
                                                </div>
                                            </div>
                                            <div className="field">
                                                <label className="label">{"Rest Time (mins):"}</label>
                                                <div className={`control ${styles.metaInputControl}`}>
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
                                                        <FormMessage className='form-message' message={errors.restTimeMin.message} danger />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className={styles.totalTime}>
                                            <p className={`text`}>Total Time: </p>
                                            <p className={`subsection-title`}>{displayTotal} min</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="field">
                                    <label className="label">Ingredients</label>
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
                                        <FormMessage className='form-message' message={errors.ingredients.root.message} danger/>
                                    }
                                </div>

                                <div className="field">
                                    <label className="label">Directions:</label>
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

                                <div className={styles.collapsibleBody}>
                                    {essentialTagIds.map(id => (
                                        <TagSection id={id} key={`facet-section-${id}`}/>
                                    ))}
                                </div>

                                <CollapsibleSection
                                    title={
                                        <h2 className="section-title">{"Style and Identity"}</h2>
                                    }
                                >
                                    <div className={styles.collapsibleBody}>
                                        {styleAndIdentityTagIds.map(id => (
                                            <TagSection id={id} key={`facet-section-${id}`}/>
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
                                            <TagSection id={id} key={`facet-section-${id}`}/>
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
                                            <FormMessage className='form-message' message={errors.credit.message} danger />
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
                                <PreviewPane fallback={loadedRecipe} />
                            </aside>
                        </FormProvider>
                    </div>
                </div>
            </section>
        </div>
    );
}

function PreviewPane({ fallback }: { fallback?: any }) {
    const { control } = useFormContext<FormData>();

    // watch the whole form (simple) – or list specific names if you want fewer re-renders
    const w = (useWatch({ control }) as Partial<FormData>) || {};

    // numbers (guard against string values)
    const servings = Number(w.servings ?? fallback?.servings ?? 0) || 0;
    const prep     = Number(w.prepTimeMin ?? fallback?.prepTimeMin ?? 0) || 0;
    const cook     = Number(w.cookTimeMin ?? fallback?.cookTimeMin ?? 0) || 0;
    const rest     = Number(w.restTimeMin ?? fallback?.restTimeMin ?? 0) || 0;
    const total    = prep + cook + rest;

    // tags are objects in the form; map to strings for the card
    const tags = (w.tags ?? fallback?.tags ?? [])

    // shape the object your RecipeCard expects
    const recipeForCard = {
        name: w.name ?? fallback?.name ?? "",
        description: w.description ?? fallback?.description ?? "",
        image: w.image ?? fallback?.image ?? "",
        servings,
        prepTimeMin: prep,
        cookTimeMin: cook,
        restTimeMin: rest,
        totalTimeMin: total || Number(fallback?.totalTimeMin ?? 0) || 0,
        ingredients: (w.ingredients ?? fallback?.ingredients ?? []).filter((i: any) => i?.text?.trim?.()),
        directions: (w.directions ?? fallback?.directions ?? []).filter((d: any) => d?.text?.trim?.()),
        tags,
        credit: w.credit ?? fallback?.credit,
    };

    return (
        <div className={styles.previewPane}>
            <h3 className={styles.previewTitle}>Preview</h3>
            <RecipeCard recipe={recipeForCard as UnvalidatedRecipe} />
        </div>
    );
}