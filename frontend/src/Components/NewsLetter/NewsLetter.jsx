import React from 'react'
import './NewsLetter.css'

const NewsLetter = () => {
  return (
    <div className= 'newsletter' >
        <h1>Be the First to Know! </h1>
        <p>Subscribe to Our Newsletter for Exclusive Deals and Updates.</p>
        <div>
            <input type="email" placeholder='Enter your email' />
            <button>Subscribe</button>
        </div>
      
    </div>
  )
}

export default NewsLetter
