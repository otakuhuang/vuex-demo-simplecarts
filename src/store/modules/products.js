import shop from '../../api/shop';
import {PRODUCTS} from '../mutation-types';

// initial state
const state = {
    all: [],
}

// getters
const getters = {}

// actions
const actions = {
    getAllProducts({commit}) {
        shop.getProducts(products => {
            commit(PRODUCTS.SET_PRODUCTS, products);
        })
    }
}

// mutations
const mutations = {
    [PRODUCTS.SET_PRODUCTS](state, products) {
        state.all = products;
    },

    [PRODUCTS.DECREMENT_PRODUCT_INVENTORY](state, {id}) {
        const product = state.all.find(product => product.id === id);
        product.need++;
        product.selected++;
    },

    [PRODUCTS.INCREMENT_PRODUCT_INVENTORY](state, {id}) {
        const product = state.all.find(product => product.id === id);
        product.need--;
        product.selected--;
    },

    [PRODUCTS.CHANGE_PRODUCT_INVENTORY](state, {id}) {
        const product = state.all.find(product => product.id === id);
        if (product.selected) {
            if (product.selected <= product.inventory) {
                product.need = product.selected;
            } else {
                product.need = product.inventory;
                product.selected = product.inventory;
            }
        } else if (product.selected <= 0) {
            product.need = 0;
            product.selected = 0;
        }
    },

    [PRODUCTS.BUY_PRODUCTS](state, carts) {
        for (let cart of carts) {
            const product = state.all.find(product => product.title === cart.title);
            product.inventory -= cart.quantity;
            product.need = 0;
            product.selected = 0;
        }
    }
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
}