import { useEffect, useMemo, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { getCurrentWordAtPosition } from "../../utils/helpers";
import { AutoSuggestResult, useAutoSuggest } from "../../hooks/use-auto-suggest";
import { useRouteLoaderData } from "react-router";
import { RootLoaderResult } from "../../pages/root/rootLoader";
import { parseIngredientLine } from "../../utils/parseIngredientLine";
import { preprocessIngredientInput } from "../../utils/ingredientPreprocessor";
import { StandardIngredient, StandardMeasurement } from "../../api/types/standardized";
import { logRecipe } from "../../utils/logger";

const UNIT_SEARCH_KEYS = ['name', 'plural', 'symbol', 'aliases'];
const INGREDIENT_SEARCH_KEYS = ['name'];

interface InputWithAutoSuggestProps {
    name: string;
    className?: string;
    suggestionLimit?: 5
}

/**
 * Input field that suggests standard ingredients or measurements based on which word the user is currently typing.
 */
export default function IngredientInput({ name, className, suggestionLimit = 5 }: InputWithAutoSuggestProps) {
    const {
        standardMeasurementsLookupTable,
        flattenedStandardIngredientsForFuse,
        flattenedStandardMeasurementsForFuse,
        rawUnitsList,
        rawIngredientsSet,
        allIngredientForms,
        allIngredientPreparations
    } = useRouteLoaderData('root') as RootLoaderResult;

    const TEXT_NAME = `${name}.text`;
    const PARSED_INGREDIENT_NAME = `${name}.parsed`;

    const { register, getValues, setValue } = useFormContext();
    const { ref, ...rest } = register(TEXT_NAME);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const inputValue = getValues(TEXT_NAME);
    const [cursorPos, setCursorPos] = useState(0);
    const currentWord = getCurrentWordAtPosition(inputValue, cursorPos);

    const [suggestions, setSuggestions] = useState<AutoSuggestResult<{ name: string }>[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);

    const hasData =
        standardMeasurementsLookupTable &&
        flattenedStandardIngredientsForFuse &&
        flattenedStandardMeasurementsForFuse &&
        rawIngredientsSet &&
        rawUnitsList &&
        allIngredientForms &&
        allIngredientPreparations

    const searchUnits = hasData
        ? useAutoSuggest<StandardMeasurement>({
              autoSuggestionsList: flattenedStandardMeasurementsForFuse,
              keys: UNIT_SEARCH_KEYS
          })
        : null;

    const searchIngredients = hasData
        ? useAutoSuggest<StandardIngredient>({
              autoSuggestionsList: flattenedStandardIngredientsForFuse,
              keys: INGREDIENT_SEARCH_KEYS
          })
        : null;

    useEffect(() => {
        if (!hasData) return;

        updateParsedInfo(getValues(TEXT_NAME));

        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (!hasData || !currentWord) {
            setShowSuggestions(false);
            return;
        }

        const isLikelyAmount = /^\d+([\/.]\d+)?$/.test(currentWord);
        const isLikelyUnit = rawUnitsList.some(unit =>
            unit.includes(currentWord.toLowerCase())
        );

        let results: AutoSuggestResult<{ name: string }>[] = [];

        if (isLikelyAmount) {
            // Do nothing
        } else if (inputValue.trim().split(/\s+/).length < 3 && isLikelyUnit && searchUnits && searchIngredients) {
            // Make unit recommendations
            results = searchUnits(currentWord);
            if (results.length < suggestionLimit) {
                results = results.concat(searchIngredients(currentWord));
            }
        } else if (searchIngredients && searchUnits) {
            // Make ingredient recommendation
            // const parsed = getValues(PARSED_INGREDIENT_NAME)?.ingredient || '';
            results = searchIngredients(currentWord);
            if (results.length < suggestionLimit) {
                results = results.concat(searchUnits(currentWord));
            }
        }

        setSuggestions(results.slice(0, suggestionLimit));
    }, [currentWord, inputValue, hasData, searchIngredients, searchUnits]);

    const updateParsedInfo = (input: string) => {
        if (!hasData) return;
        const parsedIngredients = parseIngredientLine(
            preprocessIngredientInput(input, rawUnitsList), 
            rawIngredientsSet,
            rawUnitsList, 
            standardMeasurementsLookupTable,
            allIngredientForms,
            allIngredientPreparations
        );
        logRecipe.debug(
            { 
                input: preprocessIngredientInput(input, rawUnitsList), 
                parsedIngredients
            },
            "preprocessed ingredient input -> what was able to be parsed"
        );
        setValue(PARSED_INGREDIENT_NAME, parsedIngredients);
    };

    const handleIngredientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(TEXT_NAME, e.target.value, { shouldDirty: true, shouldTouch: true });
        setCursorPos(e.target.selectionStart ?? 0);

        if (hasData) {
            setShowSuggestions(true);
            setHighlightedIndex(-1);
            updateParsedInfo(e.target.value);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!hasData || !suggestions.length) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlightedIndex((i) => Math.min(i + 1, suggestions.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlightedIndex((i) => Math.max(i - 1, 0));
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (highlightedIndex >= 0) {
                handleSuggestionClick(suggestions[highlightedIndex].name);
            }
        }
    };

    const handleSuggestionClick = (suggestionText: string) => {
        const input = inputRef.current;
        if (!input) return;

        const left = inputValue.lastIndexOf(" ", cursorPos - 1) + 1;
        const right = inputValue.indexOf(" ", cursorPos);
        const wordEnd = right === -1 ? inputValue.length : right;

        const newValue = inputValue.substring(0, left) + suggestionText + inputValue.substring(wordEnd);
        setValue(TEXT_NAME, newValue, { shouldDirty: true, shouldTouch: true });
        updateParsedInfo(newValue);
        setShowSuggestions(false);

        setTimeout(() => {
            input.focus();
            const cursorPos = left + suggestionText.length;
            input.setSelectionRange(cursorPos, cursorPos);
        }, 0);
    };

    return (
        <div className={`dropdown ${showSuggestions && 'dropdown--is-active'} ${className}`} ref={wrapperRef}>
            <div className={`dropdown-trigger`}>
                <input
                    className={`input ${className}`}
                    {...rest}
                    onChange={(e) => {
                        register(TEXT_NAME).onChange(e);
                        handleIngredientChange(e);
                    }}
                    onKeyDown={handleKeyDown}
                    ref={(el) => {
                        ref(el);
                        inputRef.current = el;
                    }}
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck="false"
                />
            </div>
            {hasData && (
                <div className="dropdown-menu dropdown-menu--left">
                    <div className="dropdown-content">
                        {suggestions.map((item, index) => (
                            <div
                                key={index}
                                className={`dropdown-item ${index === highlightedIndex && 'dropdown-item--is-highlighted'}`}
                                onMouseDown={(e) => handleSuggestionClick(e.currentTarget.textContent || "")}
                            >
                                {item.name}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}


    