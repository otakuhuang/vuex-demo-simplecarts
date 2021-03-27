import shop from '../../api/shop';
import {CART, PRODUCTS} from '../mutation-types';

// initial state
// shape: [{ id, quantity }]
const state = {
    items: [],
    checkoutStatus: null
}

// getters
const getters = {
    // 设置 getters
    cartProducts: (state, getters, rootState) => {
        // 获取 state 中的 items 并且进行遍历
        return state.items.map(({id, quantity}) => {
            // 找到 rootState 公共的 store 中 products 的 all 是否有 items 中的 id，如果有就直接返回一个新的对象，包含 title、price、quantity 三个字段
            const product = rootState.products.all.find(product => product.id === id);
            return {
                title: product.title,
                price: product.price,
                quantity
            }
        });
    },
    cartTotalPrice: (state, getters) => {
        // 获取 getters 中 cartProducts 的数据并进行 rescue 方法计算总价格
        return getters.cartProducts.reduce((total, product) => {
            return total + product.price * product.quantity;
        }, 0);
    }
}

// actions
const actions = {
    checkout({commit, state}, products) {
        // 暂存 items 数据
        const savedCartItems = [...state.items];
        // 首先先去清空已经有的 status
        commit(CART.SET_CART_ITEMS, {items: []});
        // 调用接口中的购买接口，传入成功的 cb 以及失败的 cb
        // 如果成功了直接清空购物车的 items
        // 如果失败了返回错误信息，并且将暂存的数据重新赋值给 items
        // empty cart
        shop.buyProducts(
            products,
            () => {
                commit(CART.SET_CHECKOUT_STATUS, 'successful');
                commit(`products/${PRODUCTS.BUY_PRODUCTS}`, products, {root: true});
            },
            () => {
                commit(CART.SET_CHECKOUT_STATUS, 'failed');
                // rollback to the cart saved before sending the request
                commit(CART.SET_CART_ITEMS, {items: savedCartItems});
            }
        );
    },

    addProductToCart({state, commit}, product) {
        // 添加的时候先清空状态
        commit(CART.SET_CHECKOUT_STATUS, null);
        // 判断添加的当前 product 的数量如果大于 0
        if (product.inventory > 0) {
            // 找到当前是否有这个产品的存在
            const cartItem = state.items.find(item => item.id === product.id);
            if (cartItem) {
                // 如果有，就增加 items 中对应数据的 quantity 数量就可以了
                commit(CART.INCREMENT_ITEM_QUANTITY, cartItem);
            } else {
                // 如果没有，就调用 mutation 中的存储方法
                commit(CART.PUSH_PRODUCT_TO_CART, {id: product.id, quantity: 1});
            }
            // 跨 modules 调用 products 模块减少产品的数量
            // remove 1 item from stock
            commit(`products/${PRODUCTS.DECREMENT_PRODUCT_INVENTORY}`, {
                id: product.id
            }, {root: true});
        }
    },

    reduceProductToCart({state, commit}, product) {
        const cartItem = state.items.find(item => item.id === product.id);
        if (cartItem) {
            if (product.need > 1) {
                commit(CART.DECREMENT_ITEM_QUANTITY, cartItem);
            } else {
                commit(CART.POP_PRODUCT_TO_CART, {id: product.id});
            }
            commit(`products/${PRODUCTS.INCREMENT_PRODUCT_INVENTORY}`, {
                id: product.id
            }, {root: true});
        }
    },

    changeProductToCart({state, commit}, product) {
        const cartItem = state.items.find(item => item.id === product.id);
        if (product.selected) {
            if (product.selected <= product.inventory) {
                if (cartItem) {
                    commit(CART.CHANGE_ITEM_QUANTITY, {id: product.id, quantity: product.selected});
                } else {
                    commit(CART.PUSH_PRODUCT_TO_CART, {id: product.id, quantity: product.selected});
                }
            } else {
                if (cartItem) {
                    commit(CART.CHANGE_ITEM_QUANTITY, {id: product.id, quantity: product.inventory});
                } else {
                    commit(CART.PUSH_PRODUCT_TO_CART, {id: product.id, quantity: product.inventory});
                }
            }
        } else {
            commit(CART.POP_PRODUCT_TO_CART, {id: product.id});
        }
        commit(`products/${PRODUCTS.CHANGE_PRODUCT_INVENTORY}`, {
            id: product.id
        }, {root: true});
    }
}

// mutations
const mutations = {
    // 添加购物车没有的数据
    [CART.PUSH_PRODUCT_TO_CART](state, {id, quantity}) {
        // 根据传来的总共添加的数量，直接赋值给 quantity
        state.items.push({
            id,
            quantity
        })
    },

    // 删除购物车已有的数据
    [CART.POP_PRODUCT_TO_CART](state, {id}) {
        state.items = state.items.filter(item => item.id !== id);
    },

    // 添加 items 中数量 quantity
    [CART.INCREMENT_ITEM_QUANTITY](state, {id}) {
        const cartItem = state.items.find(item => item.id === id);
        cartItem.quantity++;
    },

    // 减少 items 中数量 quantity
    [CART.DECREMENT_ITEM_QUANTITY](state, {id}) {
        const cartItem = state.items.find(item => item.id === id);
        cartItem.quantity--;
    },

    // 输入框输入的数量
    [CART.CHANGE_ITEM_QUANTITY](state, {id, quantity}) {
        const cartItem = state.items.find(item => item.id === id);
        cartItem.quantity = quantity;
    },

    // 重新赋值购物车 items 的数据
    [CART.SET_CART_ITEMS](state, {items}) {
        state.items = items;
    },

    // 修改当前订单的状态 status
    [CART.SET_CHECKOUT_STATUS](state, status) {
        state.checkoutStatus = status;
    }
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}