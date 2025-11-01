import type { Params } from 'react-router-dom';
import { verifyEmail } from '../../api/queries/usersApi';

const NUM_RESULTS = 20;

interface LoaderArgs {
    params: Params
}

export interface VerifyEmailLoaderResult {
    emailVerified: boolean;
    reason: string | null;
}

export async function verifyEmailLoader({ params }: LoaderArgs): Promise<VerifyEmailLoaderResult> {
    const { token } = params;
    let emailVerified = false;
    let reason = null;

    if (token) {
        await verifyEmail(token)
        .then((response) => {
            emailVerified = true;
        })
        .catch(error => {
            if (error.name === 'INVALID_TOKEN') {
                reason = error.response.data.message;
            } else {
                throw error;
            }
        })
    }
    

    return {
        emailVerified,
        reason
    }
}