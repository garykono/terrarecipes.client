import { Recipe } from './recipe';
import { Collection } from './collection';

export interface User {
    _id: string;
    username: string;
    email: string;
    recipes: Recipe[];
    collections: Collection[];
    role: string;
    verifiedAt: Date;
}