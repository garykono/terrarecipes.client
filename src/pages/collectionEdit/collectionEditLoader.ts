import type { Params } from 'react-router-dom';
import type { Recipe } from '../../api/types/recipe';
import { getCollectionById } from '../../api/queries/collectionApi';
import { Collection } from '../../api/types/collection';

const RESULTS_COLS = 4;
const RESULTS_ROWS = 4;

interface LoaderArgs {
    params: Params
}

export interface CollectionEditLoaderResult {
    collection: Collection | null;
    page: number;
    numCols: number;
    numRows: number;
}

export async function collectionEditLoader({ params }: LoaderArgs): Promise<CollectionEditLoaderResult> {
    const { id, page } = params;

    let pageNum = Number(page);
    if (page && isNaN(pageNum)) {
        throw new Error('Param error: Page must be an integer.');
    } else if (pageNum < 1) {
        pageNum = 1;
    }

    const collection = null;
    
    if (id) {
        await getCollectionById(id)
    };

    return {
        collection,
        page: page? pageNum : 1,
        numCols: RESULTS_COLS,
        numRows: RESULTS_ROWS
    }
}