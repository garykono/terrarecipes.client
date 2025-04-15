import type { Params } from 'react-router-dom';
import type { User } from '../../api/types/user';
import { getUserInfo } from '../../api/queries/usersApi';

interface LoaderArgs {
    params: Params
}

export interface RootLoaderResult {
    user: User | null;
}

export async function rootLoader({ params }: LoaderArgs): Promise<RootLoaderResult> {
    let user = null;

    await getUserInfo()
        .then(response => {
            user = response;
        })
        .catch(err => {
            if (err.status) {
                // Do nothing, there is just no user logged in.
            } else {
                console.log(err);
            }
        })

    return {
        user
    }
}