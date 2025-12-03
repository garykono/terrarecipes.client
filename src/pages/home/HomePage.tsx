import clsx from "clsx";
import { useLoaderData, useNavigate } from "react-router-dom";
import styles from "./HomePage.module.css";
import { HomeLoaderResult } from "./homeLoader";
import { Recipe } from "../../api/types/recipe";
import FeaturedList from "../../components/featuredList/FeaturedList";
import FeaturedCluster from "../../components/featuredCluster/FeaturedCluster";
import { shavePrefix } from "../../utils/tagHelpers";

function HomePage () {
    const { recipes } = useLoaderData() as HomeLoaderResult;
    const navigate = useNavigate();

    const featuredListsData = 
        {
            dinner: {
                title: "Trending Now",
                featuredList: getFeaturedRecipesList("dinner"),
                buttonTitle: "More Dinner Recipes",
                onClick: () => navigate(`./recipes/1/dinner`)
            },
            onePot: {
                title: "30-Minute Dinners",
                featuredList: getFeaturedRecipesList("one pot"),
                buttonTitle: "More One Pot Recipes",
                onClick: () => navigate(`./recipes/1/one pot`)
            },
            side: {
                title: "Sides Recipes",
                featuredList: getFeaturedRecipesList("side"),
                buttonTitle: "More Sides",
                onClick: () => navigate(`./recipes/1/sides`)
            },
            toMake: {
                title: "New This Week",
                featuredList: getFeaturedRecipesList("to make"),
                buttonTitle: "More Recipes to Try",
                onClick: () => navigate(`./recipes/1/to make`)
            }
        }

    function getFeaturedRecipesList(tag: string) {
        return recipes.filter((recipe: Recipe) => {
            const flattenedTags = Array.isArray(recipe?.tags)
                ? recipe.tags
                : Object.values(recipe.tags.facets).flat().map(shavePrefix).concat(recipe.tags.custom);
            
            return flattenedTags.includes(tag);
        }).slice(0, 4);
    }
    
    return (
        <div className={styles.homePage}>
            <section className={clsx(
                "page-top",
                "section",
                styles.heroSection
            )}>
                <div className={clsx(
                    "container",
                    styles.heroContainer
                )}>
                    {recipes[0] && 
                        <FeaturedCluster 
                            title="Featured This Week" 
                            hero={recipes[0]} 
                            companions={recipes.slice(1, 5)} 
                            className={styles.heroCluster}
                        />}
                </div>
            </section>
            
            {/* {recipes[0] && <HomePageFeaturedRecipe recipe={recipes[0]} />} */}
            <HomePageFeaturedList listInfo={featuredListsData["toMake"]} />
            <HomePageFeaturedList listInfo={featuredListsData["dinner"]} />

            <section className={clsx(
                "section",
                styles.secondClusterSection
            )}>
                <div className={clsx(
                    "container",
                    styles.secondClusterContainer
                )}>
                    <FeaturedCluster 
                        title="One Pot Recipes" 
                        hero={recipes[10]} 
                        companions={recipes.slice(11, 15)} 
                        className={styles.heroCluster}
                    />
                </div>
            </section>

            <HomePageFeaturedList listInfo={featuredListsData["onePot"]} />
        </div>
    );
}

interface HomePageFeaturedListProps {
    listInfo: {
        title: string;
        featuredList: Recipe[];
        buttonTitle: string;
        onClick: React.MouseEventHandler<HTMLButtonElement>;
    }
}

function HomePageFeaturedList({ listInfo }: HomePageFeaturedListProps) {
    const { title, featuredList, buttonTitle, onClick } = listInfo;
    return (
        <section className="section">
            <div className="container">
                <FeaturedList 
                    title={title}
                    featuredList={featuredList}
                    buttonTitle={buttonTitle}
                    onClick={onClick}
                />
            </div>
        </section>
    )
}

export default HomePage;