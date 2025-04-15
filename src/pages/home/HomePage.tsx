import { useState, useContext, useEffect } from "react";
import { useLoaderData } from "react-router-dom";
import FeaturedRecipe from "../../components/FeaturedRecipe";
import FeaturedList from "../../components/FeaturedList";
import { Recipe } from "../../api/types/recipe";
import { HomeLoaderResult } from "./homeLoader";

function HomePage () {
    const { recipes } = useLoaderData() as HomeLoaderResult;

    const featuredListsData = 
        {
            dinner: {
                title: "Dinner Recipes",
                featuredList: getFeaturedRecipesList("dinner"),
                buttonTitle: "More Dinner Recipes"
            },
            bigPot: {
                title: "Big Pot Recipes",
                featuredList: getFeaturedRecipesList("big pot"),
                buttonTitle: "More Big Pot Recipes"
            },
            side: {
                title: "Sides Recipes",
                featuredList: getFeaturedRecipesList("side"),
                buttonTitle: "More Sides"
            },
            toMake: {
                title: "Recipes to Try",
                featuredList: getFeaturedRecipesList("to make"),
                buttonTitle: "More Recipes to Try"
            }
        }

    function getFeaturedRecipesList(tag: string) {
        return recipes.filter((recipe: Recipe) => {
            return recipe.tags.includes(tag);
        }).slice(0, 4);
    }

    let content = recipes[0] ? 
        <HomePageFeaturedRecipe recipe={recipes[0]} /> : null; 
    
    return (
        <div className="my-color my-color-page-bg" style={{fontFamily: "Helvetica", letterSpacing: '1.5px'}}>
            <section className="hero is-medium my-color-bg" style={{}}>
                <div className="hero-body">
                    <div className="container has-text-centered">
                        <p className="title my-5 has-text-white">A simple way to manage and share recipes</p>
                        <p className="subtitle has-text-white">More features coming soon!</p>
                    </div>
                </div>
            </section>
            <div className="container">
                {content}
                <HomePageFeaturedList listInfo={featuredListsData["toMake"]} />
                <HomePageFeaturedList listInfo={featuredListsData["dinner"]} />
                <HomePageFeaturedList listInfo={featuredListsData["bigPot"]} />
            </div>
        </div>
    );
}

interface HomePageFeaturedListProps {
    listInfo: {
        title: string;
        featuredList: Recipe[];
        buttonTitle: string;
    }
}

function HomePageFeaturedList({ listInfo }: HomePageFeaturedListProps) {
    const { title, featuredList, buttonTitle } = listInfo;
    return (
        <section className="section is-flex is-justify-content-center">
            <div className="column is-14">
                <FeaturedList 
                    title={title}
                    featuredList={featuredList}
                    buttonTitle={buttonTitle}
                />
            </div>
        </section>
    )
}

function HomePageFeaturedRecipe({ recipe }: { recipe: Recipe }) {
    return (
        <section className="section is-flex is-justify-content-center">
            <div className="column is-11">
                <FeaturedRecipe recipe={recipe} />
            </div>
        </section>
    )
}

export default HomePage;