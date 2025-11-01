import { createBrowserRouter } from "react-router-dom";
import GlobalErrorDisplay from "../components/globalErrorDisplay/GlobalErrorDisplay";
import Root from "../pages/root/Root";
import { rootLoader } from "../pages/root/rootLoader";
import HomePage from '../pages/home/HomePage';
import { homeLoader } from "../pages/home/homeLoader";
import BrowsePage from "../pages/browse/browsePage";
import { browseLoader } from "../pages/browse/browseLoader";
import BrowseCoreCategoryPage from "../pages/browseCoreCategory/browseCoreCategoryPage";
import { browseCoreCategoryLoader } from "../pages/browseCoreCategory/browseCoreCategoryLoader";
import BrowseFeaturedCategoryPage from "../pages/browseFeaturedCategory/browseFeaturedCategoryPage";
import { browseFeaturedCategoryLoader } from "../pages/browseFeaturedCategory/browseFeaturedCategoryLoader";
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
import LogInPage from '../pages/logIn/LogInPage'
import SignUpPage from '../pages/signUp/SignUpPage'
import VerificationEmailSentPage from "../pages/verificationEmailSent/VerificationEmailSentPage";
import VerifyEmailPage from '../pages/verifyEmail/VerifyEmailPage';
import { verifyEmailLoader } from "../pages/verifyEmail/verifyEmailLoader";
import VerificationRequiredPage from "../pages/verificationRequired/VerificationRequiredPage";
import ForgotPasswordPage from '../pages/forgotPassword/ForgotPasswordPage'
import ResetPasswordPage from '../pages/resetPassword/ResetPasswordPage'
import { resetPasswordLoader } from '../pages/resetPassword/ResetPasswordLoader';
import AccountEditPage from "../pages/accountEdit/AccountEditPage";
import UserRecipesPage from "../pages/userRecipes/UserRecipesPage";
import { userRecipesLoader } from '../pages/userRecipes/userRecipesLoader';
import UserCollectionsPage from '../pages/userCollections/UserCollectionsPage';
import LoadingScreen from "../components/LoadingScreen";
import TestPage from "../pages/test/TestPage";
import GroceryListPage from "../pages/groceryList/GroceryListPage";
import { groceryListLoader } from "../pages/groceryList/groceryListLoader";

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
                path: '/browse',
                element: <BrowsePage />,
                loader: browseLoader,
                hydrateFallbackElement: <LoadingScreen />,
                errorElement:<GlobalErrorDisplay />,
            },
            {
                path: '/browse/core/:category',
                element: <BrowseCoreCategoryPage />,
                loader: browseCoreCategoryLoader,
                hydrateFallbackElement: <LoadingScreen />,
                errorElement:<GlobalErrorDisplay />,
            },
            {
                path: '/browse/featured/:category',
                element: <BrowseFeaturedCategoryPage />,
                loader: browseFeaturedCategoryLoader,
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
                path: '/createRecipe',
                element: <RecipeEditPage mode="create"/>,
                loader: undefined,
                hydrateFallbackElement: <LoadingScreen />,
                errorElement:<GlobalErrorDisplay />,
            },
            {
                path: '/editRecipe/:id?',
                element: <RecipeEditPage mode="edit"/>,
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
                path: '/verificationSent',
                element: <VerificationEmailSentPage />,
                loader: undefined,
                hydrateFallbackElement: <LoadingScreen />,
                errorElement:<GlobalErrorDisplay />,
            },
            {
                path: '/verifyEmail/:token',
                element: <VerifyEmailPage />,
                loader: verifyEmailLoader,
                hydrateFallbackElement: <LoadingScreen />,
                errorElement:<GlobalErrorDisplay />,
            },
            {
                path: '/verificationRequired',
                element: <VerificationRequiredPage />,
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
                path: '/resetPassword/:token',
                element: <ResetPasswordPage />,
                loader: resetPasswordLoader,
                hydrateFallbackElement: <LoadingScreen />,
                errorElement:<GlobalErrorDisplay />,
            },
            {
                path: '/account',
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
            },
            {
                path: '/groceryList/recipe/:recipeId',
                element: <GroceryListPage mode="recipe"/>,
                loader: groceryListLoader,
                hydrateFallbackElement: <LoadingScreen />,
                errorElement:<GlobalErrorDisplay />,
            },
            {
                path: '/groceryList/collection/:collectionId',
                element: <GroceryListPage mode="collection"/>,
                loader: groceryListLoader,
                hydrateFallbackElement: <LoadingScreen />,
                errorElement:<GlobalErrorDisplay />,
            },
            {
                path: '/test',
                element: <TestPage />,
                loader: undefined,
                hydrateFallbackElement: <LoadingScreen />,
                errorElement:<GlobalErrorDisplay />,
            }
        ]
    }
])

 