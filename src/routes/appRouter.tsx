import { createBrowserRouter } from "react-router-dom";
import GlobalErrorDisplay from "../components/GlobalErrorDisplay";
import Root from "../pages/root/Root";
import { rootLoader } from "../pages/root/rootLoader";
import HomePage from '../pages/home/HomePage';
import { homeLoader } from "../pages/home/homeLoader";
import RecipesPage from '../pages/recipes/RecipesPage'
import { recipesLoader } from "../pages/recipes/recipesLoader";
import SingleRecipePage from '../pages/singleRecipe/SingleRecipePage'
import { singleRecipeLoader } from "../pages/singleRecipe/singleRecipeLoader"
import RecipeEditPage from '../pages/recipeEdit/RecipeEditPage'
import { recipeEditLoader } from '../pages/recipeEdit/recipeEditLoader'
import SingleCollectionPage from "../pages/singleCollection/SingleCollectionPage";
import { singleCollectionLoader } from "../pages/singleCollection/singleCollectionLoader";
import CollectionEditPage from "../pages/collectionEdit/collectionEditPage";
import { collectionEditLoader } from '../pages/collectionEdit/collectionEditLoader';
import LogInPage from '../pages/LogInPage'
import SignUpPage from '../pages/SignUpPage'
import ForgotPasswordPage from '../pages/ForgotPasswordPage'
import ChangePasswordPage from '../pages/ChangePasswordPage'
import AccountPage from '../pages/AccountPage'
import AccountEditPage from "../pages/AccountEditPage";
import UserRecipesPage from "../pages/userRecipes/UserRecipesPage";
import { userRecipesLoader } from '../pages/userRecipes/userRecipesLoader';
import UserCollectionsPage from '../pages/UserCollectionsPage';
import LoadingScreen from "../components/LoadingScreen";

export const appRouter = createBrowserRouter([
    {
        path: '/',
        element: <Root />,
        loader: rootLoader,
        id: 'root',
        hydrateFallbackElement: <LoadingScreen />,
        errorElement:<GlobalErrorDisplay />,
        children: [
            {
                index: true,
                element: <HomePage />,
                loader: homeLoader,
                hydrateFallbackElement: <LoadingScreen />,
                errorElement:<GlobalErrorDisplay />,
            },
            {
                path: '/recipes/:page?/:search?',
                element: <RecipesPage />,
                loader: recipesLoader,
                hydrateFallbackElement: <LoadingScreen />,
                errorElement:<GlobalErrorDisplay />,
            },
            {
                path: '/recipe/:id',
                element: <SingleRecipePage />,
                loader: singleRecipeLoader,
                hydrateFallbackElement: <LoadingScreen />,
                errorElement:<GlobalErrorDisplay />,
            },
            {
                path: '/editRecipe/:id?',
                element: <RecipeEditPage />,
                loader: recipeEditLoader,
                hydrateFallbackElement: <LoadingScreen />,
                errorElement:<GlobalErrorDisplay />,
            },
            {
                path: '/collection/:id/:page?',
                element: <SingleCollectionPage />,
                loader: singleCollectionLoader,
                hydrateFallbackElement: <LoadingScreen />,
                errorElement:<GlobalErrorDisplay />,
            },
            {
                path: '/editCollection/:id/:page?',
                element: <CollectionEditPage />,
                loader: collectionEditLoader,
                hydrateFallbackElement: <LoadingScreen />,
                errorElement:<GlobalErrorDisplay />,
            },
            {
                path: '/logIn',
                element: <LogInPage />,
                loader: undefined,
                hydrateFallbackElement: <LoadingScreen />,
                errorElement:<GlobalErrorDisplay />,
            },
            {
                path: '/signUp',
                element: <SignUpPage />,
                loader: undefined,
                hydrateFallbackElement: <LoadingScreen />,
                errorElement:<GlobalErrorDisplay />,
            },
            {
                path: '/forgotPassword',
                element: <ForgotPasswordPage />,
                loader: undefined,
                hydrateFallbackElement: <LoadingScreen />,
                errorElement:<GlobalErrorDisplay />,
            },
            {
                path: '/changePassword',
                element: <ChangePasswordPage />,
                loader: undefined,
                hydrateFallbackElement: <LoadingScreen />,
                errorElement:<GlobalErrorDisplay />,
            },
            {
                path: '/account',
                element: <AccountPage />,
                loader: undefined,
                hydrateFallbackElement: <LoadingScreen />,
                errorElement:<GlobalErrorDisplay />,
            },
            {
                path: '/accountEdit',
                element: <AccountEditPage />,
                loader: undefined,
                hydrateFallbackElement: <LoadingScreen />,
                errorElement:<GlobalErrorDisplay />,
            },
            {
                path: '/myRecipes/:page?/:search?',
                element: <UserRecipesPage />,
                loader: userRecipesLoader,
                hydrateFallbackElement: <LoadingScreen />,
                errorElement:<GlobalErrorDisplay />,
            },
            {
                path: '/myCollections',
                element: <UserCollectionsPage />,
                loader: undefined,
                hydrateFallbackElement: <LoadingScreen />,
                errorElement:<GlobalErrorDisplay />,
            }
        ]
    }
])

 