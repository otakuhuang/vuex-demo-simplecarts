const _product = [
    {"id": 1, "title": "华为 Mate 20", "price": 3999, "inventory": 2, "need": 0, "selected": 0},
    {"id": 2, "title": "小米 9", "price": 2999, "inventory": 0, "need": 0, "selected": 0},
    {"id": 3, "title": "OPPO R17", "price": 2999, "inventory": 5, "need": 0, "selected": 0},
]

export default {
    getProducts(cb) {
        setTimeout(() => cb(_product), 100);
    },
    buyProducts(products, cb, errorCb) {
        setTimeout(() => {
            Math.random() > 0.5 ? cb() : errorCb()
        }, 100)
    },
}