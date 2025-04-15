import { SubmitHandler, useForm } from "react-hook-form";

interface SearchBarProps {
    initialSearchTerm: string | undefined;
    onSearch: (search: string | undefined) => void;
}

function SearchBar({ initialSearchTerm, onSearch }: SearchBarProps) {
    const { register, handleSubmit, watch, setError, clearErrors, formState: { errors } } = useForm({
            mode: 'onSubmit',
            reValidateMode: 'onSubmit',
            defaultValues: {
                search: initialSearchTerm
            }
        });    
    
    const onSubmit: SubmitHandler<{ search: string | undefined}> = ({ search }: { search: string | undefined}) => {
        onSearch(search? search.trim().replace(' ', '-') : "");
    }

    return (
        <form className="container is-flex" onSubmit={handleSubmit(onSubmit)}>
            <div className="field mr-3">
                {/* <label className="label mr-4">Search: </label> */}
                <div className="control">
                    <input 
                        className="input"
                        type="text"
                        {...register("search", {
                            required: ""
                        })}
                    />
                </div>
            </div>
            <div className="field">
                <div className="control">
                    <button type="submit" className="button my-color-bg">
                        Search
                    </button>
                </div>
            </div>
        </form>        
    );
}

export default SearchBar;