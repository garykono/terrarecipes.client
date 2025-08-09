import styles from "./HomePage.module.css";
import { useState, useContext, useEffect } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import FeaturedRecipe from "../../components/featuredRecipe/FeaturedRecipe";
import FeaturedList from "../../components/featuredList/FeaturedList";
import { Recipe } from "../../api/types/recipe";
import { HomeLoaderResult } from "./homeLoader";
import BasicHero from "../../components/basicHero/BasicHero";

function HomePage () {
    const { recipes } = useLoaderData() as HomeLoaderResult;
    const navigate = useNavigate();

    const featuredListsData = 
        {
            dinner: {
                title: "Dinner Recipes",
                featuredList: getFeaturedRecipesList("dinner"),
                buttonTitle: "More Dinner Recipes",
                onClick: () => navigate(`./recipes/1/dinner`)
            },
            onePot: {
                title: "One Pot Recipes",
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
                title: "Recipes to Try",
                featuredList: getFeaturedRecipesList("to make"),
                buttonTitle: "More Recipes to Try",
                onClick: () => navigate(`./recipes/1/to make`)
            }
        }

    function getFeaturedRecipesList(tag: string) {
        return recipes.filter((recipe: Recipe) => {
            return recipe.tags.includes(tag);
        }).slice(0, 4);
    }
    
    return (
        <div className={styles.homePage}>
            <BasicHero title='Home Page' text='A simple way to manage recipes. More features coming!' />
            <div className={styles.recipeSections}>
                {recipes[0] && <HomePageFeaturedRecipe recipe={recipes[0]} />}
                <HomePageFeaturedList listInfo={featuredListsData["toMake"]} />
                <HomePageFeaturedList listInfo={featuredListsData["dinner"]} />
                <HomePageFeaturedList listInfo={featuredListsData["onePot"]} />
            </div>
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

function HomePageFeaturedRecipe({ recipe }: { recipe: Recipe }) {
    return (
        <section className="section">
            <div className="container">
                <FeaturedRecipe recipe={recipe} />
            </div>
        </section>
    )
}

export default HomePage;