import axiosInstance from "../../utils/axiosConfig";
import { Collection } from "../types/collection";

export const getCollectionById = async (id: string) => {
    return (
        axiosInstance
            .get(`/collections/${id}`)
            .then((response) => {
                return response.data.data.doc as Collection;
            })
    );      
}

export const createCollection = async (collection: CollectionUpdateProps) => {
    return (
        axiosInstance
            .post(`/collections/myCollections`, collection)
            .then(response => {
                return response;
            })
    );
    // Don't need to do error handling here as of right now. Collections are also virtual fields of user so a getUserInfo refresh
    // needed where the collection was created
    // const responseData = response.data.data.doc;
}

export interface CollectionUpdateProps {
    name?: string;
    description?: string;
    recipes?: string[];
}

export const editCollectionById = async (collectionId: string, collectionUpdates: CollectionUpdateProps) => {
    return (
        axiosInstance
            .patch(`/collections/myCollections/${collectionId}`, collectionUpdates)
            .then(response => {
                return response;
            })
    );
    // Don't need to do error handling here as of right now. Collections are also virtual fields of user so a getUserInfo refresh
    // needed where the collection was created
    // const responseData = response.data.data.data;
}

export const deleteCollectionById = async (id: string) => {
    return (
        axiosInstance
            .delete(`/collections/myCollections/${id}`)
            .then(response => {
                return response;
            })
    );
}