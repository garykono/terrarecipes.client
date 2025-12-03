import { Control, Controller } from "react-hook-form";
import { StandardTags } from "../../../api/types/standardized";
import { FacetKey, facetPath, FormData } from "../RecipeEditPage";
import { FacetChipPicker } from "../../../components/facetChipPicker/FacetChipPicker";
import FormMessage from "../../../components/formMessage/FormMessage";


export function TagSection({
        tags,
        id, 
        control
}: { tags: StandardTags, id: FacetKey, control: Control<FormData> }) {
    

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
                        <FormMessage className="form-message" message={fieldState.error.message} danger />
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