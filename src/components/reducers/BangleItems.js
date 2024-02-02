import React from 'react';
import { ADD_PRODUCT, UPDATE_CART, CHANGE_LOGIN_STATUS, ADD_SINGLEQUANTITY, ADD_QUANTITY, ADD_TO_CART, SUB_QUANTITY, REMOVE_ITEM, TRYATHOME_STATE, ADD_TO_TRYOUTCART } from '../actions/action-types/cart-actions';
import { MenuItems } from '../Navbar/MenuItems';
import axios from 'axios';
let allproducts = [];
MenuItems.map((item, key) => {
    if (item.types)
        item.types.map((type, key) => {
            item[type.name.replaceAll(' ', '')].map((product, key) => {
                let currentproduct = new Object({ ...product, path: item.path + '/' + type.name + '/' + product.name })
                allproducts.push(currentproduct)
            })
        })

})
const initState = {
    items: MenuItems,
    allItems: allproducts,
    addedItems: [],
    total: 0,
    totalQuantity: 0,
    currentproduct: {},
    totalDiscount: 0,
    userid: '',
    password: '',
    tryathome:false,
    tryoutcart:[]

}
const BangleItems = (state = initState, action) => {
    if (action.type === ADD_TO_CART) {
        let addedItem;
        state.items.filter(subtype => subtype.types).map((maintype) => {
            maintype.types.map((subtype) => {
                maintype[subtype.name.replaceAll(' ', '')].map((product) => {
                    if (action.name == product.name)
                        addedItem = product;
                })
            })
        })
        if (addedItem != undefined) {

            state.totalQuantity += 1
            var userid = state.userid;
            var totalQuantity = state.totalQuantity;
            let existed_item = state.addedItems.find(item => action.name === item.name)
            if (existed_item) {
                addedItem.quantity += 1;
                var cart = state.addedItems;
                var total = state.total + addedItem.price - (addedItem.price * addedItem.discount / 100);
                var totalDiscount = (addedItem.price * addedItem.discount / 100);
                const { data } = axios.post('/updatecart', {
                    userid, cart, total, totalQuantity, totalDiscount
                })
                return {
                    ...state,
                    total: state.total + addedItem.price - (addedItem.price * addedItem.discount / 100),
                    totalDiscount: (addedItem.price * addedItem.discount / 100)
                }
            }
            else {
                addedItem.quantity = 1;
                let discountedprice = addedItem.price - (addedItem.price * addedItem.discount / 100);
                let newTotal = state.total + discountedprice
                var cart = [...state.addedItems, addedItem];
                var total = state.total + addedItem.price - (addedItem.price * addedItem.discount / 100);
                var totalDiscount = (addedItem.price * addedItem.discount / 100);
                const { data } = axios.post('/updatecart', {
                    userid, cart, total, totalQuantity, totalDiscount
                })
                return {
                    ...state,
                    addedItems: [...state.addedItems, addedItem],
                    totalDiscount: (addedItem.price * addedItem.discount / 100),
                    total: newTotal
                }

            }

        }
    }
    else if (action.type === ADD_PRODUCT) {
        return {
            ...state,
            currentproduct: action.product
        }
    }
    else if (action.type === ADD_QUANTITY) {
        state.addedItems.filter(product => { return product.name === action.name }).map(product => {
            state.totalQuantity = state.totalQuantity - product.quantity + action.quantity;
            let discountedprice = product.price - (product.price * product.discount / 100);
            state.totalDiscount += product.quantity * (product.price * product.discount / 100);
            state.total = state.total - (product.quantity * discountedprice) + (action.quantity * discountedprice);
            product.quantity = action.quantity;
        })
        var userid=state.userid;
        var cart=state.addedItems
        var total=state.total;
        var totalQuantity=state.totalQuantity;
        var totalDiscount=state.totalDiscount;
        const {data} = axios.post('/updatecart', {
            userid,cart,total,totalQuantity,totalDiscount
        })
        return { ...state }
    }
    else if (action.type === SUB_QUANTITY) {
        state.addedItems.filter(product => { return product.name === action.name }).map(product => {
            if (product.quantity > 1) {
                state.totalQuantity -= 1;
                let discountedprice = product.price - (product.price * product.discount / 100);
                state.totalDiscount -= (product.price * product.discount / 100);
                state.total -= discountedprice;
                product.quantity -= 1;
                var userid=state.userid;
                var cart=state.addedItems
                var total=state.total;
                var totalQuantity=state.totalQuantity;
                var totalDiscount=state.totalDiscount;
                const {data} = axios.post('/updatecart', {
                    userid,cart,total,totalQuantity,totalDiscount
                })
            }
        })
        return { ...state }
    }
    else if (action.type === ADD_SINGLEQUANTITY) {
        state.addedItems.filter(product => { return product.name === action.name }).map(product => {
            if (product.quantity < 10) {
                state.totalQuantity += 1;
                let discountedprice = product.price - (product.price * product.discount / 100)
                state.totalDiscount += (product.price * product.discount / 100);
                state.total += discountedprice;
                product.quantity += 1;
                var userid=state.userid;
                var cart=state.addedItems
                var total=state.total;
                var totalQuantity=state.totalQuantity;
                var totalDiscount=state.totalDiscount;
                const {data} = axios.post('/updatecart', {
                    userid,cart,total,totalQuantity,totalDiscount
                })
            }
        })
       
        return { ...state }
    }
    else if (action.type == REMOVE_ITEM) {
        state.totalDiscount = 0;
        state.totalQuantity = 0;
        state.total = 0;
        let addedItems = state.addedItems.filter(product => { return product.name != action.name })
        addedItems.map((product, index) => {
            state.totalDiscount += (product.price * product.discount / 100) * product.quantity;
            state.totalQuantity += product.quantity;
            state.total += (product.quantity * product.price - (product.price * product.discount / 100) * product.quantity);
        })
        state.addedItems = addedItems;
        var userid=state.userid;
        var cart=state.addedItems
        var total=state.total;
        var totalQuantity=state.totalQuantity;
        var totalDiscount=state.totalDiscount;
        const {data} = axios.post('/updatecart', {
            userid,cart,total,totalQuantity,totalDiscount
        })
        return { ...state }

    }
    else if (action.type == UPDATE_CART) {
        return {
            ...state,
            addedItems: action.addedItems,
            total: action.total,
            totalQuantity: action.totalQuantity,
            totalDiscount: action.totalDiscount,

        }
    }
    else if (action.type == CHANGE_LOGIN_STATUS) {
        return {
            ...state,
            userid: action.userid,
            password: action.password
        }
    }
    else if(action.type == TRYATHOME_STATE)
    {
        return{
            ...state,
            tryathome: action.tryathome
        }
    }
    if (action.type ===ADD_TO_TRYOUTCART) {
        let addedItem;
        state.items.filter(subtype => subtype.types).map((maintype) => {
            maintype.types.map((subtype) => {
                maintype[subtype.name.replaceAll(' ', '')].map((product) => {
                    if (action.name == product.name)
                        addedItem = product;
                })
            })
        })
        if (addedItem != undefined) {
            let existed_item = state.tryoutcart.find(item => action.name === item.name)
            if (existed_item) {
                var cart = state.tryoutcart;
                // const { data } = axios.post('/updatetryoutcart', {
                //    cart
                // })
                return {
                    ...state,
                }
            }
            else {
                var cart = [...state.tryoutcart, addedItem];
                // const { data } = axios.post('/updatetryoutcart', {
                //     cart
                // })
                return {
                    ...state,
                    tryoutcart: [...state.tryoutcart, addedItem]
                }

            }

        }
    }
    else {
        return state
    }
}

export default BangleItems
