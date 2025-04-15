import { UseFieldArrayRemove } from "react-hook-form";

interface TagListProps {
    tags: string[];
    onDelete?: (index: number) => void | UseFieldArrayRemove;
}

function TagList({ tags, onDelete }: TagListProps) {
    const renderedTags = tags.map((tag, index) => {
        if (onDelete) {
            return (
                <span className="tag" key={index}>
                    {tag}
                    <button className="delete is-small" onClick={() => onDelete(index)}></button>
                </span>
            );
        }
        else {
            return (
                <span className="tag" key={index}>
                    {tag}
                </span>
            );
        }
    });
    return (
        <div className="buttons">
            {renderedTags}
        </div>
    );
}

export default TagList;