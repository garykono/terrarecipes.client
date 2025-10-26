import type { Params } from 'react-router-dom';


interface LoaderArgs {
    params: Params
}

export interface ResetPasswordLoaderResult {
    token: string | undefined;
}

export async function resetPasswordLoader({ params }: LoaderArgs): Promise<ResetPasswordLoaderResult> {
    const { token } = params;
    

    return {
        token
    }
}