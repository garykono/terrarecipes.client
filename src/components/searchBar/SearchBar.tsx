import { SubmitHandler, useForm } from "react-hook-form";
import './SearchBar.css';

interface SearchBarProps {
    initialSearchTerm: string | undefined;
    placeholder?: string;
    onSearch: (search: string | undefined) => void;
    className?: string;
}

function SearchBar({ initialSearchTerm, placeholder, onSearch, className }: SearchBarProps) {
    const { register, handleSubmit, watch, setError, clearErrors, formState: { errors } } = useForm({
            mode: 'onSubmit',
            reValidateMode: 'onSubmit',
            defaultValues: {
                search: initialSearchTerm
            }
        });    
    
    const onSubmit: SubmitHandler<{ search: string | undefined}> = ({ search }: { search: string | undefined}) => {
        onSearch(search ? search.trim().toLowerCase().replace(' ', '-') : "");
    }

    return (
        <form className={`search-bar ${className}`} onSubmit={handleSubmit(onSubmit)}>
            <div className="field">
                {/* <label className="label mr-4">Search: </label> */}
                <div className="control">
                    <input 
                        className="input"
                        type="text"
                        {...register("search", {
                            required: ""
                        })}
                        placeholder={placeholder? placeholder : ''}
                    />
                </div>
            </div>
            <div className="field">
                <div className="control">
                    <button type="submit" className="button button--small button--full search-button">
                        Search
                    </button>
                </div>
            </div>
        </form>        
    );
}

export default SearchBar;