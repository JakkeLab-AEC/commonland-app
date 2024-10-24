import React from 'react'
import './accountpopup_styles.css'

export default function AccountPopup({username, teamname, signOutHandler}:{username: string, teamname: string, signOutHandler:() => void}) {
    return (
        <div className="style-component flex flex-col">
            <div className='flex-grow flex flex-row gap-2 '>
                <div style={{width: 64, height: 64, backgroundColor: 'lightgrey', borderRadius: 32}}>

                </div>
                <div className='flex flex-col'>
                    <div className='flex flex-row'>
                        <div style={{fontWeight: 600, width: 52}}>
                            Name
                        </div>
                        <div>
                            {username}
                        </div>
                    </div>
                    <div className='flex flex-row'>
                        <div style={{fontWeight: 600, width: 52}}>
                            Team
                        </div>
                        <div>
                            {teamname}
                        </div>
                    </div>
                </div>
            </div>
            <button className='h-[32px]' 
                style={{backgroundColor: '#FF6868', color: 'white', borderRadius: 4, alignContent: 'center', textAlign:'center'}}
                onClick={signOutHandler}>
                Sign Out
            </button>
        </div>
    )
}