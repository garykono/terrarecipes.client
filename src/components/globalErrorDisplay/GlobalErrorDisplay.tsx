import styles from './GlobalErrorDisplay.module.css';
import { useState, useEffect } from "react";
import { Link, useRouteError } from "react-router-dom";

interface GlobalErrorDisplayProps {
    error?: any;
    title?: string;
    message?: string;
}

export default function GlobalErrorDisplay({ error = useRouteError(), title, message }: GlobalErrorDisplayProps) {
    const [ displayTitle, setDisplayTitle ] = useState('ERROR.')
    const [ displayMessage, setDisplayMessage ] = useState("Something went wrong!");

    useEffect(() => {
        if (!error && !title) {
            console.log("A GlobalErrorDisplay was prompted but no error argument was given nor route error found.");
        } else {
            console.log(error);
            if (error.name === 'NotLoggedIn') {
                setDisplayTitle("")
                setDisplayMessage("You must be logged in to access this feature.")
            } else if (error.name === 'No_ID') {
                setDisplayTitle("Void ID")
                setDisplayMessage("No resource ID was specified.")
            } else if (error.name === 'MissingLoaderData') {
                setDisplayTitle("Missing Loader Data")
                setDisplayMessage("Failed to load a required resource from server.")
            } else if (error.name === 'MissingParameters') {
                setDisplayTitle("Missing Required Parameters")
                setDisplayMessage("One or more required parameters were not given.")
            }  else if (error.name === 'InvalidParameters') {
                setDisplayTitle("Invalid Parameters")
                setDisplayMessage("Invalid values were given for one or more parameters.")
            } else if (error.name === 'INVALID_FIELDS_ERROR') {
                setDisplayTitle("Invalid Fields Sent")
                setDisplayMessage("Some fields sent with request were rejected from the server.")
            } else if (error.status) {
                setDisplayTitle(`${error.status} Error.`);

                if (error.status === 400) {
                    if (error.name === 'CAST_ERROR') {
                        setDisplayMessage('Access to a resource was requested with an ID that was incorrectly formatted.')
                    }
                } else if (error.status === 401) {
                    setDisplayMessage("Authorization failed.")
                } else if (error.status === 403) {
                    setDisplayMessage("Access was denied for attempted request.")
                } else if (error.status === 404) {
                    if (error.response?.data?.message?.startsWith('Invalid _id')) {
                        setDisplayMessage("The requested resource could not be found on the server.");
                    } else {
                        setDisplayMessage("The requested URL was not found on this server.")
                    }
                } else if (error.status === 500) {
                    setDisplayMessage("There was an issue with the server.")
                } else if (error.status === 503) {
                    setDisplayMessage("Failed to connect to the server.")
                }
            }    
            
            // Override error with custom title/message
            if (title) setDisplayTitle(title);
            if (message) setDisplayMessage(message);
        }
    }, [])

    return (
        <div className="page-top">
            <div className="container">
                <h2 className="page-title">{displayTitle}</h2>
                <p className="subsection-title">{displayMessage}</p>
                <div  className={`subsection-title ${styles.homeLink}`}>
                    <Link to='/'>Go Home</Link>
                </div>
            </div>
        </div>
    );
}