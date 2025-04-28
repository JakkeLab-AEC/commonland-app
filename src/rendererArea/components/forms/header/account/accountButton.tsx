import React from "react";

export default function AccountButton({onClickHandler}:{onClickHandler:() => void}) {
    return (
        <button className="flex" style={{width:32, height:32, backgroundColor: "white", borderRadius:16}} onClick={onClickHandler}>
            
        </button>
    )
}