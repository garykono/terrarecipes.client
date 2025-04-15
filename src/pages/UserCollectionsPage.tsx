import { useState, useEffect, useContext } from 'react'
import { Form, Link, useNavigate, useRevalidator, useRouteLoaderData } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { MdEdit } from 'react-icons/md';
import { MdDelete } from 'react-icons/md'
import { CollectionUpdateProps, createCollection, deleteCollectionById } from '../api/queries/collectionApi';
import Modal from '../components/Modal'
import FormMessage from '../components/FormMessage';
import GlobalErrorDisplay from '../components/GlobalErrorDisplay';
import { ErrorMessageSetter, useSetError } from '../hooks/form-submit-error-handling';
import { Collection } from '../api/types/collection';

function UserCollectionsPage() {
    const navigate = useNavigate();
    const revalidator = useRevalidator();
    const { user } = useRouteLoaderData('root');

    const { register, handleSubmit, setValue, watch, setError, clearErrors, formState: { errors } } = useForm({
            mode: 'onSubmit',
            reValidateMode: 'onSubmit',
            defaultValues: {
                name: '',
                description: ''
            }
        });

    const [showCreateCollectionModal, setShowCreateCollectionModal] = useState(false);
    const [showDeleteCollectionModal, setShowDeleteCollectionModal] = useState(false);
    const [collectionNameToDelete, setCollectionNameToDelete] = useState("");
    const [collectionIdToDelete, setCollectionIdToDelete] = useState("");

    const [successMessage, setSuccessMessage] = useState('');
    const [dangerMessage, setDangerMessage] = useState('');

    const addCollection = ({ name, description }: CollectionUpdateProps) => {
        createCollection({
                name,
                description
            })
            .then(() => {
                setSuccessMessage(`Collection '${name}' has been successfully created.`)
                setDangerMessage('');
                setValue('name', '');
                setValue('description', '');

                revalidator.revalidate();
                setShowCreateCollectionModal(false);
            })
            .catch(err => {
                useSetError(err, setError as ErrorMessageSetter);
                setSuccessMessage('');
                // setDangerMessage(`Could not create collection '${collectionName}`);
                // setSuccessMessage('');
            })
    }

    const deleteCollection = async (collectionId: string) => {
        await deleteCollectionById(collectionId)
            .then(() => {
                setSuccessMessage(`Collection '${collectionNameToDelete}' has been successfully deleted.`)
                setDangerMessage('');
                revalidator.revalidate();
                setShowDeleteCollectionModal(false);
            })
            .catch(err => {
                console.log(err);
                setError('root.other', err);
                // setDangerMessage(`Failed to delete collection '${collectionNameToDelete}'.`);
                // setSuccessMessage('');
            })
    }

    const handleCreateCollectionButtonClick = () => {
        setShowCreateCollectionModal(true);
    }

    const handleDeleteCollectionButtonClick = (collectionName: string, collectionId: string) => {
        setCollectionIdToDelete(collectionId);
        setCollectionNameToDelete(collectionName);
        setShowDeleteCollectionModal(true);
    }

    const createCollectionModal = (
        <Modal 
            onClose={() => setShowCreateCollectionModal(false)} 
            onConfirm={handleSubmit(addCollection)} 
            title='Create a new Collection?'
            submitButtonText='Create'
            success>

            <form onSubmit={handleSubmit(addCollection)}>
                <div className="field">
                    <label className="label">Collection Name</label>
                    <div className="control">
                        <input 
                            className="input" 
                            placeholder="ex. Summer Recipes to Try"
                            {...register("name", {
                                required: "A collection must have a name.",
                                maxLength: {
                                    value: 50,
                                    message: "Name must be 50 characters or less."
                                }
                            })}
                        />
                        {errors.name?.message && (
                            <FormMessage message={errors.name?.message} danger />
                        )}
                    </div>
                </div>
                <div className="field">
                <label className="label">Collection Description</label>
                    <div className="control">
                        <textarea 
                            className="textarea"  
                            rows={5}
                            {...register("description", {
                                maxLength: {
                                    value: 300,
                                    message: "Description must be 300 characters or less."
                                }
                            })}
                        />
                        {errors.description?.message && (
                            <FormMessage message={errors.description?.message} danger />
                        )}
                    </div>
                </div>
            </form>
        </Modal>
    );

    const deleteCollectionModal = (
        <Modal 
            onClose={() => setShowDeleteCollectionModal(false)} 
            onConfirm={() => deleteCollection(collectionIdToDelete)} 
            title='Delete collection?'
            submitButtonText={'Delete'}>
            Are you sure you want to delete this collection?
        </Modal>
    );

    let content = (() => {
        if (user) {
            return user.collections.map((collection: Collection) => {
                return (
                    <div className="columns" key={collection._id}>
                        <div className="column is-10 box">
                            <Link to={`/collection/${collection._id}`}>
                                <p className="has-text-black">{collection.name}</p>
                            </Link>
                        </div>
                        
                        <div className="column is-2">
                            <MdEdit 
                                className="mx-2"
                                onClick={() => navigate(`/editCollection/${collection._id}`)}
                            />
                            <MdDelete 
                                className="js-modal-trigger" 
                                onClick={() => handleDeleteCollectionButtonClick(collection.name, collection._id)}
                            />                                                  
                        </div>
                    </div>
                );
            });
        }
    })();


    if (!user) {
        const e = new Error();
        e.name = 'NotLoggedIn';
        return <GlobalErrorDisplay error={e} />
    }

    if (errors.root?.other) {
        return <GlobalErrorDisplay error={errors.root.other} />;
    }

    return (
        <>
            <section className="section">
                <div className="is-flex is-flex-direction-row is-justify-content-space-between is-align-items-center">
                    <h3 className="is-size-4 has-text-weight-bold mb-4">My Collections:</h3>
                    {successMessage !== '' &&
                        <FormMessage message={successMessage} success />
                    }
                    {dangerMessage !== '' &&
                        <FormMessage message={dangerMessage} danger />
                    }
                    <button className="button" onClick={handleCreateCollectionButtonClick}>
                        Create New Collection
                    </button>
                </div>
                <div className="mt-2 column is-7">
                    {content}
                </div>
            </section>
            {showCreateCollectionModal && createCollectionModal}
            {showDeleteCollectionModal && deleteCollectionModal}
        </>
    ); 
}

export default UserCollectionsPage;