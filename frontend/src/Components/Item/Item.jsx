import React from 'react';
import { Link } from 'react-router-dom';
import './Item.css';

const Item = (props) => {
  return (
    <div className="item">
      <Link to={`/product/${props.id}`}>
        <img onClick={() => window.scrollTo(0, 0)} src={props.image} alt={props.name} />
      </Link>
      <p>{props.name}</p>
      <div className="item-prices">
        <div className="item-price-new">LKR{props.new_price}</div>
        <div className="item-price-old">LKR{props.old_price}</div>
      </div>
    </div>
  );
};

export default Item;
