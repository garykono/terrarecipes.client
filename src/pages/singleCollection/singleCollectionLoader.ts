import type { Params } from 'react-router-dom';
import type { Recipe } from '../../api/types/recipe';
import { getCollectionById } from '../../api/queries/collectionApi';
import { Collection } from '../../api/types/collection';

const NUM_RESULTS = 20;

interface LoaderArgs {
    params: Params
}

export interface SingleCollectionLoaderResult {
    collection: Collection | null;
    page: number;
    numResults: number;
}

export async function singleCollectionLoader({ params }: LoaderArgs): Promise<SingleCollectionLoaderResult> {
    const { id, page } = params;

    let pageNum = Number(page);
    if (page && isNaN(pageNum)) {
        throw new Error('Param error: Page must be an integer.');
    } else if (pageNum < 1) {
        pageNum = 1;
    }

    // Typescript makes us do this check but we can't even get to this route if id is not given
    let collection = null;
    if (id) {
        collection = await getCollectionById(id);
    }

    return {
        collection,
        page: page? pageNum : 1,
        numResults: NUM_RESULTS,
    }
}