import clsx from 'clsx';
import { useState, useEffect } from 'react';
import styles from './Pagination.module.css';

interface PaginationProps {
    currentPage: number;
    onFirstPageButtonClicked: () => void;
    onPreviousPageButtonClicked: () => void; 
    onNextPageButtonClicked: () => void; 
    onLastPageButtonClicked: () => void;
    numPages: number;
    className?: string;
}

export default function Pagination({ 
        currentPage, 
        onFirstPageButtonClicked,
        onPreviousPageButtonClicked, 
        onNextPageButtonClicked, 
        onLastPageButtonClicked,
        numPages,
        className
    }: PaginationProps) {
        
    const [previousPageButtonDisabledClass, setPreviousPageButtonDisabledClass] = useState("");
    const [nextPageButtonDisabledClass, setNextPageButtonDisabledClass] = useState("");

    useEffect(() => {
        if (currentPage <= 1) {
            setPreviousPageButtonDisabledClass("is-disabled");
        } else {
            setPreviousPageButtonDisabledClass("");
        }
        if (currentPage >= numPages) {
            setNextPageButtonDisabledClass("is-disabled");
        } else {
            setNextPageButtonDisabledClass("");
        }
    }, [currentPage, numPages])

    return (
        <nav 
            className={clsx(
                styles.pagination,
                className
            )} 
            role="navigation" 
            aria-label="pagination"
        >
            <a 
                className={clsx(
                    styles.paginationButton,
                    previousPageButtonDisabledClass
                )}
                onClick={previousPageButtonDisabledClass === "" ? onPreviousPageButtonClicked : undefined}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={styles.paginationButtonIcon}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                    </svg>
            </a>
            
            <ul className={styles.pageList}>
                {currentPage > 2 &&
                    <>
                        <li>
                            <a 
                                className={styles.pageLink}
                                onClick={onFirstPageButtonClicked}
                                aria-label="Goto page 1"
                                >1
                            </a>
                        </li>
                        <li><span className={styles.paginationEllipsis}>&hellip;</span></li>
                    </>
                }
                {currentPage > 1 && 
                    <li>
                        <a 
                            className={styles.pageLink} 
                            onClick={onPreviousPageButtonClicked}
                            aria-label={`Goto page ${currentPage - 1}`}>{currentPage - 1}
                        </a>
                    </li>
                }
                <li>
                    <a
                        className={clsx(
                            styles.pageLink,
                            styles.pageLinkCurrent
                        )}
                        aria-label={`Page ${currentPage}`}
                        aria-current="page"
                        >{currentPage}
                    </a>
                </li>
                {currentPage < numPages && numPages > 1 &&
                    <li>
                        <a
                            className={styles.pageLink}
                            onClick={onNextPageButtonClicked}
                            aria-label={`Goto page ${currentPage + 1}`}
                            >{currentPage + 1}
                        </a>
                    </li>
                }
                {currentPage + 1 < numPages &&
                    <>
                        <li><span className={styles.paginationEllipsis}>&hellip;</span></li>
                        <li>
                            <a 
                                className={styles.pageLink} 
                                onClick={onLastPageButtonClicked}
                                aria-label={`Goto page ${numPages}`}>{numPages}
                            </a>
                        </li>
                    </>
                }
            </ul>

            <a 
                className={clsx(
                    styles.paginationButton,
                    nextPageButtonDisabledClass
                )}
                onClick={nextPageButtonDisabledClass === ""? onNextPageButtonClicked : undefined}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={styles.paginationButtonIcon}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
            </a>
        </nav>
    );
}
