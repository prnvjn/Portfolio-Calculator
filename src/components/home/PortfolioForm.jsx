import React, { useState, useEffect, useContext, forwardRef, useRef } from 'react';
import { addDoc, doc, collection, serverTimestamp } from '@firebase/firestore';
import { db } from '../../firebase.js';
import { AuthContext } from '../../App.jsx';
import {getAllSymbols} from '../../utils/WTDApi.js'
import ReactDatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import '../../assets/css/portfolioform.css';

export const PortfolioForm = ({ datastate }) => {
  const [queryresults, setQueryResults] = useState(null);
  const {user} = useContext(AuthContext);
  const [addStock, setAddstock]=useState(true)
  const [inputValue, setInputValue] = useState('');
  const [suggestedValues, setSuggestedValues] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const calendarRef = useRef(null);
  const [dataobj, setDataobj] = useState({
    balance: 0,
    start: '',
    finish: '',
    allocation: []
  });

  // looks for suggested stock options
  const handleTicker = async(event)=>{
    const value = event.target.value
    setInputValue(value);

    const data = await getAllSymbols(value)
    setSuggestedValues(data)
    
  }
  // toggle add more stocks input
  const addStockButton=()=>{
    setAddstock(!addStock)
  }

  // adds and remove stock from the list
  const handleOptionToggle = (option) => {
    if (selectedOptions.includes(option)) {
      setSelectedOptions(selectedOptions.filter((item) => item !== option));
    } else {
      setSelectedOptions([...selectedOptions, option]);
    }
  };

  const CustomStartInput = forwardRef(({ value, onClick }, ref) => (
    <button id="datepick" className='buttons' onClick={onClick} ref={ref}>
      {value ? value : 'Select a start date'}
    </button>
  ));

  const CustomFinishInput = forwardRef(({ value, onClick }, ref) => (
    <button id="datepick" className='buttons' onClick={onClick} ref={ref}>
      {value ? value : 'Select a finish date'}
    </button>
  ));

  return (
    <form id='portfolioform' className='flex items-center relative mx-auto flex-col w-max-2 justify-start rounded-lg p-2'> 
      <input className='my-3 text-center' type="number" name="" id="" placeholder='Enter your starting balance' value={dataobj.balance} onChange={(event) => setDataobj({...dataobj, balance: event.target.value})} />
      <div className=' text-md flex justify-between w-80 items-center p-2'>
        <span id="addstocks">Add stocks</span>
        <span onClick={addStockButton} id='plusbutton'>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-9 h-9">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </span>
      </div>
      <ul>
        {selectedOptions.map((stock)=> 
          <li className='flex justify-between font-medium  items-center max-h-96 w-80' key={stock}> 
            <input type="checkbox" className="w-7 h-7" checked={selectedOptions.includes(stock)} onChange={() => handleOptionToggle(stock)} 
              htmlFor={stock}
            /> 
            <label htmlFor={stock} className=' '>{stock}</label>  
            <input type="number" className="percents w-10 h-7 text-base" htmlFor={stock} max='100' min='0' placeholder='0' onChange={(event) => {
              const newAllocation = dataobj.allocation.filter((item) => item.symbol !== stock);
              setDataobj({...dataobj, allocation: [...newAllocation, {symbol: stock, weight: event.target.value}]});
            }} />
          </li>
        )}
      </ul>
      {!addStock && <input type="text" className='mb-3' value={inputValue} onChange={handleTicker} />}  
      <ul className="max-h-96 w-80	overflow-y-scroll  bg-purple-400 rounded-sm ">
        {/* add a check box */}
        {inputValue.length !== 0 &&
          suggestedValues.map((value, index) => 
            <li className='text-purple-600 bg-slate-200 text-m m-1 text-left p-1 ' key={index}>
              <label className='flex justify-between font-medium items-center'>
                {value.symbol}
                <input type="checkbox" className=' w-7 h-7' checked={selectedOptions.includes(value.symbol)}
                  onChange={() => {
                    handleOptionToggle(value.symbol);
                    addStockButton();
                    setInputValue("");
                  }}
                />
              </label>
            </li>
        )}
      </ul>
      <ReactDatePicker
        className='w-10'
        selected={dataobj.start}
        onChange={(date) => setDataobj({...dataobj, start: date})}
        customInput={<CustomStartInput />}
        popperPlacement='bottom'
        peekNextMonth
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
      />
      <ReactDatePicker
        className='w-10'
        selected={dataobj.finish}
        onChange={(date) => setDataobj({...dataobj, finish: date})}
        customInput={<CustomFinishInput />}
        popperPlacement='bottom'
        peekNextMonth
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
      />
      <button className='buttons text-black' onClick={() => {}}>Check History</button>
    </form>
  )
}

