import { useState, useEffect } from 'react';

interface PaginationProps {
    currentPage: number;
    onFirstPageButtonClicked: () => void;
    onPreviousPageButtonClicked: () => void; 
    onNextPageButtonClicked: () => void; 
    onLastPageButtonClicked: () => void;
    numPages: number;
}

export default function Pagination({ 
        currentPage, 
        onFirstPageButtonClicked,
        onPreviousPageButtonClicked, 
        onNextPageButtonClicked, 
        onLastPageButtonClicked,
        numPages 
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
        <nav className="pagination is-centered is-small" role="navigation" aria-label="pagination">
            <a 
                className={`pagination-previous ${previousPageButtonDisabledClass}`}
                onClick={previousPageButtonDisabledClass === ""? onPreviousPageButtonClicked : undefined}
                >Previous
            </a>
            <a 
                className={`pagination-next ${nextPageButtonDisabledClass}`}
                onClick={nextPageButtonDisabledClass === ""? onNextPageButtonClicked : undefined}
                >Next page
            </a>
            <ul className="pagination-list">
                {currentPage > 2 &&
                    <>
                        <li>
                            <a 
                                className="pagination-link" 
                                onClick={onFirstPageButtonClicked}
                                aria-label="Goto page 1"
                                >1
                            </a>
                        </li>
                        <li><span className="pagination-ellipsis">&hellip;</span></li>
                    </>
                }
                {currentPage > 1 && 
                    <li>
                        <a 
                            className="pagination-link" 
                            onClick={onPreviousPageButtonClicked}
                            aria-label={`Goto page ${currentPage - 1}`}>{currentPage - 1}
                        </a>
                    </li>
                }
                <li>
                    <a
                        className="pagination-link is-current"
                        aria-label={`Page ${currentPage}`}
                        aria-current="page"
                        >{currentPage}
                    </a>
                </li>
                {currentPage < numPages && numPages > 1 &&
                    <li>
                        <a
                            className="pagination-link" 
                            onClick={onNextPageButtonClicked}
                            aria-label={`Goto page ${currentPage + 1}`}
                            >{currentPage + 1}
                        </a>
                    </li>
                }
                {currentPage + 1 < numPages &&
                    <>
                        <li><span className="pagination-ellipsis">&hellip;</span></li>
                        <li>
                            <a 
                                className="pagination-link" 
                                onClick={onLastPageButtonClicked}
                                aria-label={`Goto page ${numPages}`}>{numPages}
                            </a>
                        </li>
                    </>
                }
            </ul>
        </nav>
    );
}
