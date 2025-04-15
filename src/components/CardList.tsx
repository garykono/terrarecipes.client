interface CardListProps {
    list: React.ReactElement[];
    numCols: number;
}

export default function CardList({ list, numCols }: CardListProps) {
    return (
        <>
            <div className="container columns is-multiline">
                {list.map((listItem) => {
                    return (
                        <div key={listItem.key} className={getColumnSize(numCols)}>
                            {listItem}
                        </div>
                    );
                })}
            </div>
        </>
    );
}

function getColumnSize(numCols: number) {
    switch (numCols) {
        case 1:
            return "column is-full";
        case 2:
            return "column is-half";
        case 3:
            return "column is-one-third";
        case 4:
            return "column is-one-quarter";
        default:
            return "column is-one-fifth";
    }
}