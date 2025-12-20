import clsx from "clsx";
import { useLoaderData, useNavigate } from "react-router-dom";
import styles from "./HomePage.module.css";
import { HomeLoaderResult } from "./homeLoader";
import { Recipe } from "../../api/types/recipe";
import FeaturedList from "../../components/featuredList/FeaturedList";
import FeaturedCluster from "../../components/featuredCluster/FeaturedCluster";
import { HomeCategoryResult, SingleHomeCategoryResult } from "../../api/types/category";
import { useMemo } from "react";

// Most recipes to show in a single cluster or row
const MAX_RECIPES_TO_DISPLAY = 5

function HomePage () {
    const { categoryResults } = useLoaderData() as HomeLoaderResult;

    const uniqueCategoryResults = useMemo(() => {
        // Keep a counter of how many times each recipes shows up
        const recipeIdsCounter = {} as Record<string, number>;

        const categoryResultsWithDuplicatesMinimized = {} as HomeCategoryResult;
        
        Object.entries(categoryResults).forEach(([categoryKey, categoryData]) => {
            const categoryRecipesToDisplay = [] as Recipe[];

            // Increment the counter for each recipe we're using
            for (const recipe of categoryData.recipes.results) {
                if (recipeIdsCounter[recipe.id]) {
                    recipeIdsCounter[recipe.id] += 1;
                } else {
                    recipeIdsCounter[recipe.id] = 1;
                }

                // If the recipe hasn't shown up already on other lists, display it in this list
                if (recipeIdsCounter[recipe.id] < 2) categoryRecipesToDisplay.push(recipe);
                // Stop at 5 recipes
                if (categoryRecipesToDisplay.length >= MAX_RECIPES_TO_DISPLAY) break;
            };
            
            const uniqueCategory = { 
                ...categoryData,
                recipes: {
                    ...categoryData.recipes,
                    results: categoryRecipesToDisplay,
                }
            }
            categoryResultsWithDuplicatesMinimized[categoryKey] = uniqueCategory;
        })

        return categoryResultsWithDuplicatesMinimized;
    }, [categoryResults])

    return (
        <div className={styles.homePage}>
            <div className={"page-top"}>
                <HomePageSection
                    singleHomeCategoryResult={uniqueCategoryResults["christmas-favorites"]}
                    variant="cluster"
                    isHero
                />

                <HomePageSection
                    singleHomeCategoryResult={uniqueCategoryResults["quick-and-easy"]}
                    variant="row"
                    isHero
                />

                <HomePageSection
                    singleHomeCategoryResult={uniqueCategoryResults["featured"]}
                    variant="cluster"
                    isHero
                />

                <HomePageSection
                    singleHomeCategoryResult={uniqueCategoryResults["comfort-classics"]}
                    variant="row"
                    isHero
                />

                <HomePageSection
                    singleHomeCategoryResult={uniqueCategoryResults["recently-added"]}
                    variant="row"
                    isHero
                />
            </div>
        </div>
    );
}

interface HomePageSectionProps {
    singleHomeCategoryResult: SingleHomeCategoryResult,
    variant: "cluster" | "row",
    isHero: boolean
}

function HomePageSection({
    singleHomeCategoryResult,
    variant,
    isHero = false
}: HomePageSectionProps) {
    if (singleHomeCategoryResult) {
        const categoryInfo = singleHomeCategoryResult.categoryInfo;
        const recipesList = singleHomeCategoryResult.recipes.results;

        if (recipesList.length > 0) {
            return (
                <section className={clsx(
                    "section",
                    isHero ?? styles.heroSection
                )}>
                    <div className={clsx(
                        "container",
                        styles.heroContainer
                    )}>
                        {variant === "cluster" 
                            ? <FeaturedCluster 
                                title={categoryInfo.title}
                                description={categoryInfo.description}
                                hero={recipesList[0]} 
                                companions={recipesList.slice(1, 5)} 
                                className={styles.heroCluster}
                            />
                            : <FeaturedList 
                                title={categoryInfo.title}
                                description={categoryInfo.description}
                                featuredList={recipesList}
                            />
                        }
                    </div>
                </section>
            )
        }
    }
    return <></>;
}

export default HomePage;