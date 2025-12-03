import clsx from 'clsx';
import { SubmitHandler, useForm } from "react-hook-form";
import styles from './SearchBar.module.css';
import Button from '../buttons/Button';

interface SearchBarProps {
    initialSearchTerm: string | undefined;
    placeholder?: string;
    onSearch: (search: string | undefined) => void;
    size?: 'medium' | 'large';
    className?: string;
}

export default function SearchBar({ initialSearchTerm, placeholder, onSearch, size = 'medium', className }: SearchBarProps) {
    const { register, handleSubmit, watch, setError, clearErrors, formState: { errors } } = useForm({
            mode: 'onSubmit',
            reValidateMode: 'onSubmit',
            defaultValues: {
                search: initialSearchTerm
            }
        });    
    
    const onSubmit: SubmitHandler<{ search: string | undefined}> = ({ search }: { search: string | undefined}) => {
        onSearch(search ? search.trim().toLowerCase() : "");
    }

    return (
        <form 
            className={clsx(
                styles.searchBar,
                className
            )} 
            onSubmit={handleSubmit(onSubmit)}
        >
            <div className="field">
                <div className="control">
                    <input 
                        className={clsx(
                            "input",
                            styles.searchInput,
                            size === 'large' && styles.searchInputLarge
                        )}
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
                    <Button primary type="submit">Search</Button>
                </div>
            </div>
        </form>        
    );
}