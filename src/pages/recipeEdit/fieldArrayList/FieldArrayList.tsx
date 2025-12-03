import clsx from "clsx";
import { UseFieldArrayRemove, UseFormGetValues, UseFormRegister } from "react-hook-form";
import { GoArrowDown, GoArrowUp } from "react-icons/go";
import styles from "./FieldArrayList.module.css";
import IngredientInput from "../../../components/ingredientInput/IngredientInput";
import DeleteButton from "../../../components/buttons/DeleteButton";
import { FormData } from "../RecipeEditPage";

export interface FieldArrayListProps {
    fieldArrayName: keyof FormData;
    title: string;
    isInput: boolean;
    field: {
        text: string;
        isSection: boolean;
        id: string;
    }[];
    getValues: UseFormGetValues<FormData>;
    register: UseFormRegister<FormData>;
    append: ({ text, isSection}: { text: string, isSection: boolean}) => void;
    remove: UseFieldArrayRemove;
    swap: (i1: number, i2: number) => void;
}

export function FieldArrayList({ fieldArrayName, title, isInput, field, getValues, register, append, remove, swap }: FieldArrayListProps) {
    return (
        <>
            <ul className={styles.fieldArrayList}>
                {field.map((item, index) => {
                    const isSection = item.isSection;
                    const name = `${fieldArrayName}.${index}` as keyof FormData;
                    let textBox;
                    if (isSection) {
                        textBox = 
                            <div className={styles.fieldArraySectionContent}>
                                <div className={styles.sectionFieldTag}>Section:</div>
                                <input 
                                    className={"input"}
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
                            key={item.id} 
                            className={clsx(
                                styles.fieldArrayListItem,
                                isSection && styles.fieldArraySection
                            )}
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