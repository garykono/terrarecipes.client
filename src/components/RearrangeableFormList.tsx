import { ReactElement, useEffect } from 'react';
import { GoXCircleFill } from 'react-icons/go';
import { GoArrowDown, GoArrowUp } from 'react-icons/go';

interface RearrangeableFormListProps {
    list: string[];
    setList: (val: string[]) => void;
    title: string;
}

function RearrangeableFormList({ list, setList, title }: RearrangeableFormListProps) {
    // Always have an empty text input box so user doesn't have press a button everytime they want to open a new list item text box
    useEffect(() => {
        if(list.length === 0 || list[list.length - 1] !== "") {
            setList([...list, ""]);
        }
    }, [list])

    const handleListInputChange = (updatedValue: string, indexToEdit: number) => {
        const updatedList = list.map((item, index) => {
            if(indexToEdit === index) {
                return updatedValue;
            } else {
                return item;
            }
        })
        setList(updatedList);
    }

    const handleAdd = (isSection: boolean) => {
        if (isSection) {
            const updatedList = [...list];
            // Relies on feature that the list will always have a blank row as its last row
            updatedList[updatedList.length - 1] = "section:";
            setList(updatedList);
        } else {
            setList([...list, ""]);
        }
    }

    const handleDelete = (indexToDelete: number) => {
        const updatedList = list.filter((value, index) => {
            return index !== indexToDelete;
        })
        setList(updatedList);
    }

    function getListItemMoveArrows(index: number, list: string[]) {
        // Swaps list item with another list item directly above or below it on the list
        const moveListItemUp = (index: number, list: string[]) => {
            const temp = list[index];
                    list[index] = list[index - 1];
                    list[index - 1] = temp;
        }
        
        const moveListItemDown = (index: number, list: string[]) => {
            const temp = list[index];
                    list[index] = list[index + 1];
                    list[index + 1] = temp;
        }
        
        
        const handleArrowClick = (arrowDirection: string) => {
            const updatedList = [...list];
            if (arrowDirection === 'up') {
                moveListItemUp(index, updatedList);
            } else if (arrowDirection === 'down') {
                moveListItemDown(index, updatedList);
            }
            setList(updatedList);
        }

        const upArrow = <GoArrowUp onClick={() => {handleArrowClick('up')}} />
        const downArrow = <GoArrowDown onClick={() => {handleArrowClick('down')}} />
    
        if (index == 0) {
            return <div>{downArrow}</div>;
        } else if (index == list.length - 1) {
            return <div>{upArrow}</div>;
        } else {
            return (
                <div>
                    {upArrow}
                    {downArrow}
                </div>
            );
        }
    }

    const renderedList = 
        list.map((item, index) => {
                const isSection = item.startsWith("section:");
                return (
                    
                    <li className="py-1 is-flex is-align-items-center" key={index}>
                        {getListItemMoveArrows(index, list)}
                        {isSection && 
                            <label className="label mx-2">Section: </label>
                        }
                        <input
                            className="input" 
                            value={isSection ? item.slice("section:".length) : item} 
                            onChange={(event) => handleListInputChange((isSection? "section:" : "") + event.target.value, index)} 
                        />
                        <button onClick={() => handleDelete(index)}>
                            <GoXCircleFill className="px-2" />
                        </button>
                    </li>
                );
            });

    return (
        <>
            <div className="content">
                <ul>
                    {renderedList}
                </ul>
            </div>
            <div className="field is-grouped my-3">
                <button className="button" onClick={() => handleAdd(false) }>
                    Add {title}
                </button>
                <button className="button" onClick={() => handleAdd(true) }>
                    Add Section
                </button>
            </div>
        </>
    );
}

export default RearrangeableFormList;

