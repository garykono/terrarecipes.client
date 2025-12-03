import { redirect, type Params } from 'react-router-dom';
import type { User } from '../../api/types/user';
import { getUserInfo } from '../../api/queries/usersApi';
import { deriveRootRedirect } from '../../services/rootRedirect';
import { buildStandardizedStaticState, StaticBootstrapState } from '../../services/staticDataBootstrap';
import { logAPI } from '../../utils/logger';

interface LoaderArgs {
    params: Params
    request: Request;
}

export interface RootLoaderResult extends StaticBootstrapState {
    user: User | null;
}

export async function rootLoader({ params, request }: LoaderArgs): Promise<RootLoaderResult | Response> {
    let user: User | null = null;

    await getUserInfo()
        .then(response => {
            user = response;
        })
        .catch(err => {
            if (err.status) {
                // Do nothing, there is just no user logged in.
            } else {
                logAPI.warn({ error: err }, "User failed to be loaded.");
            }
        })

    const staticState = await buildStandardizedStaticState();

    const { pathname } = new URL(request.url);
    
    const redirectTo = deriveRootRedirect({ user, pathname });
    if (redirectTo) {
        throw redirect(redirectTo);
    }
    
    return {
        user,
        ...staticState
    }
}