import type { Params } from 'react-router-dom';
import type { Recipe } from '../../api/types/recipe';
import { getCollectionById } from '../../api/queries/collectionApi';
import { Collection } from '../../api/types/collection';

const RESULTS_COLS = 4;
const RESULTS_ROWS = 4;

interface LoaderArgs {
    params: Params
}

export interface SingleCollectionLoaderResult {
    collection: Collection | null;
    page: number;
    numCols: number;
    numRows: number;
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
        numCols: RESULTS_COLS,
        numRows: RESULTS_ROWS
    }
}