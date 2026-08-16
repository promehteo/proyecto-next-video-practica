'use client'

import posthog from "posthog-js"

const ExploreBtn = () =>{
    const handleExplore = () => {
        posthog.capture("events_explored")
        console.log('CLICK')
    }

    return(
        <button type="button" id="explore-btn" className="mt-7 mx-auto" onClick={handleExplore}>
            ExploreBtn
            <a href="#events">
                Explore Events
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
                </svg>
            </a>
        </button>
    )
}

export default ExploreBtn