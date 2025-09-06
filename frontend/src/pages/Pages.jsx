import React from 'react'
import { Outlet } from 'react-router-dom'
import Footer from '../companents/Footer'
import Header from '../companents/Header'

function Pages({ location }) {
    return (
        <div className='container-fluit main'>
            <Header />
            <div className='main-page'>
                <Outlet />
            </div>
            <Footer location={location} />
        </div>
    )
}

export default Pages