import React, {useEffect, useState} from 'react'
import './Popular.css'

import Item from '../Item/Item'

const Popular = () => {

  const[popularProducts, setPopularProducts] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8070/popular')
      .then((response) => response.json())
      .then((data) => 
        setPopularProducts(data));
      
      
  }, []);
  return (
    <div className= 'popular'>
        <h1>Popular</h1>
        <hr/>
        <div className="popular-items">
            {popularProducts.map((item,i) => {
                return (
                    <Item 
                        key={i}
                        id={item.id}
                        image={item.image}
                        name={item.name}
                        new_price={item.new_price}
                        old_price={item.old_price}
                    />
                )
            })}
      </div>
    </div>
  )
}

export default Popular

