
import { useEffect, useRef } from 'react'

function Footer({ location }) {

    const counter = useRef(null)
    useEffect(() => {
        counter.current.innerHTML = `<img src="https://cnt0.www.uz/counter/collect?id=1839&pg=http%3A//samdu.uz/${location.pathname.split("/").slice(-1,).toString()}&c=Y&j=N&wh=1536x864&px=24&js=1.3&col=0063AF&t=ffffff&p=E6850F" alt="Топ рейтинг www.uz" />`
    }, [location])

    return (
        <div className='footer'>
            <p className='m-0 pt-3 pb-2 text-center text-white'>All rights reserved 2022 | Developed by Kuvondikov</p>
            <div className='d-flex justify-content-center'>
                <a className='d-block pt-2 pb-3' ref={counter} data-turbo="true" href="http://www.uz/ru/res/visitor/index?id=1839" target="_top"></a>
            </div>
        </div>
    )
}

export default Footer