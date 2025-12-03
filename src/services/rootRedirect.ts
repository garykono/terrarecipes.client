import { User } from "../api/types/user";

interface RootRedirectArgs {
    user: User | null;
    pathname: string;
}

export function deriveRootRedirect({ user, pathname }: RootRedirectArgs): string | null {
    // If logged in and trying to access login or sign up page
    const isAlreadySignedIn = user
        && (pathname.toLowerCase() === "/login" || pathname.toLowerCase() === "/signup")

    // If trying to access sign up flow pages that aren't relevant anymore
    const isAlreadyVerified = user 
        && user.verifiedAt 
        && (pathname.toLowerCase() === "/verificationrequired" || pathname.toLowerCase() === "/verificationsent")

    if (isAlreadySignedIn || isAlreadyVerified) {
        return "/"; // or /dashboard
    }

    return null;
}