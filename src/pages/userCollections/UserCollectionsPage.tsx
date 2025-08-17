import styles from './UserCollectionsPage.module.css';
import { useState, useEffect, useContext } from 'react'
import { Form, Link, useNavigate, useRevalidator, useRouteLoaderData } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { MdEdit } from 'react-icons/md';
import { MdDelete } from 'react-icons/md'
import { CollectionUpdateProps, createCollection, deleteCollectionById } from '../../api/queries/collectionApi';
import Modal from '../../components/modal/Modal'
import FormMessage from '../../components/formMessage/FormMessage';
import GlobalErrorDisplay from '../../components/GlobalErrorDisplay';
import { ErrorMessageSetter, useSetError } from '../../hooks/form-submit-error-handling';
import { Collection } from '../../api/types/collection';
import BasicHero from '../../components/basicHero/BasicHero';
import Button from '../../components/buttons/Button';
import Toolbar from '../../components/toolbar/Toolbar';

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


    const handleCreateCollectionButtonClick = () => {
        setShowCreateCollectionModal(true);
    }

    const handleDeleteCollectionButtonClick = (collectionName: string, collectionId: string) => {
        setCollectionIdToDelete(collectionId);
        setCollectionNameToDelete(collectionName);
        setShowDeleteCollectionModal(true);
    }

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

    const createCollectionModal = (
        <Modal 
            onClose={() => setShowCreateCollectionModal(false)} 
            windowTitle='Create a new Collection?'>

            <form className="form" onSubmit={handleSubmit(addCollection)}>
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
                <div className="buttons">
                    <Button 
                        onClick={() => setShowCreateCollectionModal(false)}
                        type="button"
                    >
                        Cancel
                    </Button>
                    <Button primary type="submit">
                        Submit
                    </Button>
                </div>
            </form>
        </Modal>
    );

    const deleteCollectionModal = (
        <Modal 
            onClose={() => setShowDeleteCollectionModal(false)} 
            windowTitle='Delete collection?'
            danger
        >
            Are you sure you want to delete this collection?
            <div className="buttons">
                <Button 
                    onClick={() => setShowDeleteCollectionModal(false)}
                    type="button"
                >
                    Cancel
                </Button>
            <Button type="button" 
                className={`${styles.deleteCollectionModalButton}`}
                danger 
                onClick={() => deleteCollection(collectionIdToDelete)}
            >
                Delete
            </Button>
            </div>
        </Modal>
    );

    let content = (() => {
        if (user) {
            return user.collections.map((collection: Collection) => {
                return (
                    <div className={styles.collection} key={collection._id}>
                        <Link 
                            to={`/collection/${collection._id}`}
                            className={styles.collectionLink}
                        >
                            <div className={styles.collectionCard}>
                                <span className={styles.collectionTitle}>
                                    {collection.name}
                                </span>
                            </div>
                        </Link>
                        
                        <div className={styles.collectionManagementButtons}>
                            <button 
                                className={styles.managementButton}
                                onClick={() => navigate(`/editCollection/${collection._id}`)}
                            >
                                <MdEdit />   
                            </button>
                            <button 
                                className={`${styles.managementButton} js-modal-trigger`} 
                                onClick={() => handleDeleteCollectionButtonClick(collection.name, collection._id)}
                            >
                                <MdDelete />      
                            </button>                                            
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
        <div className="page-user-collections">
            <BasicHero title="My Collections" />
            <div className="container">
                <Toolbar actions={[{ label: "Create Collection", icon: "➕", onClick: handleCreateCollectionButtonClick }]} />

                {successMessage !== '' &&
                    <FormMessage message={successMessage} success />
                }
                {dangerMessage !== '' &&
                    <FormMessage message={dangerMessage} danger />
                }
                    
                <div className={styles.collections}>
                    {content}
                </div>
            </div>
            {showCreateCollectionModal && createCollectionModal}
            {showDeleteCollectionModal && deleteCollectionModal}
        </div>
    ); 
}

export default UserCollectionsPage;