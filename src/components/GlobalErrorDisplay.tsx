import { useState, useEffect } from "react";
import { Link, useRouteError } from "react-router-dom";

interface GlobalErrorDisplayProps {
    error?: any;
}

export default function GlobalErrorDisplay({ error = useRouteError() }: GlobalErrorDisplayProps) {
    const [ title, setTitle ] = useState('ERROR.')
    const [ message, setMessage ] = useState("Something went wrong!");

    useEffect(() => {
        if (!error) {
            console.log("A GlobalErrorDisplay was prompted but no error argument was given nor route error found.");
        } else {
            console.log(error);
            if (error.name === 'NotLoggedIn') {
                setTitle("")
                setMessage("You must be logged in to access this feature.")
            } else if (error.name === 'No_ID') {
                setTitle("Void ID")
                setMessage("No resource ID was specified.")
            } else if (error.status) {
                setTitle(`${error.status} Error.`);

                if (error.status === 400) {
                    if (error.name === 'CAST_ERROR') {
                        setMessage('Access to a resource was requested with an ID that was incorrectly formatted.')
                    }
                } else if (error.status === 401) {
                    setMessage("Authorization failed.")
                } else if (error.status === 403) {
                    setMessage("Access was denied for attempted request.")
                } else if (error.status === 404) {
                    if (error.response?.data?.message?.startsWith('Invalid _id')) {
                        setMessage("The requested resource could not be found on the server.");
                    } else {
                        setMessage("The requested URL was not found on this server.")
                    }
                } else if (error.status === 500) {
                    setMessage("There was an issue with the server.")
                } else if (error.status === 503) {
                    setMessage("Failed to connect to the server.")
                }
            }            
        }
    }, [])

    return (
        <div className="section">
            {}
            <h2 className="title">{title}</h2>
            <p className="mb-2">{message}</p>
            <Link to='/'>Go Home</Link>
        </div>
    );
}